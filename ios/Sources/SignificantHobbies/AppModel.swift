import AuthenticationServices
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
    var account: SignificantHobbiesAccount?
    var isAccountBusy = false
    var cloudConflict: AtlasCloudSnapshot?
    var accountMessage: String?

    private let store: AtlasStore
    private let accountClient: SignificantHobbiesNativeAccountClient
    private let webAuthenticator: SignificantHobbiesWebAuthenticator
    private var remoteRevision: Int?
    private var syncRequested = false
    private var isSyncing = false
    private var deferredConflict: AtlasCloudSnapshot?

    init(
        store: AtlasStore = AtlasStore(),
        accountClient: SignificantHobbiesNativeAccountClient = SignificantHobbiesNativeAccountClient(),
        webAuthenticator: SignificantHobbiesWebAuthenticator = SignificantHobbiesWebAuthenticator()
    ) {
        self.store = store
        self.accountClient = accountClient
        self.webAuthenticator = webAuthenticator
        if ProcessInfo.processInfo.arguments.contains("--daily-demo") { selectedTab = 1 }
        if ProcessInfo.processInfo.arguments.contains("--history-demo") { selectedTab = 2 }
    }

    func load() async {
        defer { isLoading = false }
        do {
            document = ProcessInfo.processInfo.arguments.contains("--fresh-demo") ? .sample : try await store.load()
            if ProcessInfo.processInfo.arguments.contains("--daily-demo") { selectedDate = .now }
            if ProcessInfo.processInfo.arguments.contains("--account-demo") {
                account = SignificantHobbiesAccount(
                    name: "Sarthak",
                    email: "sarthak@example.com",
                    providers: ["google"]
                )
                document.syncState = .synced
                document.lastSyncedAt = Date().addingTimeInterval(-240)
                isSettingsPresented = true
            } else if ProcessInfo.processInfo.arguments.contains("--account-conflict-demo") {
                account = SignificantHobbiesAccount(
                    name: "Sarthak",
                    email: "sarthak@example.com",
                    providers: ["google"]
                )
                document.syncState = .conflict
                var accountDocument = document
                accountDocument.hobbies.append(Hobby(name: "Ceramics", category: "Make"))
                cloudConflict = AtlasCloudSnapshot(
                    document: AtlasCloudDocument(document: accountDocument),
                    revision: 3
                )
                isSettingsPresented = true
            } else {
                await restoreAccount()
            }
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
            requestSyncAfterLocalChange()
        } catch { message = error.localizedDescription }
    }

    func resetLocalData() async {
        do {
            try await store.reset()
            document = .sample
            message = "Local Life Atlas reset."
            requestSyncAfterLocalChange()
        } catch { message = error.localizedDescription }
    }

    func connectAccount() async {
        isAccountBusy = true
        accountMessage = nil
        defer { isAccountBusy = false }
        do {
            let url = await accountClient.googleStartURL
            let code = try await webAuthenticator.authenticate(at: url)
            account = try await accountClient.exchangeHandoff(code)
            try await reconcileAccountCopy()
        } catch let error as NSError
            where error.domain == ASWebAuthenticationSessionErrorDomain && error.code == 1 {
            accountMessage = nil
        } catch {
            accountMessage = friendlyMessage(for: error)
        }
    }

    func completeAppleSignIn(_ payload: AppleIdentityPayload) async {
        isAccountBusy = true
        accountMessage = nil
        defer { isAccountBusy = false }
        do {
            if let account, !account.hasApple {
                self.account = try await accountClient.linkApple(payload)
                accountMessage = "Apple sign-in added to this Significant Hobbies account."
            } else {
                account = try await accountClient.signInWithApple(payload)
            }
            try await reconcileAccountCopy()
        } catch {
            accountMessage = friendlyMessage(for: error)
        }
    }

    func syncNow() async {
        guard account != nil else { return }
        if let deferredConflict {
            self.deferredConflict = nil
            cloudConflict = deferredConflict
            return
        }
        await queueSync()
    }

    func keepDeviceCopy() async {
        guard let conflict = cloudConflict else { return }
        cloudConflict = nil
        deferredConflict = nil
        remoteRevision = conflict.revision
        await queueSync()
    }

    func useAccountCopy() async {
        guard let conflict = cloudConflict else { return }
        do {
            let restored = conflict.document.localDocument()
            try await store.replace(with: restored)
            document = restored
            remoteRevision = conflict.revision
            cloudConflict = nil
            deferredConflict = nil
            accountMessage = "Your private account copy is now on this iPhone."
        } catch {
            accountMessage = friendlyMessage(for: error)
        }
    }

    func decideConflictLater() {
        deferredConflict = cloudConflict
        cloudConflict = nil
        document.syncState = .conflict
        Task { try? await store.save(document) }
    }

    func signOut() async {
        await accountClient.signOut()
        account = nil
        remoteRevision = nil
        cloudConflict = nil
        deferredConflict = nil
        document.syncState = .localOnly
        try? await store.save(document)
        accountMessage = "Signed out. Your Life Atlas remains on this iPhone."
    }

    func deleteAccount() async {
        isAccountBusy = true
        defer { isAccountBusy = false }
        do {
            try await accountClient.deleteAccount()
            account = nil
            remoteRevision = nil
            cloudConflict = nil
            deferredConflict = nil
            document.syncState = .localOnly
            try await store.save(document)
            accountMessage = "Account and private cloud copy deleted. Your exported or local Atlas remains yours."
        } catch {
            accountMessage = friendlyMessage(for: error)
        }
    }

    private func restoreAccount() async {
        do {
            account = try await accountClient.restoreAccount()
            if account != nil { try await reconcileAccountCopy() }
        } catch {
            account = nil
            document.syncState = .localOnly
            accountMessage = friendlyMessage(for: error)
        }
    }

    private func reconcileAccountCopy() async throws {
        let remote = try await accountClient.fetchState()
        guard let remote else {
            let saved = try await accountClient.pushState(
                AtlasCloudDocument(document: document),
                baseRevision: nil
            )
            remoteRevision = saved.revision
            await markSynced()
            return
        }
        remoteRevision = remote.revision
        if remote.document == AtlasCloudDocument(document: document) {
            await markSynced()
        } else {
            document.syncState = .conflict
            try await store.save(document)
            cloudConflict = remote
        }
    }

    private func queueSync() async {
        syncRequested = true
        guard !isSyncing, deferredConflict == nil, cloudConflict == nil else { return }
        isSyncing = true
        defer { isSyncing = false }
        while syncRequested {
            syncRequested = false
            document.syncState = .pending
            try? await store.save(document)
            do {
                let saved = try await accountClient.pushState(
                    AtlasCloudDocument(document: document),
                    baseRevision: remoteRevision
                )
                remoteRevision = saved.revision
                await markSynced()
            } catch let NativeAccountError.conflict(conflict) {
                document.syncState = .conflict
                try? await store.save(document)
                cloudConflict = conflict
                return
            } catch {
                document.syncState = .failed
                try? await store.save(document)
                accountMessage = friendlyMessage(for: error)
                return
            }
        }
    }

    private func markSynced() async {
        document.syncState = .synced
        document.lastSyncedAt = .now
        try? await store.save(document)
        accountMessage = "Your private Life Atlas is up to date."
    }

    private func requestSyncAfterLocalChange() {
        guard account != nil, deferredConflict == nil, cloudConflict == nil else { return }
        document.syncState = .pending
        Task {
            try? await store.save(document)
            await queueSync()
        }
    }

    private func friendlyMessage(for error: Error) -> String {
        if let native = error as? NativeAccountError {
            return native.errorDescription ?? "Significant Hobbies account service is unavailable."
        }
        return "Significant Hobbies could not complete that account action. Try again."
    }

    private func mutate(_ operation: (inout AtlasDocument) throws -> Void) async {
        do {
            var next = document
            try operation(&next)
            try await store.save(next)
            document = next
            requestSyncAfterLocalChange()
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
