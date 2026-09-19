import Foundation
import Testing
@testable import PersonalSyncKit

@Test(arguments: ["2026-09-09", "2026-09-09T00:00:00Z", "2026-09-09T00:00:00.000Z",
                  "2026-09-09T05:30:00.000+05:30"])
func hubMirrorPreservesAcceptedTimestampFormats(value: String) throws {
    let canonical = try #require(HubMirrorTransport.date("2026-09-09T00:00:00Z"))
    #expect(HubMirrorTransport.date(value) == canonical)
    #expect(HubMirrorTransport.date("invalid-date") == nil)
}

private actor MirrorHubFixture: PersonalSyncTransport {
    enum Reply: Sendable { case accepted, missing, rejected }
    let reply: Reply
    var pullPages: [PullResponse]
    var onPush: (@Sendable () async -> Void)?
    var batches: [Int] = []
    var tokens: [String] = []
    private var pullCalls = 0

    init(reply: Reply = .accepted, pullPages: [PullResponse] = []) {
        self.reply = reply
        self.pullPages = pullPages
    }

    func push(domain: PersonalDomain, deviceId: String, mutations: [SyncMutation], bearerToken: String) async throws -> PushResponse {
        await onPush?()
        batches.append(mutations.count)
        tokens.append(bearerToken)
        guard mutations.count <= 100 else { throw PersonalSyncError.invalidResponse }
        let results = mutations.map {
            PushResult(id: $0.id, idempotencyKey: $0.idempotencyKey,
                       status: reply == .rejected ? "rejected" : "accepted",
                       version: 1, cursor: 1, expectedVersion: nil, actualVersion: nil)
        }
        return PushResponse(results: reply == .missing ? Array(results.dropLast()) : results)
    }

    func pull(domain: PersonalDomain, cursor: Int, bearerToken: String) -> PullResponse {
        pullCalls += 1
        if !pullPages.isEmpty {
            return pullPages[min(pullCalls - 1, pullPages.count - 1)]
        }
        return PullResponse(changes: [], cursor: cursor, hasMore: false)
    }

    func setOnPush(_ action: @escaping @Sendable () async -> Void) { onPush = action }
}

private func makeHubMirror(_ client: MirrorHubFixture) throws -> HubMirrorTransport {
    let file = FileManager.default.temporaryDirectory.appending(path: UUID().uuidString)
        .appending(path: "versions.json")
    let account = PersonalSyncAccount(userID: "fixture", bearerToken: "test-only", revision: UUID())
    return HubMirrorTransport(domain: .kith, deviceId: "fixture", client: client,
                              versions: try SyncVersionStore(fileURL: file), account: {
        account
    })
}

@Test func hubMirrorBatchesFirstSyncWithinServerLimit() async throws {
    let client = MirrorHubFixture()
    let transport = try makeHubMirror(client)
    let records = (0..<205).map {
        MirrorRecord(name: "person-\($0)", modifiedAt: Date(timeIntervalSince1970: 100),
                     payload: Data("{}".utf8))
    }
    try await transport.push(records)
    #expect(await client.batches == [100, 100, 5])
}

@Test(arguments: [MirrorHubFixture.Reply.missing, .rejected])
private func hubMirrorRefusesIncompleteOrRejectedAcknowledgement(reply: MirrorHubFixture.Reply) async throws {
    let transport = try makeHubMirror(MirrorHubFixture(reply: reply))
    await #expect(throws: MirrorSyncError.invalidResponse) {
        try await transport.push([MirrorRecord(name: "person-1", modifiedAt: .now, payload: Data("{}".utf8))])
    }
}

private actor SwitchingMirrorAccount {
    private var calls = 0
    private let revision = UUID()

    func resolve() -> PersonalSyncAccount {
        calls += 1
        return PersonalSyncAccount(userID: calls == 1 ? "original" : "replacement",
                                   bearerToken: "test-only", revision: revision)
    }
}

