---
title: Trajectory — build plan
description: Concrete build plan for the Trajectory feature — schema, routes, components, ritual integration, testing, rollout. Pairs with trajectory.md (the design).
---

# Trajectory — build plan

> Pairs with [`trajectory.md`](trajectory.md) (the design). This doc is the
> implementation plan: schema, files, ritual integration, testing, rollout.
> Schema and code referenced here do not exist yet — this is the plan, not
> the implementation.

## Guiding constraints

- **Private only.** No `visibility` column, no public API, no sharing. Same
  stance as the daily ritual tables.
- **No score.** No 1-10, no computed rating. Numeric inputs are user-supplied
  raw values; the chart plots them against the ideal line. The gap is the
  score.
- **Follow existing patterns.** Drizzle schema in `src/db/schema.ts`,
  server actions in `src/lib/actions/`, route in `src/app/`, client
  component in `src/components/`. Match the commitments/daily shape.
- **No deploy, no prod migration.** Schema lands via `pnpm db:push` for
  local dev only. Prod migration is operator-owned.

## Schema (`src/db/schema.ts`)

Two new tables, appended after the daily ritual section. PascalCase table
names to match the app-owned convention; field naming matches existing
tables (`userId`, `createdAt`, `updatedAt`, `dayDate`-style strings).

### `TrajectoryEra`

One row per (user, bucket, era). An era is a stretch of time during which
the user held a particular ideal for a bucket.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | text PK | `createId()` |
| `userId` | text → `User.id` cascade | owner |
| `bucket` | text | one of `health` \| `finance` \| `knowledge` \| `relationships` |
| `idealText` | text | free-form, 1-3 sentences |
| `status` | text | `active` \| `completed` \| `abandoned` |
| `openedAt` | timestamp | era start |
| `closedAt` | timestamp nullable | set when status leaves `active` |
| `createdAt` / `updatedAt` | timestamp | `(unixepoch())` defaults |

Indexes:
- `TrajectoryEra_userId_idx` on `userId`
- `TrajectoryEra_userId_bucket_status_idx` unique on
  `(userId, bucket, status)` — enforces **one active era per bucket per
  user**. The core invariant: there is exactly one "current ideal" per
  bucket. (Completed/abandoned eras can coexist many-per-bucket because
  their `status` differs from `active`.)

### `TrajectoryEntry`

One row per (era, month). The monthly reflection + optional numeric
inputs.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | text PK | `createId()` |
| `eraId` | text → `TrajectoryEra.id` cascade | which ideal this entry was scored against |
| `userId` | text → `User.id` cascade | denormalized for cheap per-user queries |
| `bucket` | text | denormalized from era for cheap bucket grouping |
| `monthKey` | text | `YYYY-MM` (user-local) |
| `reflection` | text | free-form monthly reflection |
| `numbers` | text | JSON array: `[{ "label": "runway months", "value": 7 }, ...]`. Free-form per design choice #3. Empty array if none. |

Indexes:
- `TrajectoryEntry_eraId_monthKey_key` unique on `(eraId, monthKey)` —
  one entry per era per month. Prevents duplicate monthly reflections.
- `TrajectoryEntry_userId_idx` on `userId`
- `TrajectoryEntry_userId_bucket_idx` on `(userId, bucket)` — for the
  per-bucket page query

### Why two tables, not one

