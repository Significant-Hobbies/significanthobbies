import SignificantHobbiesCore
import SwiftUI

struct HistoryView: View {
    @Environment(AppModel.self) private var model

    private var yearWeek: Int { Calendar.current.component(.weekOfYear, from: .now) }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 30) {
                AtlasHeader(
                    title: "See what became real.",
                    subtitle: "A personal almanac of attention, change, and remembered evidence.",
                    settingsAction: { model.isSettingsPresented = true }
                )
                finiteYear
                trajectory
                privateJournalHistory
                livedEvidence
                timelines
            }
            .padding(.horizontal, 18)
            .padding(.bottom, 36)
        }
        .atlasBackground()
        .navigationBarHidden(true)
    }

    private var finiteYear: some View {
        VStack(alignment: .leading, spacing: 15) {
            HStack(alignment: .lastTextBaseline) {
                Text("Week \(yearWeek)")
                    .font(.system(size: 34, weight: .medium, design: .serif).monospacedDigit())
                Text("of 52").font(.headline).foregroundStyle(AtlasPalette.quietInk)
                Spacer()
                Image(systemName: "sun.max.fill").foregroundStyle(AtlasPalette.gold).font(.title2)
            }
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 4), count: 13), spacing: 4) {
                ForEach(1...52, id: \.self) { week in
                    RoundedRectangle(cornerRadius: 2)
                        .fill(week <= yearWeek ? AtlasPalette.gold : AtlasPalette.contour.opacity(0.65))
                        .aspectRatio(1, contentMode: .fit)
                        .accessibilityLabel("Week \(week), \(week <= yearWeek ? "lived" : "ahead")")
                }
            }
            Text("Finite time is context for choosing—not a score, warning, or countdown to fear.")
                .font(.subheadline).foregroundStyle(AtlasPalette.quietInk)
        }
        .padding(18)
        .background(AtlasPalette.paper)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .overlay { RoundedRectangle(cornerRadius: 16).stroke(AtlasPalette.contour) }
    }

    private var trajectory: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Trajectory").font(.title2.weight(.bold))
            Text("Direction bends. The line is allowed to change.").font(.subheadline).foregroundStyle(AtlasPalette.quietInk)
            ZStack {
                AtlasPath(color: AtlasPalette.ink.opacity(0.35)).padding(.horizontal, 12)
                ForEach(Array(model.document.hobbies.prefix(3).enumerated()), id: \.element.id) { index, hobby in
                    VStack(spacing: 3) {
                        Circle().fill(index == 0 ? AtlasPalette.coral : (index == 1 ? AtlasPalette.sage : AtlasPalette.sky)).frame(width: 22, height: 22)
                        Text(hobby.name).font(.caption2.weight(.bold)).lineLimit(1)
                    }
                    .frame(width: 92)
                    .offset(x: CGFloat(index - 1) * 100, y: index == 1 ? -38 : 42)
                }
            }
            .frame(height: 150)
            .background(AtlasPalette.sky.opacity(0.36))
            .clipShape(RoundedRectangle(cornerRadius: 15))
        }
    }

    private var privateJournalHistory: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Text("Private Daily record").font(.title2.weight(.bold))
                Spacer()
                Label("Never public", systemImage: "lock.fill").font(.caption.weight(.bold)).foregroundStyle(AtlasPalette.quietInk)
            }
            ForEach(model.document.dailyEntries.sorted(by: { $0.date > $1.date }).prefix(5)) { entry in
                VStack(alignment: .leading, spacing: 7) {
                    Text(entry.date.formatted(.dateTime.weekday(.wide).day().month(.abbreviated)))
                        .font(.caption.weight(.bold)).foregroundStyle(AtlasPalette.quietInk)
                    if !entry.newThing.isEmpty {
                        Label(entry.newThing, systemImage: "sparkles").font(.subheadline.weight(.semibold))
                    }
                    if !entry.journal.isEmpty { Text(entry.journal).font(.system(.body, design: .serif)) }
                }
                .padding(.vertical, 10)
                Divider().overlay(AtlasPalette.contour)
            }
        }
    }

    private var livedEvidence: some View {
        VStack(alignment: .leading, spacing: 13) {
            Text("Lived evidence").font(.title2.weight(.bold))
            let stamps = model.document.commitments.flatMap { commitment in commitment.proof.map { (commitment, $0) } }
            if stamps.isEmpty {
                Text("Proof stamps from commitments will appear here. Reflection remains reflection.").foregroundStyle(AtlasPalette.quietInk)
            } else {
                ForEach(stamps, id: \.1.id) { commitment, stamp in
                    HStack(alignment: .top, spacing: 12) {
                        Image(systemName: "seal.fill").foregroundStyle(AtlasPalette.sage).font(.title2)
                        VStack(alignment: .leading, spacing: 4) {
                            Text(commitment.title).font(.headline)
                            Text(stamp.note).font(.subheadline)
                            Text(stamp.date.formatted(date: .abbreviated, time: .omitted)).font(.caption).foregroundStyle(AtlasPalette.quietInk)
                        }
                    }
                    .padding(14)
                    .background(AtlasPalette.sage.opacity(0.2))
                    .clipShape(RoundedRectangle(cornerRadius: 13))
                }
            }
        }
    }

    private var timelines: some View {
        VStack(alignment: .leading, spacing: 13) {
            Text("Life timelines").font(.title2.weight(.bold))
            ForEach(model.document.timelines) { timeline in
                NavigationLink {
                    LivingLibraryView(section: .timelines)
                } label: {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(timeline.title).font(.headline)
                            Text("\(timeline.events.count) remembered turns").font(.subheadline).foregroundStyle(AtlasPalette.quietInk)
                        }
                        Spacer()
                        Image(systemName: "chevron.right")
                    }
                    .foregroundStyle(AtlasPalette.ink)
                    .frame(minHeight: 56)
                }
                Divider().overlay(AtlasPalette.contour)
            }
        }
    }
}
