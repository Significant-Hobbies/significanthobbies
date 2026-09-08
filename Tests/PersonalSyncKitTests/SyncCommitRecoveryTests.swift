import Foundation
import Testing
@testable import PersonalSyncKit

private enum LocalCommitFailure: Error { case diskFull }

private actor RecoveryTransport: PersonalSyncTransport {
    private(set) var requestedCursors: [Int] = []
    let lastCursor: Int
    private var failOnceAt: Int?
    init(lastCursor: Int = 1, failOnceAt: Int? = nil) {
        self.lastCursor = lastCursor
        self.failOnceAt = failOnceAt
    }
    func push(domain: PersonalDomain, deviceId: String, mutations: [SyncMutation], bearerToken: String) async throws -> PushResponse {
        PushResponse(results: [])
    }
    func pull(domain: PersonalDomain, cursor: Int, bearerToken: String) async throws -> PullResponse {
        requestedCursors.append(cursor)
        if failOnceAt == cursor {
            failOnceAt = nil
            throw URLError(.networkConnectionLost)
        }
        guard cursor < lastCursor else { return PullResponse(changes: [], cursor: lastCursor, hasMore: false) }
        let next = cursor + 1
        let change = SyncChange(cursor: next, changeId: "change-\(next)", domain: domain, id: next == 1 ? "friend" : "friend-\(next)",
                                operation: .upsert, version: 1, occurredAt: "2026-09-08",
                                recordedAt: "2026-09-08", originDeviceId: "another-device",
                                record: .object(["name": .string("Synthetic friend")]))
        return PullResponse(changes: [change], cursor: next, hasMore: next < lastCursor)
    }
}

@Test func laterPageFailureDoesNotAcknowledgeOrApplyPartialDownload() async throws {
    let root = FileManager.default.temporaryDirectory.appending(path: UUID().uuidString)
    defer { try? FileManager.default.removeItem(at: root) }
    let transport = RecoveryTransport(lastCursor: 3, failOnceAt: 1)
    let coordinator = try recoveryCoordinator(root: root, transport: transport)
    await #expect(throws: URLError.self) {
        try await coordinator.synchronize(domain: .kith, deviceId: "test", bearerToken: "synthetic") { _ in
            Issue.record("An incomplete download must not be applied")
        }
    }
    #expect(try await SyncCursorStore(fileURL: root.appending(path: "cursor.json")).cursor(for: .kith) == 0)
    try await coordinator.synchronize(domain: .kith, deviceId: "test", bearerToken: "synthetic") { changes in
        #expect(changes.map(\.cursor) == [1, 2, 3])
    }
    #expect(await transport.requestedCursors == [0, 1, 0, 1, 2])
    #expect(try await SyncCursorStore(fileURL: root.appending(path: "cursor.json")).cursor(for: .kith) == 3)
}

@Test func failedCursorPersistenceAfterAppCommitReplaysSafely() async throws {
    let root = FileManager.default.temporaryDirectory.appending(path: UUID().uuidString)
    defer { try? FileManager.default.removeItem(at: root) }
    let transport = RecoveryTransport()
    let coordinator = try recoveryCoordinator(root: root, transport: transport)
    let cursorFile = root.appending(path: "cursor.json")
    let saved = root.appending(path: "app-records.json")
    try FileManager.default.createDirectory(at: cursorFile, withIntermediateDirectories: true)
    let apply: @Sendable ([SyncChange]) async throws -> Void = { changes in
        try JSONEncoder().encode(changes.map(\.record)).write(to: saved, options: .atomic)
    }
    await #expect(throws: (any Error).self) {
        try await coordinator.synchronize(domain: .kith, deviceId: "test", bearerToken: "synthetic", applyChanges: apply)
    }
    #expect(try JSONDecoder().decode([JSONValue].self, from: Data(contentsOf: saved)).count == 1)
    try FileManager.default.removeItem(at: cursorFile)
    try await coordinator.synchronize(domain: .kith, deviceId: "test", bearerToken: "synthetic", applyChanges: apply)
    #expect(await transport.requestedCursors == [0, 0])
    #expect(try JSONDecoder().decode([JSONValue].self, from: Data(contentsOf: saved)).count == 1)
    #expect(try await SyncCursorStore(fileURL: cursorFile).cursor(for: .kith) == 1)
}

