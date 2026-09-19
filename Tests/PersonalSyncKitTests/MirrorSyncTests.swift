import Foundation
import Testing
@testable import PersonalSyncKit

// MARK: - Fixtures

private actor InMemoryTransport: MirrorTransport {
    let id: String
    var isAvailable = true
    var store: [String: MirrorRecord] = [:]
    var onPull: (@Sendable () async throws -> Void)?
    private(set) var pullCalls = 0
    private(set) var pullTokens: [Data?] = []
    private(set) var pushedBatches = 0

    init(id: String) { self.id = id }

    func availability() -> MirrorAvailability {
        isAvailable ? .available : .unavailable("offline")
    }

    func push(_ records: [MirrorRecord]) throws {
        pushedBatches += 1
        for record in records {
            if let existing = store[record.name] {
                store[record.name] = MirrorMerge.winner(existing, record)
            } else {
                store[record.name] = record
            }
        }
    }

    func pull(since token: Data?) async throws -> MirrorPullPage {
        pullCalls += 1
        pullTokens.append(token)
        try await onPull?()
        return MirrorPullPage(
            records: store.values.sorted { $0.name < $1.name },
            nextToken: Data("token".utf8)
        )
    }
}

/// A minimal app-side store: emits its whole record set and commits pulled
/// winners, tolerating replay like a real document merge.
private actor FakeLocalStore {
    var records: [String: MirrorRecord] = [:]
    var appliedBatches = 0
    var failNextApply = false

    func snapshot() -> [MirrorRecord] {
        records.values.sorted { $0.name < $1.name }
    }

    func apply(_ pulled: [MirrorRecord]) throws {
        appliedBatches += 1
        if failNextApply {
            failNextApply = false
            throw MirrorSyncError.unavailable("commit failed")
        }
        for record in pulled {
            records[record.name] = record
        }
    }
}

private func record(
    _ name: String,
    at seconds: TimeInterval,
    payload: String?,
    appendOnly: Bool = false
) -> MirrorRecord {
    MirrorRecord(
        name: name,
        modifiedAt: Date(timeIntervalSinceReferenceDate: seconds),
        payload: payload.map { Data($0.utf8) },
        appendOnly: appendOnly
    )
}

private func makeRuntime(
    _ transports: [any MirrorTransport]
) throws -> (MirrorRuntime, URL) {
    let directory = FileManager.default.temporaryDirectory
        .appending(path: UUID().uuidString, directoryHint: .isDirectory)
    let runtime = MirrorRuntime(
        transports: transports,
        store: MirrorBookkeepingStore(fileURL: directory.appending(path: "mirror-sync.json"))
    )
    return (runtime, directory)
}

// MARK: - Merge rules

@Test func mergePrefersNewerWriteTime() {
    let older = record("person-1", at: 100, payload: "before")
    let newer = record("person-1", at: 200, payload: "after")
    let result = MirrorMerge.merge(local: [older], remote: [newer])
    #expect(result.toPull == [newer])
    #expect(result.toPush.isEmpty)
    #expect(result.merged == [newer])
}

@Test func mergePushesWhatRemoteLacks() {
    let mine = record("goal-1", at: 100, payload: "run a 5k")
    let result = MirrorMerge.merge(local: [mine], remote: [])
    #expect(result.toPush == [mine])
    #expect(result.toPull.isEmpty)
}

@Test func mergePropagatesTombstoneOverOlderLiveRecord() {
    let live = record("template-1", at: 100, payload: "push day")
    let tombstone = record("template-1", at: 200, payload: nil)
    let result = MirrorMerge.merge(local: [live], remote: [tombstone])
    #expect(result.toPull == [tombstone])
    #expect(result.merged.first?.isDeleted == true)
}

@Test func appendOnlyRecordSurvivesTombstone() {
    let entry = record("session-1", at: 100, payload: "45 min", appendOnly: true)
    let tombstone = record("session-1", at: 300, payload: nil, appendOnly: true)
    let result = MirrorMerge.merge(local: [entry], remote: [tombstone])
    // A tombstone can never beat a live append-only copy: a wrong clock cannot
    // erase something that happened.
    #expect(result.toPull.isEmpty)
    #expect(result.toPush == [entry])
    #expect(result.merged == [entry])
}

@Test func mergeTieBreaksDeterministicallyOnPayloadBytes() {
    let left = record("doc-1", at: 100, payload: "aaa")
    let right = record("doc-1", at: 100, payload: "bbb")
    let forward = MirrorMerge.merge(local: [left], remote: [right])
    let backward = MirrorMerge.merge(local: [right], remote: [left])
    #expect(forward.merged == backward.merged)
    #expect(forward.merged.first?.payload == Data("bbb".utf8))
}

// MARK: - Ledger

@Test func ledgerKeepsOriginalWriteTimeForUnchangedPayload() {
    var ledger = MirrorLedger()
    let original = record("goal-1", at: 100, payload: "run a 5k")
    #expect(ledger.stamp(original, now: original.modifiedAt) == original.modifiedAt)

    let reemitted = record("goal-1", at: 500, payload: "run a 5k")
    #expect(ledger.stamp(reemitted, now: reemitted.modifiedAt) == original.modifiedAt)
}

