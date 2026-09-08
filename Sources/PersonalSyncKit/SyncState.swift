import Foundation

public actor MutationOutbox {
    private let fileURL: URL
    private var entries: [OutboxEntry]

    public init(fileURL: URL) throws {
        self.fileURL = fileURL
        if FileManager.default.fileExists(atPath: fileURL.path) {
            entries = try JSONDecoder().decode([OutboxEntry].self, from: Data(contentsOf: fileURL))
        } else {
            entries = []
        }
    }

    public func enqueue(_ entry: OutboxEntry) throws {
        var candidate = entries
        if let index = candidate.firstIndex(where: {
            $0.domain == entry.domain && $0.mutation.id == entry.mutation.id
        }) {
            candidate[index] = entry
        } else {
            candidate.append(entry)
        }
        try persist(candidate)
        entries = candidate
    }

    public func pending(for domain: PersonalDomain) -> [OutboxEntry] {
        entries.filter { $0.domain == domain }
    }

    public func acknowledge(idempotencyKeys: Set<String>) throws {
        let candidate = entries.filter { !idempotencyKeys.contains($0.mutation.idempotencyKey) }
        try persist(candidate)
        entries = candidate
    }

    private func persist(_ candidate: [OutboxEntry]) throws {
        try FileManager.default.createDirectory(
            at: fileURL.deletingLastPathComponent(),
            withIntermediateDirectories: true
        )
        try JSONEncoder().encode(candidate).write(to: fileURL, options: .atomic)
    }
}

public actor SyncVersionStore {
    private let fileURL: URL
    private var versions: [PersonalDomain: [String: Int]]

    public init(fileURL: URL) throws {
        self.fileURL = fileURL
        if FileManager.default.fileExists(atPath: fileURL.path) {
            versions = try JSONDecoder().decode(
                [PersonalDomain: [String: Int]].self,
                from: Data(contentsOf: fileURL)
            )
        } else {
            versions = [:]
        }
    }

    public func version(for recordId: String, in domain: PersonalDomain) -> Int {
        versions[domain]?[recordId] ?? 0
    }

    public func setVersion(_ version: Int, for recordId: String, in domain: PersonalDomain) throws {
        guard version >= 0 else { return }
        var candidate = versions
        candidate[domain, default: [:]][recordId] = version
        try persist(candidate)
        versions = candidate
    }

    private func persist(_ candidate: [PersonalDomain: [String: Int]]) throws {
        try FileManager.default.createDirectory(
            at: fileURL.deletingLastPathComponent(),
            withIntermediateDirectories: true
        )
        try JSONEncoder().encode(candidate).write(to: fileURL, options: .atomic)
    }
}

public actor SyncFingerprintStore {
    private let fileURL: URL
    private var fingerprints: [PersonalDomain: [String: String]]

    public init(fileURL: URL) throws {
        self.fileURL = fileURL
        if FileManager.default.fileExists(atPath: fileURL.path) {
            fingerprints = try JSONDecoder().decode(
                [PersonalDomain: [String: String]].self,
                from: Data(contentsOf: fileURL)
            )
        } else {
            fingerprints = [:]
        }
    }

    public func fingerprint(for recordId: String, in domain: PersonalDomain) -> String? {
        fingerprints[domain]?[recordId]
    }

    public func setFingerprint(
        _ fingerprint: String,
        for recordId: String,
        in domain: PersonalDomain
    ) throws {
        var candidate = fingerprints
        candidate[domain, default: [:]][recordId] = fingerprint
        try persist(candidate)
        fingerprints = candidate
    }

    private func persist(_ candidate: [PersonalDomain: [String: String]]) throws {
        try FileManager.default.createDirectory(
            at: fileURL.deletingLastPathComponent(),
            withIntermediateDirectories: true
        )
        try JSONEncoder().encode(candidate).write(to: fileURL, options: .atomic)
    }
}

