import Foundation

/// One synchronisable unit, identical on every transport.
///
/// `name` is the cross-transport identity ("<kind>-<id>"). `modifiedAt` is when
/// this version was written by a device — never the time a server accepted it,
/// because the merge compares write times, not arrival times. A `nil` payload
/// is a tombstone: the record exists to say the entity was deleted, because
/// without one the other side still holds the entity and pushes it back.
///
/// `appendOnly` marks kinds that are logs of things that happened (history,
/// interactions): a completed entry is never edited and never deleted, so a
/// tombstone can never beat a live copy — a wrong device clock cannot erase a
/// workout or a note someone wrote.
public struct MirrorRecord: Equatable, Sendable {
    public var name: String
    public var modifiedAt: Date
    public var payload: Data?
    public var appendOnly: Bool
    /// Affiliation evidence carried by private-cloud copies, including deletion
    /// records. Hub callers derive authority from authentication, not this field.
    public var hubOwnerID: String?

    public init(name: String, modifiedAt: Date, payload: Data?, appendOnly: Bool = false, hubOwnerID: String? = nil) {
        self.name = name
        self.modifiedAt = modifiedAt
        self.payload = payload
        self.appendOnly = appendOnly
        self.hubOwnerID = hubOwnerID
    }

    public var isDeleted: Bool { payload == nil }
}

public enum MirrorSyncError: Error, Equatable, Sendable {
    /// The transport refused a push because the remote moved ahead. The next
    /// pull carries the remote version and the merge resolves it.
    case conflict(recordName: String)
    case unavailable(String)
    case invalidResponse
}

/// Reconciles two sets of records without ever dropping recorded history.
///
/// Pure: no network, no container, no clock it does not control. The same rules
/// decide merges against CloudKit, the Hub, or an in-memory transport in tests.
public enum MirrorMerge {
    public struct Result: Equatable, Sendable {
        /// Everything that should exist after the merge, on both sides.
        public var merged: [MirrorRecord]
        /// Records the remote side is missing or holds an older version of.
        public var toPush: [MirrorRecord]
        /// Records the local side is missing or holds an older version of.
        public var toPull: [MirrorRecord]

        public init(merged: [MirrorRecord], toPush: [MirrorRecord], toPull: [MirrorRecord]) {
            self.merged = merged
            self.toPush = toPush
            self.toPull = toPull
        }

        public var isUpToDate: Bool { toPush.isEmpty && toPull.isEmpty }
    }

    public static func merge(local: [MirrorRecord], remote: [MirrorRecord]) -> Result {
        var merged: [String: MirrorRecord] = [:]
        var toPush: [MirrorRecord] = []
        var toPull: [MirrorRecord] = []

        let localByName = Dictionary(local.map { ($0.name, $0) }, uniquingKeysWith: winner)
        let remoteByName = Dictionary(remote.map { ($0.name, $0) }, uniquingKeysWith: winner)

        for name in Set(localByName.keys).union(remoteByName.keys).sorted() {
            switch (localByName[name], remoteByName[name]) {
            case let (.some(mine), .some(theirs)):
                let chosen = winner(mine, theirs)
                merged[name] = chosen
                if chosen != theirs { toPush.append(chosen) }
                if chosen != mine { toPull.append(chosen) }
            case let (.some(mine), .none):
                merged[name] = mine
                toPush.append(mine)
            case let (.none, .some(theirs)):
                merged[name] = theirs
                toPull.append(theirs)
            case (.none, .none):
                continue
            }
        }

        return Result(
            merged: merged.values.sorted { $0.name < $1.name },
            toPush: toPush.sorted { $0.name < $1.name },
            toPull: toPull.sorted { $0.name < $1.name }
        )
    }

    /// Picks between two versions of the same record.
    ///
    /// Append-only kinds keep whichever version has content, so a log entry
    /// cannot be erased by a device whose clock is wrong or which never saw it.
    /// Everything else is last-writer-wins, and an exact timestamp tie is broken
    /// on payload bytes so two devices merging the same pair always reach the
    /// same answer rather than disagreeing forever.
    public static func winner(_ left: MirrorRecord, _ right: MirrorRecord) -> MirrorRecord {
        if left == right { return left }
        if left.appendOnly || right.appendOnly {
            if left.isDeleted != right.isDeleted { return left.isDeleted ? right : left }
        }
        if left.modifiedAt != right.modifiedAt {
            return left.modifiedAt > right.modifiedAt ? left : right
        }
        let leftBytes = left.payload ?? Data()
        let rightBytes = right.payload ?? Data()
        if leftBytes.count != rightBytes.count {
            return leftBytes.count > rightBytes.count ? left : right
        }
        if leftBytes != rightBytes {
            return leftBytes.lexicographicallyPrecedes(rightBytes) ? right : left
        }
        // Retained affiliation wins an otherwise identical old-client copy.
        // Conflicting owners remain distinguishable for caller validation.
        return (left.hubOwnerID ?? "") < (right.hubOwnerID ?? "") ? right : left
    }
}

/// Remembers what each record looked like when it was last written, so a local
/// edit can be dated without every domain type carrying an `updatedAt` field.
///
/// Sync bookkeeping stays out of the app's document model: fingerprinting the
/// encoded payload cannot be forgotten by a call site that mutates an entity.
/// The stamp also carries `appendOnly` so a CloudKit hard delete — which reports
/// only a record name — can be turned into a correctly shaped tombstone.
public struct MirrorLedger: Codable, Equatable, Sendable {
    public struct Stamp: Codable, Equatable, Sendable {
        public var fingerprint: String
        public var modifiedAt: Date
        public var appendOnly: Bool

        public init(fingerprint: String, modifiedAt: Date, appendOnly: Bool = false) {
            self.fingerprint = fingerprint
            self.modifiedAt = modifiedAt
            self.appendOnly = appendOnly
        }
    }

    public var stamps: [String: Stamp]

    public init(stamps: [String: Stamp] = [:]) {
        self.stamps = stamps
    }

    /// Dates a record: unchanged payloads keep the timestamp they already had, so
    /// re-reading a document does not make every record look freshly edited and
    /// win every merge.
    public mutating func stamp(_ record: MirrorRecord, now: Date) -> Date {
        let fingerprint = Self.fingerprint(of: record)
        if let existing = stamps[record.name], existing.fingerprint == fingerprint {
            return existing.modifiedAt
        }
        stamps[record.name] = Stamp(
            fingerprint: fingerprint,
            modifiedAt: now,
            appendOnly: record.appendOnly
        )
        return now
    }

    public func appendOnly(for recordName: String) -> Bool {
        stamps[recordName]?.appendOnly ?? false
    }

    public static func fingerprint(of record: MirrorRecord) -> String {
        let payload = fingerprint(of: record.payload)
        guard let owner = record.hubOwnerID else { return payload }
        return payload + ":owner:" + fingerprint(of: Data(owner.utf8))
    }

    public static func fingerprint(of payload: Data?) -> String {
        guard let payload else { return "deleted" }
        // Not a cryptographic digest: this only has to change when the bytes do,
        // and it must stay identical across OS versions, so no Hasher seeding.
        var hash: UInt64 = 0xcbf2_9ce4_8422_2325
        for byte in payload {
            hash ^= UInt64(byte)
            hash = hash.multipliedReportingOverflow(by: 0x100_0000_01b3).partialValue
        }
        return String(hash, radix: 16)
    }
}
