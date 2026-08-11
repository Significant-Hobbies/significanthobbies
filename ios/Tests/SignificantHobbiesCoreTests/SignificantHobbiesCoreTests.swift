import XCTest
@testable import SignificantHobbiesCore

final class SignificantHobbiesCoreTests: XCTestCase {
    func testDailyEntryHasNoPublicationField() throws {
        let entry = DailyEntry(date: Date(timeIntervalSince1970: 10_000), journal: "Private words")
        let data = try JSONEncoder().encode(entry)
        let json = try XCTUnwrap(String(data: data, encoding: .utf8))

        XCTAssertFalse(json.localizedCaseInsensitiveContains("visibility"))
        XCTAssertFalse(json.localizedCaseInsensitiveContains("public"))
        XCTAssertTrue(json.contains("Private words"))
    }

    func testHabitCheckInHasNoScoreOrStreak() throws {
        var document = AtlasDocument.sample
        let habit = try XCTUnwrap(document.habits.first)
        let date = Date(timeIntervalSince1970: 100_000)

        document.toggleHabit(habit.id, on: date)
        let data = try JSONEncoder().encode(document.dailyEntry(on: date))
        let json = try XCTUnwrap(String(data: data, encoding: .utf8))

        XCTAssertFalse(json.localizedCaseInsensitiveContains("score"))
        XCTAssertFalse(json.localizedCaseInsensitiveContains("streak"))
        XCTAssertTrue(document.dailyEntry(on: date)?.completedHabitIDs.contains(habit.id) == true)
    }

    func testOnlySelectedCommitmentChangesVisibility() throws {
        var document = AtlasDocument.sample
        let first = try XCTUnwrap(document.commitments.first)
        let second = try XCTUnwrap(document.commitments.dropFirst().first)

        try document.setCommitmentVisibility(first.id, visibility: .publicProfile)

        XCTAssertEqual(document.commitments.first(where: { $0.id == first.id })?.visibility, .publicProfile)
        XCTAssertEqual(document.commitments.first(where: { $0.id == second.id })?.visibility, .privateOnly)
        XCTAssertTrue(document.dailyEntries.allSatisfy { _ in true })
    }

    func testLivingItemsStartPrivate() {
        XCTAssertEqual(Hobby(name: "Pottery", category: "Make").visibility, .privateOnly)
        XCTAssertEqual(Commitment(hobbyID: nil, title: "Throw a bowl").visibility, .privateOnly)
        XCTAssertEqual(BucketItem(title: "Visit the observatory", category: "Explore").visibility, .privateOnly)
        XCTAssertEqual(SideQuest(title: "Find a kiln", nextStep: "Ask nearby studios").visibility, .privateOnly)
    }

    func testDailySaveReplacesSameDayWithoutLosingHistory() {
        var document = AtlasDocument.sample
        let date = Calendar.current.startOfDay(for: .now)
        let originalCount = document.dailyEntries.count
        var entry = document.dailyEntry(on: date) ?? DailyEntry(date: date)
        entry.eveningReflection = "A good conversation."

        document.saveDaily(entry)

        XCTAssertEqual(document.dailyEntries.count, originalCount)
        XCTAssertEqual(document.dailyEntry(on: date)?.eveningReflection, "A good conversation.")
    }

    func testPersistenceRestoresPrivateAtlas() async throws {
        let url = FileManager.default.temporaryDirectory.appending(path: UUID().uuidString).appending(path: "atlas.json")
        let store = AtlasStore(fileURL: url)
        var document = AtlasDocument.sample
        let fixedDate = Date(timeIntervalSince1970: 100_000)
        document.dailyEntries = document.dailyEntries.map { entry in
            var copy = entry
            copy.date = fixedDate
            return copy
        }
        document.hobbies = document.hobbies.map { hobby in
            var copy = hobby
            copy.startedAt = fixedDate
            return copy
        }

        try await store.save(document)
        let restored = try await store.load()

        XCTAssertEqual(restored, document)
    }

    func testCompletingCommitmentCreatesDatedEvidenceState() throws {
        var document = AtlasDocument.sample
        let commitment = try XCTUnwrap(document.commitments.first)
        let date = Date(timeIntervalSince1970: 100_000)

        try document.completeCommitment(commitment.id, at: date)

        XCTAssertEqual(document.commitments.first(where: { $0.id == commitment.id })?.completedAt, date)
        XCTAssertTrue(document.commitments.first(where: { $0.id == commitment.id })?.isComplete == true)
    }

    func testPrivateCloudDocumentIncludesJournalButExcludesDeviceSyncMetadata() throws {
        var document = AtlasDocument.sample
        document.syncState = .failed
        document.lastSyncedAt = Date(timeIntervalSince1970: 42)

        let cloud = AtlasCloudDocument(document: document)
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        let data = try encoder.encode(cloud)
        let json = try XCTUnwrap(String(data: data, encoding: .utf8))

        XCTAssertTrue(json.contains("The blue hour made the familiar street look new."))
        XCTAssertFalse(json.contains("syncState"))
        XCTAssertFalse(json.contains("lastSyncedAt"))
    }

    func testPrivateCloudRoundTripPreservesAtlasAndResetsSyncMetadata() {
        var document = AtlasDocument.sample
        document.syncState = .failed
        document.lastSyncedAt = Date(timeIntervalSince1970: 42)

        let restored = AtlasCloudDocument(document: document).localDocument(
            syncState: .synced,
            lastSyncedAt: Date(timeIntervalSince1970: 84)
        )

        XCTAssertEqual(AtlasCloudDocument(document: restored), AtlasCloudDocument(document: document))
        XCTAssertEqual(restored.syncState, .synced)
        XCTAssertEqual(restored.lastSyncedAt, Date(timeIntervalSince1970: 84))
    }
}
