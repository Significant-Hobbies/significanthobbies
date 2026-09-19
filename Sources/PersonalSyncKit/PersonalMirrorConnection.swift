#if canImport(CloudKit) && canImport(AuthenticationServices) && canImport(Security) && (os(iOS) || os(macOS))
import Foundation

/// Canonical composition root for the dual-mirror pattern, shared by every app.
///
/// One connection gives the app its shared identity client and a `MirrorRuntime`
/// wired with both production transports — the Hub (`personal-platform` D1) and
/// the app's CloudKit private zone — so the same `MirrorRecord`s reach Apple
/// storage and Cloudflare and a fresh install can restore from either.
///
/// Apps keep applying changes to their own local store; this type only owns
/// authentication, the mirror transports, and sync bookkeeping.
public struct PersonalMirrorConnection: Sendable {
    public let identity: PersonalIdentityClient
    public let runtime: MirrorRuntime
    public let account: PersonalAccountModel

    /// - Parameters:
    ///   - domain: the app's Hub domain.
    ///   - keychainService: the app's bearer-token Keychain service.
    ///   - supportDirectory: directory for sync bookkeeping files.
    ///   - deviceId: stable per-device identifier.
    ///   - callbackScheme: the app's URL scheme for the browser sign-in handoff.
    ///   - cloudKitContainer: the app's private CloudKit container identifier.
    ///   - cloudKitZone / cloudKitRecordType: zone and record type for the mirror
    ///     records. Apps with an existing zone pass their legacy names to keep
    ///     their CloudKit history.
    ///   - appendOnly: resolves a record name to its append-only flag, typically
    ///     by record-name prefix (e.g. `"session-"` for history kinds).
    ///   - accountGate: optional ownership gate for the Hub leg. Returning
    ///     `false` keeps Hub sync quiet until the local store is bound to the
    ///     verified account, while CloudKit still syncs.
    ///   - platformURL / identityURL: production defaults; tests inject their own.
    @MainActor
    public init(
        domain: PersonalDomain,
        keychainService: String,
        supportDirectory: URL,
        deviceId: String,
        callbackScheme: String,
        cloudKitContainer: String,
        cloudKitZone: String = CloudKitMirrorTransport.defaultZoneName,
        cloudKitRecordType: String = CloudKitMirrorTransport.defaultRecordType,
        appendOnly: @escaping @Sendable (String) -> Bool,
        accountGate: (@Sendable (PersonalSyncAccount) async -> Bool)? = nil,
        platformURL: URL = URL(string: "https://personal-platform.sarthakagrawal927.workers.dev")!,
        identityURL: URL = URL(string: "https://live.significanthobbies.com")!
    ) throws {
        let identity = PersonalIdentityClient(
            baseURL: identityURL,
            tokenStore: KeychainBearerTokenStore(service: keychainService)
        )
        self.identity = identity
        account = PersonalAccountModel(identity: identity, callbackScheme: callbackScheme, identityURL: identityURL)

        let hub = HubMirrorTransport(
            domain: domain,
            deviceId: deviceId,
            client: PersonalSyncClient(baseURL: platformURL),
            versions: try SyncVersionStore(
                fileURL: supportDirectory.appending(path: "mirror-hub-versions.json")
            ),
            account: { [identity] in try await identity.verifiedSyncAccount() },
            accountGate: accountGate,
            appendOnly: appendOnly
        )
        let cloudKit = CloudKitMirrorTransport(
            containerIdentifier: cloudKitContainer,
            zoneName: cloudKitZone,
            recordType: cloudKitRecordType,
            appendOnly: appendOnly
        )
        runtime = MirrorRuntime(
            transports: [hub, cloudKit],
            store: MirrorBookkeepingStore(
                fileURL: supportDirectory.appending(path: "mirror-sync.json")
            )
        )
    }

    /// Composition init for tests and custom wiring — the production
    /// convenience init above is the one apps normally use.
    public init(identity: PersonalIdentityClient, runtime: MirrorRuntime, account: PersonalAccountModel) {
        self.identity = identity
        self.runtime = runtime
        self.account = account
    }
}
#endif
