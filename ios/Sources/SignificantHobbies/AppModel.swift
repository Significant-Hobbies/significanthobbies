import AuthenticationServices
import Foundation
import Observation
import PersonalSyncKit
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
    let account: PersonalAccountModel?
    private(set) var isAccountDemo = false
    var accountMessage: String?
    private(set) var forceJournalOnboarding = false

    private let store: AtlasStore
    private let platform: PersonalPlatformConnection?

    init(
        store: AtlasStore = AtlasStore(),
        platform: PersonalPlatformConnection? = AppModel.makePlatformConnection()
    ) {
        self.store = store
        let activePlatform = Self.isAutomatedLaunch ? nil : platform
        self.platform = activePlatform
        account = activePlatform.map {
            PersonalAccountModel(identity: $0.identity, callbackScheme: "significanthobbies")
        }
    }

    var isAccountConnected: Bool { isAccountDemo || account?.isSignedIn == true }
    var isAccountBusy: Bool { account?.isConnecting == true }
    var accountName: String { isAccountDemo ? "Sarthak" : "Significant Hobbies account" }
    var accountEmail: String? {
        isAccountDemo ? "sarthak@example.com" : account?.session?.email
    }
    var hasAppleAccount: Bool {
        isAccountDemo || account?.session?.appleSubject != nil
    }

    func load() async {
        defer { isLoading = false }
        do {
            let arguments = ProcessInfo.processInfo.arguments
            if arguments.contains("--reset-onboarding") {
                JournalOnboardingPreferences.reset()
            }
            if arguments.contains("--onboarding-demo") {
                document = AtlasDocument()
                forceJournalOnboarding = true
            } else {
                document = arguments.contains("--fresh-demo") ? .sample : try await store.load()
            }
            isDataAvailable = true
            if arguments.contains("--daily-demo") { selectedDate = .now }
            if arguments.contains("--account-demo") {
                isAccountDemo = true
                document.syncState = .synced
                document.lastSyncedAt = Date().addingTimeInterval(-240)
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

    func shouldPresentJournalOnboarding(completed: Bool) -> Bool {
        JournalOnboardingPolicy.shouldPresent(
            completed: completed,
            entries: document.dailyEntries,
            forced: forceJournalOnboarding
        )
    }

    @discardableResult
    func saveDaily(_ entry: DailyEntry, announceSuccess: Bool = true) async -> Bool {
        guard await mutate({ $0.saveDaily(entry) }) else { return false }
        enqueueJournal(entry)
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
            let previous = document
            try await store.replace(with: importPreview)
            document = importPreview
            isDataAvailable = true
            self.importPreview = nil
            isImportConfirmationPresented = false
            message = "Compatible archive replaced."
            await enqueueJournalChanges(from: previous, to: importPreview)
        } catch { message = error.localizedDescription }
    }

    func clearJournalWriting() async {
        do {
            let previous = document
            var next = document
            next.clearJournalWriting()
            try await store.replace(with: next)
            document = next
            message = !isAccountConnected
                ? "Journal writing cleared from this device."
                : "Journal writing cleared from this device and synced archive."
            await enqueueJournalChanges(from: previous, to: next)
        } catch { message = error.localizedDescription }
    }

    func connectAccount() async {
        accountMessage = nil
        guard let account else { return }
        await account.connectWithGoogle()
        if account.isSignedIn {
            await syncWithPlatform()
        } else {
            accountMessage = account.errorMessage
        }
    }

    func completeAppleSignIn(_ result: Result<ASAuthorization, Error>) async {
        accountMessage = nil
        guard let account else { return }
        await account.completeApple(result)
        if account.isSignedIn {
            await syncWithPlatform()
        } else {
            accountMessage = account.errorMessage
        }
    }

    func syncNow() async {
        guard isAccountConnected else { return }
        await syncWithPlatform(announcing: true)
    }

    func signOut() async {
        await account?.signOut()
        document.syncState = .localOnly
        try? await store.save(document)
        accountMessage = "Signed out. Your Journal archive remains on this device."
    }

    func deleteJournalCloudData() async {
        guard isAccountConnected, let platform else { return }
        accountMessage = nil
        guard await syncWithPlatform() else {
            accountMessage = "Journal cloud data could not be loaded. Nothing was deleted."
            return
        }
        do {
            for entry in document.dailyEntries {
                try await platform.sync.enqueue(
                    recordId: JournalPlatformRecord.recordId(entry),
                    operation: .delete,
                    occurredAt: JournalPlatformRecord.iso(.now)
                )
            }
            _ = try await platform.sync.synchronize()
            await account?.signOut()
            document.syncState = .localOnly
            try await store.save(document)
            accountMessage = "Journal cloud data deleted. Your local archive and shared account remain intact."
        } catch {
            accountMessage = friendlyMessage(for: error)
        }
    }

    private func restoreAccount() async {
        guard let account else { return }
        await account.restore()
        if account.isSignedIn {
            await syncWithPlatform()
        } else if let error = account.errorMessage {
            document.syncState = .localOnly
            accountMessage = error
        }
    }

    private func markSynced() async {
        document.syncState = .synced
        document.lastSyncedAt = .now
        try? await store.save(document)
        accountMessage = "Journal is up to date."
    }

    private func enqueueJournal(_ entry: DailyEntry) {
        guard isAccountConnected, let platform else { return }
        let payload = JournalPlatformRecord.encode(entry)
        let recordId = JournalPlatformRecord.recordId(entry)
        Task {
            document.syncState = .pending
            try? await store.save(document)
            do {
                try await platform.sync.enqueue(
                    recordId: recordId,
                    occurredAt: JournalPlatformRecord.iso(entry.date),
                    record: payload
                )
                await syncWithPlatform()
            } catch {
                document.syncState = .failed
                try? await store.save(document)
            }
        }
    }

    @discardableResult
    private func syncWithPlatform(announcing: Bool = false) async -> Bool {
        guard isAccountConnected, let platform else { return false }
        document.syncState = .pending
        try? await store.save(document)
        do {
            for entry in document.dailyEntries {
                try await platform.sync.enqueue(
                    recordId: JournalPlatformRecord.recordId(entry),
                    occurredAt: JournalPlatformRecord.iso(entry.date),
                    record: JournalPlatformRecord.encode(entry)
                )
            }
            let changes = try await platform.sync.synchronize()
            var next = document
            for change in changes {
                if change.operation == .delete {
                    guard let sourceId = JournalPlatformRecord.sourceId(change) else { continue }
                    next.dailyEntries.removeAll { $0.id == sourceId }
                } else if let entry = JournalPlatformRecord.decode(change) {
                    next.saveDaily(entry)
                }
            }
            if next != document {
                try await store.save(next)
                document = next
            }
            await markSynced()
            if announcing { accountMessage = "Journal is up to date." }
            return true
        } catch {
            document.syncState = .failed
            try? await store.save(document)
            if announcing { accountMessage = "Journal sync will retry when you are online." }
            return false
        }
    }

    private func enqueueJournalChanges(from previous: AtlasDocument, to next: AtlasDocument) async {
        guard isAccountConnected, let platform else { return }
        let previousEntries = Dictionary(uniqueKeysWithValues: previous.dailyEntries.map { ($0.id, $0) })
        let nextEntries = Dictionary(uniqueKeysWithValues: next.dailyEntries.map { ($0.id, $0) })
        do {
            for removedId in previousEntries.keys where nextEntries[removedId] == nil {
                try await platform.sync.enqueue(
                    recordId: JournalPlatformRecord.recordId(removedId),
                    operation: .delete,
                    occurredAt: JournalPlatformRecord.iso(.now)
                )
            }
            for entry in next.dailyEntries where previousEntries[entry.id] != entry {
                try await platform.sync.enqueue(
                    recordId: JournalPlatformRecord.recordId(entry),
                    occurredAt: JournalPlatformRecord.iso(entry.date),
                    record: JournalPlatformRecord.encode(entry)
                )
            }
            await syncWithPlatform()
        } catch {
            document.syncState = .failed
            try? await store.save(document)
        }
    }

    private func friendlyMessage(for error: Error) -> String {
        if let identity = error as? PersonalIdentityError {
            return identity.errorDescription ?? "Journal account service is unavailable."
        }
        return "Journal could not complete that account action. Try again."
    }

    private static var isAutomatedLaunch: Bool {
        ProcessInfo.processInfo.environment["XCTestConfigurationFilePath"] != nil
            || ProcessInfo.processInfo.arguments.contains("--fresh-demo")
    }

    private static func makePlatformConnection() -> PersonalPlatformConnection? {
        let defaults = UserDefaults.standard
        let key = "personal-platform-device-id"
        let deviceId = defaults.string(forKey: key) ?? UUID().uuidString.lowercased()
        defaults.set(deviceId, forKey: key)
        let supportDirectory = FileManager.default.urls(
            for: .applicationSupportDirectory,
            in: .userDomainMask
        )[0].appending(path: "SignificantHobbies", directoryHint: .isDirectory)
        return try? PersonalPlatformConnection(
            domain: .journal,
            keychainService: "com.significanthobbies.app.session",
            supportDirectory: supportDirectory,
            deviceId: deviceId
        )
    }

    @discardableResult
    private func mutate(_ operation: (inout AtlasDocument) throws -> Void) async -> Bool {
        do {
            var next = document
            try operation(&next)
            try await store.save(next)
            document = next
            return true
        } catch {
            message = error.localizedDescription
            return false
        }
    }
}
