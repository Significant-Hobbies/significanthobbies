# STATUS — significanthobbies

> Short live-status view. Detailed historical status log preserved at
> [`docs/knowledge/archive/project-status-2026-07-13.md`](docs/knowledge/archive/project-status-2026-07-13.md).
> Update this file when the objective, active work, blockers, or next steps
> change. Do not let deploy-version snapshots accumulate here — put those in
> the archive.

Last updated: 2026-07-20

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
- **Discovery:** the hobby quiz (`/find-your-hobby`) is the single primary
  discovery UX (2026-07-03). The other three surfaces (`/hobbies`, `/explore`,
  `/journeys`) are hidden from homepage/nav/footer; code intact, reachable
  via deep links/SEO/cross-links.
- **Content flywheel:** versioned JSON content packages + CLI shipped on a
  branch; pending cross-repository OpenSpec verification and merge. The
  canonical package document is intentionally empty until topics are selected.
- **Docs:** consolidated into a canonical `docs/` tree with Blume as the
  presentation layer (this branch).

## Active work

- Docs consolidation (this branch): unified scattered root-level and `docs/`
  markdown into one canonical knowledge system. See `docs/index.md`.

## Blockers

- **7-day PostHog quiz-funnel evidence** has not been supplied in-repo;
  closure of the discovery-path decision cannot be marked complete without
  the operator readout. See
  [`docs/product/discovery-funnel.md`](docs/product/discovery-funnel.md).
- **Content-flywheel branch** pending cross-repository OpenSpec verification
  before merge.

## Next steps

1. Capture the 7-day PostHog quiz-funnel result, then freeze the winning
   discovery path and pause feature development.
2. Review and merge the content-flywheel branch after OpenSpec verification.
3. Tighten the first-time user journey to a meaningful public timeline.
4. Wire habits ↔ commitments (optional explicit link, no auto-link by default).
5. Turn side quests / XP / badges into a coherent progression system only if
   they improve hobby follow-through.

## Unresolved questions

- Will the quiz funnel validate as the primary discovery path, or does one of
  the hidden surfaces need to be re-surfaced? (Blocked on PostHog readout.)
- Should the content-flywheel canonical package document be populated before
  or after the branch merge? (Pending topic selection.)
- **Trajectory feature** (built 2026-07-19): private monthly life-review
  across Health/Finance/Knowledge/Relationships. Design in
  [`docs/product/trajectory.md`](docs/product/trajectory.md), build plan in
  [`docs/product/trajectory-build-plan.md`](docs/product/trajectory-build-plan.md).
  Shipped to local dev: schema applied, `/trajectory` route + components,
  daily ritual month-end nudge, nav link, unit tests (35 passing, coverage
  above thresholds), e2e spec. Not yet deployed — production deploy is
  operator-owned.

## Deploy fingerprint

- **Worker:** `significanthobbies` (prod) / `significanthobbies-preview` (PR)
- **Routes:** `significanthobbies.com/*`, `www.significanthobbies.com/*`
- **Deploy trigger:** manual `workflow_dispatch` on `.github/workflows/deploy.yml`
- **DB:** Turso `significanthobbies` (libSQL)
