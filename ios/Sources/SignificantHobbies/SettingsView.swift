import AuthenticationServices
import SignificantHobbiesCore
import SwiftUI
import UniformTypeIdentifiers

struct SettingsView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.colorScheme) private var colorScheme
    @Environment(\.dismiss) private var dismiss
    @State private var isImporterPresented = false
    @State private var showReset = false
    @State private var showDeleteCloudData = false

    var body: some View {
        @Bindable var model = model
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    settingsSection("Account & sync") {
                        HStack(spacing: 12) {
                            Image(systemName: model.isAccountConnected ? "person.crop.circle.fill" : "iphone.gen3")
                                .font(.title2)
                                .frame(width: 46, height: 46)
                                .background(model.isAccountConnected ? AtlasPalette.sage : AtlasPalette.sky)
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                            VStack(alignment: .leading, spacing: 3) {
                                Text(model.isAccountConnected ? model.accountName : "Private on this device").font(.headline)
                                Text(model.accountEmail ?? "Journal works offline.")
                                    .font(.subheadline).foregroundStyle(AtlasPalette.quietInk)
                            }
                            Spacer()
                            Text(syncLabel(model.document.syncState).uppercased())
                                .font(.caption2.weight(.black))
                                .foregroundStyle(AtlasPalette.quietInk)
                        }
                        Text("Journal stays immediate on this device and syncs its typed entries through your shared Significant Hobbies account.")
                            .font(.subheadline).foregroundStyle(AtlasPalette.quietInk)
                        if model.isAccountBusy {
                            HStack(spacing: 10) {
                                ProgressView()
                                Text("Contacting Journal…")
                            }
                            .frame(maxWidth: .infinity, minHeight: 48)
                        } else if !model.isAccountConnected {
                            appleAccountButton
                            Button { Task { await model.connectAccount() } } label: {
                                Label("Continue with Google", systemImage: "person.crop.circle.badge.plus")
                            }
                            .buttonStyle(AtlasPrimaryButtonStyle())
                        } else {
                            if let lastSync = model.document.lastSyncedAt {
                                LabeledContent("Last synced") {
                                    Text(lastSync, style: .relative).foregroundStyle(AtlasPalette.quietInk)
                                }
                            }
                            Button { Task { await model.syncNow() } } label: {
                                Label("Sync compatible archive", systemImage: "arrow.triangle.2.circlepath")
                            }
                            .buttonStyle(AtlasPrimaryButtonStyle())
                            if !model.hasAppleAccount {
                                Text("Add Apple to this shared account so future Apple sign-ins open the same Journal data.")
                                    .font(.footnote)
                                    .foregroundStyle(AtlasPalette.quietInk)
                                appleAccountButton
                            }
                            Button { Task { await model.signOut() } } label: {
                                Label("Sign out", systemImage: "rectangle.portrait.and.arrow.right")
                                    .frame(maxWidth: .infinity, minHeight: 48, alignment: .leading)
                            }
                            Button(role: .destructive) { showDeleteCloudData = true } label: {
                                Label("Delete Journal cloud data", systemImage: "person.crop.circle.badge.minus")
                                    .frame(maxWidth: .infinity, minHeight: 48, alignment: .leading)
                            }
                        }
                        if let accountMessage = model.accountMessage {
                            Text(accountMessage)
                                .font(.footnote)
                                .foregroundStyle(AtlasPalette.quietInk)
                                .accessibilityLabel("Account status: \(accountMessage)")
                        }
                    }
                    settingsSection("Your data") {
                        ShareLink(item: AtlasExportPayload(document: model.document), preview: SharePreview("Compatible archive")) {
                            Label("Export compatible archive", systemImage: "square.and.arrow.up").frame(maxWidth: .infinity, alignment: .leading)
                        }
                        .frame(minHeight: 48)
                        Text("The archive keeps Journal writing plus preserved pre-split Live and Habits records so nothing is stranded.")
                            .font(.caption)
                            .foregroundStyle(AtlasPalette.quietInk)
                        Button { isImporterPresented = true } label: {
                            Label("Preview an import", systemImage: "doc.badge.plus").frame(maxWidth: .infinity, alignment: .leading)
                        }
                        .frame(minHeight: 48)
                        Button(role: .destructive) { showReset = true } label: {
                            Label(resetButtonTitle, systemImage: "trash").frame(maxWidth: .infinity, alignment: .leading)
                        }
                        .frame(minHeight: 48)
                    }
                    settingsSection("Privacy") {
                        Label("Journal entries: always private", systemImage: "lock.fill").font(.headline).frame(minHeight: 44)
                        Text("Journal has no public profile, social feed, or publishing control.")
                            .font(.subheadline).foregroundStyle(AtlasPalette.quietInk)
                    }
                    settingsSection("About") {
                        LabeledContent("Version", value: "1.0.0 (3)")
                        Link("Privacy", destination: URL(string: "https://journal.significanthobbies.com/privacy/")!).frame(minHeight: 44)
                        Link("Support", destination: URL(string: "https://journal.significanthobbies.com/support/")!).frame(minHeight: 44)
                    }
                }
                .padding(18)
                .frame(maxWidth: 720, alignment: .leading)
                .frame(maxWidth: .infinity)
            }
            .atlasBackground()
            .navigationTitle("You")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Done") { dismiss() } }
            }
        }
        .fileImporter(isPresented: $isImporterPresented, allowedContentTypes: [.json]) { result in
            guard case let .success(url) = result else { return }
            let accessed = url.startAccessingSecurityScopedResource()
            defer { if accessed { url.stopAccessingSecurityScopedResource() } }
            if let data = try? Data(contentsOf: url) { Task { await model.prepareImport(data) } }
        }
        .alert("Replace your compatible archive?", isPresented: $model.isImportConfirmationPresented) {
            Button("Replace", role: .destructive) { Task { await model.confirmImport() } }
            Button("Cancel", role: .cancel) { model.importPreview = nil }
        } message: {
            Text("The import contains \(model.importPreview?.dailyEntries.count ?? 0) Journal entries. Preserved split-product data stays in the archive.")
        }
        .confirmationDialog(resetDialogTitle, isPresented: $showReset) {
            Button("Clear Journal writing", role: .destructive) { Task { await model.clearJournalWriting() } }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text(resetDialogMessage)
        }
        .confirmationDialog(
            "Delete Journal data from the cloud?",
            isPresented: $showDeleteCloudData
        ) {
            Button("Delete Journal cloud data", role: .destructive) {
                Task { await model.deleteJournalCloudData() }
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("The shared account and this device archive remain intact. Sign in again later to create a fresh Journal cloud copy.")
        }
    }

    private var resetButtonTitle: String {
        !model.isAccountConnected ? "Clear Journal writing on this device" : "Clear synced Journal writing"
    }

    private var resetDialogTitle: String {
        !model.isAccountConnected ? "Clear Journal writing on this device?" : "Clear Journal writing everywhere?"
    }

    private var resetDialogMessage: String {
        !model.isAccountConnected
            ? "This clears Journal writing from this device while preserving compatible Live and Habits records."
            : "This clears Journal writing from this device and pushes the change to your synced archive. Compatible Live and Habits records are preserved."
    }

    private var appleAccountButton: some View {
        SignInWithAppleButton(.continue) { request in
            model.account?.prepareApple(request)
        } onCompletion: { result in
            Task { await model.completeAppleSignIn(result) }
        }
        .signInWithAppleButtonStyle(colorScheme == .dark ? .white : .black)
        .frame(maxWidth: .infinity, minHeight: 48)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .accessibilityIdentifier("apple-account-button")
        .disabled(model.isAccountBusy)
    }

    private func settingsSection<Content: View>(_ title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 9) {
            AtlasLabel(text: title)
            VStack(alignment: .leading, spacing: 10) { content() }
                .padding(15).background(AtlasPalette.paper).clipShape(RoundedRectangle(cornerRadius: 14))
                .overlay { RoundedRectangle(cornerRadius: 14).stroke(AtlasPalette.contour) }
        }
    }

    private func syncLabel(_ state: SyncState) -> String {
        switch state {
        case .localOnly: "On device"
        case .pending: "Syncing"
        case .synced: "Synced"
        case .conflict: "Decision needed"
        case .failed: "Retry needed"
        }
    }
}

private struct AtlasExportPayload: Transferable {
    let document: AtlasDocument

    static var transferRepresentation: some TransferRepresentation {
        DataRepresentation(exportedContentType: .json) { payload in
            let encoder = JSONEncoder()
            encoder.dateEncodingStrategy = .iso8601
            encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
            return try encoder.encode(payload.document)
        }
    }
}
