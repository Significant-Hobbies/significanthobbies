import SignificantHobbiesCore
import SwiftUI

@main
struct SignificantHobbiesApp: App {
    @State private var model = AppModel()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(model)
                .task { await model.load() }
        }
    }
}