@Test func ledgerRedatesChangedPayload() {
    var ledger = MirrorLedger()
    let original = record("goal-1", at: 100, payload: "run a 5k")
    _ = ledger.stamp(original, now: original.modifiedAt)

    let edited = record("goal-1", at: 500, payload: "run a 10k")
    #expect(ledger.stamp(edited, now: edited.modifiedAt) == edited.modifiedAt)
}

// MARK: - Runtime: dual transport convergence

@Test func localWritesReachBothRemotes() async throws {
    let hub = InMemoryTransport(id: "hub")
    let cloud = InMemoryTransport(id: "cloudkit")
    let (runtime, _) = try makeRuntime([hub, cloud])
    let doc = FakeLocalStore()
    try await doc.apply([record("person-1", at: 100, payload: "Ravi")])

    let outcome = try await runtime.synchronize {
        await doc.snapshot()
    } apply: { pulled in
        try await doc.apply(pulled)
    }

    #expect(outcome.isComplete)
    #expect(await hub.store["person-1"]?.payload == Data("Ravi".utf8))
    #expect(await cloud.store["person-1"]?.payload == Data("Ravi".utf8))
}

@Test func recordPulledFromOneRemotePropagatesToOther() async throws {
    let hub = InMemoryTransport(id: "hub")
    let cloud = InMemoryTransport(id: "cloudkit")
    try await hub.push([record("session-1", at: 100, payload: "run", appendOnly: true)])
    let (runtime, _) = try makeRuntime([hub, cloud])
    let doc = FakeLocalStore()

    let outcome = try await runtime.synchronize {
        await doc.snapshot()
    } apply: { pulled in
        try await doc.apply(pulled)
    }

    #expect(outcome.isComplete)
    // Pulled from hub, committed locally, and forwarded to CloudKit: the two
    // remotes are equivalent after one pass.
    #expect(await doc.records["session-1"]?.payload == Data("run".utf8))
    #expect(await cloud.store["session-1"]?.payload == Data("run".utf8))
}

@Test func tombstoneReachesBothRemotes() async throws {
    let hub = InMemoryTransport(id: "hub")
    let cloud = InMemoryTransport(id: "cloudkit")
    let live = record("template-1", at: 100, payload: "push day")
    try await hub.push([live])
    try await cloud.push([live])
    let (runtime, _) = try makeRuntime([hub, cloud])
    let doc = FakeLocalStore()
    try await doc.apply([record("template-1", at: 200, payload: nil)])

    _ = try await runtime.synchronize {
        await doc.snapshot()
    } apply: { pulled in
        try await doc.apply(pulled)
    }

    #expect(await hub.store["template-1"]?.isDeleted == true)
    #expect(await cloud.store["template-1"]?.isDeleted == true)
}

@Test func newerRemoteVersionIsAppliedLocally() async throws {
    let hub = InMemoryTransport(id: "hub")
    let cloud = InMemoryTransport(id: "cloudkit")
    try await hub.push([record("goal-1", at: 300, payload: "new target")])
    let (runtime, _) = try makeRuntime([hub, cloud])
    let doc = FakeLocalStore()
    try await doc.apply([record("goal-1", at: 100, payload: "old target")])

    _ = try await runtime.synchronize {
        await doc.snapshot()
    } apply: { pulled in
        try await doc.apply(pulled)
    }

    #expect(await doc.records["goal-1"]?.payload == Data("new target".utf8))
    // The losing local version is corrected on both remotes too.
    #expect(await hub.store["goal-1"]?.payload == Data("new target".utf8))
    #expect(await cloud.store["goal-1"]?.payload == Data("new target".utf8))
}

@Test func failedApplyRetriesPullOnNextSync() async throws {
    let hub = InMemoryTransport(id: "hub")
    let (runtime, _) = try makeRuntime([hub])
    let doc = FakeLocalStore()
    try await doc.apply([record("note-1", at: 100, payload: "local")])

    // Remote wins; the app commit fails; nothing is acknowledged.
    try await hub.push([record("note-1", at: 200, payload: "remote")])
    await doc.setFailNextApply()
    await doc.resetAppliedBatches()
    _ = try await runtime.synchronize {
        await doc.snapshot()
    } apply: { pulled in
        try await doc.apply(pulled)
    }
    #expect(await doc.records["note-1"]?.payload == Data("local".utf8))

    // Next pass replays the same pull and commits.
    _ = try await runtime.synchronize {
        await doc.snapshot()
    } apply: { pulled in
        try await doc.apply(pulled)
    }
    #expect(await doc.records["note-1"]?.payload == Data("remote".utf8))
    #expect(await doc.appliedBatches == 2)
}

