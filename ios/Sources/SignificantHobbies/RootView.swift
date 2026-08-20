import SignificantHobbiesCore
import SwiftUI

struct RootView: View {
    @Environment(AppModel.self) private var model

    var body: some View {
        @Bindable var model = model
        NavigationStack {
            if model.isLoading {
                ProgressView("Opening your Journal…")
            } else if model.isDataAvailable {
                JournalView()
            } else {
                VStack(spacing: 18) {
                    ContentUnavailableView(
                        "Journal could not open your archive",
                        systemImage: "exclamationmark.triangle",
                        description: Text("Your existing file was left untouched. Restart Journal or restore a compatible archive before writing.")
                    )
                    Button("Open recovery settings") { model.isSettingsPresented = true }
                        .buttonStyle(.borderedProminent)
                }
                .padding()
            }
        }
        .atlasBackground()
        .sheet(isPresented: $model.isSettingsPresented) { SettingsView() }
        .alert("Journal", isPresented: Binding(
            get: { model.message != nil },
            set: { if !$0 { model.message = nil } }
        )) {
            Button("OK", role: .cancel) { model.message = nil }
        } message: {
            Text(model.message ?? "")
        }
    }
}
