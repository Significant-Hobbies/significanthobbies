import XCTest

@MainActor
final class SignificantHobbiesUITests: XCTestCase {
    override func setUpWithError() throws { continueAfterFailure = false }

    func testThreePartNavigationIsReachable() {
        let app = XCUIApplication()
        app.launchArguments = ["--fresh-demo"]
        app.launch()

        XCTAssertTrue(app.staticTexts["Go inhabit your life."].waitForExistence(timeout: 3))
        app.tabBars.buttons["Daily"].tap()
        XCTAssertTrue(app.staticTexts["A private ritual. Nothing written here can be published."].waitForExistence(timeout: 3))
        app.tabBars.buttons["See History"].tap()
        XCTAssertTrue(app.staticTexts["See what became real."].waitForExistence(timeout: 3))
    }

    func testDailyJournalSavesPrivately() {
        let app = XCUIApplication()
        app.launchArguments = ["--fresh-demo"]
        app.launch()
        app.tabBars.buttons["Daily"].tap()

        let journal = app.textViews["Private journal"]
        XCTAssertTrue(journal.waitForExistence(timeout: 3))
        journal.tap()
        journal.typeText("A quiet walk after rain.")
        app.buttons["Save private Daily entry"].tap()

        XCTAssertTrue(app.alerts["Significant Hobbies"].waitForExistence(timeout: 3))
        XCTAssertTrue(app.alerts["Significant Hobbies"].staticTexts["Private Daily entry saved on this iPhone."].exists)
    }
}
