import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif
#if canImport(Security)
import Security
#endif

public struct PersonalAppleCredential: Equatable, Sendable {
    public let identityToken: String
    public let nonce: String
    public let email: String?
    public let firstName: String?
    public let lastName: String?

    public init(
        identityToken: String,
        nonce: String,
        email: String? = nil,
        firstName: String? = nil,
        lastName: String? = nil
    ) {
        self.identityToken = identityToken
        self.nonce = nonce
        self.email = email
        self.firstName = firstName
        self.lastName = lastName
    }
}

public struct PersonalIdentitySession: Codable, Equatable, Sendable {
    public let userId: String
    public let email: String
    public let appleSubject: String?
}

public enum PersonalIdentityError: LocalizedError, Equatable, Sendable {
    case missingSession
    case sessionChanged
    case invalidResponse
    case unavailablePresentationContext
    case server(status: Int, message: String)
    case keychain(status: Int32)

    public var errorDescription: String? {
        switch self {
        case .sessionChanged: "The account changed. Try again with your current account."
        case .missingSession: "Sign in again to connect this app."
        case .invalidResponse: "The personal account service returned an invalid response."
        case .unavailablePresentationContext:
            "Open the app window and try Google sign-in again."
        case let .server(_, message): message
        case .keychain: "The secure account session could not be accessed."
        }
    }
}

public protocol PersonalBearerTokenStore: Sendable {
    func load() async throws -> String?
    func save(_ token: String) async throws
    func delete() async throws
}

#if canImport(Security)
public actor KeychainBearerTokenStore: PersonalBearerTokenStore {
    private let service: String
    private let account: String

    public init(service: String, account: String = "better-auth-bearer") {
        self.service = service
        self.account = account
    }

    public func load() throws -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne,
        ]
        var result: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        if status == errSecItemNotFound { return nil }
        guard status == errSecSuccess, let data = result as? Data,
              let token = String(data: data, encoding: .utf8)
        else { throw PersonalIdentityError.keychain(status: status) }
        return token
    }

    public func save(_ token: String) throws {
        let identity: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
        ]
        let attributes: [String: Any] = [
            kSecValueData as String: Data(token.utf8),
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,
        ]
        let status = SecItemUpdate(identity as CFDictionary, attributes as CFDictionary)
        if status == errSecItemNotFound {
            var insertion = identity
            insertion.merge(attributes) { _, replacement in replacement }
            let insertionStatus = SecItemAdd(insertion as CFDictionary, nil)
            guard insertionStatus == errSecSuccess else {
                throw PersonalIdentityError.keychain(status: insertionStatus)
            }
        } else if status != errSecSuccess {
            throw PersonalIdentityError.keychain(status: status)
        }
    }

    public func delete() throws {
        let status = SecItemDelete([
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
        ] as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound else {
            throw PersonalIdentityError.keychain(status: status)
        }
    }
}
#endif

