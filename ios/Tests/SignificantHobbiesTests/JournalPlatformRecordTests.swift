import Foundation
import PersonalSyncKit
import SignificantHobbiesCore
import XCTest

@testable import Journal_by_Significant_Hobbies

final class JournalPlatformRecordTests: XCTestCase {
    func testEntryPreservesTheJournalSections() throws {
        let date = try XCTUnwrap(ISO8601DateFormatter().date(from: "2026-08-21T05:30:00Z"))
        let id = UUID(uuidString: "AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE")!
        let entry = DailyEntry(
            id: id,
            date: date,
            morningReflection: "Begin quietly.",
            eveningReflection: "The walk helped.",
            journal: "A clear day.",
            newThing: "Tried a new route."
        )

        guard case .object(let payload) = JournalPlatformRecord.encode(entry) else {
            return XCTFail("Expected an object record")
        }
        XCTAssertEqual(payload["sourceId"], .string(id.uuidString.lowercased()))
        XCTAssertEqual(payload["body"], .string("A clear day."))
        XCTAssertEqual(payload["occurredOn"], .string("2026-08-21T05:30:00Z"))
        XCTAssertEqual(JournalPlatformRecord.recordId(entry), id.uuidString.lowercased())
    }

    func testRemoteEntryUsesSourceIdentityAndSections() throws {
        let change = try decodeChange(
            id: "server-version",
            record: """
                {"sourceId":"aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee","body":"A clear day.","occurredOn":"2026-08-21T05:30:00Z","morningReflection":"Begin quietly.","eveningReflection":"The walk helped.","newThing":"Tried a new route."}
                """
        )
        let entry = try XCTUnwrap(JournalPlatformRecord.decode(change))
        XCTAssertEqual(entry.id, UUID(uuidString: "AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE"))
        XCTAssertEqual(entry.journal, "A clear day.")
        XCTAssertEqual(entry.morningReflection, "Begin quietly.")
        XCTAssertEqual(entry.eveningReflection, "The walk helped.")
        XCTAssertEqual(entry.newThing, "Tried a new route.")
    }

    func testPaceEntryWithoutSourceIdentityStillImports() throws {
        let change = try decodeChange(
            id: "pace-entry",
            record: "{\"body\":\"A note from Pace.\",\"occurredOn\":\"2026-08-21T06:00:00Z\"}"
        )
        let first = try XCTUnwrap(JournalPlatformRecord.decode(change))
        let second = try XCTUnwrap(JournalPlatformRecord.decode(change))
        XCTAssertEqual(first.id, second.id)
        XCTAssertEqual(first.journal, "A note from Pace.")
    }

    private func decodeChange(id: String, record: String) throws -> SyncChange {
        let payload = """
            {"cursor":1,"changeId":"change-1","domain":"journal","id":"\(id)","operation":"upsert","version":1,"occurredAt":"2026-08-21T06:00:00Z","recordedAt":"2026-08-21T06:00:01Z","originDeviceId":"pace","record":\(record)}
            """
        return try JSONDecoder().decode(SyncChange.self, from: Data(payload.utf8))
    }
}
