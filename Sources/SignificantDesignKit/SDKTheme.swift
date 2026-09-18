import SwiftUI

/// The Significant Hobbies family visual contract.
///
/// The kit owns *mechanics* — semantic color roles, spacing, motion, tactile
/// and drawn-line behavior — while each product supplies identity through an
/// `SDKIdentity` (its palette) plus its own assets, copy, and accents. The
/// default neutrals are the shared paper/charcoal baseline; products override
/// only the roles that carry their identity.
///
/// The kit is presentation-only: it must never import product models,
/// storage, sync, or business logic.

// MARK: - Palette

/// The concrete colors for one scheme. `neutral` supplies the shared
/// paper/charcoal baseline so products only author what differs.
public struct SDKPalette: Sendable, Equatable {
    // Surfaces, back to front.
    public var canvas: Color
    public var surface: Color
    public var surfaceRaised: Color
    public var hairline: Color

    // Text, in descending emphasis.
    public var textPrimary: Color
    public var textSecondary: Color
    public var textTertiary: Color

    // The product accent.
    public var accent: Color
    public var accentSoft: Color
    public var accentDeep: Color
    public var onAccent: Color

    // Status.
    public var positive: Color
    public var caution: Color
    public var negative: Color

    public init(
        canvas: Color, surface: Color, surfaceRaised: Color, hairline: Color,
        textPrimary: Color, textSecondary: Color, textTertiary: Color,
        accent: Color, accentSoft: Color, accentDeep: Color, onAccent: Color,
        positive: Color, caution: Color, negative: Color
    ) {
        self.canvas = canvas
        self.surface = surface
        self.surfaceRaised = surfaceRaised
        self.hairline = hairline
        self.textPrimary = textPrimary
        self.textSecondary = textSecondary
        self.textTertiary = textTertiary
        self.accent = accent
        self.accentSoft = accentSoft
        self.accentDeep = accentDeep
        self.onAccent = onAccent
        self.positive = positive
        self.caution = caution
        self.negative = negative
    }

    /// The shared family neutrals. Charcoal at night, warm paper by day;
    /// status colours are muted so they inform rather than decorate.
    public static func neutral(dark: Bool) -> SDKPalette {
        dark
            ? SDKPalette(
                canvas: Color(hex: 0x0B0B0C),
                surface: Color(hex: 0x151515),
                surfaceRaised: Color(hex: 0x202020),
                hairline: Color.white.opacity(0.09),
                textPrimary: Color(hex: 0xF2F0EA),
                textSecondary: Color(hex: 0xAAA8A2),
                textTertiary: Color(hex: 0x89867F),
                accent: Color(hex: 0xF2F0EA),
                accentSoft: Color(hex: 0xC7C4BD),
                accentDeep: Color(hex: 0x85817A),
                onAccent: Color(hex: 0x111111),
                positive: Color(hex: 0x72A982),
                caution: Color(hex: 0x8A5B12),
                negative: Color(hex: 0xB94F43)
            )
            : SDKPalette(
                canvas: Color(hex: 0xF3F1EC),
                surface: Color(hex: 0xFBFAF7),
                surfaceRaised: Color(hex: 0xE9E6DF),
                hairline: Color.black.opacity(0.10),
                textPrimary: Color(hex: 0x171717),
                textSecondary: Color(hex: 0x5E5B56),
                textTertiary: Color(hex: 0x6B6761),
                accent: Color(hex: 0x191919),
                accentSoft: Color(hex: 0x5B5852),
                accentDeep: Color(hex: 0x000000),
                onAccent: Color(hex: 0xF8F7F3),
                positive: Color(hex: 0x4F7D61),
                caution: Color(hex: 0x8A5B12),
                negative: Color(hex: 0xB94F43)
            )
    }
}

/// A product's supplied identity: its light and dark palettes. Defaults are
/// the family neutrals so adopting the kit changes mechanics before colour.
public struct SDKIdentity: Sendable, Equatable {
    public var light: SDKPalette
    public var dark: SDKPalette

    public init(
        light: SDKPalette = .neutral(dark: false),
        dark: SDKPalette = .neutral(dark: true)
    ) {
        self.light = light
        self.dark = dark
    }

    public static let `default` = SDKIdentity()
}

/// The resolved theme components read from the environment. `isDark` records
/// which palette resolved so surfaces can adjust shadows and edges.
public struct SDKTheme: Sendable, Equatable {
    public var palette: SDKPalette
    public var isDark: Bool

    public var canvas: Color { palette.canvas }
    public var surface: Color { palette.surface }
    public var surfaceRaised: Color { palette.surfaceRaised }
    public var hairline: Color { palette.hairline }
    public var textPrimary: Color { palette.textPrimary }
    public var textSecondary: Color { palette.textSecondary }
    public var textTertiary: Color { palette.textTertiary }
    public var accent: Color { palette.accent }
    public var accentSoft: Color { palette.accentSoft }
    public var accentDeep: Color { palette.accentDeep }
    public var onAccent: Color { palette.onAccent }
    public var positive: Color { palette.positive }
    public var caution: Color { palette.caution }
    public var negative: Color { palette.negative }

    public static func resolve(_ scheme: ColorScheme, identity: SDKIdentity = .default) -> SDKTheme {
        SDKTheme(palette: scheme == .dark ? identity.dark : identity.light, isDark: scheme == .dark)
    }
}

// MARK: - Environment

private struct SDKThemeKey: EnvironmentKey {
    static let defaultValue = SDKTheme.resolve(.dark)
}

private struct SDKWorkspaceMaxWidthKey: EnvironmentKey {
    static let defaultValue: CGFloat = 720
}

public extension EnvironmentValues {
    var sdkTheme: SDKTheme {
        get { self[SDKThemeKey.self] }
        set { self[SDKThemeKey.self] = newValue }
    }

    /// Wide Mac windows may earn more room for evidence surfaces; compact
    /// layouts stay narrow and do not consume it.
    var sdkWorkspaceMaxWidth: CGFloat {
        get { self[SDKWorkspaceMaxWidthKey.self] }
        set { self[SDKWorkspaceMaxWidthKey.self] = newValue }
    }
}

/// Resolves the product identity against the live colour scheme and injects
/// it. Applied once at each scene root.
public struct SDKThemeProvider: ViewModifier {
    @Environment(\.colorScheme) private var scheme
    private let identity: SDKIdentity

    public init(identity: SDKIdentity) {
        self.identity = identity
    }

    public func body(content: Content) -> some View {
        content.environment(\.sdkTheme, .resolve(scheme, identity: identity))
    }
}

public extension View {
    func sdkTheme(_ identity: SDKIdentity = .default) -> some View {
        modifier(SDKThemeProvider(identity: identity))
    }
}

// MARK: - Colour helper

public extension Color {
    init(hex: UInt32, opacity: Double = 1) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255,
            opacity: opacity
        )
    }
}
