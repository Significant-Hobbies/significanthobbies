import Foundation
import Testing
@testable import PersonalSyncKit

private enum ReplayFailure: Error { case localWrite, page }

private actor ReplayTransport: PersonalSyncTransport {
    private(set) var cursors: [Int] = []
    var failSecondPage: Bool
    init(failSecondPage: Bool = false) { self.failSecondPage = failSecondPage }
    func push(domain: PersonalDomain, deviceId: String, mutations: [SyncMutation], bearerToken: String) -> PushResponse {
        PushResponse(results: [])
    }
    func pull(domain: PersonalDomain, cursor: Int, bearerToken: String) throws -> PullResponse {
        cursors.append(cursor)
        if cursor == 2 && failSecondPage { throw ReplayFailure.page }
        func change(_ cursor: Int, _ id: String, _ version: Int, _ operation: MutationOperation) -> SyncChange {
            SyncChange(cursor: cursor, changeId: "c\(cursor)", domain: domain, id: id,
                       operation: operation, version: version, occurredAt: "2026-09-09",
                       recordedAt: "2026-09-09", originDeviceId: "fixture", record: .string("v\(version)"))
        }
        if cursor == 0 {
            return PullResponse(changes: [change(1, "person", 1, .delete), change(2, "note", 1, .upsert)], cursor: 2, hasMore: true)
        }
        if cursor == 2 {
            return PullResponse(changes: [change(3, "person", 2, .upsert), change(4, "note", 2, .upsert)], cursor: 4, hasMore: true)
        }
        if cursor == 4 {
            return PullResponse(changes: [change(5, "later-local-version", 1, .delete)], cursor: 5, hasMore: false)
        }
        return PullResponse(changes: [], cursor: cursor, hasMore: false)
    }
}

private func replayCoordinator(_ root: URL, _ transport: any PersonalSyncTransport) throws -> SyncCoordinator {
    try SyncCoordinator(client: transport,
                        outbox: MutationOutbox(fileURL: root.appending(path: "outbox.json")),
                        cursors: SyncCursorStore(fileURL: root.appending(path: "cursor.json")),
                        versions: SyncVersionStore(fileURL: root.appending(path: "versions.json")),
                        fingerprints: SyncFingerprintStore(fileURL: root.appending(path: "fingerprints.json")))
}

@Test func replayRecoversAcknowledgedHistoryOnlyAfterDurableCommitAndRetries() async throws {
    let root = FileManager.default.temporaryDirectory.appending(path: UUID().uuidString)
    defer { try? FileManager.default.removeItem(at: root) }
    let cursorFile = root.appending(path: "cursor.json")
    try await SyncCursorStore(fileURL: cursorFile).setCursor(4, for: .kith)
    try await SyncVersionStore(fileURL: root.appending(path: "versions.json")).setVersion(2, for: "later-local-version", in: .kith)
    // Reproduce the old bug's complete acknowledged state: metadata claims
    // these records are present, but the app file does not exist.
    for id in ["person", "note"] {
        try await SyncVersionStore(fileURL: root.appending(path: "versions.json")).setVersion(2, for: id, in: .kith)
        try await SyncFingerprintStore(fileURL: root.appending(path: "fingerprints.json")).setFingerprint(
            syncFingerprint(operation: .upsert, record: .string("v2")), for: id, in: .kith)
    }
    let transport = ReplayTransport()
    let coordinator = try replayCoordinator(root, transport)
    await #expect(throws: ReplayFailure.localWrite) {
        try await coordinator.synchronize(domain: .kith, deviceId: "fixture", bearerToken: "synthetic", replayFromStart: true) { _ in
            throw ReplayFailure.localWrite
        }
    }
    #expect(try await SyncCursorStore(fileURL: cursorFile).cursor(for: .kith) == 4)
    let reopened = try replayCoordinator(root, transport)
    let file = root.appending(path: "app.json")
    try await reopened.synchronize(domain: .kith, deviceId: "fixture", bearerToken: "synthetic", replayFromStart: true) { changes in
        #expect(changes.map(\.id) == ["person", "note"])
        #expect(changes.allSatisfy { $0.operation == .upsert && $0.version == 2 })
        #expect(try await SyncCursorStore(fileURL: cursorFile).cursor(for: .kith) == 4)
        try JSONEncoder().encode(changes.map(\.record)).write(to: file, options: .atomic)
    }
    #expect(try JSONDecoder().decode([JSONValue].self, from: Data(contentsOf: file)).count == 2)
    #expect(try await SyncCursorStore(fileURL: cursorFile).cursor(for: .kith) == 5)
    #expect(await transport.cursors == [0, 2, 4, 0, 2, 4])
    #expect(try await SyncVersionStore(fileURL: root.appending(path: "versions.json")).version(for: "later-local-version", in: .kith) == 2)
}

