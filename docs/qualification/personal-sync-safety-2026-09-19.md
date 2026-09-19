# Personal sync safety: source qualification

Date: 2026-09-19. Status: Kith internal-TestFlight source candidate qualified locally; provider mutation, migration and release remain gated.

The owner explicitly reactivated the named Anchor, Hub/shared, Calorie, Setline
and Kith sync fixes in Hub #158, comment 5740805079. This receipt covers source
repair and synthetic qualification. It does not authorize publication, migration,
installation on an owner's store, or release. Original working checkouts were
preserved; Calorie and Setline include their pre-existing dirty native migration.

## Implemented repairs

| Component | Reviewed repair | Evidence |
| --- | --- | --- |
| Shared PersonalSyncKit | Whole-pass verified Hub account/credential snapshot; validation around network/caller boundaries; store-actor compare-and-save prevents stale passes undoing bind, repull or reset; additive caller snapshot validation, including push-only passes. | Full Swift suite: 70 Swift Testing cases and 6 XCTest cases pass. Tests exercise account changes, in-flight pushes, control operations at snapshot/final-save boundaries and local snapshot failure before push/receipt. |
| Anchor | Restore native SwiftData/CloudKit configuration across platforms; Hub exports only owned finished sessions and linked metadata; reject foreign/nil-parent collisions; isolated durable batch save; defer unsaved drafts; preserve raw UUID aliases and fail before pull when progressed alias evidence is lost. | Full Swift suite: 242 tests in 28 suites pass. Includes actual read-only-store failure, retry/reopen, held UI-model refresh, forged owner/UUID/parent rejection and missing versions with a nonempty next delta. Native build receipts recorded in Anchor's qualification document. |
| Calorie | Verified ownership approval, retryable account-scoped legacy import with completion saved atomically in the document, honest failed receipts, document/generation validation under the local-write lock, guarded replacement. | `pnpm quality` passes (87 tests). Full native gate: 64 unit tests, 11 UI tests, Release build; 74.4857% coverage. All 27 sync-commit tests also pass on the final source. |
| Setline | Stable repeatable tombstones, atomic document deletion markers including unseen remote deletions, fractional timestamp preservation, corrupt-ledger failure, snapshot/apply/status fencing under the app lock. | `pnpm run check` passes (25 tests). Full native gate: 208 unit tests, 18 UI tests pass with 1 additional test skipped, Release build; 81.9683% coverage. |
| Kith | Per-record Hub affiliation and content-bound approval; transport-specific projections; CloudKit affiliation preservation; authenticated Hub authority; parent-first apply and guarded person-deletion cascade; stable wire aliases; exact committed re-projection before push; malformed/foreign/colliding batches remain retryable. The Hub contract now preserves person details/list items and enforces closeness 1–5. | Final native gate: 61 unit tests, 10 UI tests and Release build pass. Shared Swift suite: 76 tests. Hub typecheck passes and backend suite: 57 tests. A current signed 1.0.0 (13) development archive contains the expected CloudKit and Sign in with Apple entitlements plus a valid privacy manifest. |

Astra performed design and final source review. SWE-2 supplied bounded shared,
caller and Anchor implementations/tests; the root integrated and corrected them.
Worker-only alternatives are not the release candidate.

## Reproduction and dependency boundary

The candidate is uncommitted and retained under
`/Users/sarthak/Desktop/fleet/.worktrees/personal-sync-158/`. The five sibling
worktrees are `shared-safe-sync-158`, `anchor-safe-integrated-158`,
`calorie-safe-sync-158`, `setline-safe-sync-158`, and `kith-safe-integrated-158`.
The `significanthobbies` symlink preserves their local package resolution.
Baselines are Anchor draft #58
`faab9d636395e1a480b2e1bc6efd0b032f7fd0a2`, Kith
`344895435aa6f6360cc0fc11f46f23a76682ec78`, Calorie
`82f624b09e63b8e7ff909903838638fc691cb271` plus existing native migration,
Setline `8cee9ccd3edd0b783fe3e1f0803ed28a55936223` plus existing native migration,
and shared `8eef61c717d54a6fbfebc38f29671bfd00b24f4b`.
The worktree baselines and reviewed diffs are the source identity until commits
are authorized. Release reproduction requires immutable shared and app commits;
the qualification-only local package link is not a publishable dependency pin.

