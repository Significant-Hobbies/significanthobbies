# Significant Hobbies Hub

The Hub is the front door and privacy-safe control plane for five personal apps:
Live, Calorie, Setline, Kith, and Anchor. Anchor has absorbed the
maintained Indulge/Habits product; the backend keeps `habits` records and typed
contracts only for compatibility.

This repository owns:

- the Hub UI served by `services/hub-backend`;
- the existing `personal-platform` Cloudflare Worker and D1;
- typed summary, record, semantic-action, audit, and undo contracts;
- the root `PersonalSyncKit` Swift package used by native applications.

Live and Journal were extracted with preserved history into
[`Significant-Hobbies/live`](https://github.com/Significant-Hobbies/live) and
[`Significant-Hobbies/journal`](https://github.com/Significant-Hobbies/journal).
Their runtime and local data identities did not move.
Journal has since been removed from the Fleet product lineup; its independent
source and compatibility history are retained.

## Checks

```bash
npm --prefix services/hub-backend ci
npm run check
npm run test:swift
```

See [the ownership matrix](docs/architecture/ownership-and-extraction.md) for
canonical repositories, data authorities, compatibility, and rollback.

## Native sync commit contract

Native consumers should call `synchronize(applyChanges:)` and atomically save
the supplied batch in their own store before that closure returns. Throw if
the save fails. Download metadata and the cursor advance only after the closure
succeeds. The app must tolerate replay: if its save succeeds but bookkeeping
fails, the same batch can arrive again. Do not recursively synchronize inside
the apply closure. Concurrent sync attempts wait for the current commit.

The return-only `synchronize()` API is deprecated. It remains available for
compatibility, but cannot establish that downloaded records reached the app's
durable store. Consumer migration and physical signed-in qualification are
tracked in [#155](https://github.com/Significant-Hobbies/significanthobbies/issues/155).

<!-- portfolio-retained-work:2026-09-07 -->
## Retained work from the portfolio review

These are unresolved requirements retained at the owner’s request. They are not completed features. Work should follow a concrete need and fresh evidence.

### Add a shared Significant Hobbies design foundation

Define the shared design foundation around the retained apps, while preserving independent stores and app ownership.

Original requirements and discussion: [#147](https://github.com/Significant-Hobbies/significanthobbies/issues/147).

### Preserve the Hub destination through sign-in

[The entry-contract repair (#154)](https://github.com/Significant-Hobbies/significanthobbies/issues/154)
now keeps sign-in and the private Hub on Live's authenticated origin, using the
existing Hub renderer and Live host-only session. [Local qualification](docs/hub-login-qualification-2026-09-07.md)
verified real synthetic sessions, two-account summary isolation, expiry, revoked
sessions, retry and unavailable-auth behavior. The public directory stays on the
apex; the authenticated entry is `https://live.significanthobbies.com/hub`.
On 9 September 2026, source `629d8e7be44295044e60c950395ec3232541a373`
was deployed to `personal-platform` as version
`8549fc16-e9dd-4ed8-864f-363c6cfde642`, verified at 100% traffic with its
full Git SHA tag. The [release receipt](https://github.com/Significant-Hobbies/significanthobbies/issues/154#issuecomment-5598004640)
records six passing deployment gates, 53 Worker tests, and actual 390px browser
verification: five apps without Journal, no horizontal overflow, and apex
`/hub` → Live `/hub` → Live `/login?callbackUrl=%2Fhub`, with private/no-store
redirects and a working public-directory guest exit.

Google still rejects the actual sign-in handoff with `redirect_uri_mismatch`;
[Live issue 14](https://github.com/Significant-Hobbies/live/issues/14) retains the
callback registration requirement. Keep #154 open for real hosted account
return, expiry and isolation qualification. The private Hub is not yet shareable.
Rollback for this release is Worker version
`d9b6ea57-7b9c-4a75-8f25-db62bd6d4db8` (source `c821abf`). No schema,
credential or binding configuration change was made.

## Native sync account ownership

Before first sync, the native app must ask the person to approve which verified
Hub account owns its local document, save that choice atomically with the local
data, and bind the runtime with `bindAccount(account, adoptingUnownedData: true)`.
Obtain `account` from `identity.verifiedSyncAccount()`; its public `userID` is the
server-verified stable ID. Existing ownership never transfers to another user.
Legacy queues without ownership stay intact and cannot upload before approval.

Pass the captured account to `enqueue(..., account: account)` and
`synchronize(account: account, applyChanges: ...)`. The app's commit callback
must also check its local document owner before saving downloaded changes.
Account changes invalidate older grants; same-user token refresh can obtain a
new grant and resume the same durable queue. Unscoped enqueue is supported only
for a still-unowned offline queue. Use a separate local document and sync storage
for another account; do not delete or reassign old data to make sign-in succeed.

The runtime serializes binding, enqueue and sync. Its apply callback must commit
only the app document; it must not await enqueue or another sync on the same
runtime. Changes needed after a download should be staged after synchronize
returns. Native consumer adoption remains tracked in issue 156.

## Opt-in download recovery

Compatible callers can request `synchronize(account: account, replayFromStart: true, applyChanges: ...)`
to recover records an older client acknowledged without retaining. This keeps the
verified-owner lock and existing outbox processing, reads historical pages from
zero without resetting durable state, and commits the app before updating progress.
Replay is cancellable and limited to 100 pages of at most 500 records; a limit,
partial download or app-write failure leaves the cursor retryable. The cursor
never moves backwards.

The callback receives the latest replayed version of each record, excluding
versions older than already-known metadata. Callers must still preserve newer
local edits and local tombstones; replay is not permission to replace their store.
Do not opt outbound-only callers such as Anchor into imports. Kith/Setline caller
acceptance and actual account recovery remain in [#155](https://github.com/Significant-Hobbies/significanthobbies/issues/155).
