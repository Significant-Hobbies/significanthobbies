import SwiftUI

// MARK: - Surfaces

/// The family card. Everything that needs to sit above the canvas uses it.
public struct SDKCard<Content: View>: View {
    @Environment(\.sdkTheme) private var theme
    private let padding: CGFloat
    private let content: Content

    public init(padding: CGFloat = SDKSpace.md, @ViewBuilder content: () -> Content) {
        self.padding = padding
        self.content = content()
    }

    public var body: some View {
        content
            .padding(padding)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(theme.surface, in: .rect(cornerRadius: SDKRadius.lg))
            .overlay(
                RoundedRectangle(cornerRadius: SDKRadius.lg)
                    .strokeBorder(theme.hairline, lineWidth: 1)
            )
            .shadow(color: .black.opacity(theme.isDark ? 0.28 : 0.05), radius: 18, y: 6)
    }
}

/// Section heading with an optional trailing control.
public struct SDKSectionHeader<Trailing: View>: View {
    @Environment(\.sdkTheme) private var theme
    private let title: String
    private let subtitle: String?
    private let trailing: Trailing

    public init(
        _ title: String,
        subtitle: String? = nil,
        @ViewBuilder trailing: () -> Trailing = { EmptyView() }
    ) {
        self.title = title
        self.subtitle = subtitle
        self.trailing = trailing()
    }

    public var body: some View {
        HStack(alignment: .firstTextBaseline) {
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.system(size: 17, weight: .semibold, design: .rounded))
                    .foregroundStyle(theme.textPrimary)
                if let subtitle {
                    Text(subtitle)
                        .font(.system(size: 12))
                        .foregroundStyle(theme.textTertiary)
                }
            }
            Spacer(minLength: SDKSpace.sm)
            trailing
        }
    }
}

/// Responsive content column: readable on a phone, bounded on a wide Mac
/// window. Consumers may raise the ceiling through `sdkWorkspaceMaxWidth`.
public struct SDKContentFrame<Content: View>: View {
    @Environment(\.sdkWorkspaceMaxWidth) private var maxWidth
    private let content: Content

    public init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    public var body: some View {
        content
            .frame(maxWidth: maxWidth)
            .frame(maxWidth: .infinity)
            .padding(.horizontal, SDKSpace.md)
    }
}

// MARK: - Drawn lines

/// A small hand-drawn stroke used as punctuation, never as an affordance.
/// The animated form reveals itself once unless Reduce Motion is enabled.
public struct SDKDrawnUnderline: View {
    @Environment(\.sdkTheme) private var theme
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var reveal: CGFloat

    private let width: CGFloat
    private let tint: Color?
    private let animated: Bool

    public init(width: CGFloat = 64, tint: Color? = nil, animated: Bool = false) {
        self.width = width
        self.tint = tint
        self.animated = animated
        _reveal = State(initialValue: animated ? 0 : 1)
    }

    public var body: some View {
        SDKDrawnUnderlineShape()
            .trim(from: 0, to: reveal)
            .stroke(
                tint ?? theme.accent,
                style: StrokeStyle(lineWidth: 2.4, lineCap: .round, lineJoin: .round)
            )
            .frame(width: width, height: 8)
            .rotationEffect(.degrees(-1.2))
            .onAppear {
                guard animated, reveal < 1 else { return }
                if reduceMotion {
                    reveal = 1
                } else {
                    withAnimation(.easeOut(duration: 0.52)) { reveal = 1 }
                }
            }
            .accessibilityHidden(true)
    }
}

private struct SDKDrawnUnderlineShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.move(to: CGPoint(x: 1, y: rect.height * 0.62))
        path.addCurve(
            to: CGPoint(x: rect.width - 5, y: rect.height * 0.42),
            control1: CGPoint(x: rect.width * 0.27, y: rect.height * 0.31),
            control2: CGPoint(x: rect.width * 0.70, y: rect.height * 0.74)
        )
        path.addEllipse(
            in: CGRect(x: rect.width - 2, y: rect.height * 0.28, width: 4, height: 4)
        )
        return path
    }
}

/// A drawn comparison line with a slight authored bend; labels and values
/// carry the exact meaning. Reveal is suppressed under Reduce Motion.
public struct SDKDrawnTrace: View {
    @Environment(\.sdkTheme) private var theme
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var reveal: CGFloat = 0

    private let fraction: Double
    private let tint: Color

    public init(fraction: Double, tint: Color) {
        self.fraction = min(1, max(0, fraction))
        self.tint = tint
    }

