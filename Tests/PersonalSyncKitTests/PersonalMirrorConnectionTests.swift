#if canImport(CloudKit) && canImport(AuthenticationServices) && canImport(Security) && (os(iOS) || os(macOS))
import Foundation
import Testing
@testable import PersonalSyncKit

/// The production convenience init constructs `CKContainer(identifier:)`,
/// which traps in an unentitled test process, so dual-transport wiring is
/// verified inside each app target's entitled test/build gate. The
/// composition init — the test seam every app uses — stays covered here.
struct PersonalMirrorConnectionTests {
    @Test func compositionInitExposesInjectedParts() async throws {
        let directory = FileManager.default.temporaryDirectory
            .appending(path: UUID().uuidString, directoryHint: .isDirectory)
        defer { try? FileManager.default.removeItem(at: directory) }
        let identity = PersonalIdentityClient(
            baseURL: try #require(URL(string: "https://identity.invalid")),
            tokenStore: MemoryBearerStore()
        )
        let runtime = MirrorRuntime(
            transports: [],
            store: MirrorBookkeepingStore(fileURL: directory.appending(path: "mirror-sync.json"))
        )
        let account = await MainActor.run {
            PersonalAccountModel(identity: identity, callbackScheme: "synthetic")
        }
        let connection = PersonalMirrorConnection(identity: identity, runtime: runtime, account: account)
        #expect(connection.identity === identity)
        #expect(connection.runtime === runtime)
    }
}
#endif
