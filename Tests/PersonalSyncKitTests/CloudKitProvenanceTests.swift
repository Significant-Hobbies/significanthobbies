#if canImport(CloudKit)
import CloudKit
import Foundation
import Testing
@testable import PersonalSyncKit

@Suite struct CloudKitProvenanceTests {
    @Test(arguments: [false, true])
    func ownerSurvivesRecordMapping(deleted: Bool) throws {
        let cloud = CKRecord(recordType: "MirrorRecord", recordID: CKRecord.ID(recordName: "synthetic"))
        let value = MirrorRecord(name: "synthetic", modifiedAt: .now,
                                 payload: deleted ? nil : Data("{}".utf8), hubOwnerID: "a")
        try CloudKitMirrorTransport.populate(cloud, from: value)
        #expect(CloudKitMirrorTransport.decodeRecord(cloud) == value)
        var oldCaller = value
        oldCaller.hubOwnerID = nil
        try CloudKitMirrorTransport.populate(cloud, from: oldCaller)
        #expect(CloudKitMirrorTransport.decodeRecord(cloud)?.hubOwnerID == "a")
        var foreign = value
        foreign.hubOwnerID = "b"
        #expect(throws: MirrorSyncError.self) { try CloudKitMirrorTransport.populate(cloud, from: foreign) }
        #expect(CloudKitMirrorTransport.decodeRecord(cloud) == value)
    }

    @Test func ownerChangesAreSyncableWithoutChangingPayload() {
        let unowned = MirrorRecord(name: "synthetic", modifiedAt: .now, payload: nil)
        var owned = unowned
        owned.hubOwnerID = "a"
        #expect(MirrorLedger.fingerprint(of: unowned) == MirrorLedger.fingerprint(of: unowned.payload))
        #expect(MirrorLedger.fingerprint(of: owned) != MirrorLedger.fingerprint(of: unowned))
        #expect(MirrorMerge.winner(owned, unowned) == owned)
        #expect(MirrorMerge.winner(unowned, owned) == owned)
        let merge = MirrorMerge.merge(local: [owned], remote: [unowned])
        #expect(merge.toPush == [owned])
    }
}
#endif
