import SignificantHobbiesCore
import SwiftUI
import UniformTypeIdentifiers

struct SettingsView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.dismiss) private var dismiss
    @State private var isProfileEditorPresented = false
    @State private var isImporterPresented = false
    @State private var showReset = false

    var body: some View {
        @Bindable var model = model
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    publicPreview
                    settingsSection("Account & sync") {
                        Label("Local Life Atlas active", systemImage: "iphone.gen3").font(.headline).frame(minHeight: 44)
                        Text("Daily and Living changes remain useful offline. Publication requires an explicit item choice and a completed account sync.")
                            .font(.subheadline).foregroundStyle(AtlasPalette.quietInk)
                        Link(destination: URL(string: "https://significanthobbies.com")!) {
                            Label("Open Significant Hobbies account", systemImage: "safari").frame(maxWidth: .infinity, minHeight: 48)
                        }
                        .buttonStyle(.bordered)
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
