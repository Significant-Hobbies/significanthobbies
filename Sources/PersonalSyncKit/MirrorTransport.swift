import Foundation

public enum MirrorAvailability: Equatable, Sendable {
    case available
    case unavailable(String)
}

/// What one pull returned. `records` is the delta since `token` (or the full
/// remote set when the token was absent or expired). `nextToken` is opaque to
/// the runtime — each transport owns its meaning (Hub cursor, CloudKit zone
/// change token).
public struct MirrorPullPage: Sendable {
    public var records: [MirrorRecord]
    public var nextToken: Data?

    public init(records: [MirrorRecord], nextToken: Data?) {
        self.records = records
        self.nextToken = nextToken
    }
}

/// One remote home for `MirrorRecord`s. Implementations carry no merge rules —
/// `MirrorMerge` decides what wins; transports only move records and report
/// whether they are reachable.
///
/// Both production transports (Hub worker, CloudKit private zone) implement
/// this; apps and tests can add in-memory ones.
public protocol MirrorTransport: Sendable {
    /// Stable identifier used to namespace per-transport bookkeeping.
    var id: String { get }
    func availability() async -> MirrorAvailability
    /// Accepts records the transport is missing or holds an older version of.
    func push(_ records: [MirrorRecord]) async throws
    /// Returns every change since `token`. An expired or absent token means the
    /// transport returns its full current set — safe because absence never
    /// means deletion: only an explicit tombstone removes anything.
    func pull(since token: Data?) async throws -> MirrorPullPage
    /// Begins one bounded synchronization pass and returns the transport to use
    /// for that whole pass. Transports that authenticate per request (the Hub)
    /// pin their verified account here so a sign-in that lands mid-pass is
    /// detected, never silently adopted as the session for work already begun
    /// under another account. The default returns `self`: transports without
    /// per-pass credentials need no pinning.
    func beginSynchronization() async throws -> any MirrorTransport
    /// Throws when the session this pass began with is no longer current —
    /// e.g. the account was signed out or replaced mid-pass. The runtime calls
    /// it after every suspension whose completion must still belong to the
    /// original account. The default is a no-op for transports without
    /// per-pass sessions.
    ///
    /// This bounds the pass; it is not per-record provenance. A caller's
    /// `apply` closure is arbitrary async code that can suspend, so the guard
    /// cannot make it atomic: an apply that already committed after an account
    /// switch stays committed. Callers whose own commits can outlive a
    /// suspension must recheck their owner/epoch before their durable commit.
    /// Checks reject observed session changes; they cannot make external
    /// identity changes atomic with app or bookkeeping writes.
    func validateSynchronization() async throws
}

public extension MirrorTransport {
    func beginSynchronization() async throws -> any MirrorTransport { self }
    func validateSynchronization() async throws {}
}

/// Opaque per-transport pull tokens and last-pushed fingerprints, stored beside
/// the app's document rather than inside it.
///
/// These are sync bookkeeping, not user data. Keeping them out of the document
/// means an export contains user content and nothing about how a device talked
/// to a server, and importing a file cannot corrupt sync state.
public actor MirrorBookkeepingStore {
    public struct State: Codable, Equatable, Sendable {
        public var ledger: MirrorLedger
        /// Per transport: the pull token the remote last returned.
        public var pullTokens: [String: Data]
        /// Per transport: record name → fingerprint of what that transport last
        /// accepted. Lets each remote be pushed only its own missing deltas.
        public var pushedFingerprints: [String: [String: String]]
        public var lastSyncedAt: Date?
        /// The account this bookkeeping belongs to. Set explicitly by the app
        /// after account approval; a different account must never inherit
        /// another account's queue, tokens, or ledger.
        public var ownerID: String?

        public init(
            ledger: MirrorLedger = MirrorLedger(),
            pullTokens: [String: Data] = [:],
            pushedFingerprints: [String: [String: String]] = [:],
            lastSyncedAt: Date? = nil,
            ownerID: String? = nil
        ) {
            self.ledger = ledger
            self.pullTokens = pullTokens
            self.pushedFingerprints = pushedFingerprints
            self.lastSyncedAt = lastSyncedAt
            self.ownerID = ownerID
        }
    }

    public let fileURL: URL
    private var revision: UInt64 = 0

    public init(fileURL: URL) {
        self.fileURL = fileURL
    }

    public func load() throws -> State {
        guard FileManager.default.fileExists(atPath: fileURL.path) else { return State() }
        let data = try Data(contentsOf: fileURL)
        // Ownership and tombstones cannot be reconstructed from a fresh pull.
        // Preserve corrupt evidence and stop until explicit recovery is chosen.
        return try JSONDecoder().decode(State.self, from: data)
    }

    public func save(_ state: State) throws {
        try FileManager.default.createDirectory(
            at: fileURL.deletingLastPathComponent(),
            withIntermediateDirectories: true
        )
        let data = try JSONEncoder().encode(state)
        try data.write(to: fileURL, options: .atomic)
        revision &+= 1
    }

    // One store actor owns this file. The in-memory revision invalidates passes
    // suspended across reset/rebind/repull without locking app callbacks.
    func loadSnapshot() throws -> (state: State, revision: UInt64) {
        (try load(), revision)
    }

    func requireRevision(_ expected: UInt64) throws {
        guard revision == expected else {
            throw MirrorSyncError.unavailable("sync bookkeeping changed; retry required")
        }
    }

    func save(_ state: State, ifRevision expected: UInt64) throws {
        try requireRevision(expected)
        try save(state)
    }

    func bindOwner(_ userID: String?) throws {
        var state = try load()
        if let bound = state.ownerID, bound != userID {
            throw PersonalSyncOwnershipError.differentAccount
        }
        guard let userID else { return }
        state.ownerID = userID
        try save(state)
    }

    func repullAll() throws {
        var state = try load()
        state.pullTokens = [:]
        try save(state)
    }

    /// Forgets what was last synced from this device.
    ///
    /// Must be called whenever local data is wiped or wholesale replaced. The
    /// ledger is what turns "this entity is no longer here" into a tombstone, so
    /// a reset with a surviving ledger would sync itself as a deletion of
    /// everything and erase the same data from every remote. Forgetting costs
    /// one full compare; not forgetting costs the data.
    public func reset() throws {
        if FileManager.default.fileExists(atPath: fileURL.path) {
            try FileManager.default.removeItem(atPath: fileURL.path)
        }
        revision &+= 1
    }
}
