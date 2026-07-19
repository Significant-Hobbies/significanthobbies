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

`User` (app profile: username, bio, creed, onboardingData, completedQuests,
earnedBadges), `Account`/`Session`/`VerificationToken` (legacy NextAuth-era,
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

`Commitment` (hobbyName, goalDays, status, startDate, completedAt) and `Stamp`
(commitmentId, dayDate, proofUrl, proofType, note). The unique index
`Stamp_commitmentId_dayDate_key` on `(commitmentId, dayDate)` enforces one
stamp per day per commitment — the core invariant. `proofType` is derived from
`proofUrl` (`youtube` | `video` | `image` | `url` | `text`). Streak math is
pure (`src/lib/commitments.ts`); streak badges (7/30/100/365-day) are merged
into `User.earnedBadges` by the `logStamp` server action. See
[`decisions.md`](decisions.md) A4 and A8.

### Daily ritual (from today-little-log merge)

`Habit` (name, status, targetFrequency, icon, sourceQuestId), `HabitLog`
(habitId, dayDate, completed — unique on `(habitId, dayDate)`), `JournalEntry`
(userId, dayDate, amEntry, pmEntry — unique on `(userId, dayDate)`),
`DailyCheckin` (userId, dayDate, amCompleted, pmCompleted — unique on
`(userId, dayDate)`). All private by default — no visibility fields. See
[`knowledge/archive/merge-plan-tll.md`](../knowledge/archive/merge-plan-tll.md)
for the merge rationale.

### Quests and arcs

`UserQuest` (questId, type `rediscovery` | `static`, sourceHobby,
sourceTimelineId, sourceBucketItemId, arcId, status). The unique index
`UserQuest_userId_questId_active_key` on `(userId, questId, status)` prevents
duplicate active quests. `Arc` (title, type, sourceBucketItemId,
sourceTimelineId, status) groups quests into life chapters.

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
