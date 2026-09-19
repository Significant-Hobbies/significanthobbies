import Foundation
import Testing
@testable import PersonalSyncKit

private actor MirrorHubFixture: PersonalSyncTransport {
    enum Reply: Sendable { case accepted, missing, rejected }
    let reply: Reply
    var batches: [Int] = []
    init(reply: Reply = .accepted) { self.reply = reply }

    func push(domain: PersonalDomain, deviceId: String, mutations: [SyncMutation], bearerToken: String) throws -> PushResponse {
        batches.append(mutations.count)
        guard mutations.count <= 100 else { throw PersonalSyncError.invalidResponse }
        let results = mutations.map {
            PushResult(id: $0.id, idempotencyKey: $0.idempotencyKey,
                       status: reply == .rejected ? "rejected" : "accepted",
                       version: 1, cursor: 1, expectedVersion: nil, actualVersion: nil)
        }
        return PushResponse(results: reply == .missing ? Array(results.dropLast()) : results)
    }

    func pull(domain: PersonalDomain, cursor: Int, bearerToken: String) -> PullResponse {
        PullResponse(changes: [], cursor: cursor, hasMore: false)
    }
}

private func makeHubMirror(_ client: MirrorHubFixture) throws -> HubMirrorTransport {
    let file = FileManager.default.temporaryDirectory.appending(path: UUID().uuidString)
        .appending(path: "versions.json")
    return HubMirrorTransport(domain: .kith, deviceId: "fixture", client: client,
                              versions: try SyncVersionStore(fileURL: file), account: {
        PersonalSyncAccount(userID: "fixture", bearerToken: "test-only", revision: UUID())
    })
}

@Test func hubMirrorBatchesFirstSyncWithinServerLimit() async throws {
    let client = MirrorHubFixture()
    let transport = try makeHubMirror(client)
    let records = (0..<205).map {
        MirrorRecord(name: "person-\($0)", modifiedAt: Date(timeIntervalSince1970: 100),
                     payload: Data("{}".utf8))
    }
    try await transport.push(records)
    #expect(await client.batches == [100, 100, 5])
}

@Test(arguments: [MirrorHubFixture.Reply.missing, .rejected])
private func hubMirrorRefusesIncompleteOrRejectedAcknowledgement(reply: MirrorHubFixture.Reply) async throws {
    let transport = try makeHubMirror(MirrorHubFixture(reply: reply))
    await #expect(throws: MirrorSyncError.invalidResponse) {
        try await transport.push([MirrorRecord(name: "person-1", modifiedAt: .now, payload: Data("{}".utf8))])
    }
}
