# STATUS — significanthobbies

> Short live-status view. Detailed historical status log preserved at
> [`docs/knowledge/archive/project-status-2026-07-13.md`](docs/knowledge/archive/project-status-2026-07-13.md).
> Update this file when the objective, active work, blockers, or next steps
> change. Do not let deploy-version snapshots accumulate here — put those in
> the archive.

Last updated: 2026-07-26

## Objective

Ship and operate **significanthobbies** — a life planner with two dimensions
(Daily + Living) — at `significanthobbies.com` on Cloudflare Workers. The
mortality frame (life grid, manifesto) connects both dimensions. The journal
is the bridge between daily practice and life aspirations.

## Current state

- **Runtime:** Cloudflare Worker `significanthobbies` (OpenNext) + Astro
  landing overlay for anon `GET /`. Turso (libSQL) + Drizzle ORM +
  better-auth Google OAuth. PostHog analytics.
- **Two dimensions shipped:** Daily ritual (`/daily` — AM/PM prompts, habits,
  compulsory journal) and Living (timelines, bucket lists, side quests,
  public profiles, SEO blog, discovery quiz).
- **Journal reader built locally:** `/daily` now pairs today's AM/PM writing
  with a private, read-only 21-day date rail. The rail communicates only
  whether writing exists — no totals, streaks, scores, or entry-length
  comparisons. No schema change; production deployment remains operator-owned.
- **Front door (2026-07-26):** `/life-in-weeks` is a new anonymous surface —
  one birth year in, the whole life grid out, then a turn toward what the
  remaining weeks are for. The mortality frame previously existed only behind
  Google OAuth, so the most affecting thing the product does was unreachable
  for a first-time visitor. It is now the hero CTA on the Astro landing and the
  closing link on `/manifesto`.
- **Mortality maths corrected everywhere (2026-07-26):** every surface now
  derives weeks remaining from conditional life expectancy. The old fixed
  4,000-week frame told a 71-year-old they had ~270 weeks left and anyone past
  77 exactly zero, on `/dashboard`, `/daily`, `/trajectory`, `/look-back`,
  `/commitments` and their public profile. See
  [`docs/architecture/decisions.md`](docs/architecture/decisions.md) A10.
- **The corpus is reachable (2026-07-26):** every "thing you could do" the
  product owns is now importable data rather than a const inside a page
  component. 322 experiences at `/experiences`, each with its own page; the
  suggestion engine reads all of them where it previously had a private
  52-item pool. 122 hobbies gained twelve cross-cutting facets, so "gentle,
  cheap, screen-free" is two clicks rather than unanswerable. See
  [`docs/architecture/decisions.md`](docs/architecture/decisions.md) A11.
- **Discovery:** the hobby quiz (`/find-your-hobby`) is the single primary
  discovery UX (2026-07-03). The other three surfaces (`/hobbies`, `/explore`,
  `/journeys`) are hidden from homepage/nav/footer; code intact, reachable
  via deep links/SEO/cross-links.
- **Content flywheel:** versioned JSON content packages + CLI shipped on a
  branch; pending cross-repository OpenSpec verification and merge. The
  canonical package document is intentionally empty until topics are selected.
- **Docs:** consolidated into a canonical `docs/` tree with Blume as the
  presentation layer.
- **Product cleanup (2026-07-25):** an audit found several surfaces that looked
  like features but were not. Removed the arcs façade (table never written,
  `/arcs` permanently empty, and it fed wrong numbers to the insights panel) and
  five badges no evaluator could award. Fixed the day-boundary bug (`dayDate`
  was resolved in UTC despite being documented user-local), made habit cadence
  real, closed two privacy leaks, and wired two implemented-but-uncalled actions
  (`syncQuestProgress`, `closeEra`). Detail in
  [`docs/knowledge/learnings.md`](docs/knowledge/learnings.md).
