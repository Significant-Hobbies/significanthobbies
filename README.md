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
Deployment and actual hosted Google sign-in remain unqualified. Keep #154 open
until exact deployed revisions and a real hosted return/expiry/isolation journey
are recorded; local test-provider proof does not make the private Hub shareable.
