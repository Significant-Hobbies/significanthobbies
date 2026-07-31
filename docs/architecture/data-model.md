---
title: Data model
description: Drizzle schema overview — auth tables, app profile, timelines, bucket lists, commitments + stamps, daily ritual tables, quests, arcs. JSON-in-SQLite pattern and the unique indexes that enforce invariants.
---

# Data model

> `src/db/schema.ts` is the source of truth — this page is a map of the tables,
> the invariants enforced by indexes, and the JSON-in-SQLite pattern. Do not
> restate field lists here; read the schema for those.

## Table groups

### better-auth core (`auth_*`)

`auth_user`, `auth_session`, `auth_account`, `auth_verification`. Field names
match `@better-auth/core` defaults so `drizzleAdapter` resolves them. Prefixed
`auth_` to avoid case-insensitive collisions with the legacy PascalCase app
tables. See [`decisions.md`](decisions.md) A7.

### App profile (legacy PascalCase, preserved)

`User` (app profile: username, bio, creed, timezone, onboardingData,
completedQuests, earnedBadges), `Account`/`Session`/`VerificationToken` (legacy NextAuth-era,
untouched — better-auth no longer reads from them). The `User` table is
app-owned and referenced by `Timeline`, `Like`, `Comment`, `Follow`,
`Commitment`, `Stamp`, `Habit`, `HabitLog`, `JournalEntry`, `DailyCheckin`,
`UserQuest`, `Arc`, `BucketList`, `BucketListItem`.

### Timelines and social

`Timeline` (phases/pins/versions as JSON text), `Like`, `Comment`, `Follow`.
Indexes on `userId`, `slug`, `visibility`. `Like` has a unique index on
`(userId, timelineId)` — one like per user per timeline. `Follow` has a unique
index on `(followerId, followingId)`.

### Bucket lists

`BucketList` (intentions/items as JSON text, visibility, slug, horizon, size,
boldness, defaultView) and `BucketListItem` (per-item status, targetYear,
completedAt, sourceSlug for items seeded from a shared list). `BucketList`
supports both list and Bingo presentations (`defaultView`).

### Commitments and stamps

`Commitment` (hobbyName, goalDays, status, visibility, startDate, completedAt)
and `Stamp` (commitmentId, dayDate, proofUrl, proofType, note). The unique index
`Stamp_commitmentId_dayDate_key` on `(commitmentId, dayDate)` enforces one
stamp per day per commitment — the core invariant. `proofType` is derived from
`proofUrl` (`youtube` | `video` | `image` | `url` | `text`). Streak math is
pure (`src/lib/commitments.ts`); streak badges (7/30/100/365-day) are merged
into `User.earnedBadges` by the `logStamp` server action. See
[`decisions.md`](decisions.md) A4 and A8.

`visibility` defaults to `private` and gates display on the public profile.
Before 2026-07-25 the column did not exist and every commitment was published
with no opt-out.

`Stamp.dayDate` is resolved in the user's timezone, so "one stamp per day" means
the user's day. See [`knowledge/learnings.md`](../knowledge/learnings.md) L9.

### Retired tables (still declared, never read)

`Arc`, `UserQuest.arcId`, and `DailyCheckin` have no runtime readers or writers.
They remain in `src/db/schema.ts` so a generated migration can never drop them —
deleting a table from the schema file is how you accidentally write a destructive
production migration.

`DailyCheckin` (userId, dayDate, amCompleted, pmCompleted) tracked whether the
AM/PM ritual was "completed". The AM/PM rings on `/daily` now derive from whether
the matching journal entry has text, which is what they always looked like they
meant: the old flag was set only when you pressed save *during* that half of the
day, so writing a morning entry in the evening left the AM ring dark even though
the entry existed. On `/dashboard` the state was write-only — stored and never
rendered. Retired 2026-07-25.

### Daily ritual (from today-little-log merge)

