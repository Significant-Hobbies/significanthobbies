import SignificantHobbiesCore
import SwiftUI

struct JournalView: View {
    @Environment(AppModel.self) private var model
    @State private var draft = DailyEntry(date: .now)
    @State private var loadedDraft = DailyEntry(date: .now)
    @State private var priorEntry: DailyEntry?
    @State private var ritual = 0
    @State private var isArchivePresented = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 26) {
                AtlasHeader(
                    title: ritual == 0 ? "Meet the morning." : "Close the day gently.",
                    subtitle: "A private ritual. Nothing written here can be published.",
                    settingsAction: { model.isSettingsPresented = true }
                )
                dateRail
                Picker("Ritual", selection: $ritual) {
                    Text("Morning").tag(0)
                    Text("Evening").tag(1)
                }
                .pickerStyle(.segmented)
                reflectionField
                journal
                Button {
                    Task {
                        if await model.saveDaily(draft) {
                            loadedDraft = draft
                        }
                    }
                } label: {
                    Label("Save private Journal entry", systemImage: "lock.fill")
                }
                .buttonStyle(AtlasPrimaryButtonStyle())
                priorContext
            }
            .padding(.horizontal, 18)
            .padding(.bottom, 34)
            .frame(maxWidth: 720, alignment: .leading)
            .frame(maxWidth: .infinity)
        }
        .background((ritual == 0 ? AtlasPalette.gold.opacity(0.15) : AtlasPalette.lilac.opacity(0.28)).ignoresSafeArea())
        .navigationBarHidden(true)
        .onAppear { loadDraft() }
        .onChange(of: model.selectedDate) { _, _ in loadDraft() }
        .sheet(isPresented: $isArchivePresented) { archive }
    }

    private var dateRail: some View {
        HStack {
            Button { changeDate(by: -1) } label: {
                Image(systemName: "chevron.left").frame(width: 44, height: 44)
            }
            .accessibilityLabel("Previous day")
            .accessibilityHint("Opens the previous Journal date")
            Spacer()
            VStack(spacing: 2) {
                Text(Calendar.current.isDateInToday(model.selectedDate) ? "Today" : model.selectedDate.formatted(.dateTime.weekday(.wide)))
                    .font(.headline)
                Text(model.selectedDate.formatted(.dateTime.day().month(.wide))).font(.caption).foregroundStyle(AtlasPalette.quietInk)
            }
            Spacer()
            Button { changeDate(by: 1) } label: {
                Image(systemName: "chevron.right").frame(width: 44, height: 44)
            }
            .disabled(!canMoveForward)
            .accessibilityLabel("Next day")
            .accessibilityHint("Opens the next Journal date")
        }
        .padding(.horizontal, 6)
        .background(AtlasPalette.paper.opacity(0.78))
        .clipShape(RoundedRectangle(cornerRadius: 13))
    }

    private var reflectionField: some View {
        VStack(alignment: .leading, spacing: 9) {
            AtlasLabel(text: ritual == 0 ? "What deserves your attention?" : "What felt alive today?")
            TextEditor(text: ritual == 0 ? $draft.morningReflection : $draft.eveningReflection)
                .font(.system(.title3, design: .serif))
                .scrollContentBackground(.hidden)
                .frame(minHeight: 105)
                .padding(12)
                .background(AtlasPalette.paper)
                .clipShape(RoundedRectangle(cornerRadius: 14))
                .overlay { RoundedRectangle(cornerRadius: 14).stroke(AtlasPalette.contour) }
                .accessibilityLabel(ritual == 0 ? "Morning reflection" : "Evening reflection")
        }
    }

    private var journal: some View {
        VStack(alignment: .leading, spacing: 9) {
            HStack {
                AtlasLabel(text: "Private journal")
                Spacer()
                Label("Never public", systemImage: "lock.fill").font(.caption.weight(.bold)).foregroundStyle(AtlasPalette.quietInk)
            }
            TextEditor(text: $draft.journal)
                .scrollContentBackground(.hidden)
                .font(.system(.body, design: .serif))
                .frame(minHeight: 180)
                .padding(13)
                .background(AtlasPalette.paper)
                .clipShape(RoundedRectangle(cornerRadius: 15))
                .overlay { RoundedRectangle(cornerRadius: 15).stroke(AtlasPalette.contour) }
                .accessibilityLabel("Private journal")
        }
    }

    private var priorContext: some View {
        VStack(alignment: .leading, spacing: 9) {
            AtlasLabel(text: "A thread from before")
            if let previous = priorEntry {
                Text(previous.journal).font(.system(.body, design: .serif)).foregroundStyle(AtlasPalette.quietInk)
                Text(previous.date.formatted(date: .abbreviated, time: .omitted)).font(.caption.weight(.bold))
            } else {
                Text("Earlier writing will return here as context, never as a score.").foregroundStyle(AtlasPalette.quietInk)
            }
            Button("Browse Journal archive") { isArchivePresented = true }
                .font(.subheadline.weight(.semibold))
        }
        .padding(16)
        .background(AtlasPalette.paper.opacity(0.7))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private func loadDraft() {
        draft = model.document.dailyEntry(on: model.selectedDate) ?? DailyEntry(date: Calendar.current.startOfDay(for: model.selectedDate))
        loadedDraft = draft
        priorEntry = model.document.dailyEntries
            .filter { $0.date < Calendar.current.startOfDay(for: model.selectedDate) && !$0.journal.isEmpty }
            .max { $0.date < $1.date }
    }

    private var canMoveForward: Bool {
        Calendar.current.startOfDay(for: model.selectedDate) < Calendar.current.startOfDay(for: .now)
    }

    private var archiveEntries: [DailyEntry] {
        model.document.dailyEntries
            .filter { !$0.morningReflection.isEmpty || !$0.eveningReflection.isEmpty || !$0.journal.isEmpty }
            .sorted { $0.date > $1.date }
    }

    private var archive: some View {
        NavigationStack {
            List(archiveEntries) { entry in
                Button {
                    openDate(entry.date, dismissArchive: true)
                } label: {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(entry.date.formatted(date: .long, time: .omitted))
                            .font(.headline)
                        Text(entry.journal.isEmpty ? entry.morningReflection + entry.eveningReflection : entry.journal)
                            .lineLimit(2)
                            .foregroundStyle(AtlasPalette.quietInk)
                    }
                }
                .foregroundStyle(AtlasPalette.ink)
            }
            .overlay {
                if archiveEntries.isEmpty {
                    ContentUnavailableView("No Journal entries yet", systemImage: "book.closed")
                }
            }
            .navigationTitle("Journal archive")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { isArchivePresented = false }
                }
            }
        }
        .atlasBackground()
    }

    private func changeDate(by dayOffset: Int) {
        let date = Calendar.current.date(byAdding: .day, value: dayOffset, to: model.selectedDate) ?? model.selectedDate
        openDate(date)
    }

    private func openDate(_ date: Date, dismissArchive: Bool = false) {
        Task {
            if draft != loadedDraft {
                guard await model.saveDaily(draft, announceSuccess: false) else { return }
            }
            model.selectedDate = Calendar.current.startOfDay(for: date)
            if dismissArchive { isArchivePresented = false }
        }
    }
}
