import AuthenticationServices
import CryptoKit
import Foundation
import Security
import SignificantHobbiesCore
import UIKit

struct AppleIdentityPayload: Sendable {
    let identityToken: String
    let nonce: String
    let email: String?
    let firstName: String?
    let lastName: String?
}

struct SignificantHobbiesAccount: Equatable, Sendable {
    let name: String
    let email: String
    let providers: Set<String>

    var hasApple: Bool { providers.contains("apple") }
}

enum NativeAccountError: LocalizedError {
    case invalidCallback
    case missingSession
    case conflict(AtlasCloudSnapshot)
    case server(String)
    case http(Int, String)

    var errorDescription: String? {
        switch self {
        case .invalidCallback:
            "Significant Hobbies could not verify the sign-in handoff."
        case .missingSession:
            "Your session expired. Sign in again."
        case .conflict:
            "A newer private Life Atlas needs your decision."
        case let .server(message), let .http(_, message):
            message
        }
    }
}

actor SignificantHobbiesKeychainSessionStore {
    private let service: String
    private let account: String

    init(
        service: String = "com.significanthobbies.app.session",
        account: String = "better-auth-bearer"
    ) {
        self.service = service
        self.account = account
    }

    func load() throws -> String? {
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
        guard status == errSecSuccess, let data = result as? Data else {
            throw NativeAccountError.server("Significant Hobbies could not read the secure session.")
        }
        return String(data: data, encoding: .utf8)
    }

    func save(_ token: String) throws {
        let data = Data(token.utf8)
        let identity: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
        ]
        let attributes: [String: Any] = [
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,
        ]
        let updateStatus = SecItemUpdate(identity as CFDictionary, attributes as CFDictionary)
        if updateStatus == errSecItemNotFound {
            var insertion = identity
            insertion.merge(attributes) { _, replacement in replacement }
            guard SecItemAdd(insertion as CFDictionary, nil) == errSecSuccess else {
                throw NativeAccountError.server("Significant Hobbies could not store the secure session.")
            }
        } else if updateStatus != errSecSuccess {
            throw NativeAccountError.server("Significant Hobbies could not update the secure session.")
        }
    }

    func delete() throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
        ]
        let status = SecItemDelete(query as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound else {
            throw NativeAccountError.server("Significant Hobbies could not remove the secure session.")
        }
    }
}