All native tests use local integrated PersonalSyncKit. Anchor Package.swift and
Kith ios/project.yml use qualification-only local dependencies; Calorie/Setline's
imported migration already did. Before CI or release, publish the shared repair,
replace local references with its immutable remote SHA and regenerate resolved
projects. An old remote pin cannot reproduce the new callback API.

Synthetic native tests ran on iOS 26.5 simulator
`28E413D9-B587-41D3-9D7C-3D903BC6F842` with Xcode 26.6. No production sync or
physical-device acceptance was performed. Local logs are retained with this task:
`/private/tmp/{calorie-native-gate-158,setline-native-gate-final-158,kith-release-full-final-158}.log`,
`/private/tmp/anchor-final-full-158.log`, and final focused XcodeBuildMCP JSON receipts.

## Explicit remaining gates

These repairs close the named source defects, not the whole dual-mirror migration:

1. Calorie and Setline still need a durable per-record provenance contract before
   unknown/foreign CloudKit arrivals may be forwarded to Hub. Kith now implements
   that contract: schema-v1 content starts unresolved; explicit approval is bound
   to the selected record content and verified Hub owner; new or changed iCloud
   content requires fresh approval; declared foreign affiliation is preserved and
   excluded. This source evidence does not replace device migration acceptance.
2. Caller locks and checks reject stale snapshots, but cannot cancel a storage
   write once the storage actor has begun it. Post-save checks prevent subsequent
   stale push/receipt work; signed storage/identity transition behavior remains to
   be qualified. Shared CAS assumes one authoritative store actor per file.
3. Calorie replacement resets bookkeeping before writing the replacement
   document. If reset succeeds but the document write fails or the process exits,
   ledger-only legacy deletion intent needs coordinated recovery. This cross-file
   crash boundary is not closed by generation fencing. Do not run the migration.
4. Anchor late native-cloud imports of legacy private-note fields and historical
   queued exports remain privacy/old-client acceptance gates. Startup vault
   preflight and simulator builds do not prove a running CloudKit mirror can be
   paused safely after a late-import vault failure.
5. Kith schema v2 persists affiliation, approval fingerprints, wire aliases and
   person references. Schema-v1 decoding is covered, but a v2 document cannot be
   opened by the old build; retain a pre-upgrade backup and qualify rollback on a
   physical device before treating the local-store migration as accepted.
6. Publish/pin exact source, deploy only the reviewed additive CloudKit schema,
   then obtain signed device upgrade, retained-store,
   offline, account-switch, CloudKit and watch continuity evidence. Kith TestFlight
   needs a reviewed archive/build identity and separate release authorization.

The following sections retain the ownership design and acceptance criteria for
that remaining work. Statements about baseline windows describe the motivating
risks; the implemented bounded protections are recorded above.

## Required ownership model

### Record provenance, independent of transport eligibility

Every live entity and tombstone needs durable provenance alongside its stable entity identity. A proposed representation is:

- `unassigned`: device-local content with no evidenced Hub approval.
- `approved(ownerID, approvalID)`: content explicitly approved for a particular verified Hub account, or newly authored within an already approved ownership context whose creation is durably recorded.
- `hubOrigin(ownerID)`: content received in a transaction pinned to that Hub account.
- `legacyUnresolved`: prior content whose source/approval cannot be established.

Keep origin/source evidence separately from the ownership decision. Record names alone and a current document-level owner are not ownership evidence. Ownership changes are explicit transitions; signing in, restoring a document, and reading an iCloud record must not implicitly assign an owner.

The exact encoding remains a design gate. Its invariants are fixed:

