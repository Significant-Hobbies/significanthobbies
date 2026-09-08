import Foundation

/// Small composition root shared by native apps. Apps keep applying changes to
/// their own local store; this type only owns authentication, the durable
/// mutation outbox, the pull cursor, and transport.
public struct PersonalPlatformConnection: Sendable {
    public let identity: PersonalIdentityClient
    public let sync: PersonalSyncRuntime

    #if canImport(Security)
    public init(
        domain: PersonalDomain,
        keychainService: String,
        supportDirectory: URL,
        deviceId: String,
        platformURL: URL = URL(string: "https://personal-platform.sarthakagrawal927.workers.dev")!,
        identityURL: URL = URL(string: "https://significanthobbies.com")!
    ) throws {
        let identity = PersonalIdentityClient(
            baseURL: identityURL,
            tokenStore: KeychainBearerTokenStore(service: keychainService)
        )
        self.identity = identity
        sync = try PersonalSyncRuntime(
            domain: domain,
            deviceId: deviceId,
            supportDirectory: supportDirectory,
            identity: identity,
            client: PersonalSyncClient(baseURL: platformURL)
        )
    }
    #endif
}

public enum PersonalSyncOwnershipError: Error, Equatable, Sendable {
    case approvalRequired
    case differentAccount
}

private struct SyncAccountBinding: Codable {
    let userID: String
}

public actor PersonalSyncRuntime {
    public let domain: PersonalDomain
    private let deviceId: String
    private let identity: PersonalIdentityClient
    private let outbox: MutationOutbox
    private let versions: SyncVersionStore
    private let fingerprints: SyncFingerprintStore
    private let coordinator: SyncCoordinator
    private let accountFile: URL
    private var accountOwner: String?
    private var operationActive = false
    private var operationWaiters: [CheckedContinuation<Void, Never>] = []

    public init(
        domain: PersonalDomain,
        deviceId: String,
        supportDirectory: URL,
        identity: PersonalIdentityClient,
        client: PersonalSyncClient
    ) throws {
        self.domain = domain
        self.deviceId = deviceId
        self.identity = identity
        accountFile = supportDirectory.appending(path: "personal-sync-account.json")
        if FileManager.default.fileExists(atPath: accountFile.path) {
            let binding = try JSONDecoder().decode(SyncAccountBinding.self, from: Data(contentsOf: accountFile))
            guard !binding.userID.isEmpty else { throw PersonalSyncOwnershipError.approvalRequired }
            accountOwner = binding.userID
        }
        let outbox = try MutationOutbox(fileURL: supportDirectory.appending(path: "personal-sync-outbox.json"))
        self.outbox = outbox
        let versions = try SyncVersionStore(
            fileURL: supportDirectory.appending(path: "personal-sync-versions.json")
        )
        self.versions = versions
        let fingerprints = try SyncFingerprintStore(
            fileURL: supportDirectory.appending(path: "personal-sync-fingerprints.json")
        )
        self.fingerprints = fingerprints
        coordinator = SyncCoordinator(
            client: client,
            outbox: outbox,
            cursors: try SyncCursorStore(fileURL: supportDirectory.appending(path: "personal-sync-cursors.json")),
            versions: versions,
            fingerprints: fingerprints
        )
    }

    public func enqueue(
        recordId: String,
        operation: MutationOperation = .upsert,
        baseVersion: Int? = nil,
        occurredAt: String,
        record: JSONValue? = nil,
        idempotencyKey: String? = nil,
        account: PersonalSyncAccount? = nil
    ) async throws {
        await acquireOperation()
        defer { releaseOperation() }
        if let account { try await requireOwner(account) }
        else if accountOwner != nil { throw PersonalSyncOwnershipError.approvalRequired }
        let fingerprint = syncFingerprint(operation: operation, record: record)
        if await fingerprints.fingerprint(for: recordId, in: domain) == fingerprint {
            return
        }
        let resolvedBaseVersion: Int
        if let baseVersion {
            resolvedBaseVersion = baseVersion
        } else {
            resolvedBaseVersion = await versions.version(for: recordId, in: domain)
        }
        let mutation = SyncMutation(
            id: recordId,
            idempotencyKey: idempotencyKey ?? UUID().uuidString.lowercased(),
            operation: operation,
            baseVersion: resolvedBaseVersion,
            occurredAt: occurredAt,
            record: record
        )
        if let account { try await requireOwner(account) }
        try await outbox.enqueue(OutboxEntry(domain: domain, mutation: mutation))
        try await fingerprints.setFingerprint(fingerprint, for: recordId, in: domain)
    }

    /// Call only after the app has durably associated its local document with
    /// this verified user and the person has approved adopting legacy data.
    /// Existing ownership never transfers implicitly to a different account.
    public func bindAccount(_ account: PersonalSyncAccount, adoptingUnownedData: Bool = false) async throws {
        await acquireOperation()
        defer { releaseOperation() }
        try await identity.requireCurrentAccount(account)
        if let accountOwner {
            guard accountOwner == account.userID else { throw PersonalSyncOwnershipError.differentAccount }
            return
        }
        guard adoptingUnownedData else { throw PersonalSyncOwnershipError.approvalRequired }
        try FileManager.default.createDirectory(at: accountFile.deletingLastPathComponent(), withIntermediateDirectories: true)
        let data = try JSONEncoder().encode(SyncAccountBinding(userID: account.userID))
        try data.write(to: accountFile, options: .atomic)
        accountOwner = account.userID
    }

    private func requireOwner(_ account: PersonalSyncAccount) async throws {
        try await identity.requireCurrentAccount(account)
        guard let accountOwner else { throw PersonalSyncOwnershipError.approvalRequired }
        guard accountOwner == account.userID else { throw PersonalSyncOwnershipError.differentAccount }
    }

    private func acquireOperation() async {
        if operationActive { await withCheckedContinuation { operationWaiters.append($0) } }
        else { operationActive = true }
    }

    private func releaseOperation() {
        if operationWaiters.isEmpty { operationActive = false }
        else { operationWaiters.removeFirst().resume() }
    }

    /// Number of durable local mutations still waiting for this domain.
    /// Apps use this to distinguish a healthy, current connection from a
    /// signed-out or failed sync that is safely retaining local changes.
    public func pendingMutationCount() async -> Int {
        await outbox.pending(for: domain).count
    }

    /// Returns immediately with no changes while signed out. Network failures
    /// are surfaced to the app, while the durable outbox remains intact.
    @available(*, deprecated, message: "Use synchronize(applyChanges:) to commit downloaded records before advancing sync progress.")
    public func synchronize() async throws -> [SyncChange] {
        try await synchronize(applyChanges: { _ in })
    }

    /// Commit the supplied batch to the application's durable store before this
    /// closure returns. Throwing leaves downloads retryable; application must
    /// tolerate replay if bookkeeping fails after its own commit succeeds.
    @discardableResult
    public func synchronize(
        account suppliedAccount: PersonalSyncAccount? = nil,
        applyChanges: @Sendable ([SyncChange]) async throws -> Void
    ) async throws -> [SyncChange] {
        let verified: PersonalSyncAccount?
        if let suppliedAccount { verified = suppliedAccount }
        else { verified = try await identity.verifiedSyncAccount() }
        guard let account = verified else { return [] }
        await acquireOperation()
        defer { releaseOperation() }
        try await requireOwner(account)
        return try await coordinator.synchronize(
            domain: domain,
            deviceId: deviceId,
            bearerToken: account.bearerToken,
            validateSession: { try await self.identity.requireCurrentAccount(account) },
            applyChanges: applyChanges
        )
    }
}
