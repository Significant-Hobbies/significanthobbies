import SignificantHobbiesCore
import SwiftUI

struct RootView: View {
    @Environment(AppModel.self) private var model

    var body: some View {
        @Bindable var model = model
        NavigationStack { JournalView() }
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
