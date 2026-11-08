import Foundation
import Testing
@testable import PersonalSyncKit

private let affiliationOwner = "verified-owner"
private let affiliationTime = Date(timeIntervalSince1970: 1_790_000_000)

private func affiliatedName(_ name: String) -> Bool { name.hasPrefix("savedTag-") }

private func affiliatedRecord(_ value: String, at time: Date = affiliationTime) -> MirrorRecord {
    MirrorRecord(name: "savedTag-fixture", modifiedAt: time,
                 payload: HubMirrorTransport.payloadData(.object(["name": .string(value)])),
                 hubOwnerID: affiliationOwner)
}

private actor AffiliationHub: PersonalSyncTransport {
    private var changes: [SyncChange] = []
    private var versions: [String: Int] = [:]
    private(set) var acceptedMutations = 0
    private(set) var pullCalls = 0
    var onPull: (@Sendable (Int) async -> Void)?
    let pageSize: Int

    init(pageSize: Int = 500) { self.pageSize = pageSize }

    func setOnPull(_ action: @escaping @Sendable (Int) async -> Void) { onPull = action }

    func seed(_ records: [MirrorRecord]) throws {
        for record in records {
            let payload = try record.payload.map { try JSONDecoder().decode(JSONValue.self, from: $0) }
            append(id: record.name, domain: .anchor, operation: record.isDeleted ? .delete : .upsert,
                   occurredAt: HubMirrorTransport.iso(record.modifiedAt), record: payload)
        }
    }

    private func append(id: String, domain: PersonalDomain, operation: MutationOperation,
                        occurredAt: String, record: JSONValue?) {
        let version = (versions[id] ?? 0) + 1
        versions[id] = version
        let cursor = changes.count + 1
        changes.append(SyncChange(cursor: cursor, changeId: "change-\(cursor)", domain: domain,
                                  id: id, operation: operation, version: version,
                                  occurredAt: occurredAt, recordedAt: occurredAt,
                                  originDeviceId: "synthetic-device", record: record ?? .null))
    }

    func push(domain: PersonalDomain, deviceId: String, mutations: [SyncMutation],
              bearerToken: String) -> PushResponse {
        PushResponse(results: mutations.map { mutation in
            let actual = versions[mutation.id] ?? 0
            guard actual == mutation.baseVersion else {
                return PushResult(id: mutation.id, idempotencyKey: mutation.idempotencyKey,
                                  status: "conflict", version: nil, cursor: nil,
                                  expectedVersion: mutation.baseVersion, actualVersion: actual)
            }
            append(id: mutation.id, domain: domain, operation: mutation.operation,
                   occurredAt: mutation.occurredAt, record: mutation.record)
            acceptedMutations += 1
            return PushResult(id: mutation.id, idempotencyKey: mutation.idempotencyKey,
                              status: "accepted", version: versions[mutation.id], cursor: changes.count,
                              expectedVersion: nil, actualVersion: nil)
        })
    }

    func pull(domain: PersonalDomain, cursor: Int, bearerToken: String) async -> PullResponse {
        pullCalls += 1
        await onPull?(pullCalls)
        let pending = changes.filter { $0.cursor > cursor && $0.domain == domain }
        let page = Array(pending.prefix(pageSize))
        return PullResponse(changes: page, cursor: page.last?.cursor ?? cursor,
                            hasMore: pending.count > page.count)
    }

    func version(_ name: String) -> Int { versions[name] ?? 0 }
}

private actor AffiliationProjection {
    private var records: [MirrorRecord]
    private(set) var applied: [MirrorRecord] = []

    init(_ records: [MirrorRecord]) { self.records = records }
    func snapshot() -> [MirrorRecord] { records }
    func replace(_ record: MirrorRecord) { records = [record] }
    func apply(_ incoming: [MirrorRecord]) {
        applied.append(contentsOf: incoming)
        for var record in incoming {
            // Model a native reread that derives affiliation from its approved account.
            record.hubOwnerID = affiliatedName(record.name) ? affiliationOwner : nil
            records.removeAll { $0.name == record.name }
            records.append(record)
        }
    }
}

private struct AffiliationRuntime {
    let runtime: MirrorRuntime
    let bookkeeping: MirrorBookkeepingStore
    let projection: AffiliationProjection

