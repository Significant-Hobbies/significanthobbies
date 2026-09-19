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
    }

    /// Forgets what was last synced from this device.
    ///
    /// Must be called whenever local data is wiped or wholesale replaced. The
    /// ledger is what turns "this entity is no longer here" into a tombstone, so
    /// a reset with a surviving ledger would sync itself as a deletion of
    /// everything and erase the same data from every remote. Forgetting costs
    /// one full compare; not forgetting costs the data.
    public func reset() throws {
        guard FileManager.default.fileExists(atPath: fileURL.path) else { return }
        try FileManager.default.removeItem(atPath: fileURL.path)
    }
}