public actor SyncCursorStore {
    private let fileURL: URL
    private var cursors: [PersonalDomain: Int]

    public init(fileURL: URL) throws {
        self.fileURL = fileURL
        if FileManager.default.fileExists(atPath: fileURL.path) {
            cursors = try JSONDecoder().decode(
                [PersonalDomain: Int].self,
                from: Data(contentsOf: fileURL)
            )
        } else {
            cursors = [:]
        }
    }

    public func cursor(for domain: PersonalDomain) -> Int {
        cursors[domain, default: 0]
    }

    public func setCursor(_ cursor: Int, for domain: PersonalDomain) throws {
        var candidate = cursors
        candidate[domain] = cursor
        try FileManager.default.createDirectory(
            at: fileURL.deletingLastPathComponent(),
            withIntermediateDirectories: true
        )
        try JSONEncoder().encode(candidate).write(to: fileURL, options: .atomic)
        cursors = candidate
    }
}

public actor SyncCoordinator {
    private let client: any PersonalSyncTransport
    private let outbox: MutationOutbox
    private let cursors: SyncCursorStore
    private let versions: SyncVersionStore
    private let fingerprints: SyncFingerprintStore
    private var isSynchronizing = false
    private var waiters: [CheckedContinuation<Void, Never>] = []

    public init(
        client: any PersonalSyncTransport,
        outbox: MutationOutbox,
        cursors: SyncCursorStore,
        versions: SyncVersionStore,
        fingerprints: SyncFingerprintStore
    ) {
        self.client = client
        self.outbox = outbox
        self.cursors = cursors
        self.versions = versions
        self.fingerprints = fingerprints
    }

    @available(*, deprecated, message: "Use synchronize(..., applyChanges:) and commit local records inside its closure before acknowledging downloads.")
    public func synchronize(
        domain: PersonalDomain,
        deviceId: String,
        bearerToken: String
    ) async throws -> [SyncChange] {
        try await synchronize(domain: domain, deviceId: deviceId, bearerToken: bearerToken, applyChanges: { _ in })
    }

    /// The callback must atomically persist downloaded records and tolerate replay.
    /// A failure retains the old cursor. Bookkeeping failures after a successful
    /// app commit can replay that batch, but can never acknowledge an unapplied one.
    /// Do not call synchronize recursively from the callback.
    @discardableResult
    public func synchronize(
        domain: PersonalDomain,
        deviceId: String,
        bearerToken: String,
        applyChanges: @Sendable ([SyncChange]) async throws -> Void
    ) async throws -> [SyncChange] {
        if isSynchronizing {
            await withCheckedContinuation { waiters.append($0) }
        } else {
            isSynchronizing = true
        }
        defer {
            if waiters.isEmpty { isSynchronizing = false }
            else { waiters.removeFirst().resume() }
        }
        try Task.checkCancellation()
        let queued = await outbox.pending(for: domain)
        if !queued.isEmpty {
            let pushed = try await client.push(
                domain: domain,
                deviceId: deviceId,
                mutations: queued.map(\.mutation),
                bearerToken: bearerToken
            )
            let acknowledged = Set(
                pushed.results
                    .filter {
                        $0.status == "accepted" || $0.status == "duplicate" || $0.status == "conflict"
                    }
                    .map(\.idempotencyKey)
            )
            for result in pushed.results {
                if let version = result.version {
                    try await versions.setVersion(version, for: result.id, in: domain)
                } else if let actualVersion = result.actualVersion {
                    try await versions.setVersion(actualVersion, for: result.id, in: domain)
                }
            }
            try await outbox.acknowledge(idempotencyKeys: acknowledged)
        }

        let currentCursor = await cursors.cursor(for: domain)
        var allChanges: [SyncChange] = []
        var nextCursor = currentCursor
        repeat {
            let page = try await client.pull(
                domain: domain,
                cursor: nextCursor,
                bearerToken: bearerToken
            )
            allChanges.append(contentsOf: page.changes)
            guard page.cursor >= nextCursor,
                  !page.hasMore || page.cursor > nextCursor else {
                throw PersonalSyncError.invalidResponse
            }
            nextCursor = page.cursor
            if !page.hasMore { break }
        } while true
        if !allChanges.isEmpty { try await applyChanges(allChanges) }
        for change in allChanges {
            try await versions.setVersion(change.version, for: change.id, in: domain)
            try await fingerprints.setFingerprint(
                syncFingerprint(operation: change.operation, record: change.record),
                for: change.id,
                in: domain
            )
        }
        try await cursors.setCursor(nextCursor, for: domain)
        return allChanges
    }
}