private actor CommitGate {
    private var isOpen = false
    private var waiters: [CheckedContinuation<Void, Never>] = []
    func wait() async {
        if isOpen { return }
        await withCheckedContinuation { waiters.append($0) }
    }
    func open() {
        isOpen = true
        for waiter in waiters { waiter.resume() }
        waiters.removeAll()
    }
}

@Test(.timeLimit(.minutes(1))) func overlappingSyncWaitsForAppCommitBeforePullingAgain() async throws {
    let root = FileManager.default.temporaryDirectory.appending(path: UUID().uuidString)
    defer { try? FileManager.default.removeItem(at: root) }
    let transport = RecoveryTransport()
    let coordinator = try recoveryCoordinator(root: root, transport: transport)
    let entered = CommitGate()
    let release = CommitGate()
    let first = Task {
        try await coordinator.synchronize(domain: .kith, deviceId: "first", bearerToken: "synthetic") { _ in
            await entered.open()
            await release.wait()
        }
    }
    await entered.wait()
    let second = Task {
        try await coordinator.synchronize(domain: .kith, deviceId: "second", bearerToken: "synthetic") { _ in
            Issue.record("Second sync must observe the first committed cursor")
        }
    }
    // Give the competing call a chance to enter while the first commit is held.
    try await Task.sleep(for: .milliseconds(50))
    #expect(await transport.requestedCursors == [0])
    await release.open()
    #expect(try await first.value.count == 1)
    #expect(try await second.value.isEmpty)
    #expect(await transport.requestedCursors == [0, 1])
}

private func recoveryCoordinator(root: URL, transport: RecoveryTransport) throws -> SyncCoordinator {
    try SyncCoordinator(client: transport,
                        outbox: MutationOutbox(fileURL: root.appending(path: "outbox.json")),
                        cursors: SyncCursorStore(fileURL: root.appending(path: "cursor.json")),
                        versions: SyncVersionStore(fileURL: root.appending(path: "versions.json")),
                        fingerprints: SyncFingerprintStore(fileURL: root.appending(path: "fingerprints.json")))
}

@Test func downloadedChangesRetryAfterFailedLocalCommitAndRestart() async throws {
    let root = FileManager.default.temporaryDirectory.appending(path: UUID().uuidString)
    defer { try? FileManager.default.removeItem(at: root) }
    let transport = RecoveryTransport()
    let coordinator = try recoveryCoordinator(root: root, transport: transport)
    await #expect(throws: LocalCommitFailure.self) {
        try await coordinator.synchronize(domain: .kith, deviceId: "test", bearerToken: "synthetic") { _ in
            throw LocalCommitFailure.diskFull
        }
    }
    #expect(try await SyncCursorStore(fileURL: root.appending(path: "cursor.json")).cursor(for: .kith) == 0)
    #expect(try await SyncVersionStore(fileURL: root.appending(path: "versions.json")).version(for: "friend", in: .kith) == 0)
    #expect(try await SyncFingerprintStore(fileURL: root.appending(path: "fingerprints.json")).fingerprint(for: "friend", in: .kith) == nil)

    let reopened = try recoveryCoordinator(root: root, transport: transport)
    let saved = root.appending(path: "app-records.json")
    try await reopened.synchronize(domain: .kith, deviceId: "test", bearerToken: "synthetic") { changes in
        try FileManager.default.createDirectory(at: root, withIntermediateDirectories: true)
        try JSONEncoder().encode(changes.map(\.record)).write(to: saved, options: .atomic)
    }
    #expect(try JSONDecoder().decode([JSONValue].self, from: Data(contentsOf: saved)).count == 1)
    #expect(try await SyncCursorStore(fileURL: root.appending(path: "cursor.json")).cursor(for: .kith) == 1)
    try await reopened.synchronize(domain: .kith, deviceId: "test", bearerToken: "synthetic") { _ in
        Issue.record("Already committed changes must not be applied again")
    }
    #expect(await transport.requestedCursors == [0, 0, 1])
}