1. A Hub snapshot includes only records approved for, or received from, that exact verified account. It excludes foreign-owner and unresolved records without manufacturing tombstones for the excluded set.
2. CloudKit continues to support device-local records and transports provenance for approved records. Do not disable native/local use merely because Hub consent is absent.
3. A record arriving through CloudKit after an earlier account approval is not automatically covered by that approval. Preserve its declared owner; leave unknown provenance unresolved.
4. A different-owner record cannot silently merge into a bound document and then upload under the document's owner. Reject and leave its cursor retryable, or durably quarantine it with its source and owner before acknowledging receipt. Quarantine must be a real persisted recovery path, not a swallowed error.
5. A Hub pull supplies its owner from authenticated transaction context, never from an untrusted payload field. A payload claiming a different owner is rejected. Hub writes derive the destination owner from authentication; owner metadata must not select another account's namespace.
6. Tombstones retain the deleted record's provenance and deletion timestamp after the live payload is gone. Removal from an account-filtered view is not a deletion.
7. Transport receipt keys include account/source scope. Hub cursors, versions, pushed fingerprints, and ledger entries cannot be inherited by another Hub account. CloudKit receipt scope must also distinguish the relevant iCloud account and zone; do not log raw account identifiers in qualification artifacts.

Preserve existing entity names and native entity encoding where possible. If an envelope or sidecar is introduced, qualify old-reader/new-reader behavior. An old client that strips provenance can turn an approved record back into unresolved content; it must never cause automatic reassignment. Hub protocol support for retained metadata and deletion ownership is an explicit open gate, not assumed compatible.

### Ownerless and legacy migration

Prior document ownership proves which account the document was connected to. It does not prove that every record currently inside it was individually approved: CloudKit may have imported records after approval. Do not bulk stamp all existing records with the current document owner based on that field alone.

Migration classification must be deterministic, non-destructive, and restartable:

| Evidence | Allowed classification | Disallowed inference |
| --- | --- | --- |
| Record obtained from a Hub pull pinned to A | Hub origin A | Reassign to currently displayed B. |
| Durable per-record approval/creation evidence for A | Approved A | Discard the evidence on CloudKit round-trip. |
| Existing Setline session explicitly carries owner A | Retain A as existing ownership evidence; validate compatibility before promoting it to the new scheme. | Rewrite A to document owner B or treat nil as B. |
| Only the document owner is A | Legacy unresolved until record-level evidence or fresh consent exists | Every present entity and deletion belongs to A. |
| Ownerless CloudKit record, or unknown hard-deletion name | Legacy unresolved | Current sign-in implies consent or deletion authority. |

Ownerless records require explicit consent showing the verified destination account and the eligible records or a clearly described bounded selection. Approval applies to that selection at an identified document revision, not to all future iCloud arrivals. A user may retain local-only use. Never offer reassignment of already foreign-owned records as an ordinary reconnect action.

Persist provenance before permitting the Hub backfill. If ownership storage fails, preserve the original store and keep uploads blocked. Journal migration progress so interruption/relaunch cannot partially approve a batch. Approval and record writes need a coordinated durable boundary; two unrelated best-effort saves are insufficient.

For CloudKit hard deletions that contain only a record name, recover ownership from the retained provenance ledger. If no evidence exists, preserve the unresolved deletion for review/retry; do not propagate it to whichever Hub account happens to be signed in.

## Account-pinned transaction and caller save boundary

The shared runtime should open one scoped transport session per pass. For Hub it captures the verified owner, identity revision/epoch, and credential snapshot. Every page and push batch uses this same snapshot; none independently selects a newer account. Do not persist credentials inside bookkeeping or test receipts.

Validate that scope before and after awaited operations that can cross an identity transition: pull pages, current-record acquisition, apply, push batches, and receipt persistence. A changed session fails the pass with retryable state. Failure must not advance the cursor or report success under the replacement identity. A response from A must never produce a push authenticated as B.

