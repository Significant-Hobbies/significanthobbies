import SignificantHobbiesCore
import SwiftUI

struct HobbyDetailView: View {
    @Environment(AppModel.self) private var model
    let hobby: Hobby

    private var current: Hobby { model.document.hobbies.first(where: { $0.id == hobby.id }) ?? hobby }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                HStack {
                    Circle().fill(AtlasPalette.sage).frame(width: 24, height: 24)
                    AtlasLabel(text: current.category)
                    Spacer()
                    Button(current.visibility.rawValue) { model.requestVisibility(for: current) }
                        .font(.caption.weight(.bold))
                        .padding(.horizontal, 10).padding(.vertical, 7)
                        .background(current.visibility == .publicProfile ? AtlasPalette.gold : AtlasPalette.contour)
                        .clipShape(Capsule())
                }
                Text(current.name).font(.system(size: 42, weight: .medium, design: .serif))
                Text(current.note).font(.title3).foregroundStyle(AtlasPalette.quietInk)
                HStack(spacing: 0) {
                    metric("STATE", current.state.rawValue)
                    metric("STARTED", current.startedAt.formatted(.dateTime.month(.abbreviated).year()))
                    metric("PROMISES", "\(model.document.commitments.count { $0.hobbyID == current.id })")
                }
                Divider().overlay(AtlasPalette.contour)
                Text("Commitments").font(.title2.weight(.bold))
                ForEach(model.document.commitments.filter { $0.hobbyID == current.id }) { commitment in
                    HStack {
                        Image(systemName: commitment.isComplete ? "checkmark.circle.fill" : "circle")
                            .foregroundStyle(commitment.isComplete ? AtlasPalette.sage : AtlasPalette.quietInk)
                        Text(commitment.title).font(.headline)
                        Spacer()
                        Button { model.requestVisibility(for: commitment) } label: {
                            Image(systemName: commitment.visibility == .publicProfile ? "globe" : "lock")
                                .frame(width: 44, height: 44)
                        }
                    }
                }
                Text("Visibility belongs to each eligible Living item. Daily writing is never part of this control.")
                    .font(.caption).foregroundStyle(AtlasPalette.quietInk)
            }
            .padding(20)
        }
        .atlasBackground()
        .navigationTitle("Hobby")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func metric(_ label: String, _ value: String) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(value).font(.subheadline.weight(.bold))
            AtlasLabel(text: label)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct AddHobbyView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.dismiss) private var dismiss
    @State private var name = ""
    @State private var category = "Make"
    @State private var note = ""
    @State private var state: HobbyState = .curious

    var body: some View {
        NavigationStack {
            Form {
                Section("What calls to you?") {
                    TextField("Hobby", text: $name)
                    Picker("Kind", selection: $category) {
                        ForEach(["Make", "Move", "Learn", "Gather", "Explore"], id: \.self) { Text($0).tag($0) }
                    }
                    Picker("Where are you?", selection: $state) {
                        ForEach(HobbyState.allCases, id: \.self) { Text($0.rawValue).tag($0) }
                    }
                    TextField("A private note", text: $note, axis: .vertical).lineLimit(2...5)
                }
                Section {
                    Label("Starts private", systemImage: "lock.fill")
                } footer: {
                    Text("You can explicitly make an eligible hobby public later. Nothing else changes with it.")
                }
            }
            .navigationTitle("Add to your atlas")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add") { Task { await model.addHobby(Hobby(name: name, category: category, note: note, state: state)); dismiss() } }
                        .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
        }
    }
}

enum LivingSection: String {
    case bucket = "Bucket list"
    case timelines = "Timelines"
    case quests = "Side quests"
}

struct LivingLibraryView: View {
    @Environment(AppModel.self) private var model
    let section: LivingSection
    @State private var isAddPresented = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text(section.rawValue).font(.system(.largeTitle, design: .serif, weight: .medium))
                Text(subtitle).foregroundStyle(AtlasPalette.quietInk)
                Button { isAddPresented = true } label: { Label("Add", systemImage: "plus") }
                    .buttonStyle(AtlasPrimaryButtonStyle())
                switch section {
                case .bucket:
                    ForEach(model.document.bucketList) { item in
                        libraryRow(item.title, note: item.category, complete: item.isComplete, visibility: item.visibility)
                    }
                case .timelines:
                    ForEach(model.document.timelines) { timeline in
                        VStack(alignment: .leading, spacing: 12) {
                            Text(timeline.title).font(.title2.weight(.bold))
                            ForEach(timeline.events.sorted(by: { $0.date > $1.date })) { event in
                                HStack(alignment: .top, spacing: 12) {
                                    Circle().fill(AtlasPalette.gold).frame(width: 12, height: 12).padding(.top, 4)
                                    VStack(alignment: .leading) {
                                        Text(event.title).font(.headline)
                                        Text(event.date.formatted(date: .abbreviated, time: .omitted)).font(.caption).foregroundStyle(AtlasPalette.quietInk)
                                    }
                                }
                            }
                        }
                        .padding(.vertical, 12)
                        Divider().overlay(AtlasPalette.contour)
                    }
                case .quests:
                    ForEach(model.document.sideQuests) { quest in
                        libraryRow(quest.title, note: quest.nextStep, complete: quest.isComplete, visibility: quest.visibility)
                    }
                }
            }
            .padding(20)
        }
        .atlasBackground()
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $isAddPresented) { AddLivingItemView(section: section) }
    }

    private var subtitle: String {
        switch section {
        case .bucket: "Possibilities worth remembering, not a checklist to finish."
        case .timelines: "See how an interest changes shape over time."
        case .quests: "Small detours with one concrete next move."
        }
    }

    private func libraryRow(_ title: String, note: String, complete: Bool, visibility: SignificantHobbiesCore.Visibility) -> some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: complete ? "checkmark.circle.fill" : "circle")
                .foregroundStyle(complete ? AtlasPalette.sage : AtlasPalette.quietInk)
            VStack(alignment: .leading, spacing: 4) {
                Text(title).font(.headline)
                Text(note).font(.subheadline).foregroundStyle(AtlasPalette.quietInk)
            }
            Spacer()
            Image(systemName: visibility == .publicProfile ? "globe" : "lock")
        }
        .padding(.vertical, 10)
    }
}

private struct AddLivingItemView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.dismiss) private var dismiss
    let section: LivingSection
    @State private var title = ""
    @State private var detail = ""

    var body: some View {
        NavigationStack {
            Form {
                TextField("Title", text: $title)
                TextField(section == .quests ? "Next step" : "Category or note", text: $detail, axis: .vertical)
            }
            .navigationTitle("Add \(section.rawValue.lowercased())")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add") {
                        Task {
                            switch section {
                            case .bucket: await model.addBucketItem(BucketItem(title: title, category: detail.isEmpty ? "Explore" : detail))
                            case .quests: await model.addSideQuest(SideQuest(title: title, nextStep: detail))
                            case .timelines: break
                            }
                            dismiss()
                        }
                    }
                    .disabled(title.trimmingCharacters(in: .whitespaces).isEmpty || section == .timelines)
                }
            }
        }
    }
}