@Test func unavailableTransportSkipsWithoutBlockingOthers() async throws {
    let hub = InMemoryTransport(id: "hub")
    let cloud = InMemoryTransport(id: "cloudkit")
    await hub.setUnavailable()
    let (runtime, _) = try makeRuntime([hub, cloud])
    let doc = FakeLocalStore()
    try await doc.apply([record("person-1", at: 100, payload: "Ravi")])

    let outcome = try await runtime.synchronize {
        await doc.snapshot()
    } apply: { pulled in
        try await doc.apply(pulled)
    }

    #expect(!outcome.isComplete)
    #expect(outcome.transports.first { $0.transportID == "hub" }?.failure != nil)
    // CloudKit still converged; Hub catches up later.
    #expect(await cloud.store["person-1"]?.payload == Data("Ravi".utf8))

    await hub.setAvailable()
    let second = try await runtime.synchronize {
        await doc.snapshot()
    } apply: { pulled in
        try await doc.apply(pulled)
    }
    #expect(second.isComplete)
    #expect(await hub.store["person-1"]?.payload == Data("Ravi".utf8))
}

@Test func twoDevicesConvergeThroughSharedRemotes() async throws {
    // Two devices share the same two remotes (like the real deployment).
    let hub = InMemoryTransport(id: "hub")
    let cloud = InMemoryTransport(id: "cloudkit")
    let (runtimeA, _) = try makeRuntime([hub, cloud])
    let (runtimeB, _) = try makeRuntime([hub, cloud])
    let docA = FakeLocalStore()
    let docB = FakeLocalStore()

    try await docA.apply([record("person-1", at: 100, payload: "from A")])
    try await docB.apply([record("person-2", at: 100, payload: "from B")])

    _ = try await runtimeA.synchronize { await docA.snapshot() } apply: { try await docA.apply($0) }
    _ = try await runtimeB.synchronize { await docB.snapshot() } apply: { try await docB.apply($0) }
    // A's second pass picks up B's record from either remote.
    _ = try await runtimeA.synchronize { await docA.snapshot() } apply: { try await docA.apply($0) }

    #expect(await docA.records["person-1"] != nil)
    #expect(await docA.records["person-2"]?.payload == Data("from B".utf8))
    #expect(await docB.records["person-1"]?.payload == Data("from A".utf8))
    #expect(await docB.records["person-2"] != nil)
}

// MARK: - Bookkeeping

@Test func bookkeepingSurvivesReopenAndResets() async throws {
    let directory = FileManager.default.temporaryDirectory
        .appending(path: UUID().uuidString, directoryHint: .isDirectory)
    let file = directory.appending(path: "mirror-sync.json")
    let store = MirrorBookkeepingStore(fileURL: file)

    var state = MirrorBookkeepingStore.State()
    state.pullTokens["hub"] = Data("42".utf8)
    state.pushedFingerprints["hub"] = ["person-1": "abc"]
    try await store.save(state)

    let reopened = try await store.load()
    #expect(reopened.pullTokens["hub"] == Data("42".utf8))
    #expect(reopened.pushedFingerprints["hub"]?["person-1"] == "abc")

    try await store.reset()
    let afterReset = try await store.load()
    #expect(afterReset == MirrorBookkeepingStore.State())
}

@Test func corruptBookkeepingFailsWithoutDiscardingOwnershipOrHistory() async throws {
    let directory = FileManager.default.temporaryDirectory
        .appending(path: UUID().uuidString, directoryHint: .isDirectory)
    let file = directory.appending(path: "mirror-sync.json")
    try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
    try Data("not json".utf8).write(to: file)

    let store = MirrorBookkeepingStore(fileURL: file)
    await #expect(throws: DecodingError.self) { try await store.load() }
    #expect(try Data(contentsOf: file) == Data("not json".utf8))
}

@Test func pullOnlySyncRemembersRemoteAcceptanceAfterRestart() async throws {
    let hub = InMemoryTransport(id: "hub")
    let remote = record("person-1", at: 100, payload: "Ravi")
    try await hub.push([remote])
    let (runtime, directory) = try makeRuntime([hub])
    let doc = FakeLocalStore()
    let outcome = try await runtime.synchronize {
        await doc.snapshot()
    } apply: { try await doc.apply($0) }
    #expect(outcome.isComplete)
    #expect(outcome.transports.first?.pushed == 0)
    let reopened = MirrorRuntime(
        transports: [hub],
        store: MirrorBookkeepingStore(fileURL: directory.appending(path: "mirror-sync.json"))
    )
    #expect(try await reopened.unpushedCount(transportID: "hub", records: [remote]) == 0)
}

private extension FakeLocalStore {
    func setFailNextApply() { failNextApply = true }
    func resetAppliedBatches() { appliedBatches = 0 }
}

private extension InMemoryTransport {
    func setOnPull(_ action: @escaping @Sendable () async throws -> Void) { onPull = action }
    func setUnavailable() { isAvailable = false }
    func setAvailable() { isAvailable = true }
}