public actor PersonalIdentityClient {
    private let baseURL: URL
    private let session: URLSession
    private let tokenStore: any PersonalBearerTokenStore
    private let decoder = JSONDecoder()
    private let encoder = JSONEncoder()
    private var sessionRevision = UUID()
    private var isWritingToken = false
    private var tokenWriteWaiters: [CheckedContinuation<Void, Never>] = []

    public init(
        baseURL: URL = URL(string: "https://significanthobbies.com")!,
        session: URLSession = .shared,
        tokenStore: any PersonalBearerTokenStore
    ) {
        self.baseURL = baseURL
        self.session = session
        self.tokenStore = tokenStore
    }

    public func signInWithApple(_ credential: PersonalAppleCredential) async throws
        -> PersonalIdentitySession
    {
        let revision = beginSessionChange()
        var request = URLRequest(url: endpoint("api/auth/sign-in/social"))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try encoder.encode(AppleSignInRequest(credential: credential))
        let (_, response) = try await send(request)
        guard let token = response.value(forHTTPHeaderField: "set-auth-token"), !token.isEmpty else {
            throw PersonalIdentityError.missingSession
        }
        return try await adoptValidatedToken(token, revision: revision)
    }

    public func linkApple(_ credential: PersonalAppleCredential) async throws
        -> PersonalIdentitySession
    {
        let revision = sessionRevision
        guard let token = try await tokenStore.load() else {
            throw PersonalIdentityError.missingSession
        }
        try requireRevision(revision)
        var request = URLRequest(url: endpoint("api/auth/link-social"))
        request.httpMethod = "POST"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try encoder.encode(AppleSignInRequest(credential: credential))
        _ = try await send(request)
        try requireRevision(revision)
        let restored = try await identitySession(bearerToken: token)
        try await requireCurrent(token, revision: revision)
        return restored
    }

    public func restoreSession() async throws -> PersonalIdentitySession? {
        let revision = sessionRevision
        let savedToken = try await tokenStore.load()
        try requireRevision(revision)
        guard let token = savedToken else { return nil }
        do {
            let restored = try await identitySession(bearerToken: token)
            try await requireCurrent(token, revision: revision)
            return restored
        } catch let error as PersonalIdentityError {
            if case .server(status: 401, message: _) = error {
                try? await removeToken(token, revision: revision)
            }
            throw error
        }
    }

    public func bearerToken() async throws -> String? {
        try await tokenStore.load()
    }

    /// Adopts the one-use native browser handoff returned by the existing
    /// Better Auth service. This is the shared sign-in path for bundle IDs that
    /// are not the Journal app's native Apple client.
    public func adoptBearerToken(_ token: String) async throws -> PersonalIdentitySession {
        guard !token.isEmpty else { throw PersonalIdentityError.missingSession }
        return try await adoptValidatedToken(token, revision: beginSessionChange())
    }

    /// Exchanges the one-use code returned by the native browser handoff and
    /// persists the resulting Significant Hobbies bearer session.
    public func exchangeBrowserHandoff(_ code: String) async throws -> PersonalIdentitySession {
        guard !code.isEmpty else { throw PersonalIdentityError.invalidResponse }
        let revision = beginSessionChange()
        var request = URLRequest(url: endpoint("api/native/auth/exchange"))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try encoder.encode(HandoffRequest(code: code))
        let (data, _) = try await send(request)
        let response = try decoder.decode(HandoffResponse.self, from: data)
        return try await adoptValidatedToken(response.token, revision: revision)
    }

    public func signOut() async {
        let revision = beginSessionChange()
        // Read and remove under the same write lock so an earlier suspended
        // save cannot publish a token after this sign-out has cleared storage.
        await acquireTokenWrite()
        let token: String
        do {
            try requireRevision(revision)
            guard let saved = try await tokenStore.load() else {
                releaseTokenWrite()
                return
            }
            try requireRevision(revision)
            token = saved
            try await tokenStore.delete()
        } catch {
            releaseTokenWrite()
            return
        }
        releaseTokenWrite()
        // Never delete again after slow revocation: a newer sign-in may finish.

        var request = URLRequest(url: endpoint("api/auth/sign-out"))
        request.httpMethod = "POST"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = Data("{}".utf8)
        _ = try? await send(request)
    }

    private func beginSessionChange() -> UUID {
        sessionRevision = UUID()
        return sessionRevision
    }

    private func requireRevision(_ revision: UUID) throws {
        guard sessionRevision == revision else { throw PersonalIdentityError.sessionChanged }
    }

    private func requireCurrent(_ token: String, revision: UUID) async throws {
        let current = try await tokenStore.load()
        try requireRevision(revision)
        guard current == token else { throw PersonalIdentityError.sessionChanged }
    }

    private func acquireTokenWrite() async {
        if isWritingToken {
            await withCheckedContinuation { tokenWriteWaiters.append($0) }
        } else { isWritingToken = true }
    }

    private func releaseTokenWrite() {
        if tokenWriteWaiters.isEmpty { isWritingToken = false }
        else { tokenWriteWaiters.removeFirst().resume() }
    }

    private func removeToken(_ token: String, revision: UUID) async throws {
        await acquireTokenWrite()
        defer { releaseTokenWrite() }
        try await requireCurrent(token, revision: revision)
        try await tokenStore.delete()
    }

    private func adoptValidatedToken(_ token: String, revision: UUID) async throws -> PersonalIdentitySession {
        try requireRevision(revision)
        guard !token.isEmpty else { throw PersonalIdentityError.missingSession }
        // Failed validation preserves any previous session. A token only becomes
        // current after the server confirms it and this attempt is still current.
        let validated = try await identitySession(bearerToken: token)
        await acquireTokenWrite()
        defer { releaseTokenWrite() }
        try requireRevision(revision)
        try await tokenStore.save(token)
        try requireRevision(revision)
        return validated
    }

    private func identitySession(bearerToken: String) async throws -> PersonalIdentitySession {
        var request = URLRequest(url: endpoint("api/personal-platform/session"))
        request.setValue("Bearer \(bearerToken)", forHTTPHeaderField: "Authorization")
        let (data, _) = try await send(request)
        return try decoder.decode(PersonalIdentitySession.self, from: data)
    }

    private func endpoint(_ path: String) -> URL {
        baseURL.appending(path: path)
    }

    private func send(_ request: URLRequest) async throws -> (Data, HTTPURLResponse) {
        let (data, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse else {
            throw PersonalIdentityError.invalidResponse
        }
        guard (200..<300).contains(http.statusCode) else {
            let body = try? decoder.decode(ServerError.self, from: data)
            throw PersonalIdentityError.server(
                status: http.statusCode,
                message: body?.message ?? "Personal account request failed."
            )
        }
        return (data, http)
    }
}

private struct AppleSignInRequest: Encodable {
    let provider = "apple"
    let idToken: AppleIDToken

    init(credential: PersonalAppleCredential) {
        idToken = AppleIDToken(credential: credential)
    }
}

private struct HandoffRequest: Encodable { let code: String }
private struct HandoffResponse: Decodable { let token: String }

private struct AppleIDToken: Encodable {
    let token: String
    let nonce: String
    let user: AppleUser?

    init(credential: PersonalAppleCredential) {
        token = credential.identityToken
        nonce = credential.nonce
        let name = AppleName(firstName: credential.firstName, lastName: credential.lastName)
        user = credential.email == nil && name.isEmpty ? nil : AppleUser(email: credential.email, name: name)
    }
}

private struct AppleUser: Encodable {
    let email: String?
    let name: AppleName
}

private struct AppleName: Encodable {
    let firstName: String?
    let lastName: String?
    var isEmpty: Bool { firstName == nil && lastName == nil }
}

private struct ServerError: Decodable {
    let message: String
}