actor SignificantHobbiesNativeAccountClient {
    static let productionBaseURL = URL(string: "https://significanthobbies.com")!

    private let baseURL: URL
    private let urlSession: URLSession
    private let sessionStore: SignificantHobbiesKeychainSessionStore

    init(
        baseURL: URL = productionBaseURL,
        urlSession: URLSession = .shared,
        sessionStore: SignificantHobbiesKeychainSessionStore = SignificantHobbiesKeychainSessionStore()
    ) {
        self.baseURL = baseURL
        self.urlSession = urlSession
        self.sessionStore = sessionStore
    }

    var googleStartURL: URL {
        var components = URLComponents(
            url: endpoint("/api/native/auth/google/start"),
            resolvingAgainstBaseURL: false
        )!
        components.queryItems = [
            URLQueryItem(name: "callback", value: "significanthobbies://auth"),
        ]
        return components.url!
    }

    func restoreAccount() async throws -> SignificantHobbiesAccount? {
        guard try await sessionStore.load() != nil else { return nil }
        do {
            return try await account()
        } catch {
            try? await sessionStore.delete()
            throw error
        }
    }

    func exchangeHandoff(_ code: String) async throws -> SignificantHobbiesAccount {
        let response = try await request(
            path: "/api/native/auth/exchange",
            body: ["code": code],
            authenticated: false
        )
        let payload = try JSONDecoder().decode(TokenResponse.self, from: response)
        try await sessionStore.save(payload.token)
        return try await account()
    }

    func signInWithApple(_ payload: AppleIdentityPayload) async throws -> SignificantHobbiesAccount {
        let response = try await appleRequest(path: "/api/auth/sign-in/social", payload: payload)
        guard let token = response.response.value(forHTTPHeaderField: "set-auth-token") else {
            throw NativeAccountError.missingSession
        }
        try await sessionStore.save(token)
        return try await account()
    }

    func linkApple(_ payload: AppleIdentityPayload) async throws -> SignificantHobbiesAccount {
        _ = try await appleRequest(path: "/api/auth/link-social", payload: payload, authenticated: true)
        return try await account()
    }

    func fetchState() async throws -> AtlasCloudSnapshot? {
        let data = try await request(path: "/api/native/state", method: "GET")
        return try decoder.decode(StateResponse.self, from: data).state
    }

    func pushState(_ document: AtlasCloudDocument, baseRevision: Int?) async throws -> AtlasCloudSnapshot {
        let data = try await request(
            path: "/api/native/state",
            method: "PUT",
            encodableBody: StateWrite(document: document, baseRevision: baseRevision)
        )
        let payload = try decoder.decode(StateResponse.self, from: data)
        guard let state = payload.state else {
            throw NativeAccountError.server("Significant Hobbies did not return the saved Life Atlas.")
        }
        return state
    }

    func signOut() async {
        _ = try? await request(path: "/api/auth/sign-out", body: [String: String]())
        try? await sessionStore.delete()
    }

    func deleteAccount() async throws {
        _ = try await request(path: "/api/auth/delete-user", body: [String: String]())
        try await sessionStore.delete()
    }

    private func appleRequest(
        path: String,
        payload: AppleIdentityPayload,
        authenticated: Bool = false
    ) async throws -> NetworkResponse {
        var idToken: [String: Any] = ["token": payload.identityToken, "nonce": payload.nonce]
        if path.hasSuffix("sign-in/social") {
            var user: [String: Any] = [:]
            if let email = payload.email { user["email"] = email }
            var name: [String: String] = [:]
            if let firstName = payload.firstName { name["firstName"] = firstName }
            if let lastName = payload.lastName { name["lastName"] = lastName }
            if !name.isEmpty { user["name"] = name }
            if !user.isEmpty { idToken["user"] = user }
        }
        return try await networkRequest(
            path: path,
            method: "POST",
            data: try JSONSerialization.data(withJSONObject: ["provider": "apple", "idToken": idToken]),
            authenticated: authenticated
        )
    }

    private func account() async throws -> SignificantHobbiesAccount {
        let data = try await request(path: "/api/auth/get-session", method: "GET")
        let session = try decoder.decode(SessionResponse.self, from: data)
        let accountsData = try await request(path: "/api/auth/list-accounts", method: "GET")
        let accounts = try decoder.decode([ProviderAccount].self, from: accountsData)
        return SignificantHobbiesAccount(
            name: session.user.name,
            email: session.user.email,
            providers: Set(accounts.map(\.providerId))
        )
    }

    private func request(
        path: String,
        method: String = "POST",
        body: [String: String],
        authenticated: Bool = true
    ) async throws -> Data {
        try await request(
            path: path,
            method: method,
            data: try JSONEncoder().encode(body),
            authenticated: authenticated
        )
    }

    private func request<T: Encodable>(path: String, method: String, encodableBody: T) async throws -> Data {
        try await request(path: path, method: method, data: try encoder.encode(encodableBody))
    }

    private func request(
        path: String,
        method: String,
        data: Data? = nil,
        authenticated: Bool = true
    ) async throws -> Data {
        try await networkRequest(
            path: path,
            method: method,
            data: data,
            authenticated: authenticated
        ).data
    }

    private func networkRequest(
        path: String,
        method: String,
        data: Data? = nil,
        authenticated: Bool = true
    ) async throws -> NetworkResponse {
        var request = URLRequest(url: endpoint(path))
        request.httpMethod = method
        request.httpBody = data
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        if data != nil { request.setValue("application/json", forHTTPHeaderField: "Content-Type") }
        if authenticated {
            guard let token = try await sessionStore.load() else { throw NativeAccountError.missingSession }
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        let (responseData, rawResponse) = try await urlSession.data(for: request)
        guard let response = rawResponse as? HTTPURLResponse else {
            throw NativeAccountError.server("Significant Hobbies received an invalid server response.")
        }
        if response.statusCode == 409,
           let conflict = try? decoder.decode(StateResponse.self, from: responseData).state {
            throw NativeAccountError.conflict(conflict)
        }
        guard (200 ..< 300).contains(response.statusCode) else {
            let message = (try? decoder.decode(ErrorResponse.self, from: responseData).message)
                ?? "Significant Hobbies account service is unavailable."
            if response.statusCode == 401 { throw NativeAccountError.missingSession }
            throw NativeAccountError.http(response.statusCode, message)
        }
        return NetworkResponse(data: responseData, response: response)
    }

    private func endpoint(_ path: String) -> URL {
        baseURL.appending(path: path.trimmingCharacters(in: CharacterSet(charactersIn: "/")))
    }

    private var encoder: JSONEncoder {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        return encoder
    }

    private var decoder: JSONDecoder {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return decoder
    }
}

enum AppleNonce {
    static func make() -> String {
        let alphabet = Array("0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._")
        return String((0..<32).map { _ in alphabet.randomElement()! })
    }

    static func digest(_ nonce: String) -> String {
        SHA256.hash(data: Data(nonce.utf8)).map { String(format: "%02x", $0) }.joined()
    }
}

@MainActor
final class SignificantHobbiesWebAuthenticator: NSObject, ASWebAuthenticationPresentationContextProviding {
    private var session: ASWebAuthenticationSession?

    func authenticate(at url: URL) async throws -> String {
        try await withCheckedThrowingContinuation { continuation in
            let session = ASWebAuthenticationSession(url: url, callbackURLScheme: "significanthobbies") {
                callbackURL, error in
                if let error {
                    continuation.resume(throwing: error)
                    return
                }
                guard
                    let callbackURL,
                    callbackURL.scheme == "significanthobbies",
                    callbackURL.host == "auth",
                    let code = URLComponents(url: callbackURL, resolvingAgainstBaseURL: false)?
                        .queryItems?.first(where: { $0.name == "code" })?.value
                else {
                    continuation.resume(throwing: NativeAccountError.invalidCallback)
                    return
                }
                continuation.resume(returning: code)
            }
            session.presentationContextProvider = self
            session.prefersEphemeralWebBrowserSession = false
            self.session = session
            guard session.start() else {
                continuation.resume(
                    throwing: NativeAccountError.server("Significant Hobbies could not open sign in.")
                )
                return
            }
        }
    }

    func presentationAnchor(for _: ASWebAuthenticationSession) -> ASPresentationAnchor {
        UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .flatMap(\.windows)
            .first(where: \.isKeyWindow) ?? ASPresentationAnchor()
    }
}

private struct TokenResponse: Decodable { let token: String }
private struct SessionResponse: Decodable { let user: SessionUser }
private struct SessionUser: Decodable { let name: String; let email: String }
private struct ProviderAccount: Decodable { let providerId: String }
private struct NetworkResponse { let data: Data; let response: HTTPURLResponse }
private struct ErrorResponse: Decodable { let message: String }
private struct StateResponse: Decodable { let state: AtlasCloudSnapshot? }
private struct StateWrite: Encodable {
    let document: AtlasCloudDocument
    let baseRevision: Int?
}