Shared checks alone cannot provide the caller's atomic-save guarantee. Each caller needs a commit context containing the pinned owner/session epoch and destination store/document generation. After acquiring its local-write lock, it revalidates the context before constructing the candidate. Identity transitions, store replacement, and the actual durable commit need a common serialization/fencing mechanism, so a check before an `await store.save` cannot race a later account transition. Memory publication and sync-success UI must validate the same context.

Define the ordering explicitly: a save that completes while the account transition is serialized behind it belongs to A; a transition that wins first invalidates A's pending save. Never relabel an A-owned committed store as B. If the storage API cannot enforce this ordering, retain this as an unresolved release gate rather than claiming that an extra pre-save boolean check closes it.

### Additional source-backed window: edit after snapshot, before apply

The post-pull snapshot does not close the entire lost-edit window. At the audited baseline, `MirrorRuntime.swift:197` obtains records and line 205 later awaits the caller apply. A local edit can finish between these points or while apply waits for the local-write lock. Kith `AppModel.swift:326-343,447-450`, Setline `AppModel.swift:469-480`, and Calorie `AppModel.swift:647-662` then apply the already-selected remote winner to the newest document without comparing the revision used for the merge. Kith person, Setline template/goal, and Calorie food upserts can overwrite that newer local edit. Their local-save paths allow edits while sync is running. Calorie increments `localMutationRevision` but does not compare it here. This is distinct from the already-covered edit-during-network-pull case and has not yet been exercised on a device.

The smallest conservative caller transaction token is `(documentRevision, storeGeneration, ownerID, sessionEpoch)` paired with the immutable document snapshot used to produce records. Capture the document and revision together on the caller actor, before asynchronous record encoding/stamping; do not capture the revision only after encoding returns. After acquiring the local-write lock, validate that token and the pinned transport session before applying any winner. On mismatch, throw a retry-required error without changing disk or the cursor; re-read and re-merge on the next pass. Increment revision for every successful durable content/ownership/store change. Kith and Setline need that monotonic revision; Calorie can use its existing counter after auditing all write paths. A successful remote apply returns or updates the expected revision for subsequent pass validation. Keep this token pass-scoped so a concurrent pending-count read cannot replace it.

Qualification needs a deterministic barrier at the start of the apply callback, after `records()` has returned, and a second case with a local save already holding the write lock. Save a newer value for the same person/template/food through the real caller API, then release apply. Assert the new local value remains both on disk and in memory, the old pull token remains, and the retry merges from that new value. Use an injected clock where record dating requires it. Snapshot validation must also run on passes with no pulled winners before push/receipt publication; an apply-only hook would skip that path. The owner/session save fencing above remains necessary in addition to the revision check.

### Bookkeeping mutation during a suspended pass

The baseline runtime is an actor but is reentrant across awaits. Its synchronization waiters cover only `synchronize`; `bindOwner` (`MirrorRuntime.swift:107-114`), `repullAll` (68-71), and `forgetBookkeeping` (53-54) can run while a pass awaits network or caller work. The pass loaded a whole state at line 191 and blindly saves it at line 241. It can therefore erase a newly bound owner, restore cleared pull tokens, or recreate ledger/fingerprint state after reset. `MirrorBookkeepingStore` in `MirrorTransport.swift:81-107` serializes individual loads/saves, not the complete read-modify-write transaction. These are source-backed interleavings, not confirmed production events.

Two valid repair designs are a single serialized mutation permit shared by synchronization and every bookkeeping writer, or store-owned generation/CAS with explicit transaction invalidation. The permit option must define queued reset/bind semantics and avoid reentrant callback deadlocks. For CAS, read `(state, generation)` atomically; all writers, including bind/repull/reset, atomically advance the generation; save only if the expected generation still matches inside the store actor's uninterrupted operation. A check in the runtime followed by an awaited unconditional store save is insufficient. Reset must invalidate old generations without ABA reuse, and caller storage replacement must invalidate the in-flight caller token as well. Require one authoritative store instance or coordinated file access if multiple instances can write the same path.

