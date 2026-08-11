## Context

See `proposal.md` for motivation and `specs/native-ios-client/spec.md` for the behavior contract. Significant Hobbies currently combines a public website with authenticated Daily and Living workflows backed by existing service contracts. The native client must carry the private product at feature parity, keep publication opt-in, and remain distinctly Significant Hobbies rather than becoming a hub. The owner selected Swift, simulator-first validation, personal Apple signing, and Apple-native tooling.

## Goals / Non-Goals

**Goals:**

- Build a maintainable SwiftUI iPhone app with a testable private domain core and no third-party runtime packages.
- Preserve complete Daily, Living, History, profile, and privacy behavior with useful local operation.
- Make account synchronization and publication explicit adapters rather than implicit view behavior.
- Produce a locally signed archive and complete metadata/privacy checklist without uploading it.

**Non-Goals:**

- A unified Fleet or Office OS hub, a social feed, competitive habit scoring, or public journals.
- Replacing the public website, reproducing every anonymous marketing route, or silently changing existing public database behavior.
- Publishing, monetization, App Store Connect setup, or production service changes.

## Decisions

### Native Apple stack with a generated, checked-in Xcode project

The app uses SwiftUI, Observation, Foundation, URLSession, AuthenticationServices, UniformTypeIdentifiers, XCTest, and OSLog. A small `project.yml` generates a checked-in `.xcodeproj`; normal development and release work remain in Xcode. There are no third-party runtime packages.

### Versioned private atlas document behind an actor

Daily entries, habits, new things, hobbies, commitments, timelines, bucket-list items, quests, direction, profile preferences, privacy flags, and sync metadata live in a versioned Codable document written atomically in Application Support. This provides reliable local use, portable export, and deterministic tests. A repository protocol leaves account-backed implementation replaceable without changing screens.

### Privacy is a domain invariant

Journal types expose no public field. Only explicitly eligible Living items have a visibility value, and publication requires an explicit operation that can be audited and reversed. Views cannot construct remote publication payloads directly. This is stricter and more testable than relying on hidden UI controls.

### Native browser authentication and isolated service DTOs

`ASWebAuthenticationSession` uses an exact `significanthobbies://auth` callback and a one-use, five-minute handoff; URLSession uses an isolated revisioned JSON endpoint; bearer session material lives only in Keychain. Local changes queue sync intents and expose pending, synced, conflict, and error states. Deferred conflicts freeze cloud writes until the owner decides. No service secrets or environment files ship in the app, and the additive migration remains unapplied until production review.

### Preserve-mode Life Atlas adaptation

The native app inherits `DESIGN.md`: warm paper, olive ink, atlas gold, lived sage, open spatial fields, paths, waypoints, and almanac chronology. Live More/Daily/See History is the tab order. Native navigation, sheets, Dynamic Type, VoiceOver, and Reduce Motion remain authoritative. Equal card grids, shame loops, and generic productivity dashboards remain excluded.

### Release boundary is local archive

Bundle identifier is `com.significanthobbies.app`; version starts at `1.0.0` build `1`; minimum deployment is iOS 17. The archive script defaults to personal team `8F7LXHTJZR`, writes outside source control, verifies its signature, and contains no upload step.

## Risks / Trade-offs

- [The web product has a broad, evolving data model] → Keep DTOs isolated, add fixture contract tests, and version the local atlas document.
- [Local and account data can diverge] → Surface last-sync provenance and require explicit conflict resolution before replacement.
- [Publication mistakes are high impact] → Encode journal privacy and Living eligibility in domain types, confirm publish operations, and test negative cases.
- [Simulator cannot prove universal-link callbacks, notifications, or real-device ergonomics] → Record those as device-only release checks rather than claiming completion.

## Migration Plan

1. Add the native project beside the existing web/public surfaces with an isolated service adapter and no existing-table mutations.
2. Implement and test local Daily, Living, History, profile, privacy, and export behavior.
3. Validate account and publication DTOs against non-mutating fixtures.
4. Capture simulator evidence and create a personal-team archive.
5. Stop before App Store Connect.

Removing `ios/` rolls back the native client without affecting public routes, web users, or server data.
