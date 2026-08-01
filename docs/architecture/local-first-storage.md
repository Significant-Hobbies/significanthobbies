---
title: Local-first storage
description: How private data chooses browser or account persistence and moves safely at sign-in.
---

# Local-first storage

Private product data has exactly one active source of truth:

| Session | Authority | Meaning |
| --- | --- | --- |
| Signed out | This browser's IndexedDB | Durable on this device; no sync guarantee |
| Signed in | Owner-scoped D1 records | Available anywhere the account is authenticated |

Network failure never changes the authority. A signed-in write that fails stays
failed rather than silently creating a second browser copy.

## Capability inventory

The runtime registry is [`src/lib/storage-mode.ts`](../../src/lib/storage-mode.ts).
`local-ready` means the complete editable domain follows this contract;
`account-only` means anonymous editing must not pretend to persist;
`public-server` means shared server state is inherently authoritative.

Trajectory, onboarding and profile drafts, bucket lists, timelines, side quests,
commitments, habits, Daily, Look Back, dashboard, and life-plan navigation are
`local-ready`. Public profiles and discovery remain `public-server`. Owner URLs
that address an existing database record by ID remain account-only; anonymous
work is opened through its local creation workspace instead.

## Browser records

Substantial records use IndexedDB, not synchronous localStorage. Every record
has a domain, schema version, installation identifier, update timestamp, and
stable record key. Reads and writes are validated; unsupported or malformed
records are moved to a quarantine key instead of being interpreted as current
user data.

Small boot metadata—the installation identifier and storage schema version—may
use localStorage. Private content must not be sent to analytics, logs, public
caches, or public pages.

Clearing browser site data removes anonymous work. Until an export interface is
shipped, the product must describe local data as device-bound rather than imply
backup or synchronization.

## Sign-in handoff

After authentication, each local-ready domain inventories browser records. The
person chooses whether to import. Server validation and owner checks apply to
every payload, and stable local identifiers make retries idempotent.

Onboarding, profile, Daily, and Commitment records can be imported together
from the global handoff notice. Bucket-list and timeline drafts remain editable
in their creation workspaces; the notice links back to those drafts, and their
normal authenticated save writes to D1 before clearing the browser copy.

If account and browser sources both contain a single-active entity, the account
version wins by default. Replacement requires an explicit choice and a valid
domain transition. The browser source is retained through any failure and moved
to a recoverable archive only after every selected database write succeeds.

Publishing, public identity, community mutations, and cross-device access stay
account-only. A local draft may survive an attempted publish, but the public
operation must not appear successful without authentication and a server write.

## Rollback

A domain can be changed from `local-ready` to `account-only` in the capability
registry without deleting its browser records. Rollback must leave those records
untouched so a corrected client can recover or import them later.
