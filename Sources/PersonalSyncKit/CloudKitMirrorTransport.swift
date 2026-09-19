#if canImport(CloudKit)
import CloudKit
import Foundation

/// The CloudKit home for `MirrorRecord`s: the owner's private database, a custom
/// zone, one record per mirror record.
///
/// Private database only — these records are one person's data, so there is no
/// shared or public zone and no server-side logic that could read them. A custom
/// zone rather than the default one, because only a custom zone supports
/// fetching changes by token — the default zone would force a full compare on
/// every sync.
///
/// Zone and record-type names are injectable so an app with an existing zone
/// (Setline's `Training`/`SyncRecord`) keeps its CloudKit history instead of
/// re-seeding. This type holds no merge rules. It moves records and reports
/// whether iCloud is usable; `MirrorMerge` decides what wins.
public struct CloudKitMirrorTransport: MirrorTransport {
    public static let defaultZoneName = "Sync"
    public static let defaultRecordType = "MirrorRecord"

    public let id = "cloudkit"

    private let container: CKContainer
    private let zoneID: CKRecordZone.ID
    private let recordType: String
    private let appendOnly: @Sendable (String) -> Bool

    public init(
        containerIdentifier: String,
        zoneName: String = defaultZoneName,
        recordType: String = defaultRecordType,
        appendOnly: @escaping @Sendable (String) -> Bool = { _ in false }
    ) {
        self.container = CKContainer(identifier: containerIdentifier)
        self.zoneID = CKRecordZone.ID(zoneName: zoneName, ownerName: CKCurrentUserDefaultName)
        self.recordType = recordType
        self.appendOnly = appendOnly
    }

    private var database: CKDatabase { container.privateCloudDatabase }

    public func availability() async -> MirrorAvailability {
        do {
            switch try await container.accountStatus() {
            case .available:
                return .available
            case .noAccount:
                return .unavailable("no iCloud account")
            case .restricted:
                return .unavailable("iCloud is restricted on this device")
            case .couldNotDetermine:
                return .unavailable("iCloud status could not be determined")
            case .temporarilyUnavailable:
                return .unavailable("iCloud is temporarily unavailable")
            @unknown default:
                return .unavailable("unrecognised iCloud status")
            }
        } catch {
            // A missing container reads as an error here rather than a status,
            // and it means the build is not provisioned rather than that the
            // user did anything wrong.
            return .unavailable(error.localizedDescription)
        }
    }

    public func push(_ records: [MirrorRecord]) async throws {
        guard !records.isEmpty else { return }
        try await ensureZoneExists()
        // CloudKit caps a single operation at 400 changes; batching keeps a
        // large first sync from failing wholesale.
        for batch in stride(from: 0, to: records.count, by: 300).map({ offset in
            Array(records[offset..<min(offset + 300, records.count)])
        }) {
            let ids = batch.map { CKRecord.ID(recordName: $0.name, zoneID: zoneID) }
            let existing = try await database.records(for: ids)
            var saving: [CKRecord] = []
            for record in batch {
                let recordID = CKRecord.ID(recordName: record.name, zoneID: zoneID)
                guard let fetched = existing[recordID] else { throw MirrorSyncError.invalidResponse }
                let destination: CKRecord
                switch fetched {
                case let .success(remote):
                    guard remote.recordType == recordType,
                          let current = mirrorRecord(from: remote) else {
                        throw MirrorSyncError.invalidResponse
                    }
                    guard MirrorMerge.winner(record, current) == record else {
                        throw MirrorSyncError.conflict(recordName: record.name)
                    }
                    destination = remote
                case let .failure(error):
                    guard let cloudError = error as? CKError, cloudError.code == .unknownItem else { throw error }
                    destination = CKRecord(recordType: recordType, recordID: recordID)
                }
                try Self.populate(destination, from: record)
                saving.append(destination)
            }
            let result = try await database.modifyRecords(
                saving: saving,
                deleting: [],
                savePolicy: .ifServerRecordUnchanged,
                atomically: false
            )
            for record in batch {
                let recordID = CKRecord.ID(recordName: record.name, zoneID: zoneID)
                guard let saved = result.saveResults[recordID] else {
                    throw MirrorSyncError.invalidResponse
                }
                _ = try saved.get()
            }
        }
    }

