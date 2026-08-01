## Why

Anonymous visitors can explore several private planning surfaces but cannot reliably keep what they enter. This makes the product appear to accept work and then ask for it again, while each feature independently decides whether the database or a read-only sample is authoritative.

## What Changes

- Add one application-wide storage mode: `local` for anonymous visitors and `account` for authenticated users.
- Give private planning surfaces a shared local persistence layer with versioned records, validation, timestamps, and explicit ownership metadata.
- Make Trajectory fully usable without an account and restore an anonymous user's active contract and reviews on return.
- Replace misleading guest samples or save affordances with UI that clearly identifies where the current data is stored.
- Add an idempotent sign-in handoff that imports local work into the account database without deleting the local copy until the database transaction succeeds.
- Inventory and migrate the remaining private Daily and Living writes in bounded slices so the whole application converges on the same source-of-truth contract.
- Keep public/community reads server-backed and keep publishing, sharing, and account-only identity operations behind authentication.

## Capabilities

### New Capabilities

- `local-first-persistence`: Defines storage-mode selection, anonymous durability, source-of-truth visibility, sign-in handoff, conflict handling, and failure recovery across private product data.

### Modified Capabilities

- `trajectory-contract`: Makes trajectory contracts and reviews writable and durable for anonymous visitors as well as authenticated owners.

## Impact

- Affects auth/session state, private feature actions and clients, Trajectory, Daily and Living planning surfaces, and their tests and documentation.
- Adds a browser-storage repository and a shared storage-mode provider; it does not require a new production dependency or a production database migration for the first slice.
- Database writes remain owner-scoped. Public data and publication workflows remain database-backed and authenticated.
