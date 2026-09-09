import Foundation
import Testing
@testable import PersonalSyncKit

private final class OwnershipProtocol: URLProtocol, @unchecked Sendable {
    nonisolated(unsafe) static var handler: (@Sendable (URLRequest) async -> String)!
    override class func canInit(with request: URLRequest) -> Bool { true }
    override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }
    override func startLoading() {
        Task {
            let body = await Self.handler(request)
            let response = HTTPURLResponse(url: request.url!, statusCode: 200, httpVersion: nil, headerFields: nil)!
            client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
            client?.urlProtocol(self, didLoad: Data(body.utf8))
            client?.urlProtocolDidFinishLoading(self)
        }
    }
    override func stopLoading() {}
}

private actor OwnershipRequests {
    private(set) var pushes: [String] = []
    func respond(_ request: URLRequest) -> String {
        let token = request.value(forHTTPHeaderField: "Authorization") ?? ""
        if request.url!.path.hasSuffix("session") {
            let id = token.contains("account-b") ? "b" : "a"
            return "{\"userId\":\"\(id)\",\"email\":\"\(id)@example.invalid\"}"
        }
        if request.url!.path.hasSuffix("push") {
            pushes.append(token)
            return #"{"results":[]}"#
        }
        return #"{"changes":[],"cursor":0,"hasMore":false}"#
    }
}

private struct OwnershipFixture {
    let directory = FileManager.default.temporaryDirectory.appending(path: UUID().uuidString)
    let tokens = MemoryBearerStore()
    let requests = OwnershipRequests()
    let session: URLSession
    let identity: PersonalIdentityClient
    let client: PersonalSyncClient
    init() {
        let configuration = URLSessionConfiguration.ephemeral
        configuration.protocolClasses = [OwnershipProtocol.self]
        session = URLSession(configuration: configuration)
        identity = PersonalIdentityClient(baseURL: URL(string: "https://identity.invalid")!, session: session, tokenStore: tokens)
        client = PersonalSyncClient(baseURL: URL(string: "https://sync.invalid")!, session: session)
        let requests = requests
        OwnershipProtocol.handler = { await requests.respond($0) }
    }
    func runtime() throws -> PersonalSyncRuntime {
        try PersonalSyncRuntime(domain: .kith, deviceId: "synthetic", supportDirectory: directory, identity: identity, client: client)
    }
    func cleanup() {
        session.invalidateAndCancel()
        try? FileManager.default.removeItem(at: directory)
    }
}

@Suite(.serialized)
struct SyncAccountOwnershipTests {
    @Test func legacyQueueCannotUploadWithoutExplicitApproval() async throws {
        let f = OwnershipFixture(); defer { f.cleanup() }
        await f.tokens.save("account-a")
        let runtime = try f.runtime()
        try await runtime.enqueue(recordId: "legacy", occurredAt: "2026-09-08", record: .string("synthetic"))
        let account = try #require(await f.identity.verifiedSyncAccount())
        await #expect(throws: PersonalSyncOwnershipError.approvalRequired) { try await runtime.bindAccount(account) }
        await #expect(throws: PersonalSyncOwnershipError.approvalRequired) { try await runtime.synchronize { _ in } }
        #expect(await f.requests.pushes.isEmpty)
        #expect(await runtime.pendingMutationCount() == 1)
    }