@Test(arguments: [true, false])
private func hubMirrorRejectsResponseAfterAccountSwitch(push: Bool) async throws {
    let account = SwitchingMirrorAccount()
    let file = FileManager.default.temporaryDirectory.appending(path: UUID().uuidString)
        .appending(path: "versions.json")
    let versions = try SyncVersionStore(fileURL: file)
    let transport = HubMirrorTransport(domain: .kith, deviceId: "fixture", client: MirrorHubFixture(),
                                       versions: versions, account: { await account.resolve() })
    await #expect(throws: PersonalIdentityError.sessionChanged) {
        if push {
            try await transport.push([MirrorRecord(name: "person-1", modifiedAt: .now, payload: Data("{}".utf8))])
        } else {
            _ = try await transport.pull(since: nil)
        }
    }
    #expect(await versions.version(for: "person-1", in: .kith) == 0)
}

// MARK: - Pinned synchronization sessions

/// Test account source: hands out the current account and can hold one
/// resolve that follows the first recorded push — a deterministic barrier for
/// switching the account at an exact point inside a pass.
private actor SwitchableAccount {
    private var current: PersonalSyncAccount
    private var pushesSeen = 0
    private var postPushResolves = 0
    private var holdOnPostPushResolve: Int?
    private var waiters: [CheckedContinuation<Void, Never>] = []
    private let held: AsyncStream<Void>.Continuation?

    init(_ account: PersonalSyncAccount, held: AsyncStream<Void>.Continuation? = nil) {
        current = account
        self.held = held
    }

    func switchTo(_ account: PersonalSyncAccount) { current = account }

    /// Suspends the `ordinal`-th account resolve after the first recorded
    /// push until `release()` is called.
    func holdPostPushResolve(_ ordinal: Int) { holdOnPostPushResolve = ordinal }

    func release() {
        holdOnPostPushResolve = nil
        for waiter in waiters { waiter.resume() }
        waiters = []
    }

    func notePushSent() {
        pushesSeen += 1
        // A transport that skips identity checks entirely still trips the
        // barrier here, so the test never waits on a resolve that never comes.
        if pushesSeen == 2 { held?.yield() }
    }

    func resolve() async -> PersonalSyncAccount {
        if pushesSeen >= 1 {
            postPushResolves += 1
            if postPushResolves == holdOnPostPushResolve {
                held?.yield()
                await withCheckedContinuation { waiters.append($0) }
            }
        }
        return current
    }
}

/// Collects what a caller-side `apply` committed, so tests can observe that an
/// apply which already ran is not rolled back when the pass aborts.
private actor AppliedRecords {
    private(set) var records: [MirrorRecord] = []
    func append(_ pulled: [MirrorRecord]) { records.append(contentsOf: pulled) }
    var count: Int { records.count }
}

private func makeSessionTransport(
    client: MirrorHubFixture,
    account: SwitchableAccount
) throws -> HubMirrorTransport {
    let file = FileManager.default.temporaryDirectory.appending(path: UUID().uuidString)
        .appending(path: "versions.json")
    return HubMirrorTransport(domain: .kith, deviceId: "fixture", client: client,
                              versions: try SyncVersionStore(fileURL: file),
                              account: { await account.resolve() })
}

private func makeHubRuntime(
    client: MirrorHubFixture,
    account: SwitchableAccount
) throws -> (MirrorRuntime, MirrorBookkeepingStore) {
    let directory = FileManager.default.temporaryDirectory
        .appending(path: UUID().uuidString, directoryHint: .isDirectory)
    let store = MirrorBookkeepingStore(fileURL: directory.appending(path: "mirror-sync.json"))
    let transport = HubMirrorTransport(
        domain: .kith, deviceId: "fixture", client: client,
        versions: try SyncVersionStore(fileURL: directory.appending(path: "versions.json")),
        account: { await account.resolve() }
    )
    return (MirrorRuntime(transports: [transport], store: store), store)
}

private func remoteChange(_ id: String, payload: String) -> SyncChange {
    SyncChange(
        cursor: 1, changeId: "change-\(id)", domain: .kith, id: id,
        operation: .upsert, version: 1,
        occurredAt: "2026-09-01T00:00:00Z", recordedAt: "2026-09-01T00:00:00Z",
        originDeviceId: "other-device",
        record: .object(["value": .string(payload)])
    )
}

private func sessionRecord(_ name: String) -> MirrorRecord {
    MirrorRecord(name: name, modifiedAt: Date(timeIntervalSince1970: 100),
                 payload: Data("{}".utf8))
}