Regression: hold a pass immediately after its bookkeeping load, perform each operation separately, and release it. Binding must retain the owner; repull must leave the next pass starting from no cursor; reset must not restore old ledger/fingerprints/tokens. In an invalidation design the old pass must fail/retry before further apply/push/receipt work; a serialized design must prove the operation runs in its documented order after the pass. Reopen the store to verify persisted state, and repeat with mutation at the pre-save boundary. Owner and identity guards alone do not close this stale-bookkeeping overwrite.

## Durable deletion and malformed batches

Tombstones are part of the persistent syncable set. Enumerating records or computing pending counts is not acknowledgement. Repeated snapshots and relaunch must reproduce the same deletion with the same timestamp and owner until a separately justified retention policy permits removal. Both mirrors can need a deletion at different times; success on one is not authority to discard it for the other.

Persist pulled tombstones even when their live entity was never seen locally. Stale data from the other mirror must not resurrect that entity on the next pass. Setline's append-only workout history remains protected from tombstone erasure; mutable templates/goals retain deletion replay. Excluding an active workout or a foreign-account entity must not generate a delete.

A malformed record of a supported kind fails the whole candidate batch before any partial document publication. Decoding errors, identity mismatches, and domain validation failures must propagate. The pull token remains unchanged, and a corrected retry is idempotent. Deliberately unsupported legacy record kinds need an explicit compatibility policy; they cannot be confused with corrupt supported records. If they are acknowledged, any required retained data must first have a durable, qualified storage path.

## Qualification matrix

All network fixtures use synthetic accounts and payloads. These tests do not require production credentials or production requests.

| Area | Required scenario | Acceptance evidence |
| --- | --- | --- |
| Shared session | A changes to B after the final pull response check, while snapshot/apply waits, between push batches, and before bookkeeping save. Include same-user credential/epoch change. | No B-authenticated mutation from A's pass; no stale caller commit or receipt; explicit retry outcome. Barrier placement proves the post-pull window was exercised. |
| Shared receipts | Bind/reset/repull or another bookkeeping operation overlaps an in-flight pass; restart after interruption. | No stale pass overwrites owner, cursor, versions, or reset state. Scope survives relaunch without crossing accounts. |
| Shared two-mirror behavior | One transport fails or is unavailable; the other succeeds. | Independent progress retained; incomplete pass reported honestly; unresolved records cannot leak through the next transport. |
| Ownership | A-approved, B-owned, unassigned, and legacy-unresolved live records and tombstones coexist; CloudKit delivers more records after approval. | Hub receives only its approved set. Unknown/foreign records retain recoverable provenance. No filtering-generated deletes. |
| Migration | Owner field exists only at document level; approval save fails; app terminates mid-migration; old client rewrites a record. | No automatic bulk claim, no partial upload, restartable consent state, original data preserved. |
| Deletion | Snapshot twice, status read before sync, failed push/retry, two transports, process reopen, pulled deletion for unknown entity. | Stable owned tombstone survives each boundary and defeats stale resurrection. |
| Malformed batch | Valid record followed by malformed supported record, mismatched envelope/entity identity, domain validation failure, corrected retry. | Whole local candidate rejected; no partial publication or cursor advancement; replay produces one correct entity. |

### Kith

- Exercise malformed person and interaction fields, supported unknown/invalid shapes, and person ID/envelope mismatches through the actual `AppModel` caller.
- Preserve established deletion dominance and test valid remote interaction changes rather than silently acknowledging a selected winner that the caller does not apply.
- Hold the actual local-write boundary after a valid pull; change identity/store generation; assert disk, in-memory people/notes, pending count, and last-success state all follow the commit fence.
- Test ownerless/foreign live records and deletions arriving through CloudKit before and after approval, followed by a second Hub pass. Existing document/legacy-cloud ownership protections must not be weakened.
- Required native check for iOS source changes: `ios/scripts/check.sh`, with exact source and shared dependency resolution recorded. A source pass is not TestFlight evidence.