@Test func partialReplayNeverCommitsAndSuccessfulReplayNeverRegressesCursor() async throws {
    let root = FileManager.default.temporaryDirectory.appending(path: UUID().uuidString)
    defer { try? FileManager.default.removeItem(at: root) }
    let cursorFile = root.appending(path: "cursor.json")
    try await SyncCursorStore(fileURL: cursorFile).setCursor(20, for: .kith)
    let coordinator = try replayCoordinator(root, ReplayTransport(failSecondPage: true))
    await #expect(throws: ReplayFailure.page) {
        try await coordinator.synchronize(domain: .kith, deviceId: "fixture", bearerToken: "synthetic", replayFromStart: true) { _ in
            Issue.record("Partial replay reached the app")
        }
    }
    #expect(try await SyncCursorStore(fileURL: cursorFile).cursor(for: .kith) == 20)
    let retried = try replayCoordinator(root, ReplayTransport())
    try await retried.synchronize(domain: .kith, deviceId: "fixture", bearerToken: "synthetic", replayFromStart: true) { _ in }
    #expect(try await SyncCursorStore(fileURL: cursorFile).cursor(for: .kith) == 20)
}

private actor EndlessReplayTransport: PersonalSyncTransport {
    private(set) var calls = 0
    func push(domain: PersonalDomain, deviceId: String, mutations: [SyncMutation], bearerToken: String) -> PushResponse { PushResponse(results: []) }
    func pull(domain: PersonalDomain, cursor: Int, bearerToken: String) -> PullResponse {
        calls += 1
        return PullResponse(changes: [], cursor: cursor + 1, hasMore: true)
    }
}

@Test func replayIsBoundedWithoutCommittingPartialHistory() async throws {
    let root = FileManager.default.temporaryDirectory.appending(path: UUID().uuidString)
    defer { try? FileManager.default.removeItem(at: root) }
    let transport = EndlessReplayTransport()
    let coordinator = try replayCoordinator(root, transport)
    await #expect(throws: PersonalSyncError.invalidResponse) {
        try await coordinator.synchronize(domain: .kith, deviceId: "fixture", bearerToken: "synthetic", replayFromStart: true) { _ in
            Issue.record("Unbounded replay reached the app")
        }
    }
    #expect(await transport.calls == 100)
    #expect(try await SyncCursorStore(fileURL: root.appending(path: "cursor.json")).cursor(for: .kith) == 0)
}

private actor CancellingReplayTransport: PersonalSyncTransport {
    func push(domain: PersonalDomain, deviceId: String, mutations: [SyncMutation], bearerToken: String) -> PushResponse { PushResponse(results: []) }
    func pull(domain: PersonalDomain, cursor: Int, bearerToken: String) -> PullResponse {
        withUnsafeCurrentTask { $0?.cancel() }
        return PullResponse(changes: [], cursor: 1, hasMore: false)
    }
}

@Test func cancelledReplayCannotAcknowledgeProgress() async throws {
    let root = FileManager.default.temporaryDirectory.appending(path: UUID().uuidString)
    defer { try? FileManager.default.removeItem(at: root) }
    let coordinator = try replayCoordinator(root, CancellingReplayTransport())
    let task = Task {
        try await coordinator.synchronize(domain: .kith, deviceId: "fixture", bearerToken: "synthetic", replayFromStart: true) { _ in
            Issue.record("Cancelled replay reached app commit")
        }
    }
    await #expect(throws: CancellationError.self) { try await task.value }
    #expect(try await SyncCursorStore(fileURL: root.appending(path: "cursor.json")).cursor(for: .kith) == 0)
}
