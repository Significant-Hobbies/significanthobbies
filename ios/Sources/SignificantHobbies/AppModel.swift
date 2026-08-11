import Foundation
import Observation
import SignificantHobbiesCore

@MainActor
@Observable
final class AppModel {
    private(set) var document: AtlasDocument = .sample
    var selectedDate = Date.now
    var selectedTab = 0
    var isLoading = true
    var isSettingsPresented = false
    var message: String?
    var pendingVisibility: VisibilityRequest?
    var importPreview: AtlasDocument?
    var isImportConfirmationPresented = false

    private let store: AtlasStore

    init(store: AtlasStore = AtlasStore()) {
        self.store = store
        if ProcessInfo.processInfo.arguments.contains("--daily-demo") { selectedTab = 1 }
        if ProcessInfo.processInfo.arguments.contains("--history-demo") { selectedTab = 2 }
    }

    func load() async {
        defer { isLoading = false }
        do {
            document = ProcessInfo.processInfo.arguments.contains("--fresh-demo") ? .sample : try await store.load()
            if ProcessInfo.processInfo.arguments.contains("--daily-demo") { selectedDate = .now }
        } catch {
            document = .sample
            message = error.localizedDescription
        }
    }

    func saveDaily(_ entry: DailyEntry) async {
        await mutate { $0.saveDaily(entry) }
        message = "Private Daily entry saved on this iPhone."
    }

    func toggleHabit(_ habit: Habit) async {
        await mutate { $0.toggleHabit(habit.id, on: selectedDate) }
    }

    func addHobby(_ hobby: Hobby) async {
        await mutate { $0.addHobby(hobby) }
        message = "Hobby added to your private atlas."
    }

    func addCommitment(_ commitment: Commitment) async {
        await mutate { $0.addCommitment(commitment) }
        message = "Commitment added privately."
    }

    func addBucketItem(_ item: BucketItem) async {
        await mutate { $0.addBucketItem(item) }
    }

    func addSideQuest(_ quest: SideQuest) async {
        await mutate { $0.addSideQuest(quest) }
    }

    func addDirection(_ direction: YearDirection) async {
        await mutate { $0.addDirection(direction) }
    }

    func completeCommitment(_ commitment: Commitment) async {
        await mutate { try $0.completeCommitment(commitment.id) }
    }

    func requestVisibility(for commitment: Commitment) {
        pendingVisibility = VisibilityRequest(
            kind: .commitment,
            id: commitment.id,
            title: commitment.title,
            current: commitment.visibility
        )
    }

    func requestVisibility(for hobby: Hobby) {
        pendingVisibility = VisibilityRequest(kind: .hobby, id: hobby.id, title: hobby.name, current: hobby.visibility)
    }

    func confirmVisibility() async {
        guard let request = pendingVisibility else { return }
        let next: SignificantHobbiesCore.Visibility = request.current == .privateOnly ? .publicProfile : .privateOnly
        await mutate { document in
            switch request.kind {
            case .commitment: try document.setCommitmentVisibility(request.id, visibility: next)
            case .hobby: try document.setHobbyVisibility(request.id, visibility: next)
            }
        }
        pendingVisibility = nil
        message = next == .publicProfile ? "Eligible for your public profile after account sync." : "Returned to private."
    }

    func updateProfile(_ profile: Profile) async { await mutate { $0.profile = profile } }

    func prepareImport(_ data: Data) async {
        do {
            importPreview = try await store.previewImport(data)
            isImportConfirmationPresented = true
        } catch { message = error.localizedDescription }
    }

    func confirmImport() async {
        guard let importPreview else { return }
        do {
            try await store.replace(with: importPreview)
            document = importPreview
            self.importPreview = nil
            isImportConfirmationPresented = false
            message = "Life Atlas replaced."
        } catch { message = error.localizedDescription }
    }

    func resetLocalData() async {
        do {
            try await store.reset()
            document = .sample
            message = "Local Life Atlas reset."
        } catch { message = error.localizedDescription }
    }

    private func mutate(_ operation: (inout AtlasDocument) throws -> Void) async {
        do {
            var next = document
            try operation(&next)
            try await store.save(next)
            document = next
        } catch { message = error.localizedDescription }
    }
}

struct VisibilityRequest: Identifiable, Equatable {
    enum Kind { case commitment, hobby }
    var kind: Kind
    var id: UUID
    var title: String
    var current: SignificantHobbiesCore.Visibility
}