- **Auth is optional again (2026-07-25).** All 12 route guards used a bare
  `redirect('/login')`, so signing in from `/trajectory` landed on `/dashboard` —
  the login page had accepted and validated `callbackUrl` all along and nothing
  ever sent it. Guards now preserve the return path, and "continue as guest"
  follows the same intent instead of a hardcoded `/timeline/new` (one of its old
  targets, `/bucket-list/new`, itself required a session). `/daily` and
  `/trajectory` now render a read-only signed-out preview of one sample month
  rather than a wall. The longitudinal/single-session split and its constraints
  are recorded as [`decisions.md`](docs/architecture/decisions.md) A9.

## Active work

- **`0003` applied to production 2026-07-25.**
  `drizzle/0003_visibility_and_timezone.sql` added `Commitment.visibility` and
  `UserQuest.visibility` (both `TEXT NOT NULL DEFAULT 'private'`),
  `User.timezone` (nullable `TEXT`), and the two supporting indexes. Applied
  statement-by-statement via the Turso CLI against the `significanthobbies`
  database and verified with `pragma_table_info` plus app-shaped queries. This
  unblocks deploying `main`, which already reads all three columns.

  Correction to the earlier framing: production held **0 commitments and 0
  quests**, so no existing row was ever publicly exposed. The `'private'`
  default protects future rows; it did not undo a live leak. 14 users, none with
  a timezone yet — `TimezoneSync` populates that on next visit.
- **`pnpm db:generate` is safe again (baselined 2026-07-25).** The snapshot used
  to record only migration 0000, so drizzle-kit emitted `CREATE TABLE` for tables
  that already existed in production. `drizzle/0001_baseline_current_schema.sql`
  is an intentionally empty baseline anchoring a snapshot of the current schema;
  `db:generate` now reports `No schema changes` and produces correct incremental
  diffs. The temporary guard script has been removed. Layout and conventions in
  [`drizzle/README.md`](drizzle/README.md); the failure mode is recorded in
  [`docs/knowledge/learnings.md`](docs/knowledge/learnings.md) L12.

## Routes with no inbound UI links (deliberate, not forgotten)

Checked 2026-07-25. Routes are preserved by default per the fleet standard; these
are parked with a reason rather than deleted.

| Route | Why it has no links |
| --- | --- |
| `/timelines/recent` | Duplicates `/explore` (both list `PUBLIC` timelines by recency). `/explore` is the designated community surface and is deliberately hidden pending the quiz-funnel readout, so linking either would undercut that experiment. Also absent from `sitemap.ts`. Revisit with the funnel decision. |
| `/compare` | Static hobby-vs-hobby SEO page, no user data. It is in `sitemap.ts` and indexable, so crawlers are its intended audience; internal links are optional. |
| `/explore` | Intentionally hidden — see [`docs/product/discovery-funnel.md`](docs/product/discovery-funnel.md). |
| `/hobbies`, `/journeys` | Same as `/explore`. Reachable via deep links, SEO, and quiz cross-links. |

`/life-plan` was in this category and is now linked from the account dropdown: it
is not a `/dashboard` duplicate (archetype, life balance, and the only surface
rendering bucket-item quest chains) and it is `noindex`, so surfacing it does not
touch the discovery experiment.

**Resolved 2026-07-25:** user profiles are now in `sitemap.ts`. Only users with a
username *and* at least one `PUBLIC` timeline are listed — an empty profile is a
thin page, and `PRIVATE`/`UNLISTED` content is never advertised. `lastModified`
tracks the newest public timeline update, the query is capped at 5000 rows, and it
returns `[]` on failure so a database hiccup degrades the sitemap rather than
500ing it and taking the static entries down with it.

Private app routes stay out of the sitemap by design: `/daily`, `/dashboard`,
`/trajectory`, `/commitments`, `/life-plan`, `/bucket-list`, and `/look-back` are
all `noindex` and auth-gated, so listing them would point crawlers at a login
redirect and contradict their own robots directive. `/search` is in the sitemap
and is genuinely public — that one is consistent.

## Blockers

- **7-day PostHog quiz-funnel evidence** has not been supplied in-repo;
  closure of the discovery-path decision cannot be marked complete without
  the operator readout. See
  [`docs/product/discovery-funnel.md`](docs/product/discovery-funnel.md).
