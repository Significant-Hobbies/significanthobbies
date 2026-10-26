# Significant Hobbies Hub — PROJECT STATUS

Last updated: 2026-10-26

## Why / What

The owner retired the cross-app Hub product on 2026-10-26: the applications
have not been used together and there is no current need for the Hub.

## Current status

- Hub product development, growth work and the cross-app qualification study
  are cancelled. Issue #190 is closed as not planned, not as qualified sync.
- The standalone apps remain independent. Anchor, Kith, Calorie and Setline
  import this repository's `PersonalSyncKit`; Live delegates compatibility
  routes to the shared backend. Keep those dependencies available.
- Source history, existing Worker/D1/bindings, authentication identities and
  stored records are retained. No provider deletion, migration, client sync
  change or production shutdown accompanies this product retirement. Existing
  hosted routes remain compatibility surfaces, not a renewed Hub roadmap.
- Resume the Hub product only after an explicit new owner decision grounded
  in demonstrated use. Do not turn the retained backend into a replacement Hub.

## Historical source qualification

- Issue #158's shared mirror source now provides CloudKit and Hub transports,
  local commit before cursor advancement, bounded Hub batches, verified per-record
  acknowledgements, and conditional CloudKit saves. Corrupt bookkeeping stops
  synchronization instead of discarding ownership and tombstone history. Local
  verification passes 64 Swift tests and 55 Worker tests with typecheck and a
  deployment dry run. This is source qualification: app pins, real-account
  restores, native release gates, and the Calorie production migration remain
  pending. Existing applications and production storage have not been migrated.
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

## Historical recovery and account work

An opt-in native replay API now supports recovery of previously acknowledged
records without resetting owner state. It retains verified-account serialization,
latest-version precedence, bounded/cancellable pagination and app-commit-before-
progress semantics. Caller preservation of current edits/tombstones is required;
Kith/Setline integration and real-account recovery remain in issue 155. No Worker
or schema deployment accompanies this package change.

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

These historical checks do not establish real-account/native sync acceptance.
The owner cancelled the Hub qualification scope on 2026-10-26. Any future
standalone-app safety work belongs in its owning repository; it does not
automatically reopen the retired cross-app product.
