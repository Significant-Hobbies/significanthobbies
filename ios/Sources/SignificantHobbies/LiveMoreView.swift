import SignificantHobbiesCore
import SwiftUI

struct LiveMoreView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    @State private var isAddHobbyPresented = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 30) {
                AtlasHeader(
                    title: "Go inhabit your life.",
                    subtitle: "Choose one real thing worth leaving the screen for.",
                    settingsAction: { model.isSettingsPresented = true }
                )
                compassField
                livingNow
                nextCommitments
                atlasShelves
                sideQuest
            }
            .padding(.horizontal, 18)
            .padding(.bottom, 34)
        }
        .atlasBackground()
        .navigationBarHidden(true)
        .sheet(isPresented: $isAddHobbyPresented) { AddHobbyView() }
    }

    private var compassField: some View {
        ZStack(alignment: .bottomLeading) {
            AtlasPath(color: AtlasPalette.ink.opacity(0.35)).padding(18)
            Circle().fill(AtlasPalette.gold).frame(width: 26, height: 26).offset(x: 20, y: -18)
            Circle().fill(AtlasPalette.sage).frame(width: 18, height: 18).offset(x: 238, y: -128)
            VStack(alignment: .leading, spacing: 11) {
                AtlasLabel(text: "This year's direction")
                Text(model.document.directions.first?.title ?? "Name what matters")
                    .font(.system(.title, design: .serif, weight: .medium))
                    .frame(maxWidth: dynamicTypeSize.isAccessibilitySize ? .infinity : 265, alignment: .leading)
                Text(model.document.directions.first?.why ?? "A direction is a way to choose, not another score.")
                    .font(.subheadline)
                    .foregroundStyle(AtlasPalette.quietInk)
                    .frame(maxWidth: dynamicTypeSize.isAccessibilitySize ? .infinity : 270, alignment: .leading)
                if let practice = model.document.directions.first?.dailyPractice {
                    Label(practice, systemImage: "sparkles")
                        .font(.caption.weight(.semibold))
                        .lineLimit(dynamicTypeSize.isAccessibilitySize ? 3 : 2)
                        .padding(.horizontal, 10).padding(.vertical, 8)
                        .background(AtlasPalette.paper.opacity(0.8))
                        .clipShape(RoundedRectangle(cornerRadius: 9))
                }
            }
            .padding(20)
        }
        .frame(height: dynamicTypeSize.isAccessibilitySize ? 560 : 260)
        .frame(maxWidth: .infinity)
        .background(AtlasPalette.sky)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private var livingNow: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                VStack(alignment: .leading, spacing: 3) {
                    Text("Living now").font(.title2.weight(.bold))
                    Text("What already has your attention.").font(.subheadline).foregroundStyle(AtlasPalette.quietInk)
                }
                Spacer()
                Button { isAddHobbyPresented = true } label: { Image(systemName: "plus").frame(width: 44, height: 44) }
                    .accessibilityLabel("Add hobby")
            }
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 10) {
                    ForEach(model.document.hobbies) { hobby in
                        NavigationLink {
                            HobbyDetailView(hobby: hobby)
                        } label: {
                            VStack(alignment: .leading, spacing: 10) {
                                Circle().fill(color(for: hobby.category)).frame(width: 16, height: 16)
                                Text(hobby.name)
                                    .font(.system(.title3, design: .serif, weight: .semibold))
                                    .multilineTextAlignment(.leading)
                                Text(hobby.state.rawValue).font(.caption.weight(.bold)).foregroundStyle(AtlasPalette.quietInk)
                            }
                            .frame(
                                width: dynamicTypeSize.isAccessibilitySize ? 220 : 156,
                                height: dynamicTypeSize.isAccessibilitySize ? 210 : 126,
                                alignment: .topLeading
                            )
                            .padding(15)
                            .background(AtlasPalette.paper)
                            .clipShape(RoundedRectangle(cornerRadius: 15))
                            .overlay { RoundedRectangle(cornerRadius: 15).stroke(AtlasPalette.contour) }
                        }
                        .foregroundStyle(AtlasPalette.ink)
                    }
                }
            }
        }
    }

    private var nextCommitments: some View {
        VStack(alignment: .leading, spacing: 13) {
            Text("A promise to the near future").font(.title2.weight(.bold))
            ForEach(model.document.commitments.filter { !$0.isComplete }.prefix(3)) { commitment in
                HStack(spacing: 13) {
                    VStack(spacing: 2) {
                        Text(commitment.dueDate?.formatted(.dateTime.day()) ?? "•")
                            .font(.title2.monospacedDigit().weight(.bold))
                        Text(commitment.dueDate?.formatted(.dateTime.month(.abbreviated)) ?? "OPEN")
                            .font(.caption2.weight(.bold))
                    }
                    .frame(width: 54, height: 58)
                    .background(AtlasPalette.gold)
                    .clipShape(Circle())
                    VStack(alignment: .leading, spacing: 4) {
                        Text(commitment.title).font(.headline)
                        Text(commitment.visibility.rawValue).font(.caption).foregroundStyle(AtlasPalette.quietInk)
                    }
                    Spacer()
                    Button { Task { await model.completeCommitment(commitment) } } label: {
                        Image(systemName: "checkmark").frame(width: 44, height: 44)
                    }
                    .accessibilityLabel("Complete \(commitment.title)")
                }
                Divider().overlay(AtlasPalette.contour)
            }
        }
    }

    private var atlasShelves: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Open a part of the atlas").font(.title2.weight(.bold))
            NavigationLink { LivingLibraryView(section: .bucket) } label: {
                shelf(icon: "flag.checkered", title: "Bucket list", count: model.document.bucketList.count, color: AtlasPalette.coral)
            }
            NavigationLink { LivingLibraryView(section: .timelines) } label: {
                shelf(icon: "point.bottomleft.forward.to.point.topright.scurvepath", title: "Timelines", count: model.document.timelines.count, color: AtlasPalette.sky)
            }
            NavigationLink { LivingLibraryView(section: .quests) } label: {
                shelf(icon: "map.fill", title: "Side quests", count: model.document.sideQuests.count, color: AtlasPalette.lilac)
            }
        }
    }

    private var sideQuest: some View {
        Group {
            if let quest = model.document.sideQuests.first(where: { !$0.isComplete }) {
                VStack(alignment: .leading, spacing: 11) {
                    AtlasLabel(text: "A small detour")
                    Text(quest.title).font(.system(.title2, design: .serif, weight: .semibold))
                    Text("Next: \(quest.nextStep)").font(.subheadline).foregroundStyle(AtlasPalette.quietInk)
                }
                .padding(18)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(AtlasPalette.lilac)
                .clipShape(RoundedRectangle(cornerRadius: 16))
            }
        }
    }

    private func shelf(icon: String, title: String, count: Int, color: Color) -> some View {
        HStack(spacing: 14) {
            Image(systemName: icon).frame(width: 46, height: 46).background(color).clipShape(Circle())
            Text(title).font(.headline)
            Spacer()
            Text("\(count)").font(.headline.monospacedDigit())
            Image(systemName: "chevron.right")
        }
        .foregroundStyle(AtlasPalette.ink)
        .frame(minHeight: 58)
    }

    private func color(for category: String) -> Color {
        switch category.lowercased() {
        case "make": AtlasPalette.coral
        case "move": AtlasPalette.sage
        case "learn": AtlasPalette.sky
        default: AtlasPalette.gold
        }
    }
}
