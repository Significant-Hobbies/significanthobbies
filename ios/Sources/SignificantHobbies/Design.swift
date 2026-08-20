import SwiftUI
import UIKit

enum AtlasPalette {
    static let paper = adaptive(light: 0xFCF8ED, dark: 0x191712)
    static let ink = adaptive(light: 0x362F1C, dark: 0xF4EEDB)
    static let actionInk = Color(red: 54 / 255, green: 47 / 255, blue: 28 / 255)
    static let gold = adaptive(light: 0xEAC13E, dark: 0xF1C94E)
    static let sage = adaptive(light: 0x81B378, dark: 0x7FB776)
    static let quietInk = adaptive(light: 0x6F6752, dark: 0xC0B799)
    static let contour = adaptive(light: 0xDED3B7, dark: 0x4B4534)
    static let sky = adaptive(light: 0xA6D3E8, dark: 0x477B94)
    static let coral = adaptive(light: 0xE87F61, dark: 0xD9785F)
    static let lilac = adaptive(light: 0xCFBEE2, dark: 0x695A79)

    private static func adaptive(light: UInt32, dark: UInt32) -> Color {
        Color(uiColor: UIColor { traits in
            UIColor(rgb: traits.userInterfaceStyle == .dark ? dark : light)
        })
    }
}

private extension UIColor {
    convenience init(rgb: UInt32) {
        self.init(
            red: CGFloat((rgb >> 16) & 0xFF) / 255,
            green: CGFloat((rgb >> 8) & 0xFF) / 255,
            blue: CGFloat(rgb & 0xFF) / 255,
            alpha: 1
        )
    }
}

struct AtlasBackground: ViewModifier {
    func body(content: Content) -> some View {
        content
            .foregroundStyle(AtlasPalette.ink)
            .background(AtlasPalette.paper.ignoresSafeArea())
            .tint(AtlasPalette.ink)
    }
}

struct SHMark: View {
    var size: CGFloat = 42

    var body: some View {
        ZStack {
            Circle().fill(AtlasPalette.ink)
            Text("J")
                .font(.system(size: size * 0.32, weight: .bold, design: .serif))
                .foregroundStyle(AtlasPalette.paper)
        }
        .frame(width: size, height: size)
        .accessibilityLabel("Journal")
    }
}

struct AtlasHeader: View {
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    let title: String
    let subtitle: String
    var settingsAction: (() -> Void)?

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                SHMark()
                Text("JOURNAL")
                    .font(.caption.weight(.bold))
                    .tracking(1.25)
                Spacer()
                if let settingsAction {
                    Button(action: settingsAction) {
                        Image(systemName: "person.crop.circle")
                            .font(.title2)
                            .frame(width: 44, height: 44)
                    }
                    .accessibilityLabel("Profile and settings")
                }
            }
            Text(title)
                .font(.system(.largeTitle, design: .serif, weight: .medium))
                .tracking(-0.7)
            Text(subtitle)
                .font(.body)
                .foregroundStyle(AtlasPalette.quietInk)
        }
        .padding(.top, 14)
    }
}

struct AtlasPath: View {
    var color: Color = AtlasPalette.gold

    var body: some View {
        GeometryReader { geometry in
            Path { path in
                path.move(to: CGPoint(x: 12, y: geometry.size.height * 0.72))
                path.addCurve(
                    to: CGPoint(x: geometry.size.width - 14, y: geometry.size.height * 0.28),
                    control1: CGPoint(x: geometry.size.width * 0.32, y: geometry.size.height * 0.1),
                    control2: CGPoint(x: geometry.size.width * 0.64, y: geometry.size.height * 0.9)
                )
            }
            .stroke(color, style: StrokeStyle(lineWidth: 4, lineCap: .round, dash: [2, 10]))
        }
        .accessibilityHidden(true)
    }
}

struct AtlasPrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.headline.weight(.bold))
            .foregroundStyle(AtlasPalette.actionInk)
            .frame(maxWidth: .infinity, minHeight: 54)
            .background(AtlasPalette.gold)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            .shadow(color: AtlasPalette.ink.opacity(0.22), radius: 0, x: 0, y: configuration.isPressed ? 1 : 4)
            .offset(y: configuration.isPressed ? 3 : 0)
            .animation(.easeOut(duration: 0.1), value: configuration.isPressed)
    }
}

struct AtlasLabel: View {
    let text: String
    var body: some View {
        Text(text.uppercased())
            .font(.caption2.weight(.bold))
            .tracking(1.1)
            .foregroundStyle(AtlasPalette.quietInk)
    }
}

extension View {
    func atlasBackground() -> some View { modifier(AtlasBackground()) }
}
