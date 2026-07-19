---
title: Architectural decisions
description: Durable architectural decisions for significanthobbies and the why behind each. Astro overlay, JSON-in-SQLite, quiz-as-primary discovery, no-scoring daily ritual, edge cache, OpenNext static-assets cache.
---

# Architectural decisions

> Durable choices and the why behind each. Historical design narrative is
> preserved in [`knowledge/archive/design-2026-03-01.md`](../knowledge/archive/design-2026-03-01.md)
> and [`knowledge/archive/side-quests-design-2026-03-06.md`](../knowledge/archive/side-quests-design-2026-03-06.md).
> This page keeps the choices that still constrain the current codebase.

## A1 — Astro owns `GET /`, Next.js handles everything else

**Decision:** The anon landing page is a static Astro site (`landing-astro/`)
overlaid into `.open-next/assets/`. `wrangler.toml` uses
`run_worker_first = ["/*", "!/"]` so the Worker is skipped entirely for anon
`GET /`. Next.js `page.tsx` is an auth-only fallback; authed visitors get an
inline `location.replace('/dashboard')` in the Astro HTML.

**Why:** The homepage is the LCP path and the highest-traffic page. Serving it
from the ASSETS binding eliminates Worker cold-start TTFB entirely. Astro is
also a better fit for static marketing content than Next.js App Router. The
fleet perf push (2026-06-20) required sub-second TTFB on `/`.

**Constraint:** Demo timelines moved to `GET /api/demo-timelines` because the
Astro HTML is static — it cannot render per-request data. Any new
homepage-embedded dynamic content must either be fetched client-side or moved
to a Next route. The Astro overlay must be rebuilt and redeployed when landing
copy changes; it is not ISR.

## A2 — JSON-in-SQLite for structured user data

**Decision:** Structured fields (`phases`, `pins`, `versions`,
`completedQuests`, `earnedBadges`, `intentions`, `items`) are stored as JSON
strings in `text` columns, parsed/serialized in server actions. Not normalized
into separate tables.

**Why:** The data is read and written as a whole unit per parent record
(timeline, bucket list, user). Normalizing would add join complexity and
migration burden without enabling any query pattern the product actually needs.
SQLite handles JSON text well and Drizzle's `text` columns are simple.

**Constraint:** No indexed queries on nested fields. If a future feature needs
to query "all timelines containing hobby X in any phase," that requires either
a full scan with JSON parsing in app code or a denormalized join table. Do not
assume JSON-in-SQLite scales to that case without measuring. See
[`data-model.md`](data-model.md).

## A3 — The hobby quiz is the single primary discovery UX

**Decision:** `/find-your-hobby` is the only discovery surface linked from the
homepage, nav, and footer. `/hobbies`, `/explore`, `/journeys` are hidden (code
intact, routes reachable via deep links/SEO/cross-links).

**Why:** Four discovery surfaces split attention and dilute measurement. The
quiz is the most focused, interactive, single-purpose flow with the clearest
payoff. Chosen 2026-07-03; see
[`product/discovery-funnel.md`](../product/discovery-funnel.md) for the
7-day PostHog funnel and decision rule.

**Constraint:** Do not re-surface the hidden surfaces until the 7-day funnel
readout is in. Do not add a fifth discovery surface. The hidden routes and
their SEO pages must stay functional — they are linked from the quiz result.

## A4 — No scoring, no streaks on daily practice

**Decision:** Habits are simple boolean check-ins. No scoreboard, no min/ideal/
max, no monthly calendar, no streak count, no XP for daily practice. The
journal entry is compulsory for the PM ritual but not scored.

**Why:** "We don't rank you against other people. Your weeks are your own. We
don't shame you for missed days." Scoring daily practice turns reflection into
performance, which is the opposite of the product's emotional goal. This stance
came over explicitly from the `today-little-log` merge — see
[`knowledge/archive/merge-plan-tll.md`](../knowledge/archive/merge-plan-tll.md).

