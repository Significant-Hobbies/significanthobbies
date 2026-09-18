import SwiftUI
import XCTest

@testable import SignificantDesignKit

final class SDKContractTests: XCTestCase {

    // MARK: Theme resolution

    func testResolvePicksTheSchemePaletteAndRecordsDarkness() {
        let light = SDKTheme.resolve(.light)
        let dark = SDKTheme.resolve(.dark)
        XCTAssertFalse(light.isDark)
        XCTAssertTrue(dark.isDark)
        XCTAssertEqual(light.palette, SDKPalette.neutral(dark: false))
        XCTAssertEqual(dark.palette, SDKPalette.neutral(dark: true))
    }

    func testProductIdentityOverridesOnlySuppliedRoles() {
        let accent = Color(hex: 0x2266CC)
        var dark = SDKPalette.neutral(dark: true)
        dark.accent = accent
        dark.accentSoft = accent.opacity(0.6)
        dark.accentDeep = accent.opacity(0.4)
        dark.onAccent = .white

        let identity = SDKIdentity(dark: dark)
        let resolved = SDKTheme.resolve(.dark, identity: identity)

        XCTAssertEqual(resolved.accent, accent)
        XCTAssertEqual(resolved.onAccent, .white)
        // Untouched roles remain the shared family neutrals.
        XCTAssertEqual(resolved.canvas, SDKPalette.neutral(dark: true).canvas)
        XCTAssertEqual(resolved.textPrimary, SDKPalette.neutral(dark: true).textPrimary)
    }

    func testDefaultIdentityResolvesNeutralPalettes() {
        let identity = SDKIdentity.default
        XCTAssertEqual(identity.light, .neutral(dark: false))
        XCTAssertEqual(identity.dark, .neutral(dark: true))
    }

    // MARK: Scale contract

    func testSpacingStaysOnTheFourPointGrid() {
        let values = [
            SDKSpace.xxs, SDKSpace.xs, SDKSpace.sm, SDKSpace.md,
            SDKSpace.lg, SDKSpace.xl, SDKSpace.xxl,
        ]
        for value in values {
            XCTAssertEqual(value.truncatingRemainder(dividingBy: 4), 0)
        }
        XCTAssertEqual(values, values.sorted())
    }

    func testMotionSuppressesSpringsUnderReduceMotion() {
        XCTAssertNil(SDKMotion.snappy(reduceMotion: true))
        XCTAssertNil(SDKMotion.gentle(reduceMotion: true))
        XCTAssertNotNil(SDKMotion.snappy(reduceMotion: false))
        XCTAssertNotNil(SDKMotion.gentle(reduceMotion: false))
    }

    // MARK: Accessibility floor

    func testInteractiveContractsMeetTheMinimumTarget() {
        // The tactile styles and preference rows agree on this floor.
        XCTAssertGreaterThanOrEqual(SDKMetrics.minimumTouchTarget, 44)
        XCTAssertGreaterThanOrEqual(SDKMetrics.minimumRowHeight, SDKMetrics.minimumTouchTarget)
    }
}
