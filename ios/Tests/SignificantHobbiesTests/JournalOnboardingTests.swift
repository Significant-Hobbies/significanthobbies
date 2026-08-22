import SignificantHobbiesCore
import XCTest

@testable import Journal_by_Significant_Hobbies

final class JournalOnboardingTests: XCTestCase {
    func testNewEmptyJournalPresentsOnboarding() {
        XCTAssertTrue(JournalOnboardingPolicy.shouldPresent(completed: false, entries: []))
    }

    func testExistingWritingBypassesOnboarding() {
        let entry = DailyEntry(date: .now, journal: "Already here")
        XCTAssertFalse(JournalOnboardingPolicy.shouldPresent(completed: false, entries: [entry]))
    }

    func testCompletionAndForcedEvidenceAreExplicit() {
        XCTAssertFalse(JournalOnboardingPolicy.shouldPresent(completed: true, entries: []))
        XCTAssertTrue(JournalOnboardingPolicy.shouldPresent(completed: false, entries: [], forced: true))
        XCTAssertFalse(JournalOnboardingPolicy.shouldPresent(completed: true, entries: [], forced: true))
    }
}