    init(client: AffiliationHub, local: [MirrorRecord]) throws {
        let directory = FileManager.default.temporaryDirectory.appending(path: UUID().uuidString)
        let account = PersonalSyncAccount(userID: affiliationOwner, bearerToken: "synthetic",
                                          revision: UUID())
        let transport = HubMirrorTransport(
            domain: .anchor, deviceId: "synthetic", client: client,
            versions: try SyncVersionStore(fileURL: directory.appending(path: "versions.json")),
            account: { account }, recordAffiliation: .matching(affiliatedName)
        )
        bookkeeping = MirrorBookkeepingStore(fileURL: directory.appending(path: "mirror.json"))
        runtime = MirrorRuntime(transports: [transport], store: bookkeeping)
        projection = AffiliationProjection(local)
    }

    func synchronize() async throws -> MirrorRuntime.TransportOutcome {
        let result = try await runtime.synchronize(records: { await projection.snapshot() },
                                                   apply: { await projection.apply($0) })
        let outcome = try #require(result.transports.first)
        #expect(outcome.failure == nil)
        return outcome
    }
}

@Test func hubAffiliationLocalWriteConvergesThroughEchoNoDeltaAndRepull() async throws {
    let client = AffiliationHub()
    let fixture = try AffiliationRuntime(client: client, local: [affiliatedRecord("first")])
    #expect(try await fixture.synchronize().pushed == 1)
    #expect(try await fixture.synchronize().pushed == 0)
    #expect(try await fixture.synchronize().pushed == 0)
    try await fixture.runtime.repullAll()
    #expect(try await fixture.synchronize().pushed == 0)
    #expect(await client.acceptedMutations == 1)
    #expect(await client.version("savedTag-fixture") == 1)
    #expect(await fixture.projection.applied.isEmpty)
    let state = try await fixture.bookkeeping.load()
    #expect(state.pushedFingerprints["hub"]?["savedTag-fixture"] ==
            MirrorLedger.fingerprint(of: affiliatedRecord("first")))
}

@Test func hubAffiliationRemoteImportAndNativeRereadConverge() async throws {
    let client = AffiliationHub()
    try await client.seed([affiliatedRecord("remote")])
    let fixture = try AffiliationRuntime(client: client, local: [])
    let first = try await fixture.synchronize()
    #expect(first.pulled == 1)
    #expect(first.pushed == 0)
    #expect(await fixture.projection.applied.first?.hubOwnerID == affiliationOwner)
    #expect(await fixture.projection.snapshot() == [affiliatedRecord("remote")])
    #expect(try await fixture.synchronize().pushed == 0)
    #expect(try await fixture.synchronize().pushed == 0)
    try await fixture.runtime.repullAll()
    #expect(try await fixture.synchronize().pushed == 0)
    #expect(await client.acceptedMutations == 0)
    #expect(await client.version("savedTag-fixture") == 1)
}

@Test func hubAffiliationRealEditAndTombstoneEachPropagateOnce() async throws {
    let client = AffiliationHub()
    let fixture = try AffiliationRuntime(client: client, local: [affiliatedRecord("first")])
    _ = try await fixture.synchronize()
    _ = try await fixture.synchronize()
    await fixture.projection.replace(affiliatedRecord("changed", at: affiliationTime.addingTimeInterval(1)))
    #expect(try await fixture.synchronize().pushed == 1)
    #expect(try await fixture.synchronize().pushed == 0)
    #expect(try await fixture.synchronize().pushed == 0)
    var deleted = affiliatedRecord("changed", at: affiliationTime.addingTimeInterval(2))
    deleted.payload = nil
    await fixture.projection.replace(deleted)
    #expect(try await fixture.synchronize().pushed == 1)
    #expect(try await fixture.synchronize().pushed == 0)
    #expect(try await fixture.synchronize().pushed == 0)
    try await fixture.runtime.repullAll()
    #expect(try await fixture.synchronize().pushed == 0)
    #expect(await client.acceptedMutations == 3)
    #expect(await client.version("savedTag-fixture") == 3)
    #expect(await fixture.projection.snapshot() == [deleted])
}

