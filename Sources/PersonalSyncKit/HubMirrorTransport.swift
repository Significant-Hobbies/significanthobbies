import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif

/// The Hub (`personal-platform`) home for `MirrorRecord`s.
///
/// Maps mirror envelopes onto the existing `/v1/sync` contract: record name is
/// the record ID, `modifiedAt` travels as `occurredAt`, tombstones travel as
/// `delete` mutations. The Hub's own server-assigned version is kept only as the
/// optimistic-concurrency `baseVersion`; merge truth lives in `modifiedAt`, which
/// is identical across transports.
///
/// Payloads must be JSON documents — the Hub stores `payload_json`.
public struct HubMirrorTransport: MirrorTransport {
    public let id = "hub"

    private let domain: PersonalDomain
    private let deviceId: String
    private let client: any PersonalSyncTransport
    private let account: @Sendable () async throws -> PersonalSyncAccount?
    /// Optional ownership gate applied after the account resolves — apps use it
    /// to keep the Hub leg quiet until the local store is bound to that account
    /// (e.g. document owner approval), while other transports still sync.
    private let accountGate: (@Sendable (PersonalSyncAccount) async -> Bool)?
    /// Resolves a record name to its append-only flag for pulled records, whose
    /// payload no longer carries that bit. Apps typically answer by record-name
    /// prefix or from the ledger.
    private let appendOnly: @Sendable (String) -> Bool
    /// Hub server versions per record, for optimistic concurrency only.
    private let versions: SyncVersionStore
    /// The account this copy is pinned to. Set only on the session copy
    /// returned by `beginSynchronization`: every request in that pass then
    /// authenticates with this exact user, revision, and bearer token, and
    /// the live account is only ever consulted to prove it is still the same
    /// one — a mid-pass sign-in is detected, never adopted as the session for
    /// work already begun under another account.
    private var pinned: PersonalSyncAccount?

    public init(
        domain: PersonalDomain,
        deviceId: String,
        client: any PersonalSyncTransport,
        versions: SyncVersionStore,
        account: @escaping @Sendable () async throws -> PersonalSyncAccount?,
        accountGate: (@Sendable (PersonalSyncAccount) async -> Bool)? = nil,
        appendOnly: @escaping @Sendable (String) -> Bool = { _ in false }
    ) {
        self.domain = domain
        self.deviceId = deviceId
        self.client = client
        self.versions = versions
        self.account = account
        self.accountGate = accountGate
        self.appendOnly = appendOnly
    }

    /// The account currently signed in and permitted — used to detect that the
    /// session a pass began with is gone, never as a replacement for it.
    private func liveAccount() async throws -> PersonalSyncAccount? {
        guard let verified = try await account() else { return nil }
        if let accountGate, await !accountGate(verified) { return nil }
        return verified
    }

    /// The identity requests authenticate as: the pinned account when this is
    /// a session copy, otherwise a fresh resolution.
    private func resolvedAccount() async throws -> PersonalSyncAccount? {
        if let pinned { return pinned }
        return try await liveAccount()
    }

    private func requireCurrent(_ expected: PersonalSyncAccount) async throws {
        guard let current = try await liveAccount(),
              current.userID == expected.userID,
              current.revision == expected.revision,
              current.bearerToken == expected.bearerToken else {
            throw PersonalIdentityError.sessionChanged
        }
    }

    /// Pins one synchronization pass to the account verified now. The returned
    /// copy authenticates every request — every pull page and every push batch
    /// — with that exact account and re-checks the live account around each
    /// suspension, so a sign-in that lands mid-pass fails the pass instead of
    /// silently continuing as the new account.
    public func beginSynchronization() async throws -> any MirrorTransport {
        guard let verified = try await liveAccount() else {
            throw MirrorSyncError.unavailable("not signed in")
        }
        var copy = self
        copy.pinned = verified
        return copy
    }

    /// Asserts the live account is still the one this pass was pinned to. On
    /// an unpinned transport this only asserts some account remains signed in;
    /// `beginSynchronization` is what turns an account switch into a failure.
    public func validateSynchronization() async throws {
        if let pinned {
            try await requireCurrent(pinned)
        } else if try await resolvedAccount() == nil {
            throw MirrorSyncError.unavailable("not signed in")
        }
    }

    public func availability() async -> MirrorAvailability {
        do {
            return try await resolvedAccount() == nil
                ? .unavailable("not signed in")
                : .available
        } catch {
            return .unavailable(String(describing: error))
        }
    }

    public func push(_ records: [MirrorRecord]) async throws {
        guard !records.isEmpty else { return }
        for offset in stride(from: 0, to: records.count, by: 100) {
            try Task.checkCancellation()
            try await pushBatch(Array(records[offset..<min(offset + 100, records.count)]))
        }
    }

