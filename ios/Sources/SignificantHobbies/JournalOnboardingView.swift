import SignificantHobbiesCore
import SwiftUI

enum JournalOnboardingStep: Int, CaseIterable {
    case promise
    case invitation
    case writing
    case saved
}

enum JournalOnboardingPreferences {
    static let completedKey = "journal-onboarding-completed-v1"
    static let stepKey = "journal-onboarding-step-v1"
    static let invitationKey = "journal-onboarding-invitation-v1"
    static let draftKey = "journal-onboarding-draft-v1"

    static func reset(defaults: UserDefaults = .standard) {
        [completedKey, stepKey, invitationKey, draftKey].forEach(defaults.removeObject(forKey:))
    }
}

enum JournalOnboardingPolicy {
    static func shouldPresent(
        completed: Bool,
        entries: [DailyEntry],
        forced: Bool = false
    ) -> Bool {
        if forced { return !completed }
        guard !completed else { return false }
        return !entries.contains { entry in
            !entry.journal.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                || !entry.morningReflection.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                || !entry.eveningReflection.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        }
    }
}

struct JournalOnboardingView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @AppStorage(JournalOnboardingPreferences.stepKey) private var storedStep = JournalOnboardingStep.promise.rawValue
    @AppStorage(JournalOnboardingPreferences.invitationKey) private var invitation = ""
    @AppStorage(JournalOnboardingPreferences.draftKey) private var draft = ""

    let completion: () -> Void

    private let invitations = [
        "What do you want to remember?",
        "What is asking for your attention?",
        "What felt quietly true?",
    ]

    private var step: JournalOnboardingStep {
        JournalOnboardingStep(rawValue: storedStep) ?? .promise
    }

    private var shouldReduceMotion: Bool {
        reduceMotion || ProcessInfo.processInfo.arguments.contains("--reduce-motion-demo")
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 28) {
                header
                stepContent
                    .id(step)
                    .transition(shouldReduceMotion ? .identity : .opacity.combined(with: .move(edge: .trailing)))
            }
            .padding(.horizontal, 22)
            .padding(.vertical, 24)
            .frame(maxWidth: 680, alignment: .leading)
            .frame(maxWidth: .infinity)
        }
        .background(background.ignoresSafeArea())
        .navigationBarHidden(true)
    }

    private var header: some View {
        HStack(alignment: .center, spacing: 14) {
            SHMark(size: 46)
            VStack(alignment: .leading, spacing: 2) {
                Text("JOURNAL")
                    .font(.caption.weight(.bold))
                    .tracking(1.25)
                Text("Private by design")
                    .font(.subheadline)
                    .foregroundStyle(AtlasPalette.quietInk)
            }
            Spacer()
        }
    }

    @ViewBuilder
    private var stepContent: some View {
        switch step {
        case .promise:
            promise
        case .invitation:
            invitationPicker
        case .writing:
            writing
        case .saved:
            saved
        }
    }

    private var promise: some View {
        VStack(alignment: .leading, spacing: 26) {
            VStack(alignment: .leading, spacing: 14) {
                Text("A private room for what matters.")
                    .font(.system(.largeTitle, design: .serif, weight: .medium))
                    .tracking(-0.7)
                Text("Write one honest page. Journal cannot publish or share it, and you do not need an account.")
                    .font(.title3)
                    .foregroundStyle(AtlasPalette.quietInk)
            }

            HStack(alignment: .top, spacing: 14) {
                Image(systemName: "lock.fill")
                    .font(.title2)
                    .foregroundStyle(AtlasPalette.ink)
                    .frame(width: 44, height: 44)
                    .background(AtlasPalette.gold)
                    .clipShape(Circle())
                VStack(alignment: .leading, spacing: 5) {
                    Text("Your words are never a profile.")
                        .font(.headline)
                    Text("Journal works offline. If you later connect your account, entries can also live in your private cloud archive.")
                        .foregroundStyle(AtlasPalette.quietInk)
                }
            }

            Button("Begin privately") { advance(to: .invitation) }
                .buttonStyle(AtlasPrimaryButtonStyle())
        }
    }

    private var invitationPicker: some View {
        VStack(alignment: .leading, spacing: 22) {
            onboardingTitle(
                "Choose a doorway.",
                detail: "An invitation can help you begin. A blank page is equally welcome."
            )

            VStack(spacing: 10) {
                ForEach(invitations, id: \.self) { option in
                    invitationButton(option)
                }
                invitationButton("Blank page", stores: "")
            }

            backButton(to: .promise)
        }
    }

    private func invitationButton(_ label: String, stores value: String? = nil) -> some View {
        Button {
            invitation = value ?? label
            advance(to: .writing)
        } label: {
            HStack(spacing: 12) {
                Text(label)
                    .font(.system(.headline, design: .serif))
                    .multilineTextAlignment(.leading)
                Spacer()
                Image(systemName: "arrow.right")
                    .accessibilityHidden(true)
            }
            .foregroundStyle(AtlasPalette.ink)
            .frame(maxWidth: .infinity, minHeight: 52, alignment: .leading)
            .padding(.horizontal, 16)
            .background(AtlasPalette.paper.opacity(0.82))
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            .overlay { RoundedRectangle(cornerRadius: 14).stroke(AtlasPalette.contour) }
        }
        .accessibilityHint("Opens the private writing step")
    }

    private var writing: some View {
        VStack(alignment: .leading, spacing: 20) {
            onboardingTitle(
                invitation.isEmpty ? "Begin anywhere." : invitation,
                detail: "This becomes a real entry only when you save."
            )

            ZStack(alignment: .topLeading) {
                if draft.isEmpty {
                    Text("Write what you want to keep…")
                        .font(.system(.body, design: .serif))
                        .foregroundStyle(AtlasPalette.quietInk)
                        .padding(.horizontal, 18)
                        .padding(.vertical, 20)
                        .accessibilityHidden(true)
                }
                TextEditor(text: $draft)
                    .scrollContentBackground(.hidden)
                    .font(.system(.body, design: .serif))
                    .frame(minHeight: 260)
                    .padding(12)
                    .accessibilityLabel("First private Journal entry")
            }
            .background(AtlasPalette.paper)
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay { RoundedRectangle(cornerRadius: 16).stroke(AtlasPalette.contour) }

            Button {
                Task { await saveFirstEntry() }
            } label: {
                Label("Save my first private entry", systemImage: "lock.fill")
            }
            .buttonStyle(AtlasPrimaryButtonStyle())
            .disabled(draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)

            backButton(to: .invitation)
        }
    }

    private var saved: some View {
        VStack(alignment: .leading, spacing: 26) {
            onboardingTitle(
                "Your first page is here.",
                detail: "It is saved in your real Journal archive—not a tutorial or sample."
            )

            VStack(alignment: .leading, spacing: 10) {
                Label("Saved on this device", systemImage: "checkmark.circle.fill")
                    .font(.headline)
                Text("Journal remains complete offline. If you want the same entries on another device, connect your Significant Hobbies account from Settings.")
                    .foregroundStyle(AtlasPalette.quietInk)
            }
            .padding(.vertical, 6)

            Button("Open Journal") { completion() }
                .buttonStyle(AtlasPrimaryButtonStyle())

            Button("Open account & sync settings") {
                completion()
                model.isSettingsPresented = true
            }
            .font(.headline)
            .frame(maxWidth: .infinity, minHeight: 48)
        }
    }

    private func onboardingTitle(_ title: String, detail: String) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.system(.largeTitle, design: .serif, weight: .medium))
                .tracking(-0.7)
            Text(detail)
                .font(.body)
                .foregroundStyle(AtlasPalette.quietInk)
        }
    }

    private func backButton(to destination: JournalOnboardingStep) -> some View {
        Button {
            advance(to: destination)
        } label: {
            Label("Back", systemImage: "arrow.left")
                .frame(minHeight: 44)
        }
        .font(.subheadline.weight(.semibold))
    }

    private func advance(to destination: JournalOnboardingStep) {
        if shouldReduceMotion {
            storedStep = destination.rawValue
        } else {
            withAnimation(.spring(response: 0.42, dampingFraction: 0.9)) {
                storedStep = destination.rawValue
            }
        }
    }

    @MainActor
    private func saveFirstEntry() async {
        let body = draft.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !body.isEmpty else { return }
        let entry = DailyEntry(date: Calendar.current.startOfDay(for: .now), journal: body)
        guard await model.saveDaily(entry, announceSuccess: false) else { return }
        advance(to: .saved)
    }

    private var background: Color {
        switch step {
        case .promise, .invitation: AtlasPalette.gold.opacity(0.16)
        case .writing: AtlasPalette.lilac.opacity(0.24)
        case .saved: AtlasPalette.sage.opacity(0.2)
        }
    }
}