    public var body: some View {
        ZStack {
            SDKDrawnTraceShape(fraction: 1, showsEnd: false)
                .stroke(theme.hairline, style: StrokeStyle(lineWidth: 1.2, lineCap: .round))
            SDKDrawnTraceShape(
                fraction: max(0.025, fraction) * Double(reveal),
                showsEnd: true
            )
            .stroke(tint, style: StrokeStyle(lineWidth: 3, lineCap: .round, lineJoin: .round))
        }
        .frame(minHeight: 14)
        .onAppear {
            if reduceMotion {
                reveal = 1
            } else {
                withAnimation(.easeOut(duration: 0.68)) { reveal = 1 }
            }
        }
        .accessibilityHidden(true)
    }
}

private struct SDKDrawnTraceShape: Shape {
    var fraction: Double
    let showsEnd: Bool

    var animatableData: Double {
        get { fraction }
        set { fraction = newValue }
    }

    func path(in rect: CGRect) -> Path {
        let progress = CGFloat(min(1, max(0, fraction)))
        let endX = max(2, rect.width * progress)
        let start = CGPoint(x: 2, y: rect.height * 0.58)
        let end = CGPoint(x: endX, y: rect.height * 0.47)
        var path = Path()
        path.move(to: start)
        path.addCurve(
            to: end,
            control1: CGPoint(x: endX * 0.28, y: rect.height * 0.28),
            control2: CGPoint(x: endX * 0.70, y: rect.height * 0.74)
        )
        if showsEnd {
            path.addEllipse(in: CGRect(x: end.x - 2.5, y: end.y - 2.5, width: 5, height: 5))
        }
        return path
    }
}

// MARK: - Buttons

/// The single filled action on a screen. There is never more than one.
public struct SDKPrimaryButtonStyle: ButtonStyle {
    public var isDestructive: Bool = false
    public var expands: Bool = true

    public init(isDestructive: Bool = false, expands: Bool = true) {
        self.isDestructive = isDestructive
        self.expands = expands
    }

    public func makeBody(configuration: Configuration) -> some View {
        SDKTactilePrimaryButton(
            label: configuration.label,
            isPressed: configuration.isPressed,
            isDestructive: isDestructive,
            expands: expands
        )
    }
}

/// Everything that isn't the primary action.
public struct SDKQuietButtonStyle: ButtonStyle {
    public var expands: Bool = true

    public init(expands: Bool = true) {
        self.expands = expands
    }

    public func makeBody(configuration: Configuration) -> some View {
        SDKTactileQuietButton(
            label: configuration.label,
            isPressed: configuration.isPressed,
            expands: expands
        )
    }
}

/// Circular control used for compact transport-style buttons.
public struct SDKCircleButtonStyle: ButtonStyle {
    public var diameter: CGFloat = 52
    public var isProminent: Bool = false

    public init(diameter: CGFloat = 52, isProminent: Bool = false) {
        self.diameter = diameter
        self.isProminent = isProminent
    }

    public func makeBody(configuration: Configuration) -> some View {
        SDKTactileCircleButton(
            label: configuration.label,
            isPressed: configuration.isPressed,
            diameter: diameter,
            isProminent: isProminent
        )
    }
}

/// The slight lower edge makes the controls feel printed and physical without
/// turning them into skeuomorphic objects. Pressing settles the face onto
/// that edge instead of simply shrinking the whole control.
private struct SDKTactilePrimaryButton<Label: View>: View {
    @Environment(\.sdkTheme) private var theme
    @Environment(\.isEnabled) private var isEnabled
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var isHovered = false

    let label: Label
    let isPressed: Bool
    let isDestructive: Bool
    let expands: Bool

    private var tint: Color { isDestructive ? theme.negative : theme.accent }
    private var faceOffset: CGFloat { isPressed ? 2 : (isHovered && isEnabled ? -1 : 0) }

    var body: some View {
        label
            .font(.system(.body, design: .rounded).weight(.semibold))
            .foregroundStyle(theme.onAccent.opacity(isEnabled ? 1 : 0.55))
            .padding(.horizontal, SDKSpace.lg)
            .padding(.vertical, SDKSpace.sm)
            .frame(maxWidth: expands ? .infinity : nil, minHeight: SDKMetrics.minimumTouchTarget)
            .background {
                ZStack {
                    Capsule()
                        .fill(theme.isDark ? theme.accentDeep : Color.black.opacity(0.72))
                        .offset(y: isEnabled ? 3 : 1)
                    Capsule()
                        .fill(tint.opacity(isEnabled ? 1 : 0.34))
                    Capsule()
                        .strokeBorder(
                            LinearGradient(
                                colors: [theme.onAccent.opacity(0.30), theme.onAccent.opacity(0.06)],
                                startPoint: .top,
                                endPoint: .bottom
                            ),
                            lineWidth: 1
                        )
                        .padding(1)
                }
            }
            .contentShape(.capsule)
            .offset(y: faceOffset)
            .shadow(
                color: .black.opacity(isEnabled ? (theme.isDark ? 0.42 : 0.18) : 0),
                radius: isPressed ? 4 : 10,
                y: isPressed ? 2 : 7
            )
            .shadow(
                color: tint.opacity(isEnabled ? (isHovered ? 0.20 : 0.10) : 0),
                radius: isHovered ? 18 : 12,
                y: 2
            )
            .animation(SDKMotion.snappy(reduceMotion: reduceMotion), value: isPressed)
            .animation(SDKMotion.snappy(reduceMotion: reduceMotion), value: isHovered)
            .sdkButtonHover { isHovered = $0 }
    }
}

