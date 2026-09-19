import Foundation

/// Runs one sync pass against every configured remote: read the app's syncable
/// records, fetch each remote's delta, merge, push what that remote is missing,
/// and hand pulled winners back to the app for durable commit.
///
/// This is the canonical "dual mirror" pattern: the same `MirrorRecord`s travel
/// to CloudKit and the Hub, so a fresh install can rebuild from either one.
/// The runtime owns no merge rules — `MirrorMerge` decides what wins — and no
/// domain knowledge: apps supply their current record set and apply pulled
/// records into their own store.
///
/// Tombstones are the app's responsibility: entities that left the syncable set
/// must be emitted in the snapshot as records with `payload: nil`, or deletes
/// never propagate.
public actor MirrorRuntime {
    public struct TransportOutcome: Equatable, Sendable {
        public var transportID: String
        public var pushed: Int
        public var pulled: Int
        public var failure: String?

        public init(transportID: String, pushed: Int = 0, pulled: Int = 0, failure: String? = nil) {
            self.transportID = transportID
            self.pushed = pushed
            self.pulled = pulled
            self.failure = failure
        }
    }

    public struct Outcome: Equatable, Sendable {
        public var transports: [TransportOutcome]
        public var completedAt: Date

        /// True when every configured transport completed its pass. A partial
        /// sync still made progress; callers should not report "synced".
        public var isComplete: Bool { transports.allSatisfy { $0.failure == nil } }
    }

    private let transports: [any MirrorTransport]
    private let store: MirrorBookkeepingStore
    private var isSynchronizing = false
    private var waiters: [CheckedContinuation<Void, Never>] = []

    public init(transports: [any MirrorTransport], store: MirrorBookkeepingStore) {
        self.transports = transports
        self.store = store
    }

    /// Forget all sync bookkeeping. Required after the local store is wiped or
    /// wholesale replaced — a surviving ledger turns "entities are gone" into
    /// tombstones and would erase them from every remote.
    public func forgetBookkeeping() async throws {
        try await store.reset()
    }

    /// One transport's current availability, for surfaces that report each
    /// remote's state separately (e.g. Settings rows for iCloud and the Hub).
    public func availability(transportID: String) async -> MirrorAvailability? {
        guard let transport = transports.first(where: { $0.id == transportID }) else { return nil }
        return await transport.availability()
    }

    /// Clears every transport's pull token so the next pass refetches each
    /// remote's full current set — the recovery path for "check history for
    /// missing records". Pushed fingerprints and the ledger survive, so nothing
    /// already seen is re-uploaded or misdated.
    public func repullAll() async throws {
        var state = try await store.load()
        state.pullTokens = [:]
        try await store.save(state)
    }

    public func availability() async -> [String: MirrorAvailability] {
        var result: [String: MirrorAvailability] = [:]
        for transport in transports {
            result[transport.id] = await transport.availability()
        }
        return result
    }

    /// Record names this device has stamped. Apps use it to derive tombstones:
    /// a stamped name absent from the current syncable set was deleted and must
    /// be emitted as a tombstone or the delete never propagates.
    public func knownRecordNames() async throws -> Set<String> {
        Set(try await store.load().ledger.stamps.keys)
    }

    /// The append-only flag this device last stamped for a record name.
    public func isAppendOnly(_ recordName: String) async throws -> Bool {
        try await store.load().ledger.appendOnly(for: recordName)
    }

    /// The stamp the merged ledger last recorded for a record name. Apps whose
    /// entities carry no own `updatedAt` use it to keep `modifiedAt` stable:
    /// when the entity's payload fingerprint still matches the stamp, the stamp's
    /// `modifiedAt` is re-emitted instead of `now`, so an unchanged record does
    /// not look newer on every pass and loop as a perpetual push.
    public func stamp(for recordName: String) async throws -> MirrorLedger.Stamp? {
        try await store.load().ledger.stamps[recordName]
    }

    /// Binds this device's sync bookkeeping to an account. Called only after
    /// the app's explicit account approval — a different account must never
    /// inherit another account's pull tokens, pushed fingerprints, or ledger.
    /// Pass `nil` to require only that no *different* owner is bound yet.
    public func bindOwner(_ userID: String?) async throws {
        var state = try await store.load()
        if let bound = state.ownerID, bound != userID {
            throw PersonalSyncOwnershipError.differentAccount
        }
        guard let userID else { return }
        state.ownerID = userID
        try await store.save(state)
    }

    /// The account this bookkeeping is bound to, if approved yet.
    public func boundOwnerID() async throws -> String? {
        try await store.load().ownerID
    }

    /// Records staged locally that this transport has not yet accepted — the
    /// durable "pending changes" a sync status view can show per remote.
    public func unpushedCount(transportID: String, records: [MirrorRecord]) async throws -> Int {
        let pushed = try await store.load().pushedFingerprints[transportID] ?? [:]
        return records.filter {
            pushed[$0.name] != MirrorLedger.fingerprint(of: $0.payload)
        }.count
    }

    /// The last time a transport pass completed, for sync-status surfaces.
    public func lastSyncedAt() async throws -> Date? {
        try await store.load().lastSyncedAt
    }

    /// Reconciles the app's records with every reachable remote, in order.
    ///
    /// `records` must return the app's full syncable set (entities plus
    /// tombstones for deleted ones). `apply` must durably commit the pulled
    /// winners and tolerate replay — throwing leaves the pull token unsaved so
    /// the batch retries; it must never acknowledge records it did not persist.
    /// Transports sync independently: an unreachable or failing remote does not
    /// block the others, and its records stay pending for the next pass.
    @discardableResult
    public func synchronize(
        now: Date = .now,
        records: @Sendable () async throws -> [MirrorRecord],
        apply: @Sendable ([MirrorRecord]) async throws -> Void
    ) async throws -> Outcome {
        if isSynchronizing {
            await withCheckedContinuation { waiters.append($0) }
        } else {
            isSynchronizing = true
        }
        defer {
            if waiters.isEmpty { isSynchronizing = false }
            else { waiters.removeFirst().resume() }
        }
        try Task.checkCancellation()

        var outcomes: [TransportOutcome] = []
        for transport in transports {
            var outcome = TransportOutcome(transportID: transport.id)
            do {
                try await syncOne(transport, now: now, records: records, apply: apply, outcome: &outcome)
            } catch {
                outcome.failure = String(describing: error)
            }
            outcomes.append(outcome)
        }
        return Outcome(transports: outcomes, completedAt: now)
    }

    private func syncOne(
        _ transport: any MirrorTransport,
        now: Date,
        records: @Sendable () async throws -> [MirrorRecord],
        apply: @Sendable ([MirrorRecord]) async throws -> Void,
        outcome: inout TransportOutcome
    ) async throws {
        let availability = await transport.availability()
        guard availability == .available else {
            if case let .unavailable(reason) = availability {
                outcome.failure = reason
            } else {
                outcome.failure = "unavailable"
            }
            return
        }

        var bookkeeping = try await store.load()

        let pulled = try await transport.pull(since: bookkeeping.pullTokens[transport.id])
        try Task.checkCancellation()
        // Network requests can outlive a local edit. Merge with the current
        // snapshot so a response cannot overwrite work saved during the pull.
        var staged = try await records()
        for index in staged.indices {
            staged[index].modifiedAt = bookkeeping.ledger.stamp(staged[index], now: staged[index].modifiedAt)
        }

        let merge = MirrorMerge.merge(local: staged, remote: pulled.records)

        if !merge.toPull.isEmpty {
            try await apply(merge.toPull)
            // Applied records keep their remote write time: stamping with each
            // record's own modifiedAt prevents an applied pull from looking
            // freshly written here and winning merges it should lose.
            for record in merge.toPull {
                _ = bookkeeping.ledger.stamp(record, now: record.modifiedAt)
            }
        }

        var pushed = bookkeeping.pushedFingerprints[transport.id] ?? [:]
        // Everything the pull returned is definitionally present on this
        // transport — including versions that lost the merge. Marking them keeps
        // a just-pulled record from echoing back as a push, while the merged
        // winner (a different fingerprint) still goes up.
        for record in pulled.records {
            pushed[record.name] = MirrorLedger.fingerprint(of: record.payload)
        }
        let toPush = merge.merged.filter {
            pushed[$0.name] != MirrorLedger.fingerprint(of: $0.payload)
        }
        if !toPush.isEmpty {
            try await transport.push(toPush)
            var next = pushed
            for record in toPush {
                next[record.name] = MirrorLedger.fingerprint(of: record.payload)
            }
            pushed = next
            outcome.pushed = toPush.count
        }
        bookkeeping.pushedFingerprints[transport.id] = pushed

        // A token is only worth keeping once its changes have been applied and
        // everything owed to the remote has been accepted. Saving it earlier
        // would skip those records forever on the next run.
        bookkeeping.pullTokens[transport.id] = pulled.nextToken
        bookkeeping.lastSyncedAt = now
        try await store.save(bookkeeping)
        outcome.pulled = merge.toPull.count
    }
}
