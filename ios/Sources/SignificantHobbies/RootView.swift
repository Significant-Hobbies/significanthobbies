import SignificantHobbiesCore
import SwiftUI

struct RootView: View {
    @Environment(AppModel.self) private var model

    var body: some View {
        @Bindable var model = model
        TabView(selection: $model.selectedTab) {
            NavigationStack { LiveMoreView() }
                .tabItem { Label("Live More", systemImage: "sun.max.fill") }
                .tag(0)
            NavigationStack { DailyView() }
                .tabItem { Label("Daily", systemImage: "pencil.line") }
                .tag(1)
            NavigationStack { HistoryView() }
                .tabItem { Label("See History", systemImage: "point.bottomleft.forward.to.point.topright.scurvepath") }
                .tag(2)
        }
        .atlasBackground()
        .sheet(isPresented: $model.isSettingsPresented) { SettingsView() }
        .confirmationDialog(
            model.pendingVisibility?.current == .privateOnly ? "Make this public?" : "Return this to private?",
            isPresented: Binding(get: { model.pendingVisibility != nil }, set: { if !$0 { model.pendingVisibility = nil } })
        ) {
            Button(model.pendingVisibility?.current == .privateOnly ? "Make eligible for public profile" : "Make private") {
                Task { await model.confirmVisibility() }
            }
            Button("Cancel", role: .cancel) { model.pendingVisibility = nil }
        } message: {
            Text(model.pendingVisibility?.current == .privateOnly
                 ? "Only “\(model.pendingVisibility?.title ?? "this item")” will become publication-eligible. Daily writing and unrelated Living items stay private."
                 : "This removes “\(model.pendingVisibility?.title ?? "this item")” from publication eligibility.")
        }
        .alert("Significant Hobbies", isPresented: Binding(
            get: { model.message != nil },
            set: { if !$0 { model.message = nil } }
        )) {
            Button("OK", role: .cancel) { model.message = nil }
        } message: {
            Text(model.message ?? "")
        }
    }
}