Kith TestFlight remains gated on an exact, reviewable source revision, resolved PersonalSyncKit revision, successful native checks, archive/upload build identity, and device evidence tying that binary to those revisions. Required device journeys include retained local data after upgrade, explicit approval, sign-out/account switch, interrupted save/retry, CloudKit restore, both-mirror deletion, and offline local use. Record only redacted receipts and synthetic-account outcomes. No TestFlight upload, release, or production migration is authorized by this document.

### Calorie

- Qualify the existing dirty migration as a complete source snapshot; do not attribute its caller behavior to HEAD alone or remove its changes to simplify validation.
- Test foods, entries, water/weight, routines/check-ins, goal cycles, daily notes, and singleton settings across apply/replay. Validate name/entity identity agreement; invalid supported payloads must throw atomically.
- Test account changes during approval, legacy export import, mirror pull, and durable save. The best-effort legacy import must not apply A's result after ownership changes, and its completion marker must describe the account actually committed.
- Verify `knownRecordNames`-derived tombstones keep ownership, cannot delete a filtered-out foreign record, and do not assign unknown legacy data to the signed-in account.
- Verify failed/unavailable sync cannot become a misleading synced state; deletion/account-removal flows must not claim remote deletion after swallowed failures.
- Required source gates: the repository's smallest relevant checks, then `pnpm quality` and `pnpm quality:native` for the integrated candidate. Native retained-journal and legacy-store migration evidence remains separate.

### Setline

- Extend the one-pass tombstone test to repeated snapshots, pending-status reads, both transports, failed push, relaunch, and unknown pulled deletions.
- Test history carrying A, B, and nil owners in a document bound to B. Preserve append-only sessions, authored order, programme state, and the exclusion of active workouts.
- Hold a pull until a workout begins or an account/store epoch changes. Neither the document nor the pull token may advance while application is unsafe.
- Verify pulled entity IDs match their record names and supported decoding errors fail the complete candidate batch. Preserve intentional compatibility treatment of old Hub summary names.
- Qualify the dirty migration as a reproducible source snapshot. Required integrated gates: `pnpm run check` and `pnpm quality:native`; then device evidence for retained training, iCloud restore, active-workout behavior, and optional Hub approval.

### Anchor

Anchor source results are recorded above and in `docs/qualification/mirror-2026-09-19.md` in its candidate worktree. Native continuity and private-note late-import gates remain open.

## Minimal safe release defaults and remaining gates

If provenance migration is not qualified, keep the new cross-account/dual-mirror migration unreleased. Preserve the working native device store and qualified legacy/native sync path as the data authority. Keep local use available. Do not wipe stores, reset receipts, drop legacy readers, re-seed zones, or opportunistically reassign records to make a migration pass.

For a candidate that must run during qualification, new Hub backfill must remain blocked for unresolved provenance. Maintain local/CloudKit behavior only where its existing ownership protections remain qualified; the new bridge must not allow ownerless or foreign CloudKit content to enter an approved Hub export. Selecting this fallback is a release/configuration decision requiring a concrete reviewed change, not an instruction in this document to change production configuration.

Release requires all of the following evidence, still open unless recorded by the owning workstream:

1. Reviewed final source snapshots for shared code and every participating caller, preserving unrelated work and naming exact dependency revisions.
2. Passing bounded regressions plus each repository's required integrated checks, with actual commands/results attached to the owning issue.
3. A reviewed persistent provenance format, tombstone ownership policy, old-client compatibility behavior, and explicit-consent migration implementation.
4. A caller save fence proven through the actual storage/identity integration, not only fake transport callbacks.
5. Synthetic device upgrade/relaunch/offline/CloudKit/account-switch evidence for each release candidate; Kith additionally needs exact-source TestFlight build evidence.
6. Separate explicit authorization for any migration, release, deployment, or provider change after the concrete candidate and evidence are reviewable.

The bounded repairs above must not be used to close the unresolved ownership, migration, native-device, or release gates above.