private func accountA() -> PersonalSyncAccount {
    PersonalSyncAccount(userID: "a", bearerToken: "synthetic-a", revision: UUID())
}

@Test func hubMirrorBeginSynchronizationRequiresSignedInAccount() async throws {
    let file = FileManager.default.temporaryDirectory.appending(path: UUID().uuidString)
        .appending(path: "versions.json")
    let transport = HubMirrorTransport(domain: .kith, deviceId: "fixture",
                                       client: MirrorHubFixture(),
                                       versions: try SyncVersionStore(fileURL: file),
                                       account: { nil })
    await #expect(throws: MirrorSyncError.unavailable("not signed in")) {
        _ = try await transport.beginSynchronization()
    }
}

@Test func hubMirrorPinnedSessionPushesEveryBatchAsCapturedAccount() async throws {
    let gate = SwitchableAccount(accountA())
    let client = MirrorHubFixture()
    let session = try await makeSessionTransport(client: client, account: gate)
        .beginSynchronization()

    try await session.push((0..<205).map { sessionRecord("person-\($0)") })

    #expect(await client.batches == [100, 100, 5])
    #expect(await client.tokens == ["synthetic-a", "synthetic-a", "synthetic-a"])
}

/// A pass pinned at begin must never adopt a mid-pass account — whether that
/// is a different user or the same user on a refreshed session revision — as
/// the session for remaining batches.
@Test(arguments: [false, true])
func hubMirrorSessionRejectsBatchAfterAccountSwitch(sameUserRefresh: Bool) async throws {
    let held = AsyncStream<Void>.makeStream()
    defer { held.continuation.finish() }
    let captured = accountA()
    let replacement = sameUserRefresh
        ? PersonalSyncAccount(userID: "a", bearerToken: "synthetic-a2", revision: UUID())
        : PersonalSyncAccount(userID: "b", bearerToken: "synthetic-b", revision: UUID())
    let gate = SwitchableAccount(captured, held: held.continuation)
    let client = MirrorHubFixture()
    await client.setOnPush { await gate.notePushSent() }
    // The second account resolve after batch 1 is the identity check guarding
    // batch 2; holding it lets the switch land exactly between the batches.
    await gate.holdPostPushResolve(2)
    let session = try await makeSessionTransport(client: client, account: gate)
        .beginSynchronization()

    let push = Task { try await session.push((0..<150).map { sessionRecord("person-\($0)") }) }
    for await _ in held.stream { break }
    await gate.switchTo(replacement)
    await gate.release()

    await #expect(throws: PersonalIdentityError.sessionChanged) { try await push.value }
    // Only batch 1 was ever sent, and only ever as the captured account.
    #expect(await client.tokens == ["synthetic-a"])
}

/// Switching accounts after a successful pull while the caller's records
/// closure is suspended must abort the pass: nothing is applied and no cursor
/// or success is written.
@Test func hubMirrorSessionAbortsPassWhenSwitchLandsDuringRecordsSnapshot() async throws {
    let started = AsyncStream<Void>.makeStream()
    let released = AsyncStream<Void>.makeStream()
    defer { started.continuation.finish(); released.continuation.finish() }
    let gate = SwitchableAccount(accountA())
    let page = PullResponse(changes: [remoteChange("remote-1", payload: "remote")],
                            cursor: 7, hasMore: false)
    let client = MirrorHubFixture(pullPages: [page])
    let (runtime, store) = try makeHubRuntime(client: client, account: gate)
    let applied = AppliedRecords()

    async let result = runtime.synchronize {
        started.continuation.yield(())
        for await _ in released.stream { break }
        return []
    } apply: { pulled in
        await applied.append(pulled)
    }
    for await _ in started.stream { break }
    await gate.switchTo(PersonalSyncAccount(userID: "b", bearerToken: "synthetic-b", revision: UUID()))
    released.continuation.yield(())

    let outcome = try await result
    #expect(outcome.transports.first?.failure?.contains("sessionChanged") == true)
    #expect(await applied.count == 0)
    #expect(try await store.load().pullTokens["hub"] == nil)
    #expect(try await store.load().lastSyncedAt == nil)
}

