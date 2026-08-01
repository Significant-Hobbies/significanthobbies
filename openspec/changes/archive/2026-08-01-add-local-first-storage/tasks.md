## 1. Storage foundation

- [x] 1.1 Inventory every private write domain and classify it as local-ready, account-only, or public-server
- [x] 1.2 Add shared storage-mode types, a session-derived provider, and a visible device/account status component
- [x] 1.3 Add a native IndexedDB repository with versioned envelopes, stable identifiers, validation, quarantine, and recoverable error states
- [x] 1.4 Add repository contract tests for persistence, invalid records, quota/unavailable failures, and isolation between domains

## 2. Local Trajectory vertical slice

- [x] 2.1 Extract shared Trajectory validation and pure lifecycle transitions for create, continue, adjust, complete, and release
- [x] 2.2 Implement the Trajectory browser repository and test it against the shared lifecycle contract
- [x] 2.3 Route `/trajectory` through the application storage mode, replacing the signed-out sample with an editable local state
- [x] 2.4 Show whether Trajectory is saved on this device or to the signed-in account and handle browser-storage failures without losing the draft
- [x] 2.5 Verify anonymous create, refresh restoration, review, adjustment history, closure, and authenticated D1 behavior

## 3. Sign-in handoff

- [x] 3.1 Add a local-domain inventory and pending-import state that runs when authentication changes from local to account mode
- [x] 3.2 Add an authenticated, idempotent Trajectory import action with server validation, ownership enforcement, and import receipts
- [x] 3.3 Add explicit handoff UI for import approval and single-active-Trajectory conflicts without silent overwrite
- [x] 3.4 Preserve local data through failed imports, archive it after success, and test retries for duplicate prevention
- [x] 3.5 Add explicit onboarding and profile-draft import into authenticated account records
- [x] 3.6 Add explicit Daily habits, logs, and journal import with owner validation and idempotency
- [x] 3.7 Add explicit Commitment and remaining Living-draft imports without enabling anonymous publishing

## 4. Whole-application adoption

- [x] 4.1 Convert onboarding and private profile drafts to the shared local-first contract
- [x] 4.2 Convert bucket lists, private timelines, and side quests while keeping publishing account-only
- [x] 4.3 Convert commitments and habits while preserving their existing ownership and no-scoring invariants
- [x] 4.4 Convert Daily entries and related private journal context without exposing local content to analytics or public caches
- [x] 4.5 Audit remaining private surfaces, remove misleading editable account-only states, and mark the inventory complete

## 5. Documentation and verification

- [x] 5.1 Document storage authority, browser-data privacy, export/clear behavior, sign-in handoff, and rollback controls
- [x] 5.2 Run targeted unit and browser tests for each migrated domain, then run typecheck, lint, docs checks, and the narrow production build gate
- [x] 5.3 Re-run the completion audit and archive only after every local-ready domain has a verified sign-in handoff
