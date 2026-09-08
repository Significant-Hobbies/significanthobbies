import Foundation
import Testing
@testable import PersonalSyncKit

private final class SessionRaceProtocol: URLProtocol, @unchecked Sendable {
    nonisolated(unsafe) static var handler: (@Sendable (URLRequest) async -> (Int, String))!
    override class func canInit(with request: URLRequest) -> Bool { true }
    override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }
    override func startLoading() {
        Task {
            let (status, body) = await Self.handler(request)
            let response = HTTPURLResponse(url: request.url!, statusCode: status, httpVersion: nil, headerFields: nil)!
            client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
            client?.urlProtocol(self, didLoad: Data(body.utf8))
            client?.urlProtocolDidFinishLoading(self)
        }
    }
    override func stopLoading() {}
}

@Suite(.serialized)
struct IdentitySessionRaceTests {
    @Test(arguments: ["restore401", "restore200", "signout", "adopt401", "exchange200"])
    func olderRequestCannotReplaceOrEraseNewAccount(operation: String) async throws {
        let started = AsyncStream<Void>.makeStream()
        let released = AsyncStream<Void>.makeStream()
        defer { started.continuation.finish(); released.continuation.finish() }
        SessionRaceProtocol.handler = { request in
            if request.value(forHTTPHeaderField: "Authorization") == "Bearer synthetic-a" || request.url?.path == "/api/native/auth/exchange" {
                started.continuation.yield(())
                for await _ in released.stream { break }
                if operation == "exchange200" {
                    return (200, #"{"token":"synthetic-a"}"#)
                }
                if operation == "restore200" {
                    return (200, #"{"userId":"a","email":"a@example.invalid"}"#)
                }
                return (401, #"{"message":"Expired synthetic session"}"#)
            }
            return (200, #"{"userId":"b","email":"b@example.invalid"}"#)
        }
        let configuration = URLSessionConfiguration.ephemeral
        configuration.protocolClasses = [SessionRaceProtocol.self]
        let session = URLSession(configuration: configuration)
        defer { session.invalidateAndCancel() }
        let store = MemoryBearerStore()
        await store.save("synthetic-a")
        let identity = PersonalIdentityClient(baseURL: URL(string: "https://identity.invalid")!, session: session, tokenStore: store)
        let old = Task { () -> String? in
            do {
                switch operation {
                case "signout": await identity.signOut(); return nil
                case "adopt401": return try await identity.adoptBearerToken("synthetic-a").userId
                case "exchange200": return try await identity.exchangeBrowserHandoff("synthetic-code").userId
                default: return try await identity.restoreSession()?.userId
                }
            } catch { return nil }
        }
        for await _ in started.stream { break }
        let replacement = try await identity.adoptBearerToken("synthetic-b")
        #expect(replacement.userId == "b")
        released.continuation.yield(())
        let oldResult = await old.value
        #expect(await store.load() == "synthetic-b", "A late old request must not erase the replacement account")
        #expect(oldResult == nil, "A late old response must not return a stale signed-in account")
    }
    #if canImport(AuthenticationServices) && (os(iOS) || os(macOS))
    @Test(arguments: [false, true])
    @MainActor
    func oldAccountModelCallbackCannotClearRestoredReplacement(signingOut: Bool) async throws {
        let started = AsyncStream<Void>.makeStream()
        let released = AsyncStream<Void>.makeStream()
        defer { started.continuation.finish(); released.continuation.finish() }
        SessionRaceProtocol.handler = { request in
            if request.value(forHTTPHeaderField: "Authorization") == "Bearer synthetic-a" {
                started.continuation.yield(())
                for await _ in released.stream { break }
                return (200, #"{"userId":"a","email":"a@example.invalid"}"#)
            }
            return (200, #"{"userId":"b","email":"b@example.invalid"}"#)
        }
        let configuration = URLSessionConfiguration.ephemeral
        configuration.protocolClasses = [SessionRaceProtocol.self]
        let urlSession = URLSession(configuration: configuration)
        defer { urlSession.invalidateAndCancel() }
        let store = MemoryBearerStore()
        await store.save("synthetic-a")
        let identity = PersonalIdentityClient(baseURL: URL(string: "https://identity.invalid")!, session: urlSession, tokenStore: store)
        let model = PersonalAccountModel(identity: identity, callbackScheme: "synthetic")
        let old = Task { if signingOut { await model.signOut() } else { await model.restore() } }
        for await _ in started.stream { break }
        _ = try await identity.adoptBearerToken("synthetic-b")
        await model.restore()
        #expect(model.session?.userId == "b")
        released.continuation.yield(())
        await old.value
        #expect(model.session?.userId == "b")
        #expect(model.errorMessage == nil)
        #expect(!model.isConnecting)
    }
    #endif

}
