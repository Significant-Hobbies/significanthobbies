import XCTest

@MainActor
final class SignificantHobbiesUITests: XCTestCase {
    override func setUpWithError() throws { continueAfterFailure = false }

    func testJournalIsTheOnlyPrimarySurface() {
        let app = XCUIApplication()
        app.launchArguments = ["--fresh-demo"]
        app.launch()

        XCTAssertTrue(app.staticTexts["A private ritual. Nothing written here can be published."].waitForExistence(timeout: 3))
        XCTAssertEqual(app.tabBars.count, 0)
        XCTAssertFalse(app.staticTexts["Go inhabit your life."].exists)
        XCTAssertFalse(app.staticTexts["See what became real."].exists)
        XCTAssertFalse(app.staticTexts["Small ways to be here"].exists)
        XCTAssertFalse(app.staticTexts["One new thing"].exists)
        XCTAssertTrue(app.buttons["Browse Journal archive"].exists)
    }

    func testFirstEntryOnboardingSavesIntoTheRealJournal() {
        let app = XCUIApplication()
        app.launchArguments = ["--onboarding-demo", "--onboarding-production-policy", "--reset-onboarding"]
        app.launch()

        XCTAssertTrue(app.staticTexts["A private room for what matters."].waitForExistence(timeout: 3))
        app.buttons["Begin privately"].tap()
        app.buttons["What do you want to remember?"].tap()

        let editor = app.textViews["First private Journal entry"]
        XCTAssertTrue(editor.waitForExistence(timeout: 3))
        editor.tap()
        editor.typeText("The rain made the street feel new.")
        app.buttons["Save my first private entry"].tap()

        XCTAssertTrue(app.staticTexts["Your first page is here."].waitForExistence(timeout: 3))
        app.buttons["Open Journal"].tap()
        let journal = app.textViews["Private journal"]
        XCTAssertTrue(journal.waitForExistence(timeout: 3))
        XCTAssertTrue((journal.value as? String)?.contains("The rain made the street feel new.") == true)
    }

    func testOnboardingDraftSurvivesRelaunch() {
        let app = XCUIApplication()
        app.launchArguments = ["--onboarding-demo", "--reset-onboarding"]
        app.launch()
        app.buttons["Begin privately"].tap()
        app.buttons["Blank page"].tap()

        let editor = app.textViews["First private Journal entry"]
        XCTAssertTrue(editor.waitForExistence(timeout: 3))
        editor.tap()
        editor.typeText("Keep this unfinished thought.")
        app.terminate()

        app.launchArguments = ["--onboarding-demo"]
        app.launch()
        let restored = app.textViews["First private Journal entry"]
        XCTAssertTrue(restored.waitForExistence(timeout: 3))
        XCTAssertTrue((restored.value as? String)?.contains("Keep this unfinished thought.") == true)
    }

    func testExistingWritingBypassesOnboarding() {
        let app = XCUIApplication()
        app.launchArguments = ["--fresh-demo", "--reset-onboarding"]
        app.launch()

        XCTAssertFalse(app.staticTexts["A private room for what matters."].exists)
        XCTAssertTrue(app.textViews["Private journal"].waitForExistence(timeout: 3))
    }

    func testOnboardingKeepsAccessibleNamesWithLargeTypeAndReducedMotion() {
        let app = XCUIApplication()
        app.launchArguments = [
            "--onboarding-demo",
            "--reset-onboarding",
            "--reduce-motion-demo",
            "-UIPreferredContentSizeCategoryName",
            "UICTContentSizeCategoryAccessibilityExtraExtraExtraLarge",
        ]
        app.launch()

        XCTAssertTrue(app.staticTexts["A private room for what matters."].waitForExistence(timeout: 3))
        let beginButton = app.buttons["Begin privately"]
        XCTAssertTrue(beginButton.exists)
        beginButton.tap()
        XCTAssertTrue(app.buttons["Blank page"].waitForExistence(timeout: 3))
    }

    func testDailyJournalSavesPrivately() {
        let app = XCUIApplication()
        app.launchArguments = ["--fresh-demo"]
        app.launch()
        let journal = app.textViews["Private journal"]
        XCTAssertTrue(journal.waitForExistence(timeout: 3))
        journal.tap()
        journal.typeText("A quiet walk after rain.")
        app.buttons["Save private Journal entry"].tap()

        XCTAssertTrue(app.alerts["Journal"].waitForExistence(timeout: 3))
        XCTAssertTrue(app.alerts["Journal"].staticTexts["Private Journal entry saved on this device."].exists)
    }

    func testDirtyDraftSurvivesDateNavigation() {
        let app = XCUIApplication()
        app.launchArguments = ["--fresh-demo"]
        app.launch()
        let journal = app.textViews["Private journal"]
        XCTAssertTrue(journal.waitForExistence(timeout: 3))
        journal.tap()
        journal.typeText(" Kept while moving between days.")

        app.buttons["Previous day"].tap()
        XCTAssertTrue(app.buttons["Next day"].waitForExistence(timeout: 3))
        app.buttons["Next day"].tap()

        XCTAssertTrue(journal.waitForExistence(timeout: 3))
        XCTAssertTrue((journal.value as? String)?.contains("Kept while moving between days.") == true)
    }

    func testJournalArchiveCanOpenAnEntry() {
        let app = XCUIApplication()
        app.launchArguments = ["--fresh-demo"]
        app.launch()

        app.swipeUp()
        let archiveButton = app.buttons["Browse Journal archive"]
        XCTAssertTrue(archiveButton.waitForExistence(timeout: 3))
        archiveButton.tap()

        XCTAssertTrue(app.navigationBars["Journal archive"].waitForExistence(timeout: 3))
        XCTAssertTrue(app.staticTexts["The blue hour made the familiar street look new."].exists)
        app.buttons["Done"].tap()
        XCTAssertTrue(app.buttons["Save private Journal entry"].waitForExistence(timeout: 3))
    }

    func testAccountScreenExplainsPrivateSyncAndExportRecovery() {
        let app = XCUIApplication()
        app.launchArguments = ["--fresh-demo", "--account-demo"]
        app.launch()

        XCTAssertTrue(app.staticTexts["ACCOUNT & SYNC"].waitForExistence(timeout: 3))
        XCTAssertTrue(app.staticTexts["SYNCED"].exists)
        XCTAssertTrue(app.staticTexts["Journal entries: always private"].exists)
        XCTAssertTrue(app.buttons["Export compatible archive"].exists)
        XCTAssertTrue(app.buttons["Delete Journal cloud data"].exists)
    }

    func testAccountScreenOffersAppleBeforeGoogle() {
        let app = XCUIApplication()
        app.launchArguments = ["--fresh-demo"]
        app.launch()

        app.buttons["Profile and settings"].tap()
        let appleButton = app.buttons["apple-account-button"]
        let googleButton = app.buttons["Continue with Google"]
        XCTAssertTrue(appleButton.waitForExistence(timeout: 3))
        XCTAssertTrue(googleButton.exists)
        XCTAssertLessThan(appleButton.frame.minY, googleButton.frame.minY)
    }
}
