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

    func testAccountScreenOffersAppleAlongsideGoogle() {
        let app = XCUIApplication()
        app.launchArguments = ["--fresh-demo"]
        app.launch()

        app.buttons["Profile and settings"].tap()
        XCTAssertTrue(app.buttons["Connect Google account"].waitForExistence(timeout: 3))
        XCTAssertTrue(app.buttons["apple-account-button"].exists)
    }
}