@Test func editSavedDuringPullSurvivesOlderRemoteResponse() async throws {
    let hub = InMemoryTransport(id: "hub")
    let (runtime, _) = try makeRuntime([hub])
    let doc = FakeLocalStore()
    try await doc.apply([record("person-1", at: 100, payload: "old local")])
    try await hub.push([record("person-1", at: 200, payload: "remote")])
    await hub.setOnPull {
        try await doc.apply([record("person-1", at: 300, payload: "new local edit")])
    }
    let outcome = try await runtime.synchronize { await doc.snapshot() } apply: { try await doc.apply($0) }
    #expect(outcome.isComplete)
    #expect(await doc.records["person-1"]?.payload == Data("new local edit".utf8))
    #expect(await hub.store["person-1"]?.payload == Data("new local edit".utf8))
}

@Test(arguments: ["bind", "repull", "reset"])
func mirrorControlMutationCannotBeOverwrittenBySuspendedPass(_ operation: String) async throws {
    let hub = InMemoryTransport(id: "hub")
    let (runtime, directory) = try makeRuntime([hub])
    defer { try? FileManager.default.removeItem(at: directory) }
    let remote = record("person-1", at: 100, payload: "remote")
    try await hub.push([remote])
    let doc = FakeLocalStore()
    let outcome = try await runtime.synchronize {
        // The runtime has read bookkeeping and is suspended in app code.
        switch operation {
        case "bind": try await runtime.bindOwner("owner-a")
        case "repull": try await runtime.repullAll()
        default: try await runtime.forgetBookkeeping()
        }
        return await doc.snapshot()
    } apply: { try await doc.apply($0) }
    #expect(!outcome.isComplete)
    #expect(await doc.appliedBatches == 0)
    let state = try await MirrorBookkeepingStore(
        fileURL: directory.appending(path: "mirror-sync.json")
    ).load()
    #expect(state.pullTokens.isEmpty)
    #expect(state.lastSyncedAt == nil)
    #expect(state.ownerID == (operation == "bind" ? "owner-a" : nil))
    #expect(state.ledger.stamps.isEmpty)
}

@Test(arguments: ["bind", "repull", "reset"])
func mirrorBookkeepingRejectsStaleFinalSave(_ operation: String) async throws {
    let directory = FileManager.default.temporaryDirectory.appending(path: UUID().uuidString)
    defer { try? FileManager.default.removeItem(at: directory) }
    let store = MirrorBookkeepingStore(fileURL: directory.appending(path: "mirror.json"))
    let snapshot = try await store.loadSnapshot()
    switch operation {
    case "bind": try await store.bindOwner("owner-a")
    case "repull": try await store.repullAll()
    default: try await store.reset()
    }
    let afterControl = try await store.load()
    await #expect(throws: MirrorSyncError.self) {
        try await store.save(snapshot.state, ifRevision: snapshot.revision)
    }
    #expect(try await store.load() == afterControl)
}

private actor LocalSnapshotFence {
    let failOnCall: Int
    var calls = 0
    init(failOnCall: Int) { self.failOnCall = failOnCall }
    func validate() throws {
        calls += 1
        if calls == failOnCall { throw MirrorSyncError.unavailable("local document changed") }
    }
}