private struct SDKTactileQuietButton<Label: View>: View {
    @Environment(\.sdkTheme) private var theme
    @Environment(\.isEnabled) private var isEnabled
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var isHovered = false

    let label: Label
    let isPressed: Bool
    let expands: Bool

    private var faceOffset: CGFloat { isPressed ? 1.5 : (isHovered && isEnabled ? -1 : 0) }

    var body: some View {
        label
            .font(.system(.body, design: .rounded).weight(.medium))
            .foregroundStyle(theme.textPrimary.opacity(isEnabled ? 1 : 0.4))
            .padding(.horizontal, SDKSpace.lg)
            .padding(.vertical, SDKSpace.sm)
            .frame(maxWidth: expands ? .infinity : nil, minHeight: SDKMetrics.minimumTouchTarget)
            .background {
                ZStack {
                    Capsule()
                        .fill(Color.black.opacity(theme.isDark ? 0.55 : 0.16))
                        .offset(y: isEnabled ? 2 : 1)
                    Capsule()
                        .fill(theme.surfaceRaised)
                    if isHovered && isEnabled {
                        Capsule().fill(theme.textPrimary.opacity(theme.isDark ? 0.055 : 0.035))
                    }
                    Capsule()
                        .strokeBorder(
                            LinearGradient(
                                colors: theme.isDark
                                    ? [Color.white.opacity(0.14), Color.white.opacity(0.035)]
                                    : [Color.white.opacity(0.90), Color.black.opacity(0.10)],
                                startPoint: .top,
                                endPoint: .bottom
                            ),
                            lineWidth: 1
                        )
                }
            }
            .contentShape(.capsule)
            .offset(y: faceOffset)
            .shadow(
                color: .black.opacity(isEnabled ? (isHovered ? 0.18 : 0.08) : 0),
                radius: isPressed ? 2 : (isHovered ? 9 : 5),
                y: isPressed ? 1 : 4
            )
            .animation(SDKMotion.snappy(reduceMotion: reduceMotion), value: isPressed)
            .animation(SDKMotion.snappy(reduceMotion: reduceMotion), value: isHovered)
            .sdkButtonHover { isHovered = $0 }
    }
}

private struct SDKTactileCircleButton<Label: View>: View {
    @Environment(\.sdkTheme) private var theme
    @Environment(\.isEnabled) private var isEnabled
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var isHovered = false

    let label: Label
    let isPressed: Bool
    let diameter: CGFloat
    let isProminent: Bool

    private var faceOffset: CGFloat { isPressed ? 2 : (isHovered && isEnabled ? -1 : 0) }

    var body: some View {
        label
            .font(.system(size: diameter * 0.36, weight: .semibold))
            .foregroundStyle(isProminent ? theme.onAccent : theme.textPrimary)
            .frame(width: diameter, height: diameter)
            .background {
                ZStack {
                    Circle()
                        .fill(isProminent ? theme.accentDeep : Color.black.opacity(theme.isDark ? 0.55 : 0.16))
                        .offset(y: isEnabled ? 3 : 1)
                    Circle()
                        .fill(isProminent ? theme.accent : theme.surfaceRaised)
                    Circle()
                        .strokeBorder(
                            isProminent ? theme.onAccent.opacity(0.20) : theme.hairline,
                            lineWidth: 1
                        )
                        .padding(1)
                }
            }
            .contentShape(.circle)
            .offset(y: faceOffset)
            .shadow(
                color: .black.opacity(isEnabled ? (theme.isDark ? 0.40 : 0.16) : 0),
                radius: isPressed ? 3 : 9,
                y: isPressed ? 2 : 6
            )
            .animation(SDKMotion.snappy(reduceMotion: reduceMotion), value: isPressed)
            .animation(SDKMotion.snappy(reduceMotion: reduceMotion), value: isHovered)
            .sdkButtonHover { isHovered = $0 }
    }
}

private extension View {
    @ViewBuilder
    func sdkButtonHover(_ action: @escaping (Bool) -> Void) -> some View {
        #if os(macOS)
        onHover(perform: action)
        #else
        self
        #endif
    }
}