/// Switching accounts while the caller's apply is suspended must stop the
/// pass when it returns: no push goes out, no cursor or success is written.
/// The apply's own commit is caller code and is not asserted to roll back.
@Test func hubMirrorSessionSkipsPushAndCursorWhenSwitchLandsDuringApply() async throws {
    let started = AsyncStream<Void>.makeStream()
    let released = AsyncStream<Void>.makeStream()
    defer { started.continuation.finish(); released.continuation.finish() }
    let gate = SwitchableAccount(accountA())
    let page = PullResponse(changes: [remoteChange("remote-1", payload: "remote")],
                            cursor: 7, hasMore: false)
    let client = MirrorHubFixture(pullPages: [page])
    let (runtime, store) = try makeHubRuntime(client: client, account: gate)
    let applied = AppliedRecords()

    async let result = runtime.synchronize {
        [sessionRecord("local-1")]
    } apply: { pulled in
        started.continuation.yield(())
        for await _ in released.stream { break }
        await applied.append(pulled)
    }
    for await _ in started.stream { break }
    await gate.switchTo(PersonalSyncAccount(userID: "b", bearerToken: "synthetic-b", revision: UUID()))
    released.continuation.yield(())

    let outcome = try await result
    #expect(outcome.transports.first?.failure?.contains("sessionChanged") == true)
    // The suspended apply resumed and committed before the guard fired.
    #expect(await applied.count == 1)
    // Nothing after it did: no push under either account, no durable cursor.
    #expect(await client.tokens == [])
    #expect(try await store.load().pullTokens["hub"] == nil)
    #expect(try await store.load().lastSyncedAt == nil)
}

/// An unchanged session completes the whole pass under the pinned account:
/// pull, apply, push, and durable bookkeeping.
@Test func hubMirrorSessionCompletesPassUnderPinnedAccount() async throws {
    let gate = SwitchableAccount(accountA())
    let page = PullResponse(changes: [remoteChange("remote-1", payload: "remote")],
                            cursor: 7, hasMore: false)
    let client = MirrorHubFixture(pullPages: [page])
    let (runtime, store) = try makeHubRuntime(client: client, account: gate)
    let applied = AppliedRecords()

    let outcome = try await runtime.synchronize {
        [sessionRecord("local-1")]
    } apply: { pulled in
        await applied.append(pulled)
    }

    #expect(outcome.isComplete)
    #expect(await applied.records.map(\.name) == ["remote-1"])
    #expect(await client.tokens == ["synthetic-a"])
    #expect(try await store.load().pullTokens["hub"] == Data("7".utf8))
    #expect(try await store.load().lastSyncedAt != nil)
}

@Test func hubMirrorRejectsPushResponseWhenAccountChangesInFlight() async throws {
    let directory = FileManager.default.temporaryDirectory.appending(path: UUID().uuidString)
    defer { try? FileManager.default.removeItem(at: directory) }
    let account = SwitchableAccount(PersonalSyncAccount(userID: "a", bearerToken: "synthetic-a", revision: UUID()))
    let client = MirrorHubFixture()
    await client.setOnPush {
        // HTTP has received A's request; replace the session before responding.
        await account.switchTo(PersonalSyncAccount(userID: "b", bearerToken: "synthetic-b", revision: UUID()))
    }
    let versions = try SyncVersionStore(fileURL: directory.appending(path: "versions.json"))
    let transport = HubMirrorTransport(domain: .kith, deviceId: "fixture", client: client,
                                       versions: versions, account: { await account.resolve() })
    let bookkeeping = MirrorBookkeepingStore(fileURL: directory.appending(path: "mirror.json"))
    let runtime = MirrorRuntime(transports: [transport], store: bookkeeping)
    let outcome = try await runtime.synchronize(records: {
        [MirrorRecord(name: "person-1", modifiedAt: .now, payload: Data("{}".utf8))]
    }, apply: { _ in })
    #expect(await client.tokens == ["synthetic-a"])
    #expect(!outcome.isComplete)
    #expect(await versions.version(for: "person-1", in: .kith) == 0)
    #expect(try await bookkeeping.load() == MirrorBookkeepingStore.State())
}