@Test func hubAffiliationIsSelectiveAndNeverComesFromPayload() async throws {
    let client = AffiliationHub()
    let foreignPayload = HubMirrorTransport.payloadData(.object(["hubOwnerID": .string("foreign-owner")]))
    let names = ["savedTag-live", "savedTag-deleted", "session-history", "unknown-record"]
    try await client.seed(names.map {
        MirrorRecord(name: $0, modifiedAt: affiliationTime,
                     payload: $0 == "savedTag-deleted" ? nil : foreignPayload)
    })
    let directory = FileManager.default.temporaryDirectory.appending(path: UUID().uuidString)
    let account = PersonalSyncAccount(userID: affiliationOwner, bearerToken: "synthetic", revision: UUID())
    let transport = HubMirrorTransport(
        domain: .anchor, deviceId: "synthetic", client: client,
        versions: try SyncVersionStore(fileURL: directory.appending(path: "versions.json")),
        account: { account }, recordAffiliation: .matching(affiliatedName)
    )
    let records = try await transport.beginSynchronization().pull(since: nil).records
    #expect(records.map(\.hubOwnerID) == [affiliationOwner, affiliationOwner, nil, nil])
    #expect(records[1].isDeleted)
    #expect(records[0].payload == foreignPayload)
    #expect(MirrorLedger.fingerprint(of: records[0]) != MirrorLedger.fingerprint(of: foreignPayload))

    let legacy = HubMirrorTransport(
        domain: .anchor, deviceId: "synthetic", client: client,
        versions: try SyncVersionStore(fileURL: directory.appending(path: "legacy-versions.json")),
        account: { account }, accountGate: nil
    ) { (name: String) in name.hasPrefix("session-") }
    let legacyRecords = try await legacy.pull(since: nil).records
    #expect(legacyRecords.allSatisfy { $0.hubOwnerID == nil })
    #expect(legacyRecords.first(where: { $0.name == "session-history" })?.appendOnly == true)
    #expect(legacyRecords.first(where: { $0.name == "savedTag-live" })?.appendOnly == false)
}

private actor AffiliationAccount {
    var current = PersonalSyncAccount(userID: affiliationOwner, bearerToken: "synthetic", revision: UUID())
    var permitted = true
    func resolve() -> PersonalSyncAccount { current }
    func allows() -> Bool { permitted }
    func change(_ field: String) {
        switch field {
        case "user": current = PersonalSyncAccount(userID: "replacement", bearerToken: current.bearerToken, revision: current.revision)
        case "revision": current = PersonalSyncAccount(userID: current.userID, bearerToken: current.bearerToken, revision: UUID())
        case "bearer": current = PersonalSyncAccount(userID: current.userID, bearerToken: "replacement", revision: current.revision)
        default: permitted = false
        }
    }
}

@Test(arguments: ["user", "revision", "bearer", "gate"])
func hubAffiliationRejectsChangedSessionDuringPagedPull(field: String) async throws {
    let client = AffiliationHub(pageSize: 1)
    try await client.seed([affiliatedRecord("first"),
                           MirrorRecord(name: "savedTag-second", modifiedAt: affiliationTime, payload: Data("{}".utf8)),
                           MirrorRecord(name: "savedTag-third", modifiedAt: affiliationTime, payload: Data("{}".utf8))])
    let account = AffiliationAccount()
    await client.setOnPull { if $0 == 2 { await account.change(field) } }
    let directory = FileManager.default.temporaryDirectory.appending(path: UUID().uuidString)
    let versions = try SyncVersionStore(fileURL: directory.appending(path: "versions.json"))
    let transport = HubMirrorTransport(
        domain: .anchor, deviceId: "synthetic", client: client, versions: versions,
        account: { await account.resolve() }, accountGate: { _ in await account.allows() },
        recordAffiliation: .matching(affiliatedName)
    )
    let store = MirrorBookkeepingStore(fileURL: directory.appending(path: "mirror.json"))
    let runtime = MirrorRuntime(transports: [transport], store: store)
    let projection = AffiliationProjection([])
    let outcome = try await runtime.synchronize(records: { await projection.snapshot() },
                                                apply: { await projection.apply($0) })
    #expect(outcome.transports.first?.failure?.contains("sessionChanged") == true)
    #expect(await client.pullCalls == 2)
    #expect(await client.acceptedMutations == 0)
    #expect(await projection.applied.isEmpty)
    #expect(try await store.load() == MirrorBookkeepingStore.State())
    // Page one was already durable when the change was detected on page two.
    #expect(await versions.version(for: "savedTag-fixture", in: .anchor) == 1)
    #expect(await versions.version(for: "savedTag-second", in: .anchor) == 0)
    #expect(await versions.version(for: "savedTag-third", in: .anchor) == 0)
}