    @Test(arguments: [false, true]) func accountAQueueSurvivesRestartAndCannotBeSentOrAdoptedByB(replay: Bool) async throws {
        let f = OwnershipFixture(); defer { f.cleanup() }
        await f.tokens.save("account-a")
        let a = try #require(await f.identity.verifiedSyncAccount())
        let runtime = try f.runtime()
        try await runtime.bindAccount(a, adoptingUnownedData: true)
        try await runtime.enqueue(recordId: "a-person", occurredAt: "2026-09-08", record: .string("A-only"), account: a)
        await f.tokens.save("account-b")
        let b = try #require(await f.identity.verifiedSyncAccount())
        let reopened = try f.runtime()
        await #expect(throws: PersonalSyncOwnershipError.differentAccount) { try await reopened.bindAccount(b, adoptingUnownedData: true) }
        await #expect(throws: PersonalSyncOwnershipError.differentAccount) { try await reopened.synchronize(account: b, replayFromStart: replay) { _ in } }
        await #expect(throws: PersonalSyncOwnershipError.differentAccount) {
            try await reopened.enqueue(recordId: "b-person", occurredAt: "2026-09-08", record: .string("B-only"), account: b)
        }
        #expect(await f.requests.pushes.isEmpty)
        #expect(await reopened.pendingMutationCount() == 1)
    }

    @Test func sameOwnerTokenRefreshCanResumeAndStaleGrantCannot() async throws {
        let f = OwnershipFixture(); defer { f.cleanup() }
        await f.tokens.save("account-a")
        let a = try #require(await f.identity.verifiedSyncAccount())
        let runtime = try f.runtime()
        try await runtime.bindAccount(a, adoptingUnownedData: true)
        try await runtime.enqueue(recordId: "a-person", occurredAt: "2026-09-08", record: .string("A-only"), account: a)
        _ = try await f.identity.adoptBearerToken("account-a-refreshed")
        await #expect(throws: PersonalIdentityError.sessionChanged) { try await runtime.synchronize(account: a) { _ in } }
        let refreshed = try #require(await f.identity.verifiedSyncAccount())
        let reopened = try f.runtime()
        try await reopened.bindAccount(refreshed)
        try await reopened.synchronize(account: refreshed) { _ in }
        #expect(await f.requests.pushes == ["Bearer account-a-refreshed"])
    }

    @Test func failedOwnershipWriteDoesNotAuthorizeOrLoseLegacyWork() async throws {
        let f = OwnershipFixture(); defer { f.cleanup() }
        await f.tokens.save("account-a")
        let runtime = try f.runtime()
        try await runtime.enqueue(recordId: "legacy", occurredAt: "2026-09-08", record: .string("synthetic"))
        let account = try #require(await f.identity.verifiedSyncAccount())
        let bindingFile = f.directory.appending(path: "personal-sync-account.json")
        try FileManager.default.createDirectory(at: bindingFile, withIntermediateDirectories: true)
        await #expect(throws: (any Error).self) { try await runtime.bindAccount(account, adoptingUnownedData: true) }
        await #expect(throws: PersonalSyncOwnershipError.approvalRequired) { try await runtime.synchronize(account: account) { _ in } }
        #expect(await runtime.pendingMutationCount() == 1)
        #expect(await f.requests.pushes.isEmpty)
        try FileManager.default.removeItem(at: bindingFile)
        try await runtime.bindAccount(account, adoptingUnownedData: true)
        try await runtime.synchronize(account: account) { _ in }
        #expect(await f.requests.pushes == ["Bearer account-a"])
    }

    @Test(arguments: [false, true]) func switchedAccountDuringPullCannotCommitDownloadedRecordsOrCursor(replay: Bool) async throws {
        let f = OwnershipFixture(); defer { f.cleanup() }
        await f.tokens.save("account-a")
        let account = try #require(await f.identity.verifiedSyncAccount())
        let runtime = try f.runtime()
        try await runtime.bindAccount(account, adoptingUnownedData: true)
        let entered = AsyncStream<Void>.makeStream()
        let released = AsyncStream<Void>.makeStream()
        defer { entered.continuation.finish(); released.continuation.finish() }
        OwnershipProtocol.handler = { request in
            if request.url!.path.hasSuffix("pull") {
                entered.continuation.yield(())
                for await _ in released.stream { break }
                return #"{"changes":[{"cursor":10,"changeId":"synthetic-change","domain":"kith","id":"a-person","operation":"upsert","version":1,"occurredAt":"2026-09-08","recordedAt":"2026-09-08","originDeviceId":"other","record":{"name":"Synthetic A"}}],"cursor":10,"hasMore":false}"#
            }
            return await f.requests.respond(request)
        }
        let sync = Task { try await runtime.synchronize(account: account, replayFromStart: replay) { _ in Issue.record("Stale download was applied") } }
        for await _ in entered.stream { break }
        await f.tokens.save("account-b")
        released.continuation.yield(())
        await #expect(throws: PersonalIdentityError.sessionChanged) { try await sync.value }
        let cursors = try SyncCursorStore(fileURL: f.directory.appending(path: "personal-sync-cursors.json"))
        #expect(await cursors.cursor(for: .kith) == 0)
    }
    @Test func switchedAccountDuringPushDoesNotAcknowledgeOldQueue() async throws {
        let f = OwnershipFixture(); defer { f.cleanup() }
        await f.tokens.save("account-a")
        let account = try #require(await f.identity.verifiedSyncAccount())
        let runtime = try f.runtime()
        try await runtime.bindAccount(account, adoptingUnownedData: true)
        try await runtime.enqueue(recordId: "a-person", occurredAt: "2026-09-08", record: .string("A-only"), idempotencyKey: "synthetic-id", account: account)
        let entered = AsyncStream<Void>.makeStream()
        let released = AsyncStream<Void>.makeStream()
        defer { entered.continuation.finish(); released.continuation.finish() }
        OwnershipProtocol.handler = { request in
            if request.url!.path.hasSuffix("push") {
                entered.continuation.yield(())
                for await _ in released.stream { break }
                return #"{"results":[{"id":"a-person","idempotencyKey":"synthetic-id","status":"accepted","version":1}]}"#
            }
            return await f.requests.respond(request)
        }
        let sync = Task { try await runtime.synchronize(account: account) { _ in } }
        for await _ in entered.stream { break }
        await f.tokens.save("account-b")
        released.continuation.yield(())
        await #expect(throws: PersonalIdentityError.sessionChanged) { try await sync.value }
        let reopened = try f.runtime()
        #expect(await reopened.pendingMutationCount() == 1)
        let versions = try SyncVersionStore(fileURL: f.directory.appending(path: "personal-sync-versions.json"))
        #expect(await versions.version(for: "a-person", in: .kith) == 0)
    }

    @Test(arguments: [false, true]) func accountChangeInsideAppCommitLeavesCursorRetryable(replay: Bool) async throws {
        let f = OwnershipFixture(); defer { f.cleanup() }
        await f.tokens.save("account-a")
        let account = try #require(await f.identity.verifiedSyncAccount())
        let runtime = try f.runtime()
        try await runtime.bindAccount(account, adoptingUnownedData: true)
        OwnershipProtocol.handler = { request in
            if request.url!.path.hasSuffix("pull") {
                return #"{"changes":[{"cursor":10,"changeId":"synthetic-change","domain":"kith","id":"a-person","operation":"upsert","version":1,"occurredAt":"2026-09-08","recordedAt":"2026-09-08","originDeviceId":"other","record":{"name":"Synthetic A"}}],"cursor":10,"hasMore":false}"#
            }
            return await f.requests.respond(request)
        }
        await #expect(throws: PersonalIdentityError.sessionChanged) {
            try await runtime.synchronize(account: account, replayFromStart: replay) { changes in
                #expect(changes.count == 1)
                await f.tokens.save("account-b")
            }
        }
        let cursors = try SyncCursorStore(fileURL: f.directory.appending(path: "personal-sync-cursors.json"))
        #expect(await cursors.cursor(for: .kith) == 0)
    }

}
