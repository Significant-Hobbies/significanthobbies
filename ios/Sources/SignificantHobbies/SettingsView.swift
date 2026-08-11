import AuthenticationServices
import SignificantHobbiesCore
import SwiftUI
import UniformTypeIdentifiers

struct SettingsView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.colorScheme) private var colorScheme
    @Environment(\.dismiss) private var dismiss
    @State private var isProfileEditorPresented = false
    @State private var isImporterPresented = false
    @State private var showReset = false
    @State private var showDeleteAccount = false
    @State private var appleNonce = AppleNonce.make()

    var body: some View {
        @Bindable var model = model
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    publicPreview
                    settingsSection("Account & sync") {
                        HStack(spacing: 12) {
                            Image(systemName: model.account == nil ? "iphone.gen3" : "person.crop.circle.fill")
                                .font(.title2)
                                .frame(width: 46, height: 46)
                                .background(model.account == nil ? AtlasPalette.sky : AtlasPalette.sage)
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                            VStack(alignment: .leading, spacing: 3) {
                                Text(model.account?.name ?? "Private on this iPhone").font(.headline)
                                Text(model.account?.email ?? "Every Life Atlas tool works offline.")
                                    .font(.subheadline).foregroundStyle(AtlasPalette.quietInk)
                            }
                            Spacer()
                            Text(syncLabel(model.document.syncState).uppercased())
                                .font(.caption2.weight(.black))
                                .foregroundStyle(AtlasPalette.quietInk)
                        }
                        Text("Account sync keeps one private copy of Daily and Living. It never publishes a journal or silently changes an item's visibility.")
                            .font(.subheadline).foregroundStyle(AtlasPalette.quietInk)
                        if model.isAccountBusy {
                            HStack(spacing: 10) {
                                ProgressView()
                                Text("Contacting Significant Hobbies…")
                            }
                            .frame(maxWidth: .infinity, minHeight: 48)
                        } else if model.account == nil {
                            Button { Task { await model.connectAccount() } } label: {
                                Label("Connect Google account", systemImage: "person.crop.circle.badge.plus")
                            }
                            .buttonStyle(AtlasPrimaryButtonStyle())
                            appleAccountButton
                        } else {
                            if let lastSync = model.document.lastSyncedAt {
                                LabeledContent("Last synced") {
                                    Text(lastSync, style: .relative).foregroundStyle(AtlasPalette.quietInk)
                                }
                            }
                            Button { Task { await model.syncNow() } } label: {
                                Label("Sync private Life Atlas", systemImage: "arrow.triangle.2.circlepath")
                            }
                            .buttonStyle(AtlasPrimaryButtonStyle())
                            if model.account?.hasApple == false {
                                Text("Add Apple to this account so future Apple sign-ins open the same private Life Atlas.")
                                    .font(.footnote)
                                    .foregroundStyle(AtlasPalette.quietInk)
                                appleAccountButton
                            }
                            Button { Task { await model.signOut() } } label: {
                                Label("Sign out", systemImage: "rectangle.portrait.and.arrow.right")
                                    .frame(maxWidth: .infinity, minHeight: 48, alignment: .leading)
                            }
                            Button(role: .destructive) { showDeleteAccount = true } label: {
                                Label("Delete account and cloud copy", systemImage: "person.crop.circle.badge.minus")
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
                    settingsSection("Soundtrack") {
                        Menu {
                            ForEach(["Here Comes the Sun", "Lovely Day", "Send Me On My Way", "None"], id: \.self) { track in
                                Button(track) {
                                    var profile = model.document.profile
                                    profile.soundtrack = track == "None" ? nil : track
                                    Task { await model.updateProfile(profile) }
                                }
                            }
                        } label: {
                            HStack {
                                Label(model.document.profile.soundtrack ?? "No soundtrack", systemImage: "music.note")
                                Spacer(); Image(systemName: "chevron.up.chevron.down")
                            }
                            .frame(minHeight: 48)
                        }
                        Text("A preference only. Significant Hobbies does not stream or download music.").font(.caption).foregroundStyle(AtlasPalette.quietInk)
                    }
                    settingsSection("Your data") {
                        ShareLink(item: AtlasExportPayload(document: model.document), preview: SharePreview("Life Atlas")) {
                            Label("Export Life Atlas", systemImage: "square.and.arrow.up").frame(maxWidth: .infinity, alignment: .leading)
                        }
                        .frame(minHeight: 48)
                        Button { isImporterPresented = true } label: {
                            Label("Preview an import", systemImage: "doc.badge.plus").frame(maxWidth: .infinity, alignment: .leading)
                        }
                        .frame(minHeight: 48)
                        Button(role: .destructive) { showReset = true } label: {
                            Label("Reset local Life Atlas", systemImage: "trash").frame(maxWidth: .infinity, alignment: .leading)
                        }
                        .frame(minHeight: 48)
                    }
                    settingsSection("Privacy") {
                        Label("Daily journal: always private", systemImage: "lock.fill").font(.headline).frame(minHeight: 44)
                        Text("Hobbies and commitments begin private. Only the item whose Public control you explicitly confirm becomes publication-eligible.")
                            .font(.subheadline).foregroundStyle(AtlasPalette.quietInk)
                    }
                    settingsSection("About") {
                        LabeledContent("Version", value: "1.0.0 (1)")
                        Link("Privacy", destination: URL(string: "https://significanthobbies.com/privacy")!).frame(minHeight: 44)
                        Link("Support", destination: URL(string: "https://significanthobbies.com")!).frame(minHeight: 44)
                    }
                }
                .padding(18)
            }
            .atlasBackground()
            .navigationTitle("You")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Done") { dismiss() } }
            }
        }
        .sheet(isPresented: $isProfileEditorPresented) { ProfileEditorView() }
        .fileImporter(isPresented: $isImporterPresented, allowedContentTypes: [.json]) { result in
            guard case let .success(url) = result else { return }
            let accessed = url.startAccessingSecurityScopedResource()
            defer { if accessed { url.stopAccessingSecurityScopedResource() } }
            if let data = try? Data(contentsOf: url) { Task { await model.prepareImport(data) } }
        }
        .alert("Replace your Life Atlas?", isPresented: $model.isImportConfirmationPresented) {
            Button("Replace", role: .destructive) { Task { await model.confirmImport() } }
            Button("Cancel", role: .cancel) { model.importPreview = nil }
        } message: {
            Text("The import contains \(model.importPreview?.dailyEntries.count ?? 0) Daily entries and \(model.importPreview?.hobbies.count ?? 0) hobbies.")
        }
        .confirmationDialog("Reset local Significant Hobbies data?", isPresented: $showReset) {
            Button("Reset Life Atlas", role: .destructive) { Task { await model.resetLocalData() } }
            Button("Cancel", role: .cancel) {}
        }
        .confirmationDialog(
            "Delete your account and private cloud Life Atlas?",
            isPresented: $showDeleteAccount
        ) {
            Button("Delete account", role: .destructive) { Task { await model.deleteAccount() } }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("Export your Life Atlas first if you want a recovery copy. The copy already on this iPhone remains local, but account deletion cannot be undone.")
        }
        .sheet(item: $model.cloudConflict) { conflict in
            NavigationStack {
                VStack(alignment: .leading, spacing: 22) {
                    ZStack {
                        RoundedRectangle(cornerRadius: 18).fill(AtlasPalette.lilac)
                        Image(systemName: "arrow.triangle.branch")
                            .font(.system(size: 34, weight: .bold))
                            .foregroundStyle(AtlasPalette.ink)
                    }
                    .frame(width: 68, height: 68)
                    Text("Choose the Life Atlas to keep")
                        .font(.system(.title2, design: .serif, weight: .semibold))
                    Text("This iPhone and your private account changed separately. Nothing is replaced or published until you decide.")
                        .foregroundStyle(AtlasPalette.quietInk)
                    atlasSummary("This iPhone", document: model.document)
                    atlasSummary("Account copy", document: conflict.document.localDocument())
                    Button("Keep this iPhone’s copy") { Task { await model.keepDeviceCopy() } }
                        .buttonStyle(AtlasPrimaryButtonStyle())
                    Button("Use the account copy") { Task { await model.useAccountCopy() } }
                        .buttonStyle(.bordered)
                        .controlSize(.large)
                        .frame(maxWidth: .infinity)
                    Button("Decide later") { model.decideConflictLater() }
                        .frame(maxWidth: .infinity, minHeight: 44)
                    Spacer()
                }
                .padding(24)
                .atlasBackground()
                .navigationTitle("Sync decision")
                .navigationBarTitleDisplayMode(.inline)
            }
            .interactiveDismissDisabled()
        }
    }

    private var appleAccountButton: some View {
        SignInWithAppleButton(.continue) { request in
            appleNonce = AppleNonce.make()
            request.requestedScopes = [.fullName, .email]
            request.nonce = AppleNonce.digest(appleNonce)
        } onCompletion: { result in
            guard
                case let .success(authorization) = result,
                let credential = authorization.credential as? ASAuthorizationAppleIDCredential,
                let tokenData = credential.identityToken,
                let token = String(data: tokenData, encoding: .utf8)
            else {
                if case let .failure(error) = result,
                   (error as? ASAuthorizationError)?.code != .canceled {
                    model.accountMessage = error.localizedDescription
                }
                return
            }
            let payload = AppleIdentityPayload(
                identityToken: token,
                nonce: appleNonce,
                email: credential.email,
                firstName: credential.fullName?.givenName,
                lastName: credential.fullName?.familyName
            )
            Task { await model.completeAppleSignIn(payload) }
        }
        .signInWithAppleButtonStyle(colorScheme == .dark ? .white : .black)
        .frame(maxWidth: .infinity, minHeight: 48)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .accessibilityIdentifier("apple-account-button")
        .disabled(model.isAccountBusy)
    }

    private var publicPreview: some View {
        VStack(alignment: .leading, spacing: 13) {
            HStack {
                SHMark(size: 48)
                VStack(alignment: .leading) {
                    Text(model.document.profile.displayName.isEmpty ? "Your profile" : model.document.profile.displayName)
                        .font(.system(.title2, design: .serif, weight: .semibold))
                    Text(model.document.profile.publicProfileEnabled ? "Public profile on" : "Public profile off")
                        .font(.caption.weight(.bold)).foregroundStyle(AtlasPalette.quietInk)
                }
                Spacer()
                Button("Edit") { isProfileEditorPresented = true }.font(.subheadline.weight(.bold)).frame(minHeight: 44)
            }
            Text(model.document.profile.bio.isEmpty ? "Add a short public-profile introduction." : model.document.profile.bio)
                .font(.subheadline).foregroundStyle(AtlasPalette.quietInk)
            let publicCount = model.document.hobbies.count { $0.visibility == .publicProfile } + model.document.commitments.count { $0.visibility == .publicProfile }
            Text("\(publicCount) Living items eligible · 0 Daily entries eligible")
                .font(.caption.weight(.bold))
                .padding(.horizontal, 10).padding(.vertical, 7)
                .background(AtlasPalette.gold.opacity(0.5))
                .clipShape(Capsule())
        }
        .padding(17)
        .background(AtlasPalette.sky.opacity(0.45))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private func settingsSection<Content: View>(_ title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 9) {
            AtlasLabel(text: title)
            VStack(alignment: .leading, spacing: 10) { content() }
                .padding(15).background(AtlasPalette.paper).clipShape(RoundedRectangle(cornerRadius: 14))
                .overlay { RoundedRectangle(cornerRadius: 14).stroke(AtlasPalette.contour) }
        }
    }

    private func atlasSummary(_ title: String, document: AtlasDocument) -> some View {
        VStack(alignment: .leading, spacing: 5) {
            Text(title).font(.headline)
            Text(
                "\(countLabel(document.dailyEntries.count, singular: "Daily entry", plural: "Daily entries")) · " +
                    "\(countLabel(document.hobbies.count, singular: "hobby", plural: "hobbies")) · " +
                    "\(countLabel(document.commitments.count, singular: "commitment", plural: "commitments"))"
            )
                .font(.subheadline)
                .foregroundStyle(AtlasPalette.quietInk)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(14)
        .background(AtlasPalette.sky.opacity(0.38))
        .clipShape(RoundedRectangle(cornerRadius: 13))
    }

    private func countLabel(_ count: Int, singular: String, plural: String) -> String {
        "\(count) \(count == 1 ? singular : plural)"
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

private struct ProfileEditorView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.dismiss) private var dismiss
    @State private var profile = Profile()

    var body: some View {
        NavigationStack {
            Form {
                Section("Profile") {
                    TextField("Display name", text: $profile.displayName)
                    TextField("A short introduction", text: $profile.bio, axis: .vertical).lineLimit(2...5)
                    Toggle("Enable public profile", isOn: $profile.publicProfileEnabled)
                }
                Section {
                    DatePicker("Birth date (optional)", selection: Binding(
                        get: { profile.birthDate ?? Calendar.current.date(byAdding: .year, value: -30, to: .now)! },
                        set: { profile.birthDate = $0 }
                    ), displayedComponents: .date)
                } footer: {
                    Text("Used only to make finite time concrete in your private history. It is never published automatically.")
                }
            }
            .navigationTitle("Profile")
            .onAppear { profile = model.document.profile }
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) { Button("Save") { Task { await model.updateProfile(profile); dismiss() } } }
            }
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
