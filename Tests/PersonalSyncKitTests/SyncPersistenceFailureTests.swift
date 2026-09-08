import Foundation
import Testing
@testable import PersonalSyncKit

@Test func failedCursorWriteKeepsPreviousProgress() async throws {
    let root = FileManager.default.temporaryDirectory.appending(path: UUID().uuidString)
    defer { try? FileManager.default.removeItem(at: root) }
    let file = root.appending(path: "cursor.json")
    let store = try SyncCursorStore(fileURL: file)
    try await store.setCursor(4, for: .kith)
    let retained = root.appending(path: "retained.json")
    try FileManager.default.moveItem(at: file, to: retained)
    try FileManager.default.createDirectory(at: file, withIntermediateDirectories: true)
    await #expect(throws: (any Error).self) { try await store.setCursor(9, for: .kith) }
    #expect(await store.cursor(for: .kith) == 4)
    try FileManager.default.removeItem(at: file)
    try FileManager.default.moveItem(at: retained, to: file)
    #expect(try await SyncCursorStore(fileURL: file).cursor(for: .kith) == 4)
    try await store.setCursor(9, for: .kith)
    #expect(try await SyncCursorStore(fileURL: file).cursor(for: .kith) == 9)
}

@Test func failedVersionWriteDoesNotPublishUncommittedVersion() async throws {
    let root = FileManager.default.temporaryDirectory.appending(path: UUID().uuidString)
    defer { try? FileManager.default.removeItem(at: root) }
    let file = root.appending(path: "versions.json")
    let store = try SyncVersionStore(fileURL: file)
    try FileManager.default.createDirectory(at: file, withIntermediateDirectories: true)
    await #expect(throws: (any Error).self) { try await store.setVersion(9, for: "friend", in: .kith) }
    #expect(await store.version(for: "friend", in: .kith) == 0)
    try FileManager.default.removeItem(at: file)
    try await store.setVersion(9, for: "friend", in: .kith)
    #expect(try await SyncVersionStore(fileURL: file).version(for: "friend", in: .kith) == 9)
}

@Test func failedFingerprintWriteDoesNotSuppressRetry() async throws {
    let root = FileManager.default.temporaryDirectory.appending(path: UUID().uuidString)
    defer { try? FileManager.default.removeItem(at: root) }
    let file = root.appending(path: "fingerprints.json")
    let store = try SyncFingerprintStore(fileURL: file)
    try FileManager.default.createDirectory(at: file, withIntermediateDirectories: true)
    await #expect(throws: (any Error).self) {
        try await store.setFingerprint("unsaved", for: "friend", in: .kith)
    }
    #expect(await store.fingerprint(for: "friend", in: .kith) == nil)
    try FileManager.default.removeItem(at: file)
    try await store.setFingerprint("unsaved", for: "friend", in: .kith)
    #expect(try await SyncFingerprintStore(fileURL: file).fingerprint(for: "friend", in: .kith) == "unsaved")
}

@Test func failedOutboxAcknowledgementKeepsPendingMutation() async throws {
    let root = FileManager.default.temporaryDirectory.appending(path: UUID().uuidString)
    defer { try? FileManager.default.removeItem(at: root) }
    let file = root.appending(path: "outbox.json")
    let store = try MutationOutbox(fileURL: file)
    let mutation = SyncMutation(id: "friend", idempotencyKey: "edit-1", operation: .upsert,
                                baseVersion: 0, occurredAt: "2026-09-08", record: .object([:]))
    try await store.enqueue(OutboxEntry(domain: .kith, mutation: mutation))
    let retained = root.appending(path: "retained.json")
    try FileManager.default.moveItem(at: file, to: retained)
    try FileManager.default.createDirectory(at: file, withIntermediateDirectories: true)
    await #expect(throws: (any Error).self) { try await store.acknowledge(idempotencyKeys: ["edit-1"]) }
    #expect(await store.pending(for: .kith).map(\.mutation) == [mutation])
    try FileManager.default.removeItem(at: file)
    try FileManager.default.moveItem(at: retained, to: file)
    #expect(try await MutationOutbox(fileURL: file).pending(for: .kith).map(\.mutation) == [mutation])
    try await store.acknowledge(idempotencyKeys: ["edit-1"])
    #expect(try await MutationOutbox(fileURL: file).pending(for: .kith).isEmpty)
}

@Test func failedOutboxEditPreservesEarlierDurableMutation() async throws {
    let root = FileManager.default.temporaryDirectory.appending(path: UUID().uuidString)
    defer { try? FileManager.default.removeItem(at: root) }
    let file = root.appending(path: "outbox.json")
    let store = try MutationOutbox(fileURL: file)
    let first = SyncMutation(id: "friend", idempotencyKey: "edit-1", operation: .upsert,
                             baseVersion: 0, occurredAt: "2026-09-08", record: .object(["name": .string("Before")]))
    let latest = SyncMutation(id: "friend", idempotencyKey: "edit-2", operation: .upsert,
                              baseVersion: 0, occurredAt: "2026-09-08", record: .object(["name": .string("After")]))
    try await store.enqueue(OutboxEntry(domain: .kith, mutation: first))
    let retained = root.appending(path: "retained.json")
    try FileManager.default.moveItem(at: file, to: retained)
    try FileManager.default.createDirectory(at: file, withIntermediateDirectories: true)
    await #expect(throws: (any Error).self) { try await store.enqueue(OutboxEntry(domain: .kith, mutation: latest)) }
    #expect(await store.pending(for: .kith).map(\.mutation) == [first])
    try FileManager.default.removeItem(at: file)
    try FileManager.default.moveItem(at: retained, to: file)
    #expect(try await MutationOutbox(fileURL: file).pending(for: .kith).map(\.mutation) == [first])
    try await store.enqueue(OutboxEntry(domain: .kith, mutation: latest))
    #expect(try await MutationOutbox(fileURL: file).pending(for: .kith).map(\.mutation) == [latest])
}
