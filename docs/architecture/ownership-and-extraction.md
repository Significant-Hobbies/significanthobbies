# Hub, Live, and Journal ownership

Last reviewed: 2026-08-23

| Product | Canonical repository | Runtime or release owner | Data authority | Public surface |
| --- | --- | --- | --- | --- |
| Hub and backend | `Significant-Hobbies/significanthobbies` | `personal-platform` Worker | Personal Platform D1 and typed service connectors | `https://significanthobbies.com` |
| PersonalSyncKit | `Significant-Hobbies/significanthobbies` root | native client releases | client outboxes and cursors | Swift package |
| Live | `Significant-Hobbies/live` | existing `significanthobbies` Worker | existing Significant Hobbies D1 and signed-out IndexedDB | `https://live.significanthobbies.com` plus compatible apex app paths |
| Journal | `Significant-Hobbies/journal` | Journal native release | versioned local atlas first; optional Personal Platform sync | Apple bundle `com.significanthobbies.app` |

Anchor, Calorie, Kith, and Setline remain independently owned. Anchor is the
maintained successor to Indulge/Habits; the old native repository is retained
as recoverable history. Repository movement does not move local data.

## Compatibility

- Runtime names, D1 identifiers, bundle identifiers, auth audiences, and
  storage bindings are unchanged.
- The Live Worker delegates apex `/` and `/hub` to `personal-platform` through
  a service binding. Other apex paths remain on Live so browser sessions,
  IndexedDB records, callbacks, and bookmarks keep working.
- Hub Backend calls Live and Calorie only through typed service bindings.
- Journal keeps the same local atlas and optional sync semantics.
- Personal Platform keeps the `habits` domain, stored records, callbacks, and
  typed contracts so historical builds and data remain compatible. It is no
  longer represented as a separate maintained app in the Hub directory.

## Rollback

Each repository retains the relevant Git history. A failed release can deploy
the preceding SHA to the unchanged Worker; this reconciliation has no database
or user-data migration to roll back. Superseded repositories are archived, not
deleted, so their history remains recoverable.

## Release gates

Run Worker, Swift package, Live web, and Journal native checks; verify package
references; verify public Hub/Live/backend responses; then update Site Health
and SaaS Maker before archiving old source locations.