@Test(arguments: [1, 2, 3])
func mirrorLocalSnapshotValidationProtectsPushOnlyPassAndReceipt(_ failOnCall: Int) async throws {
    let hub = InMemoryTransport(id: "hub")
    let (runtime, directory) = try makeRuntime([hub])
    defer { try? FileManager.default.removeItem(at: directory) }
    let fence = LocalSnapshotFence(failOnCall: failOnCall)
    let local = record("person-1", at: 100, payload: "local")
    let outcome = try await runtime.synchronize(
        records: { [local] },
        validateLocalSnapshot: { _ in try await fence.validate() },
        apply: { _ in Issue.record("A push-only pass must not apply anything") }
    )
    #expect(!outcome.isComplete)
    let persisted = try await MirrorBookkeepingStore(fileURL: directory.appending(path: "mirror-sync.json")).load()
    #expect(persisted.pullTokens.isEmpty)
    #expect(persisted.lastSyncedAt == nil)
    if failOnCall < 3 { #expect(await hub.store.isEmpty) }
    else { #expect(await hub.store[local.name] == local) }
}

// MARK: - Runtime: transport-scoped snapshots

/// Records what the scoped callbacks were invoked with, so tests can prove
/// each transport's pass ran under its own runtime id.
private actor ScopedCallbackLog {
    var snapshots: [String] = []
    var applies: [(source: String, names: [String])] = []
    var validations: [String] = []

    func recordSnapshot(_ transportID: String) { snapshots.append(transportID) }
    func recordApply(source: String, names: [String]) { applies.append((source, names)) }
    func recordValidation(_ transportID: String) { validations.append(transportID) }
}

@Test(arguments: [["hub", "cloudkit"], ["cloudkit", "hub"]])
func transportScopedSnapshotFiltersIneligibleRecord(_ order: [String]) async throws {
    let hub = InMemoryTransport(id: "hub")
    let cloud = InMemoryTransport(id: "cloudkit")
    let (runtime, _) = try makeRuntime(order.map { $0 == "hub" ? hub : cloud })
    let shared = record("shared-1", at: 100, payload: "everywhere")
    let cloudOnly = record("private-1", at: 100, payload: "cloud only")
    let log = ScopedCallbackLog()

    func synchronize() async throws -> MirrorRuntime.Outcome {
        try await runtime.synchronize(
            recordsForTransport: { transportID in
                await log.recordSnapshot(transportID)
                return transportID == "cloudkit" ? [shared, cloudOnly] : [shared]
            },
            applyFromTransport: { source, pulled in
                await log.recordApply(source: source, names: pulled.map(\.name))
            }
        )
    }

    #expect(try await synchronize().isComplete)
    // The record withheld from hub's snapshot is never offered to it —
    // absence filters, it does not delete.
    #expect(await hub.store["shared-1"]?.payload == Data("everywhere".utf8))
    #expect(await hub.store["private-1"] == nil)
    #expect(await cloud.store["shared-1"]?.payload == Data("everywhere".utf8))
    #expect(await cloud.store["private-1"]?.payload == Data("cloud only".utf8))
    #expect(await Set(log.snapshots) == Set(order))

    // A later pass keeps the exclusion: the withheld record never leaks to
    // the hub, and nothing about it is treated as a tombstone.
    #expect(try await synchronize().isComplete)
    #expect(await hub.store["private-1"] == nil)
    #expect(await cloud.store["private-1"]?.payload == Data("cloud only".utf8))
    #expect(await log.applies.isEmpty)
}

@Test func scopedCallbacksReceiveRuntimeTransportID() async throws {
    let hub = InMemoryTransport(id: "hub")
    let cloud = InMemoryTransport(id: "cloudkit")
    try await hub.push([record("remote-1", at: 100, payload: "from hub")])
    let (runtime, _) = try makeRuntime([hub, cloud])
    let doc = FakeLocalStore()
    let log = ScopedCallbackLog()

    let outcome = try await runtime.synchronize(
        recordsForTransport: { transportID in
            await log.recordSnapshot(transportID)
            return await doc.snapshot()
        },
        validateLocalSnapshot: { transportID in
            await log.recordValidation(transportID)
        },
        applyFromTransport: { source, pulled in
            await log.recordApply(source: source, names: pulled.map(\.name))
            try await doc.apply(pulled)
        }
    )

    #expect(outcome.isComplete)
    // The winner pulled from the hub is attributed to "hub" — the runtime's
    // transport id — and forwarded to CloudKit on its own pass.
    #expect(await log.applies.map(\.source) == ["hub"])
    #expect(await log.applies.map(\.names) == [["remote-1"]])
    #expect(await doc.records["remote-1"]?.payload == Data("from hub".utf8))
    #expect(await cloud.store["remote-1"]?.payload == Data("from hub".utf8))
    #expect(await Set(log.snapshots) == ["hub", "cloudkit"])
    #expect(await Set(log.validations) == ["hub", "cloudkit"])
}

@Test func failedScopedApplyLeavesPullTokenAndLaterTransportProceeds() async throws {
    let hub = InMemoryTransport(id: "hub")
    let cloud = InMemoryTransport(id: "cloudkit")
    try await hub.push([record("remote-1", at: 200, payload: "from hub")])
    let (runtime, directory) = try makeRuntime([hub, cloud])
    defer { try? FileManager.default.removeItem(at: directory) }
    let doc = FakeLocalStore()
    try await doc.apply([record("local-1", at: 100, payload: "local")])
    let log = ScopedCallbackLog()

    await doc.setFailNextApply()
    let first = try await runtime.synchronize(
        recordsForTransport: { _ in await doc.snapshot() },
        applyFromTransport: { source, pulled in
            await log.recordApply(source: source, names: pulled.map(\.name))
            try await doc.apply(pulled)
        }
    )

    #expect(!first.isComplete)
    #expect(first.transports.first { $0.transportID == "hub" }?.failure != nil)
    #expect(first.transports.first { $0.transportID == "cloudkit" }?.failure == nil)
    // The rejected batch was not committed and hub's pull token was not
    // saved — the same delta must be offered again.
    #expect(await doc.records["remote-1"] == nil)
    #expect(await log.applies.map(\.source) == ["hub"])
    let persisted = try await MirrorBookkeepingStore(
        fileURL: directory.appending(path: "mirror-sync.json")
    ).load()
    #expect(persisted.pullTokens["hub"] == nil)
    #expect(persisted.pullTokens["cloudkit"] != nil)
    // Hub's failure did not block CloudKit, which accepted the local record.
    #expect(await cloud.store["local-1"]?.payload == Data("local".utf8))

    let second = try await runtime.synchronize(
        recordsForTransport: { _ in await doc.snapshot() },
        applyFromTransport: { source, pulled in
            await log.recordApply(source: source, names: pulled.map(\.name))
            try await doc.apply(pulled)
        }
    )
    #expect(second.isComplete)
    #expect(await doc.records["remote-1"]?.payload == Data("from hub".utf8))
    #expect(await log.applies.map(\.source) == ["hub", "hub"])
}

private actor CascadingLocalStore {
    var records: [String: MirrorRecord]

    init(records: [MirrorRecord]) {
        self.records = Dictionary(uniqueKeysWithValues: records.map { ($0.name, $0) })
    }

    func snapshot() -> [MirrorRecord] {
        records.values.sorted { $0.name < $1.name }
    }

    func apply(_ pulled: [MirrorRecord]) {
        for record in pulled {
            records[record.name] = record
            if record.name == "person-1", record.isDeleted {
                records["note-1"] = MirrorRecord(
                    name: "note-1",
                    modifiedAt: record.modifiedAt,
                    payload: nil
                )
            }
        }
    }
}

@Test func applyCascadeRefreshesOutgoingProjectionBeforePush() async throws {
    let hub = InMemoryTransport(id: "hub")
    let parent = record("person-1", at: 100, payload: "person")
    let pendingChild = record("note-1", at: 200, payload: "private pending note")
    let parentDeletion = record("person-1", at: 300, payload: nil)
    try await hub.push([parentDeletion])
    let (runtime, _) = try makeRuntime([hub])
    let local = CascadingLocalStore(records: [parent, pendingChild])

    let outcome = try await runtime.synchronize(
        recordsForTransport: { _ in await local.snapshot() },
        applyFromTransport: { _, records in await local.apply(records) }
    )

    #expect(outcome.isComplete)
    #expect(await hub.store["person-1"]?.isDeleted == true)
    #expect(await hub.store["note-1"]?.isDeleted == true)
    #expect(await hub.store["note-1"]?.payload != pendingChild.payload)
    #expect(await local.records["note-1"]?.isDeleted == true)
}

// MARK: - Cancellation and serialization

/// A cancelled pass must not start network work for transports it has not
/// reached yet: cancellation aborts the whole pass instead of running the
/// remaining remotes and reporting a partial outcome.
@Test func cancelledMirrorSyncDoesNotStartRemainingTransports() async throws {
    let first = InMemoryTransport(id: "first")
    let second = InMemoryTransport(id: "second")
    await first.setOnPull { withUnsafeCurrentTask { $0?.cancel() } }
    let (runtime, _) = try makeRuntime([first, second])
    let doc = FakeLocalStore()
    try await doc.apply([record("person-1", at: 100, payload: "local")])

    let pass = Task {
        try await runtime.synchronize { await doc.snapshot() } apply: { try await doc.apply($0) }
    }
    await #expect(throws: CancellationError.self) { try await pass.value }
    #expect(await second.pullCalls == 0)
    #expect(await second.pushedBatches == 0)
    #expect(await second.store.isEmpty)
}

/// Holds only the first pull a transport performs so a second pass can be
/// observed waiting on the runtime permit.
private actor FirstPullGate {
    private var calls = 0
    private let entered: AsyncStream<Void>.Continuation
    init(entered: AsyncStream<Void>.Continuation) { self.entered = entered }
    func hold(released: AsyncStream<Void>) async {
        calls += 1
        guard calls == 1 else { return }
        entered.yield(())
        for await _ in released { break }
    }
}

private actor SnapshotProbe {
    private(set) var invocations = 0
    func mark() { invocations += 1 }
}

/// Two overlapping synchronize calls serialize: the second cannot even read
/// the app's record set while the first pass is suspended mid-pull.
@Test(.timeLimit(.minutes(1))) func overlappingMirrorSyncPassesRunSerially() async throws {
    let hub = InMemoryTransport(id: "hub")
    let (runtime, _) = try makeRuntime([hub])
    let doc = FakeLocalStore()
    try await doc.apply([record("person-1", at: 100, payload: "local")])
    let entered = AsyncStream<Void>.makeStream()
    let released = AsyncStream<Void>.makeStream()
    defer { entered.continuation.finish(); released.continuation.finish() }
    let gate = FirstPullGate(entered: entered.continuation)
    await hub.setOnPull { await gate.hold(released: released.stream) }

    let probe = SnapshotProbe()
    let first = Task {
        try await runtime.synchronize { await doc.snapshot() } apply: { try await doc.apply($0) }
    }
    for await _ in entered.stream { break }
    let second = Task {
        try await runtime.synchronize(
            records: {
                await probe.mark()
                return await doc.snapshot()
            },
            apply: { try await doc.apply($0) }
        )
    }
    // Give the competing pass a chance to enter while the first is held.
    try await Task.sleep(for: .milliseconds(50))
    #expect(await probe.invocations == 0)
    released.continuation.yield(())
    #expect(try await first.value.isComplete)
    #expect(try await second.value.isComplete)
    #expect(await probe.invocations == 1)
    #expect(await hub.pullCalls == 2)
}

// MARK: - Recovery and introspection

/// repullAll drops pull tokens so the next pass refetches the remote's full
/// set, but pushed fingerprints survive: already-seen records are not
/// re-uploaded and an unchanged pull is not re-applied.
@Test func repullAllForcesFullRefetchWithoutRepushingOrReapplying() async throws {
    let hub = InMemoryTransport(id: "hub")
    try await hub.push([record("r-1", at: 100, payload: "remote")])
    let (runtime, _) = try makeRuntime([hub])
    let doc = FakeLocalStore()

    let first = try await runtime.synchronize { await doc.snapshot() } apply: { try await doc.apply($0) }
    #expect(first.isComplete)
    #expect(await doc.records["r-1"]?.payload == Data("remote".utf8))
    #expect(await hub.pullTokens == [nil])

    try await runtime.repullAll()
    let second = try await runtime.synchronize { await doc.snapshot() } apply: { try await doc.apply($0) }
    #expect(second.isComplete)
    // The pull restarted from scratch; nothing was re-pushed or re-applied.
    #expect(await hub.pullTokens == [nil, nil])
    #expect(second.transports.first?.pushed == 0)
    #expect(await doc.appliedBatches == 1)
}

/// When the bookkeeping file cannot even be read, a pass refuses to do remote
/// work at all rather than run against unknown bookkeeping — then recovers
/// once the obstruction is gone.
@Test func obstructedBookkeepingBlocksPassThenRecovers() async throws {
    let hub = InMemoryTransport(id: "hub")
    try await hub.push([record("r-1", at: 100, payload: "remote")])
    let (runtime, directory) = try makeRuntime([hub])
    defer { try? FileManager.default.removeItem(at: directory) }
    let file = directory.appending(path: "mirror-sync.json")
    try FileManager.default.createDirectory(at: file, withIntermediateDirectories: true)
    let doc = FakeLocalStore()

    let first = try await runtime.synchronize { await doc.snapshot() } apply: { try await doc.apply($0) }
    #expect(!first.isComplete)
    #expect(first.transports.first?.failure != nil)
    #expect(await hub.pullCalls == 0)
    #expect(await doc.appliedBatches == 0)

    try FileManager.default.removeItem(at: file)
    let second = try await runtime.synchronize { await doc.snapshot() } apply: { try await doc.apply($0) }
    #expect(second.isComplete)
    #expect(await doc.records["r-1"]?.payload == Data("remote".utf8))
}

/// The app's durable commit can succeed while the final bookkeeping write
/// fails: the pull token must not advance, so the next pass replays the pull
/// and the merge makes the replay a no-op.
@Test func bookkeepingSaveFailureAfterCommitReplaysPullSafely() async throws {
    let hub = InMemoryTransport(id: "hub")
    try await hub.push([record("r-1", at: 100, payload: "remote")])
    let (runtime, directory) = try makeRuntime([hub])
    defer { try? FileManager.default.removeItem(at: directory) }
    let file = directory.appending(path: "mirror-sync.json")
    let doc = FakeLocalStore()

    let first = try await runtime.synchronize(
        records: { await doc.snapshot() },
        apply: { pulled in
            try await doc.apply(pulled)
            // The commit is durable; the bookkeeping write now fails on disk.
            try FileManager.default.createDirectory(at: file, withIntermediateDirectories: true)
        }
    )
    #expect(!first.isComplete)
    #expect(await doc.records["r-1"]?.payload == Data("remote".utf8))

    try FileManager.default.removeItem(at: file)
    let second = try await runtime.synchronize { await doc.snapshot() } apply: { try await doc.apply($0) }
    #expect(second.isComplete)
    // The failed save never persisted the token: the remote was re-read from
    // scratch, and the already-committed winner did not apply twice.
    #expect(await hub.pullTokens == [nil, nil])
    #expect(await doc.appliedBatches == 1)
}

/// bindOwner pins the explicit-adoption contract: unbound stores accept a nil
/// probe and a first bind, bound stores reject every other account including
/// nil, and the binding survives a store reopen until reset.
@Test func bindOwnerContractPersistsAndRejectsOtherAccounts() async throws {
    let directory = FileManager.default.temporaryDirectory
        .appending(path: UUID().uuidString, directoryHint: .isDirectory)
    defer { try? FileManager.default.removeItem(at: directory) }
    let file = directory.appending(path: "mirror-sync.json")
    let store = MirrorBookkeepingStore(fileURL: file)

    try await store.bindOwner(nil)
    #expect(try await store.load().ownerID == nil)
    try await store.bindOwner("owner-a")
    try await store.bindOwner("owner-a")
    #expect(try await store.load().ownerID == "owner-a")
    await #expect(throws: PersonalSyncOwnershipError.differentAccount) {
        try await store.bindOwner("owner-b")
    }
    await #expect(throws: PersonalSyncOwnershipError.differentAccount) {
        try await store.bindOwner(nil)
    }
    let reopened = MirrorBookkeepingStore(fileURL: file)
    #expect(try await reopened.load().ownerID == "owner-a")

    try await reopened.reset()
    #expect(try await reopened.load().ownerID == nil)
    try await reopened.bindOwner("owner-b")
    #expect(try await reopened.load().ownerID == "owner-b")
}

