import SwiftUI

enum AtlasPalette {
    static let paper = Color(red: 252 / 255, green: 248 / 255, blue: 237 / 255)
    static let ink = Color(red: 54 / 255, green: 47 / 255, blue: 28 / 255)
    static let gold = Color(red: 234 / 255, green: 193 / 255, blue: 62 / 255)
    static let sage = Color(red: 129 / 255, green: 179 / 255, blue: 120 / 255)
    static let quietInk = Color(red: 111 / 255, green: 103 / 255, blue: 82 / 255)
    static let contour = Color(red: 222 / 255, green: 211 / 255, blue: 183 / 255)
    static let sky = Color(red: 166 / 255, green: 211 / 255, blue: 232 / 255)
    static let coral = Color(red: 232 / 255, green: 127 / 255, blue: 97 / 255)
    static let lilac = Color(red: 207 / 255, green: 190 / 255, blue: 226 / 255)
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
            Text("SH")
                .font(.system(size: size * 0.32, weight: .bold, design: .serif))
                .foregroundStyle(AtlasPalette.paper)
        }
        .frame(width: size, height: size)
        .accessibilityLabel("Significant Hobbies")
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
                Text("SIGNIFICANT HOBBIES")
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
            .foregroundStyle(AtlasPalette.ink)
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
