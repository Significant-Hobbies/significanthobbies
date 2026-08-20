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

    func testAccountScreenExplainsPrivateSyncAndExportRecovery() {
        let app = XCUIApplication()
        app.launchArguments = ["--fresh-demo", "--account-demo"]
        app.launch()

        XCTAssertTrue(app.staticTexts["ACCOUNT & SYNC"].waitForExistence(timeout: 3))
        XCTAssertTrue(app.staticTexts["SYNCED"].exists)
        XCTAssertTrue(app.staticTexts["Journal entries: always private"].exists)
        XCTAssertTrue(app.buttons["Export Journal archive"].exists)
        XCTAssertTrue(app.buttons["Delete account and cloud copy"].exists)
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
