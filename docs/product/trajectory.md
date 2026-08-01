---
title: Trajectory — a living decision system
description: One private focus contract grounded in constraints and intent, guided by a decision policy, and revised through a feedback loop.
---

# Trajectory — a living decision system

> **Status:** contract model and anonymous local persistence built locally on
> 2026-08-01. Deployment remains operator-owned.

## The thesis

Most planners store goals and tasks. Trajectory stores the reasoning that helps
a person decide what to do next without losing sight of why or ignoring the
reality they are in.

A user holds one active trajectory at a time. It has four parts:

1. **Constraints** — what the direction must respect now.
2. **Intent** — the direction that matters, without pretending it is a fixed destination.
3. **Decision policy** — the rule used when tradeoffs appear.
4. **Feedback loop** — the signals to observe and the rhythm for reconsidering the framing.

The contract is private, unscored, and revisable. One active contract is itself
a focus constraint: the product does not let planning proliferate into a list of
competing life strategies.

## Review loop

At a user-selected weekly or monthly rhythm, the owner records what reality
showed them and chooses one decision:

- **Continue** — preserve the active contract and add the observation.
- **Adjust** — close the current version and open a revised successor.
- **Complete** — close the direction because it reached its intended end.
- **Release** — close it without framing that choice as failure.

Missed reviews create no penalty, score, streak reset, or synthetic entry. The
cadence is review context in this first version, not a notification promise.

## History

Every adjustment creates an immutable version. `/trajectory` shows prior
versions, their review signals and decisions, and which of the four parts
changed between adjacent versions. The product does not judge whether a change
was correct; it makes the user's evolving reasoning visible.

## Privacy and boundaries

- Trajectory contracts and reviews are owner-only and never public.
- A signed-out person can create and review a private trajectory stored only in
  this browser. The page identifies the device as the source of truth.
- After sign-in, local history can be imported explicitly. An existing account
  trajectory is never overwritten silently, and the local copy is archived
  only after a successful import.
- No AI authors the contract or chooses a direction.
- No contract is automatically connected to a habit, commitment, journal, or
  public artifact in this first slice.
- No scheduler, notification, scoring, recommendation, or progression system is included.

## Legacy monthly trajectory

The earlier implementation stored four bucket-specific ideals (Health,
Finance, Knowledge, Relationships), monthly reflections, numeric series, and
eras. Those tables and records remain intact. The contract model uses additive
`TrajectoryContract` and `TrajectoryReview` tables rather than silently
reinterpreting private history. The old monthly UI and Daily month-end nudge are
not part of the primary experience.

The original build plan remains at
[`trajectory-build-plan.md`](trajectory-build-plan.md) as historical design
context; it does not describe the current primary product model.

## Implementation map

- Schema: `src/db/schema.ts`
- Pure contract behavior: `src/lib/trajectory-contract.ts`
- Owner-scoped lifecycle actions: `src/lib/actions/trajectory-contract.ts`
- Route and interface: `src/app/trajectory/page.tsx` and
  `src/components/trajectory/trajectory-page-client.tsx`
- Change artifacts: `openspec/changes/add-trajectory-contract/`

## Storage authority

Trajectory follows the application storage contract:

- **Signed out:** IndexedDB on the current browser is authoritative. The data
  survives refreshes and browser restarts but is not cross-device and can be
  removed by clearing site data.
- **Signed in:** the owner-scoped D1 records are authoritative and available
  across devices.
- **At sign-in:** the application detects local history and offers an explicit,
  idempotent import. If both sources contain an active trajectory, the account
  version remains authoritative until the person chooses otherwise.

Browser records are versioned and validated. Invalid records are isolated
rather than rendered as current data. Public publishing is not available from
local mode.