- **Content-flywheel branch** pending cross-repository OpenSpec verification
  before merge.

## Next steps

1. **Nested `<main>` landmarks on 13 pages.** `app/layout.tsx` already wraps
   every page in `<main id="main">`, and 13 route components render a second
   `<main>` inside it, so assistive tech is offered a choice between two main
   landmarks. Fixed on `/life-in-weeks` only. The axe check in
   `content-flywheel.spec.ts` cannot catch it — it asserts on `main#main`,
   which a nested unnamed `<main>` leaves at a count of one. Sweep the rest and
   tighten that assertion to `page.locator('main')`.
2. **The remaining stranded content.** ~450 list items are still locked inside
   42 blog posts as prose blocks, and `famous-journeys.ts` (35 lives, 127
   phases) is in the sitemap but still two hops from any nav entry — its only
   inbound link is from `/hobbies`, which is itself not in the nav. Surfacing
   journeys in-product is a quiz-funnel decision, not a code one.
3. **Content for older visitors, remaining items.** The `/bucket-list-before-30`
   copy ("before life narrows"), `/hobbies-for-resume` framing, the
   `what-are-significant-hobbies` worked example ending at "career, now", and
   the "Life journey" starter template in `src/lib/templates.ts` whose last
   phase ends at age 28. None are linked from in-product navigation.
4. Apply `drizzle/0003_visibility_and_timezone.sql` to dev and production.
5. Capture the 7-day PostHog quiz-funnel result, then freeze the winning
   discovery path and pause feature development.
6. Review and merge the content-flywheel branch after OpenSpec verification.
7. **Make the journal an actual bridge.** `journalEntries` has no foreign key
   beyond `userId`, so the product's headline claim is copy rather than code.
   Adding an optional hobby/timeline/commitment reference to a journal entry is
   the single highest-leverage change available: it makes the thesis true and
   gives every other surface something to connect to. See
   [`docs/product/overview.md`](docs/product/overview.md).
5. Tighten the first-time user journey to a meaningful public timeline.
6. Wire habits ↔ commitments (optional explicit link, no auto-link by default).
8. Decide whether the social layer earns investment. `follows` is a vanity
   counter — no follower list, no feed, and no notification of any kind exists
   in the codebase, so a like, comment, or follow is silently discarded. Either
   ship notifications or stop presenting these as social features.

## Unresolved questions

- Will the quiz funnel validate as the primary discovery path, or does one of
  the hidden surfaces need to be re-surfaced? (Blocked on PostHog readout.)
- Should the content-flywheel canonical package document be populated before
  or after the branch merge? (Pending topic selection.)
- Should the `Arc` table and `UserQuest.arcId` be dropped? **Resolved 2026-07-25:
  retained.** All arcs runtime code is gone; the columns stay to avoid a
  destructive migration against production, which costs nothing at runtime. The
  inaccurate justification has been corrected in
  [`docs/architecture/data-model.md`](docs/architecture/data-model.md) — nothing
  ever wrote `arcId`, so there is no legacy data behind it. Drop them only as part
  of a deliberate schema tidy, never as a side effect of `db:generate`.
- Should `dailyCheckins` be retired? `amCompleted`/`pmCompleted` nearly duplicate
  "the matching journal entry is non-empty", but not exactly: writing an AM entry
  in the evening leaves `amCompleted` false. Deriving would change what the AM/PM
  rings mean, so this needs a product call rather than a refactor.

Trajectory is built and documented in
[`docs/product/trajectory.md`](docs/product/trajectory.md) (including the three
pieces of its design that were deliberately not built). Not yet deployed —
production deploy is operator-owned.

## Deploy fingerprint

- **Worker:** `significanthobbies` (prod) / `significanthobbies-preview` (PR)
- **Routes:** `significanthobbies.com/*`, `www.significanthobbies.com/*`
- **Deploy trigger:** manual `workflow_dispatch` on `.github/workflows/deploy.yml`
- **DB:** Turso `significanthobbies` (libSQL)