/// The introspection surfaces apps drive status UI from — pending counts,
/// known names, stamps, append-only flags, last-sync time — must reflect the
/// committed bookkeeping exactly.
@Test func introspectionSurfacesTrackCommittedSyncState() async throws {
    let hub = InMemoryTransport(id: "hub")
    let (runtime, _) = try makeRuntime([hub])
    let doc = FakeLocalStore()
    let person = record("person-1", at: 100, payload: "Ravi")
    let session = record("session-1", at: 50, payload: "log", appendOnly: true)
    try await doc.apply([person, session])

    #expect(try await runtime.lastSyncedAt() == nil)
    #expect(try await runtime.unpushedCount(transportID: "hub", records: [person, session]) == 2)
    #expect(try await runtime.knownRecordNames().isEmpty)

    _ = try await runtime.synchronize { await doc.snapshot() } apply: { try await doc.apply($0) }

    #expect(try await runtime.unpushedCount(transportID: "hub", records: [person, session]) == 0)
    #expect(try await runtime.knownRecordNames() == ["person-1", "session-1"])
    #expect(try await runtime.isAppendOnly("session-1") == true)
    #expect(try await runtime.isAppendOnly("person-1") == false)
    #expect(try await runtime.stamp(for: "person-1")?.modifiedAt == person.modifiedAt)
    #expect(try await runtime.lastSyncedAt() != nil)

    let edited = record("person-1", at: 200, payload: "Ravi II")
    try await doc.apply([edited])
    #expect(try await runtime.unpushedCount(transportID: "hub", records: [edited, session]) == 1)
    // An append-only kind keeps its write time across replayed snapshots.
    #expect(try await runtime.stamp(for: "session-1")?.modifiedAt == session.modifiedAt)
}