A single "entries" table with the ideal copied onto each entry would let
the ideal drift silently (edit one entry, the others don't match). The
era table makes the ideal a stable artifact with explicit open/close
semantics — which is the whole thesis. The unique index on
`(userId, bucket, status='active')` is the invariant that enforces "one
current ideal per bucket."

## Server actions (`src/lib/actions/trajectory.ts`, new file)

Mirror the shape of `daily.ts` and `commitments.ts`. All actions
`await getServerAuthSession()` and reject unauthenticated calls. All
mutations call `revalidatePath('/trajectory')` (and `/daily` for the
month-end prompt state).

- `getTrajectoryState()` — single query bundle for the page: all eras
  for the user (grouped by bucket, sorted `openedAt desc`), all entries
  for the user (sorted `monthKey asc`). One round trip.
- `setIdeal(bucket, idealText)` — closes the current active era (if any)
  by setting `status='abandoned'` + `closedAt=now` **unless** the user
  explicitly marks it completed first (see `closeEra`). Then inserts a
  new era with `status='active'`, `openedAt=now`. Enforces the
  one-active-era invariant.
- `closeEra(eraId, outcome: 'completed' | 'abandoned')` — user-declared
  era close. Sets `status` + `closedAt`. Refuses if era is not active.
  Refuses if eraId does not belong to the session user.
- `saveEntry(eraId, monthKey, reflection, numbers)` — upsert on
  `(eraId, monthKey)`. Validates `numbers` is a JSON array of
  `{ label: string, value: number }` objects (zod). Truncates reflection
  to a sane max (e.g. 5000 chars).
- `getActiveMonthEndNudge()` — used by the daily ritual: returns
  `{ active: boolean, bucketsPending: bucket[] }` if today is in the
  2-day month-end window (last day of month or first day of next) and
  the user has at least one active era without an entry for the
  closing/opening month. See "Ritual integration" below.

## Pure helpers (`src/lib/trajectory.ts`, new file)

No DB/auth deps — unit-testable in isolation, matches the
`commitments.ts` / `mortality.ts` pattern.

- `BUCKETS = ['health', 'finance', 'knowledge', 'relationships'] as const`
- `isMonthEndWindow(now: Date): boolean` — true if `now` is the last day
  of its month OR the first day of its month. (Last day: tomorrow's
  month differs. First day: yesterday's month differs.)
- `monthKeyFor(date: Date): string` — `YYYY-MM`.
- `previousMonthKey(monthKey: string): string` — for the "first day of
  new month" case where the nudge is about *last* month's reflection.
- `bucketHasEnoughPointsForChart(entries: TrajectoryEntry[]): boolean` —
  the "don't draw a line until 3 data points" rule. Counts entries with
  at least one numeric input within the active era.
- `summarizeEra(era, entries): { status, openedAt, closedAt, monthCount, lastEntryMonth }` — for the one-line era summaries on the page.

## Route (`src/app/trajectory/page.tsx`, new file)

Server component. Shape mirrors `src/app/commitments/page.tsx`:

```
session = await getServerAuthSession()
if (!session?.user) redirect('/login')
state = await getTrajectoryState()
birth = birthDateFromYear(me?.birthYear)
weeksRemaining = ... // mortality frame, same as /daily and /commitments
return <TrajectoryPageClient state={state} weeksRemaining={weeksRemaining} />
```

`metadata`: `robots: { index: false, follow: false }` — private surface,
matches `/daily` and `/commitments`.

## Client component (`src/components/trajectory/`, new dir)

- `trajectory-page-client.tsx` — top-level. Renders the 4 bucket
  sections in fixed order (Health, Finance, Knowledge, Relationships).
  Holds no state of its own; each bucket section is self-contained.
- `bucket-section.tsx` — one bucket. Renders: current ideal (with an
  "Edit ideal" affordance that opens the era-close flow), the trajectory
  chart if the active era has ≥3 numeric data points, the active era's
  entry history (most recent first), and the era list below (active
  expanded, completed/abandoned as one-line summaries, clickable to
  expand).
- `ideal-editor.tsx` — modal/inline form for editing the current ideal.
  On save, prompts: "Did you reach your previous ideal?" Yes →
  `closeEra(prevId, 'completed')`. No → `closeEra(prevId, 'abandoned')`.
  Then `setIdeal(bucket, newText)`. First-ever ideal (no previous era)
  skips the close prompt.
- `month-entry-form.tsx` — reflection textarea + dynamic list of
  `{ label, value }` numeric inputs ("Add a number" button). Calls
  `saveEntry`. Pre-filled if an entry for the current month already
  exists (upsert).
- `trajectory-chart.tsx` — minimal SVG line chart. One line per numeric
  input label, plotted across `monthKey` x-axis. The ideal is *not* a
  numeric line (ideals are free-form text) — so the chart shows
  trajectory only, with the ideal text rendered as a caption above.
  This is honest: we don't fabricate a target line from free-form text.
  Defer to the build: if a numeric input's label matches a recognizable
  pattern ("runway months", "X/week") we *still* don't draw a target
  line — the user reads the gap themselves, per the design.

## Ritual integration (`src/app/daily/page.tsx` + `src/components/daily-ritual.tsx`)

The month-end nudge is the only integration point. No new route, no new
table — just a conditional section in the daily ritual.

- `src/app/daily/page.tsx`: add `const trajectoryNudge = await
  getActiveMonthEndNudge()` to the `Promise.all`. Pass to `<DailyRitual>`.
- `src/components/daily-ritual.tsx`: if `trajectoryNudge.active`, render
  a single non-intrusive card near the top of the ritual: "It's
  month-end — reflect on your Trajectory" with a link to `/trajectory`
  and the list of buckets with a pending entry. Does **not** block the
  ritual, does **not** auto-open anything. One tap to dismiss for the
  day (client-state only, no persistence — comes back next day if still
  in the window and still pending).

The 2-day window logic lives in `isMonthEndWindow` (pure, tested).
`getActiveMonthEndNudge` uses it to decide whether to query at all —
cheap no-op outside the window.

## Nav (`src/components/nav.tsx`)

Add `{ href: '/trajectory', label: 'Trajectory' }` to `NAV_LINKS`,
placed right after `/daily` (it's the same private-dimension cadence).
No footer change needed (footer is for public surfaces).

## Testing

### Unit (`src/lib/trajectory.test.ts`, co-located)

Pure module, no DB — highest-value test target. Cover:
- `isMonthEndWindow` — last day of month (incl. Dec 31 → Jan 1 boundary),
  first day of month, mid-month returns false, Feb 28 non-leap vs Feb 29
  leap.
- `monthKeyFor` / `previousMonthKey` — Dec→Jan wrap, month formatting.
- `bucketHasEnoughPointsForChart` — 0, 1, 2, 3 entries; entries with no
  numbers don't count; entries from a previous era don't count toward
  the active era's chart.
- `summarizeEra` — active vs completed vs abandoned; empty era; era with
  entries.

### E2E (`e2e/trajectory.spec.ts`, new)

Mirror the `daily.spec.ts` shape. Cover:
- Unauthenticated redirect to `/login`.
- Authenticated empty state: 4 bucket sections render, each with an
  "Set your ideal" prompt, no chart, no era list.
- Set ideal → era appears as active, expanded.
- Save a monthly entry → appears in the active era's history.
- Edit ideal → era-close prompt appears; both "Yes" and "No" paths
  produce the correct era outcome badge; new era becomes active.
- Era list: completed and abandoned eras render as one-line summaries
  with equal visual weight (no red, no failure styling).
- 2-day month-end nudge: mock the date (or use Playwright's
  `clock.install`) and verify the nudge appears on `/daily` only in the
  window and only when an entry is pending.

### Coverage

Add `src/lib/trajectory.ts` to the coverage thresholds in
`vitest.config.ts` (it's a pure module, same tier as `commitments.ts` /
`mortality.ts`).

## Rollout

1. **Schema** — add the two tables to `src/db/schema.ts`. Run
   `pnpm db:push` locally. Do **not** generate a migration or touch
   prod.
2. **Lib** — `src/lib/trajectory.ts` + test. Land first, in isolation,
   with unit tests passing.
3. **Actions** — `src/lib/actions/trajectory.ts`. No tests yet
   (server-action layer; the codebase doesn't unit-test actions
   directly — the pure logic lives in `trajectory.ts`).
4. **Route + components** — `src/app/trajectory/page.tsx` + the
   `src/components/trajectory/` dir. Wire nav link.
5. **Ritual integration** — daily ritual nudge. Smallest diff, lands
   last so a regression here can't block the main feature.
6. **E2E** — `e2e/trajectory.spec.ts`. Run after step 4 (page exists)
   and again after step 5 (nudge).
7. **Docs** — update `docs/architecture/data-model.md` (new table
   group), `docs/development/testing.md` (new test files), and flip
   `STATUS.md` from "proposed" to "shipped (local dev)". Run
   `pnpm docs:check`.

## Out of scope for v1

- Public sharing / sanitized share. Private only.
- Custom buckets. Fixed 4.
- Numeric target lines on the chart. Ideals are free-form text; the
  chart shows trajectory only.
- Cross-era continuous line. Era boundaries are cliffs, annotated.
- Era list "view all" affordance. All eras inline per bucket.
- Streaks or any scoring. None.