**Constraint:** Commitments (`/commitments`) do have streak math and streak
badges (7/30/100/365-day) — but commitments are hobby-specific multi-day goals
with proof stamps, not the daily ritual. The two systems are deliberately
separate. Do not add streaks to habits or journal entries.

## A5 — Edge cache for anon marketing/tool HTML

**Decision:** `worker.mjs` maintains an explicit allowlist (`CACHEABLE_EXACT`,
`CACHEABLE_PREFIXES`) of anon HTML paths that are edge-cached via
`caches.default` with `public, max-age=3600, s-maxage=86400,
stale-while-revalidate=604800`. All other paths pass through to OpenNext.

**Why:** Cloudflare zone-level Cache Rules were marking s-maxage-only responses
as DYNAMIC. Using `caches.default` directly in the Worker sidesteps the
zone-level rule requirement and gives sub-second TTFB on warm-cache hits for
marketing and free-tool pages.

**Constraint:** The allowlist must be updated when new public marketing/tool
routes are added, or they will not be edge-cached. Authed requests are never
cached (the Worker checks auth state before consulting the cache). Do not add
user-specific routes to the allowlist.

## A6 — OpenNext static-assets incremental cache

**Decision:** `open-next.config.ts` uses `staticAssetsIncrementalCache` so
prerendered HTML is served from the ASSETS binding instead of re-rendering the
React tree on every request.

**Why:** This is what makes the Beasties-inlined critical CSS actually reach
the browser. Without an incremental cache the runtime re-renders from
`page.js` and the inlined CSS is lost. Most routes are prerendered at build
time, so serving prerendered HTML from the assets binding is the correct
default.

**Constraint:** A few routes opt into runtime behaviour and are the exception,
not the rule: `src/app/hobbies/[hobby]/page.tsx` and `src/app/explore/page.tsx`
use `export const revalidate` (ISR — 3600s and 300s respectively),
`src/app/sitemap.ts` uses `revalidate = 3600`, and `src/app/look-back/page.tsx`
and `src/app/timelines/recent/page.tsx` use `export const dynamic =
'force-dynamic'`. With the static-assets incremental cache, ISR routes are
served from the last build output rather than revalidating on the OpenNext
runtime — verify a new `revalidate` route actually updates before relying on
it, and grep `src/app` for `revalidate`/`dynamic` for the current set. See
[`operations/runbook.md`](../operations/runbook.md) for the cache-purge
procedure.

## A7 — Drizzle over Prisma, better-auth over NextAuth

**Decision:** The v1 design (2026-03-01) specified Prisma + NextAuth v5. The
current codebase uses Drizzle ORM + better-auth. `src/db/schema.ts` is the
source of truth; `prisma/seed.ts` is legacy naming only (it uses Drizzle now).

**Why:** Drizzle is lighter on Cloudflare Workers and has first-class Turso/
libSQL support. better-auth has a cleaner Drizzle adapter and simpler Google
OAuth than NextAuth v5 at the time of migration. The legacy PascalCase tables
(`User`, `Account`, `Session`, `VerificationToken`) are preserved because app
code references them; better-auth uses `auth_`-prefixed tables to avoid
case-insensitive collisions.

**Constraint:** Do not reintroduce Prisma. Do not rename the legacy PascalCase
tables without a coordinated migration of all references. The `prisma/`
directory name is legacy — do not add Prisma schema files there.

## A8 — Commitments and habits are separate systems

**Decision:** A commitment is a multi-day goal to show up daily for a specific
hobby (e.g. "30 days of guitar") with proof URL stamps and streak badges. A
habit is a general daily check-in (e.g. "drink water") with no scoring. The two
do not auto-link.

**Why:** Commitments are about sustained practice of a specific hobby with
evidence; habits are about daily rhythm. Conflating them would import scoring
into the daily ritual (violating A4) and import journal-style reflection into
commitments (which are about proof, not reflection).

**Constraint:** The planned "wire habits and commitments" feature (see
[`STATUS.md`](../../STATUS.md)) would allow a habit to *optionally* be linked
to a commitment so checking the habit auto-stamps the commitment — but only if
the user explicitly links them. Do not auto-link by default.
