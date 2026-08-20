import AuthenticationServices
import Foundation
import Observation
import SignificantHobbiesCore

@MainActor
@Observable
final class AppModel {
    private(set) var document = AtlasDocument()
    var selectedDate = Date.now
    var isLoading = true
    private(set) var isDataAvailable = false
    var isSettingsPresented = false
    var message: String?
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
    }

    func load() async {
        defer { isLoading = false }
        do {
            document = ProcessInfo.processInfo.arguments.contains("--fresh-demo") ? .sample : try await store.load()
            isDataAvailable = true
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
            document = AtlasDocument()
            isDataAvailable = false
            message = error.localizedDescription
        }
    }

    @discardableResult
    func saveDaily(_ entry: DailyEntry, announceSuccess: Bool = true) async -> Bool {
        guard await mutate({ $0.saveDaily(entry) }) else { return false }
        if announceSuccess {
            message = "Private Journal entry saved on this device."
        }
        return true
    }

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
            isDataAvailable = true
            self.importPreview = nil
            isImportConfirmationPresented = false
            message = "Compatible archive replaced."
            requestSyncAfterLocalChange()
        } catch { message = error.localizedDescription }
    }

    func clearJournalWriting() async {
        do {
            var next = document
            next.clearJournalWriting()
            try await store.replace(with: next)
            document = next
            message = account == nil
                ? "Journal writing cleared from this device."
                : "Journal writing cleared from this device and synced archive."
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
                accountMessage = "Apple sign-in added to this Journal account."
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
            accountMessage = "Your private account copy is now on this device."
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
        accountMessage = "Signed out. Your Journal archive remains on this device."
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
            accountMessage = "Account and private cloud copy deleted. Your exported or local archive remains yours."
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
        accountMessage = "Your private archive is up to date."
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
            return native.errorDescription ?? "Journal account service is unavailable."
        }
        return "Journal could not complete that account action. Try again."
    }

    @discardableResult
    private func mutate(_ operation: (inout AtlasDocument) throws -> Void) async -> Bool {
        do {
            var next = document
            try operation(&next)
            try await store.save(next)
            document = next
            requestSyncAfterLocalChange()
            return true
        } catch {
            message = error.localizedDescription
            return false
        }
    }
}