// MARK: - Ownership gate at the runtime boundary

private actor RecordingSyncClient: PersonalSyncTransport {
    private(set) var pulls = 0
    private(set) var pushedIDs: [String] = []
    func push(domain: PersonalDomain, deviceId: String, mutations: [SyncMutation], bearerToken: String) -> PushResponse {
        pushedIDs.append(contentsOf: mutations.map(\.id))
        return PushResponse(results: mutations.map {
            PushResult(id: $0.id, idempotencyKey: $0.idempotencyKey, status: "accepted",
                       version: 1, cursor: 1, expectedVersion: nil, actualVersion: nil)
        })
    }
    func pull(domain: PersonalDomain, cursor: Int, bearerToken: String) -> PullResponse {
        pulls += 1
        return PullResponse(changes: [], cursor: cursor, hasMore: false)
    }
}

private actor BoolFlag {
    private(set) var value = false
    func set(_ newValue: Bool) { value = newValue }
}

/// A Hub transport gated by account approval stays quiet inside a dual-mirror
/// pass — no pull, no push — while the CloudKit leg still converges. Opening
/// the gate resumes Hub work on the next pass.
@Test func gatedHubLegStaysQuietWhileOtherRemoteSyncs() async throws {
    let directory = FileManager.default.temporaryDirectory
        .appending(path: UUID().uuidString, directoryHint: .isDirectory)
    defer { try? FileManager.default.removeItem(at: directory) }
    let approved = BoolFlag()
    let client = RecordingSyncClient()
    let account = PersonalSyncAccount(userID: "a", bearerToken: "synthetic", revision: UUID())
    let hub = HubMirrorTransport(
        domain: .kith, deviceId: "fixture", client: client,
        versions: try SyncVersionStore(fileURL: directory.appending(path: "versions.json")),
        account: { account },
        accountGate: { _ in await approved.value }
    )
    let cloud = InMemoryTransport(id: "cloudkit")
    let runtime = MirrorRuntime(
        transports: [hub, cloud],
        store: MirrorBookkeepingStore(fileURL: directory.appending(path: "mirror-sync.json"))
    )
    let doc = FakeLocalStore()
    // Hub payloads are JSON documents; the fixture pushes a JSON object like a
    // real adapter would.
    try await doc.apply([record("person-1", at: 100, payload: #"{"value":"local"}"#)])

    let first = try await runtime.synchronize { await doc.snapshot() } apply: { try await doc.apply($0) }
    #expect(!first.isComplete)
    #expect(first.transports.first { $0.transportID == "hub" }?.failure != nil)
    #expect(first.transports.first { $0.transportID == "cloudkit" }?.failure == nil)
    // The gated transport did no remote work; the other remote still got it.
    #expect(await client.pulls == 0)
    #expect(await client.pushedIDs.isEmpty)
    #expect(await cloud.store["person-1"]?.payload == Data(#"{"value":"local"}"#.utf8))

    await approved.set(true)
    let second = try await runtime.synchronize { await doc.snapshot() } apply: { try await doc.apply($0) }
    #expect(second.isComplete)
    #expect(await client.pulls == 1)
    #expect(await client.pushedIDs == ["person-1"])
}
