import Foundation
import Testing
@testable import PersonalSyncKit

@Test(arguments: ["2026-09-09", "2026-09-09T00:00:00Z", "2026-09-09T00:00:00.000Z",
                  "2026-09-09T05:30:00.000+05:30"])
func hubMirrorPreservesAcceptedTimestampFormats(value: String) throws {
    let canonical = try #require(HubMirrorTransport.date("2026-09-09T00:00:00Z"))
    #expect(HubMirrorTransport.date(value) == canonical)
    #expect(HubMirrorTransport.date("invalid-date") == nil)
}

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
    let account = PersonalSyncAccount(userID: "fixture", bearerToken: "test-only", revision: UUID())
    return HubMirrorTransport(domain: .kith, deviceId: "fixture", client: client,
                              versions: try SyncVersionStore(fileURL: file), account: {
        account
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

private actor SwitchingMirrorAccount {
    private var calls = 0
    private let revision = UUID()

    func resolve() -> PersonalSyncAccount {
        calls += 1
        return PersonalSyncAccount(userID: calls == 1 ? "original" : "replacement",
                                   bearerToken: "test-only", revision: revision)
    }
}

@Test private func hubMirrorRejectsPushAfterAccountSwitch() async throws {
    let account = SwitchingMirrorAccount()
    let file = FileManager.default.temporaryDirectory.appending(path: UUID().uuidString)
        .appending(path: "versions.json")
    let versions = try SyncVersionStore(fileURL: file)
    let transport = HubMirrorTransport(domain: .kith, deviceId: "fixture", client: MirrorHubFixture(),
                                       versions: versions, account: { await account.resolve() })
    await #expect(throws: PersonalIdentityError.sessionChanged) {
        try await transport.push([MirrorRecord(name: "person-1", modifiedAt: .now, payload: Data("{}".utf8))])
    }
    #expect(await versions.version(for: "person-1", in: .kith) == 0)
}

/// A pull that was authorized under one account still succeeds when the
/// signed-in account changes mid-flight: the bearer token captured at
/// authorization determines whose data arrives, and the app's account gate
/// already pinned the destination store to that owner before the pull began.
/// Discarding a legitimately fetched page would only force a refetch.
@Test private func hubMirrorPullToleratesAccountSwitch() async throws {
    let account = SwitchingMirrorAccount()
    let file = FileManager.default.temporaryDirectory.appending(path: UUID().uuidString)
        .appending(path: "versions.json")
    let versions = try SyncVersionStore(fileURL: file)
    let transport = HubMirrorTransport(domain: .kith, deviceId: "fixture", client: MirrorHubFixture(),
                                       versions: versions, account: { await account.resolve() })
    let page = try await transport.pull(since: nil)
    #expect(page.records.isEmpty)
    #expect(page.nextToken == Data("0".utf8))
}