    private func pushBatch(_ records: [MirrorRecord]) async throws {
        guard let verified = try await resolvedAccount() else {
            throw MirrorSyncError.unavailable("not signed in")
        }
        // Never send a batch under a session that already ended: on a pinned
        // pass this is where a mid-pass account switch stops the push before
        // the next network call.
        try await requireCurrent(verified)
        var mutations: [SyncMutation] = []
        for record in records {
            let recordPayload: JSONValue?
            if let payload = record.payload {
                recordPayload = try JSONDecoder().decode(JSONValue.self, from: payload)
            } else {
                recordPayload = nil
            }
            mutations.append(
                SyncMutation(
                    id: record.name,
                    operation: record.isDeleted ? .delete : .upsert,
                    baseVersion: await versions.version(for: record.name, in: domain),
                    occurredAt: Self.iso(record.modifiedAt),
                    record: recordPayload
                )
            )
        }
        try await requireCurrent(verified)
        let response = try await client.push(
            domain: domain,
            deviceId: deviceId,
            mutations: mutations,
            bearerToken: verified.bearerToken
        )
        try await requireCurrent(verified)
        guard response.results.count == mutations.count,
              Set(response.results.map(\.idempotencyKey)).count == mutations.count else {
            throw MirrorSyncError.invalidResponse
        }
        for mutation in mutations {
            guard let result = response.results.first(where: { $0.idempotencyKey == mutation.idempotencyKey }),
                  result.id == mutation.id,
                  ["accepted", "duplicate", "conflict"].contains(result.status),
                  result.status == "conflict" || result.version != nil else {
                throw MirrorSyncError.invalidResponse
            }
        }
        var conflict: String?
        for result in response.results {
            if let version = result.version {
                try await versions.setVersion(version, for: result.id, in: domain)
            } else if let actual = result.actualVersion {
                try await versions.setVersion(actual, for: result.id, in: domain)
            }
            if result.status == "conflict", conflict == nil {
                conflict = result.id
            }
        }
        if let conflict {
            // The remote moved ahead. The next pull carries its version and the
            // merge resolves it; the local push retries on the next pass.
            throw MirrorSyncError.conflict(recordName: conflict)
        }
    }

    public func pull(since token: Data?) async throws -> MirrorPullPage {
        guard let verified = try await resolvedAccount() else {
            throw MirrorSyncError.unavailable("not signed in")
        }
        var cursor = token.flatMap { Int(String(decoding: $0, as: UTF8.self)) } ?? 0
        var records: [MirrorRecord] = []
        var pages = 0
        while true {
            try Task.checkCancellation()
            pages += 1
            guard pages <= 100 else { throw MirrorSyncError.invalidResponse }
            try await requireCurrent(verified)
            let page = try await client.pull(domain: domain, cursor: cursor, bearerToken: verified.bearerToken)
            try await requireCurrent(verified)
            for change in page.changes {
                guard change.domain == domain, let modifiedAt = Self.date(change.occurredAt),
                      change.operation == .delete || change.record != .null else {
                    throw MirrorSyncError.invalidResponse
                }
                records.append(
                    MirrorRecord(
                        name: change.id,
                        modifiedAt: modifiedAt,
                        payload: change.operation == .delete ? nil : Self.payloadData(change.record),
                        appendOnly: appendOnly(change.id)
                    )
                )
                try await versions.setVersion(change.version, for: change.id, in: domain)
            }
            try await requireCurrent(verified)
            guard page.cursor >= cursor, !page.hasMore || page.cursor > cursor else {
                throw MirrorSyncError.invalidResponse
            }
            cursor = page.cursor
            if !page.hasMore { break }
        }
        return MirrorPullPage(
            records: records,
            nextToken: Data(String(cursor).utf8)
        )
    }

    nonisolated(unsafe) private static let isoFormatter = ISO8601DateFormatter()

    static func iso(_ date: Date) -> String { isoFormatter.string(from: date) }

    static func date(_ value: String) -> Date? {
        if let date = isoFormatter.date(from: value) { return date }
        let formatter = ISO8601DateFormatter()
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        // Match the Hub's retained requireIsoDate contract, including old
        // date-only records and fractional-second timestamps.
        formatter.formatOptions = value.contains("T")
            ? [.withInternetDateTime, .withFractionalSeconds]
            : [.withFullDate]
        return formatter.date(from: value)
    }

    /// Re-encodes a pulled JSON payload to bytes. Sorted keys keep the encoding
    /// deterministic so fingerprints compare content, not formatting.
    static func payloadData(_ value: JSONValue) -> Data? {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.sortedKeys]
        return try? encoder.encode(value)
    }
}
