# Significant Hobbies Hub — PROJECT STATUS

Last updated: 2026-09-08

## Why / What

The Hub joins five independently useful personal applications in one UI. It
shows privacy-safe status and provenance and offers only documented semantic
actions, while every product retains its own interface and immediate data
authority.

## Current status

- Canonical source: `Significant-Hobbies/significanthobbies`.
- Hub Backend was consolidated here with its complete repository history.
- The root `PersonalSyncKit` package is the single native sync-client source.
- Live is independently owned at `Significant-Hobbies/live` and retains the
  existing `significanthobbies` Worker, D1, auth, and apex compatibility paths.
- Journal is removed from the maintained lineup; its independently owned
  repository and compatibility records remain retained.
- The Hub UI and backend use the existing `personal-platform` Worker and D1;
  there is no schema, credential, or user-data migration in this split.
- **2026-08-24:** Removed Habits as a separate maintained Hub directory card
  after Anchor absorbed the Indulge/Habits product loop. Anchor now describes
  planning, focus timing, interruption evidence, and schedule review together.
  The `/habits` surface, `habits` records, callbacks, and typed contracts remain
  compatibility data; no schema, user-data, or provider migration occurred.

## Next

Account isolation is tracked in [issue 156](https://github.com/Significant-Hobbies/significanthobbies/issues/156).
A synthetic restart test confirmed that the shared queue can send account A's
work under B. The shared runtime now stores a stable account owner alongside
its queue, requires explicit adoption of unowned data, rejects different-account
binding, and rechecks the captured session around transport and app commits.
Product-document ownership and consumer migrations remain required. The first repair rejects stale identity completions, validates
new bearer sessions before saving them, removes signed-out sessions before
remote revocation, and protects account UI state from older callbacks. Five
client race scenarios and two account-model scenarios pass within the full
34-test Swift suite, including seven durable ownership and in-flight sync tests. This is source-level identity protection; native consumers
must update their package pins and complete account ownership work before
signed-in sharing is qualified.

The sync commit-boundary repair is tracked in [issue 155](https://github.com/Significant-Hobbies/significanthobbies/issues/155).
`synchronize(applyChanges:)` waits for the owning app's durable commit before
advancing downloaded-record metadata and cursor. Sync attempts serialize, and
failed bookkeeping writes retain prior in-memory state. Existing return-only
sync calls remain deprecated compatibility paths and do not gain the app-commit
guarantee until their consumers migrate. Kith is the first consumer to update;
physical signed-in round trips remain unqualified.

Finish real-owner sync testing across the five maintained products, then improve Hub
summaries and actions from observed use. Product work belongs in this
repository's GitHub Issues.