    public func pull(since token: Data?) async throws -> MirrorPullPage {
        try await ensureZoneExists()

        var serverToken: CKServerChangeToken?
        if let token {
            serverToken = try? NSKeyedUnarchiver.unarchivedObject(
                ofClass: CKServerChangeToken.self,
                from: token
            )
        }

        do {
            return try await fetchChanges(since: serverToken)
        } catch let error as CKError where error.code == .changeTokenExpired {
            // The server no longer recognises the token, so everything is
            // refetched. Safe precisely because absence never means deletion
            // here: only an explicit tombstone removes anything.
            return try await fetchChanges(since: nil)
        }
    }

    private func fetchChanges(since token: CKServerChangeToken?) async throws -> MirrorPullPage {
        var records: [MirrorRecord] = []
        var deletedNames: [String] = []
        var nextToken: CKServerChangeToken?
        var cursor = token
        var hasMore = true

        while hasMore {
            try Task.checkCancellation()
            let result = try await database.recordZoneChanges(inZoneWith: zoneID, since: cursor)
            for modification in result.modificationResultsByID.values {
                let record = try modification.get().record
                guard record.recordType == recordType else { continue }
                guard let mapped = mirrorRecord(from: record) else {
                    throw MirrorSyncError.invalidResponse
                }
                records.append(mapped)
            }
            // CloudKit hard deletions carry no timestamp to merge on, so they
            // become tombstones dated at the fetch time they were observed. The
            // append-only flag is resolved per name so a stale deletion still
            // loses to a live copy elsewhere.
            deletedNames.append(contentsOf: result.deletions.map(\.recordID.recordName))
            nextToken = result.changeToken
            cursor = result.changeToken
            hasMore = result.moreComing
        }

        for name in deletedNames where !appendOnly(name) {
            records.append(MirrorRecord(name: name, modifiedAt: .now, payload: nil))
        }

        return MirrorPullPage(
            records: records,
            nextToken: nextToken.flatMap {
                try? NSKeyedArchiver.archivedData(withRootObject: $0, requiringSecureCoding: true)
            }
        )
    }

    private func ensureZoneExists() async throws {
        let zone = CKRecordZone(zoneID: zoneID)
        do {
            _ = try await database.modifyRecordZones(saving: [zone], deleting: [])
        } catch let error as CKError where error.code == .serverRecordChanged {
            // Already there, which is the normal case after the first run.
            return
        }
    }

    // MARK: - Mapping

    static func populate(_ destination: CKRecord, from record: MirrorRecord) throws {
        if let owner = record.hubOwnerID,
           let existingOwner = destination["hubOwnerID"] as? String, existingOwner != owner {
            throw MirrorSyncError.conflict(recordName: record.name)
        }
        destination["modifiedAt"] = record.modifiedAt as CKRecordValue
        destination["payload"] = record.payload as CKRecordValue?
        destination["appendOnly"] = (record.appendOnly ? 1 : 0) as CKRecordValue
        // Old callers cannot erase a retained affiliation. A different known
        // owner requires explicit recovery, never a last-writer-wins rewrite.
        if let owner = record.hubOwnerID { destination["hubOwnerID"] = owner as CKRecordValue }
    }

    private func mirrorRecord(from ckRecord: CKRecord) -> MirrorRecord? {
        Self.decodeRecord(ckRecord, appendOnly: appendOnly(ckRecord.recordID.recordName))
    }

    static func decodeRecord(_ ckRecord: CKRecord, appendOnly: Bool = false) -> MirrorRecord? {
        guard let modifiedAt = ckRecord["modifiedAt"] as? Date else { return nil }
        let appendOnlyFlag = (ckRecord["appendOnly"] as? Int ?? 0) != 0
        return MirrorRecord(
            name: ckRecord.recordID.recordName,
            modifiedAt: modifiedAt,
            payload: ckRecord["payload"] as? Data,
            appendOnly: appendOnlyFlag || appendOnly,
            hubOwnerID: ckRecord["hubOwnerID"] as? String
        )
    }
}
#endif
