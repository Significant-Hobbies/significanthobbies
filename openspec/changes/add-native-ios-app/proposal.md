## Why

Significant Hobbies is a daily life-practice product whose most frequent moments happen away from a desk. A native iPhone client can bring the full Daily and Living workflows into a focused personal app without collapsing the product into a broader hub.

## What Changes

- Add a first-party SwiftUI iPhone application using Apple frameworks and no new production dependencies.
- Match the current authenticated product surface: morning and evening Daily rituals, new-thing capture, hobbies, commitments, timelines, bucket lists, quests, journal context, history, trajectory, profile, settings, export, deletion, and opt-in public sharing controls.
- Preserve private-by-default local behavior and add an isolated, revisioned private-atlas service contract without mutating existing public web tables.
- Offer Sign in with Apple beside Google, with explicit linking for an already connected account and no email-based implicit account merge.
- Adapt the established Life Atlas visual language to native navigation, controls, accessibility, and motion.
- Add native tests, privacy metadata, app metadata, icons, simulator verification, and a signed archive workflow that stops before upload.
- Keep the web application intact, preserve the mortality-aware framing, and do not introduce a unified hub.

## Capabilities

### New Capabilities

- `native-ios-client`: Native iPhone behavior, full product parity, private local state, optional account synchronization, public-sharing boundaries, accessibility, and submission preparation.

### Modified Capabilities

None.

## Impact

Adds an `ios/` Swift/Xcode surface beside the existing web application plus additive native handoff/state source, native Apple identity-token validation, and an additive D1 migration. Existing public pages and web data formats remain unchanged. The iOS app uses the personal Apple development team for signing and is prepared for a separately authorized TestFlight upload.