`Habit` (name, status, targetFrequency, icon, sourceQuestId, and one optional
owned non-abandoned commitment reference), `HabitLog`
(habitId, dayDate, completed — unique on `(habitId, dayDate)`), `JournalEntry`
(userId, dayDate, amEntry, pmEntry, and at most one optional timeline or
commitment reference — unique on `(userId, dayDate)`). The two context foreign
keys use `ON DELETE SET NULL`, so removing a Living target preserves private
writing. A database check prevents both references from being set together.
All journal data remains private by structure — no visibility fields. See
[`knowledge/archive/merge-plan-tll.md`](../knowledge/archive/merge-plan-tll.md)
for the merge rationale and [`decisions.md`](decisions.md) A12 for the bridge
boundary.

The habit commitment foreign key uses `ON DELETE SET NULL`, so removing a
commitment preserves the habit and all `HabitLog` rows. The reference is
private planning context only: writing a habit log does not write `Stamp` or
change commitment progress. See [`decisions.md`](decisions.md) A14.

### Quests and retired arcs storage

`UserQuest` (questId, type `rediscovery` | `static`, sourceHobby,
sourceTimelineId, sourceBucketItemId, arcId, status, visibility). The unique
index `UserQuest_userId_questId_active_key` on `(userId, questId, status)`
prevents duplicate active quests.

`visibility` defaults to `private` and gates display in "The evidence" on the
public profile. Before 2026-07-25 the column did not exist and every completed
quest was published with no opt-out.

The `Arc` table and `UserQuest.arcId` remain in the schema, but nothing reads or
writes them — all arcs runtime code was removed on 2026-07-25. They are retained
to avoid a destructive migration against production, **not** to preserve data:
nothing ever wrote `arcId`, so there are no legacy rows behind it. Dropping both
is an open question in [`STATUS.md`](../../STATUS.md). Side quests are the sole
quest surface.

### Trajectory (monthly life-review)

`TrajectoryEra` (userId, bucket, idealText, status `active` | `completed` |
`abandoned`, openedAt, closedAt) and `TrajectoryEntry` (eraId, userId,
bucket, monthKey `YYYY-MM`, reflection, numbers as JSON). Private only — no
visibility fields. The one-active-era-per-bucket invariant is enforced in
the `setIdeal` server action (transaction closes the current active era
before opening a new one) — a partial unique index on `status='active'`
isn't cleanly expressible in Drizzle's SQLite API. See
[`product/trajectory.md`](../product/trajectory.md) for the design.

## JSON-in-SQLite pattern

Structured fields stored as JSON strings in `text` columns:

| Table | JSON fields |
| --- | --- |
| `User` | `onboardingData`, `completedQuests`, `earnedBadges` |
| `Timeline` | `phases`, `pins`, `versions` |
| `BucketList` | `intentions`, `items` |
| `TrajectoryEntry` | `numbers` (array of `{ label, value }`) |

Parsed/serialized in server actions (`src/lib/actions/`). Default `'[]'` for
array fields. See [`decisions.md`](decisions.md) A2 for the constraint: no
indexed queries on nested fields.

## Unique indexes that enforce invariants

| Index | Table | Columns | Invariant |
| --- | --- | --- | --- |
| `Stamp_commitmentId_dayDate_key` | `Stamp` | `(commitmentId, dayDate)` | One stamp per day per commitment |
| `HabitLog_habitId_dayDate_key` | `HabitLog` | `(habitId, dayDate)` | One check-in per habit per day |
| `JournalEntry_userId_dayDate_key` | `JournalEntry` | `(userId, dayDate)` | One journal entry per user per day |
| `DailyCheckin_userId_dayDate_key` | `DailyCheckin` | `(userId, dayDate)` | One AM/PM check-in per user per day |
| `Like_userId_timelineId_key` | `Like` | `(userId, timelineId)` | One like per user per timeline |
| `Follow_followerId_followingId_key` | `Follow` | `(followerId, followingId)` | One follow per pair |
| `UserQuest_userId_questId_active_key` | `UserQuest` | `(userId, questId, status)` | No duplicate active quests |
| `TrajectoryEntry_eraId_monthKey_key` | `TrajectoryEntry` | `(eraId, monthKey)` | One reflection per era per month |

## Migrations

Drizzle migrations live in `drizzle/`. Apply with `pnpm db:push` (dev) or
`pnpm db:generate` (migration files). The local dev DB is `file:./dev.db`
(gitignored). Production is Turso `significanthobbies`. See
[`development/workflows.md`](../development/workflows.md) for the schema-change
workflow.
