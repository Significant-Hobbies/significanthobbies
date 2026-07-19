---
title: Failed approaches and resolved traps
description: Resolved traps and approaches that did not work — preserved so they are not re-introduced. Cloudflare 1015 rate-limit, s-maxage-only cache marking, OpenNext sparse-store, stale overlay, Prisma/NextAuth era.
---

# Failed approaches and resolved traps

> Preserved so the same traps are not re-introduced. Each entry: what happened,
> how it surfaced, the fix, and the durable constraint.

## F1 — Zone-level Cloudflare rate-limit rule caused 1015 on homepage

- **What:** A zone-level rate-limit rule in the Cloudflare dashboard throttled
  requests to `/`, returning HTTP 1015 (Cloudflare's rate-limit code) or 429.
  The `smoke.yml` probe caught it.
- **How it surfaced:** the smoke probe reported 429/1015. The code was
  unchanged — the rule was a dashboard config.
- **Fix:** remove or relax the zone-level rate-limit rule in the Cloudflare
  dashboard. The Worker's own `caches.default` layer does not rate-limit.
- **Durable constraint:** do not add zone-level rate-limit rules on `/` without
  considering the smoke probe's 6-hourly cadence. See
  [`operations/runbook.md`](../operations/runbook.md) and the `smoke.yml` case
  statement which explicitly calls out 429/1015 as a dashboard issue.

## F2 — s-maxage-only cache headers marked DYNAMIC at the zone level

- **What:** Setting only `s-maxage` on responses caused Cloudflare zone-level
  Cache Rules to mark them DYNAMIC, defeating the edge cache.
- **How it surfaced:** marketing/tool pages were not caching; TTFB regressed.
- **Fix:** use `caches.default` directly in `worker.mjs` with full
  `public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800`
  headers, and an explicit `CACHEABLE_EXACT` / `CACHEABLE_PREFIXES` allowlist.
  Sidesteps the zone-level rule requirement.
- **Durable constraint:** do not revert to s-maxage-only headers. New
  cacheable routes must be added to the allowlist. See
  [`architecture/decisions.md`](../architecture/decisions.md) A5.

## F3 — OpenNext + pnpm monorepo sparse-store resolution failures

- **What:** `opennextjs-cloudflare` build failed with module resolution errors
  because pnpm's sparse store does not resolve nested deps the way OpenNext
  expects.
- **How it surfaced:** `cf-build.mjs` failed during the OpenNext build step.
- **Fix:** `scripts/cf-build.mjs` patches the sparse pnpm store before the
  OpenNext build.
- **Durable constraint:** if you change the pnpm workspace structure (add/remove
  a workspace member) or upgrade OpenNext, verify the sparse-store patch still
  applies. See [`architecture/overview.md`](../architecture/overview.md).

## F4 — Prisma + NextAuth v5 (superseded)

- **What:** the v1 design (2026-03-01) specified Prisma + NextAuth v5. Both
  were replaced: Drizzle ORM + better-auth.
- **How it surfaced:** migration to Cloudflare Workers — Prisma was heavy on
  Workers and NextAuth v5's Drizzle adapter was less clean than better-auth's.
- **Fix:** Drizzle (`src/db/schema.ts` is source of truth) + better-auth
  (`src/server/auth/config.ts`). Legacy PascalCase tables preserved; better-auth
  uses `auth_`-prefixed tables. `prisma/seed.ts` is legacy naming only.
- **Durable constraint:** do not reintroduce Prisma or NextAuth. See
  [`architecture/decisions.md`](../architecture/decisions.md) A7.

## F5 — Four parallel discovery surfaces diluted measurement

- **What:** `/hobbies`, `/explore`, `/journeys`, and `/find-your-hobby` all
  competed as discovery entry points. Funnel measurement was impossible
  because users entered through different surfaces with different intents.
- **How it surfaced:** could not attribute conversion to any single surface.
- **Fix:** 2026-07-03 — made the quiz (`/find-your-hobby`) the single primary
  discovery UX. Hid the other three from homepage/nav/footer (code intact,
  routes reachable via deep links/SEO/cross-links). Instrumented a 3-step
  PostHog funnel.
- **Durable constraint:** do not re-surface the hidden surfaces until the
  7-day funnel readout is in. Do not add a fifth discovery surface. See
  [`product/discovery-funnel.md`](../product/discovery-funnel.md).

## F6 — Scoring daily practice turned reflection into performance

- **What:** `today-little-log` had a scoreboard, min/ideal/max habit values,
  monthly calendar locks, streak counts, and a life score. Users experienced
  this as surveillance and shame, not encouragement.
- **How it surfaced:** product stance crystallized during the TLL merge —
  "we don't shame you for missed days."
- **Fix:** the merge dropped all scoring. Habits are simple boolean
  check-ins. The journal is compulsory but not scored. Commitments keep
  streaks (they are about proof, not daily rhythm).
- **Durable constraint:** do not add scoring, streaks, or XP to the daily
  ritual. See [`architecture/decisions.md`](../architecture/decisions.md) A4.
