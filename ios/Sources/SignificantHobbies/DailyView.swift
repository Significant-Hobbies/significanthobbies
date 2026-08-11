import SignificantHobbiesCore
import SwiftUI

struct DailyView: View {
    @Environment(AppModel.self) private var model
    @State private var draft = DailyEntry(date: .now)
    @State private var ritual = 0

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
                habits
                newThing
                journal
                Button {
                    Task { await model.saveDaily(draft) }
                } label: {
                    Label("Save private Daily entry", systemImage: "lock.fill")
                }
                .buttonStyle(AtlasPrimaryButtonStyle())
                priorContext
            }
            .padding(.horizontal, 18)
            .padding(.bottom, 34)
        }
        .background((ritual == 0 ? AtlasPalette.gold.opacity(0.15) : AtlasPalette.lilac.opacity(0.28)).ignoresSafeArea())
        .navigationBarHidden(true)
        .onAppear { loadDraft() }
        .onChange(of: model.selectedDate) { _, _ in loadDraft() }
    }

    private var dateRail: some View {
        HStack {
            Button { model.selectedDate = Calendar.current.date(byAdding: .day, value: -1, to: model.selectedDate) ?? model.selectedDate } label: {
                Image(systemName: "chevron.left").frame(width: 44, height: 44)
            }
            Spacer()
            VStack(spacing: 2) {
                Text(Calendar.current.isDateInToday(model.selectedDate) ? "Today" : model.selectedDate.formatted(.dateTime.weekday(.wide)))
                    .font(.headline)
                Text(model.selectedDate.formatted(.dateTime.day().month(.wide))).font(.caption).foregroundStyle(AtlasPalette.quietInk)
            }
            Spacer()
            Button { model.selectedDate = Calendar.current.date(byAdding: .day, value: 1, to: model.selectedDate) ?? model.selectedDate } label: {
                Image(systemName: "chevron.right").frame(width: 44, height: 44)
            }
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

    private var habits: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("Small ways to be here").font(.title2.weight(.bold))
                Spacer()
                Text("No streaks").font(.caption.weight(.bold)).foregroundStyle(AtlasPalette.quietInk)
            }
            ForEach(model.document.habits.filter { !$0.isArchived }) { habit in
                Button {
                    if draft.completedHabitIDs.contains(habit.id) { draft.completedHabitIDs.remove(habit.id) }
                    else { draft.completedHabitIDs.insert(habit.id) }
                } label: {
                    HStack(spacing: 12) {
                        Image(systemName: draft.completedHabitIDs.contains(habit.id) ? "checkmark.circle.fill" : "circle")
                            .font(.title3)
                            .foregroundStyle(draft.completedHabitIDs.contains(habit.id) ? AtlasPalette.sage : AtlasPalette.quietInk)
                        Text(habit.name).font(.body.weight(.medium))
                        Spacer()
                    }
                    .foregroundStyle(AtlasPalette.ink)
                    .frame(minHeight: 48)
                }
            }
        }
    }

    private var newThing: some View {
        VStack(alignment: .leading, spacing: 9) {
            AtlasLabel(text: "One new thing")
            TextField("A route, taste, person, idea…", text: $draft.newThing, axis: .vertical)
                .lineLimit(2...4)
                .padding(14)
                .background(AtlasPalette.sky.opacity(0.58))
                .clipShape(RoundedRectangle(cornerRadius: 13))
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
            if let previous = model.document.dailyEntries
                .filter({ $0.date < Calendar.current.startOfDay(for: model.selectedDate) && !$0.journal.isEmpty })
                .sorted(by: { $0.date > $1.date }).first {
                Text(previous.journal).font(.system(.body, design: .serif)).foregroundStyle(AtlasPalette.quietInk)
                Text(previous.date.formatted(date: .abbreviated, time: .omitted)).font(.caption.weight(.bold))
            } else {
                Text("Earlier writing will return here as context, never as a score.").foregroundStyle(AtlasPalette.quietInk)
            }
        }
        .padding(16)
        .background(AtlasPalette.paper.opacity(0.7))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private func loadDraft() {
        draft = model.document.dailyEntry(on: model.selectedDate) ?? DailyEntry(date: Calendar.current.startOfDay(for: model.selectedDate))
    }
}
