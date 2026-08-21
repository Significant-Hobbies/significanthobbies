import CryptoKit
import Foundation
import PersonalSyncKit
import SignificantHobbiesCore

enum JournalPlatformRecord {
    static func encode(_ entry: DailyEntry) -> JSONValue {
        .object([
            "sourceId": .string(entry.id.uuidString.lowercased()),
            "body": .string(entry.journalBody),
            "occurredOn": .string(iso(entry.date)),
            "morningReflection": .string(entry.morningReflection),
            "eveningReflection": .string(entry.eveningReflection),
            "newThing": .string(entry.newThing),
        ])
    }

    static func decode(_ change: SyncChange) -> DailyEntry? {
        guard case .object(let record) = change.record,
            case .string(let body)? = record["body"],
            case .string(let occurredOn)? = record["occurredOn"],
            let date = ISO8601DateFormatter().date(from: occurredOn)
        else { return nil }
        return DailyEntry(
            id: sourceId(change) ?? stableUUID(change.id),
            date: date,
            morningReflection: record.string("morningReflection"),
            eveningReflection: record.string("eveningReflection"),
            journal: body,
            newThing: record.string("newThing")
        )
    }

    static func sourceId(_ change: SyncChange) -> UUID? {
        guard case .object(let record) = change.record,
            case .string(let source)? = record["sourceId"]
        else { return nil }
        return UUID(uuidString: source)
    }

    static func recordId(_ entry: DailyEntry) -> String { recordId(entry.id) }
    static func recordId(_ id: UUID) -> String { id.uuidString.lowercased() }

    static func iso(_ date: Date) -> String { ISO8601DateFormatter().string(from: date) }

    private static func stableUUID(_ value: String) -> UUID {
        if let uuid = UUID(uuidString: value) { return uuid }
        let bytes = Array(SHA256.hash(data: Data(value.utf8)).prefix(16))
        return UUID(
            uuid: (
                bytes[0], bytes[1], bytes[2], bytes[3], bytes[4], bytes[5], bytes[6], bytes[7],
                bytes[8], bytes[9], bytes[10], bytes[11], bytes[12], bytes[13], bytes[14], bytes[15]
            ))
    }
}

extension DailyEntry {
    fileprivate var journalBody: String {
        if !journal.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { return journal }
        return [morningReflection, eveningReflection, newThing]
            .filter { !$0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }
            .joined(separator: "\n\n")
    }
}

extension Dictionary where Key == String, Value == JSONValue {
    fileprivate func string(_ key: String) -> String {
        guard case .string(let value)? = self[key] else { return "" }
        return value
    }
}
