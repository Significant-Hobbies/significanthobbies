---
title: Durable learnings
description: Lessons that constrain significanthobbies — build pipeline, edge cache, OpenNext, Astro overlay, daily ritual merge, discovery funnel. Distilled from shipped work and the archived status log.
---

# Durable learnings

> Distilled from shipped work and
> [`archive/project-status-2026-07-13.md`](archive/project-status-2026-07-13.md).
> These are the lessons that still constrain the current codebase, not the
> historical narrative.

## L1 — The Astro overlay must be rebuilt and redeployed on landing changes

The anon homepage is a static Astro site overlaid into `.open-next/assets/`. It
is not ISR — there is no per-request rendering. Changing landing copy requires
rebuilding the Astro package and redeploying, then purging the edge cache. A
stale overlay is caught by the deploy smoke check (≥5 sections,
`id="lcp-shell"`, `location.replace('/dashboard')`) — see
[`operations/runbook.md`](../operations/runbook.md).

**Applied:** the deploy workflow purges `/` and `www./` after every deploy. If
you hotfix the overlay without a full deploy, purge manually.

## L2 — `run_worker_first = ["/*", "!/"]` is the LCP win

The single most important line in `wrangler.toml` for homepage TTFB. Skipping
the Worker entirely for anon `GET /` eliminates cold-start. Any change to this
pattern must be measured — do not assume invoking the Worker "just to check"
is free. See [`architecture/decisions.md`](../architecture/decisions.md) A1.

## L3 — Edge cache requires an explicit allowlist, not zone-level rules

Cloudflare zone-level Cache Rules were marking s-maxage-only responses as
DYNAMIC. The fix was `caches.default` in the Worker with an explicit
`CACHEABLE_EXACT` / `CACHEABLE_PREFIXES` allowlist. New public marketing/tool
routes must be added to the allowlist in `worker.mjs` or they will not be
edge-cached. See [`architecture/decisions.md`](../architecture/decisions.md) A5.

## L4 — `staticAssetsIncrementalCache` is what makes inlined CSS reach the browser

Without it, the runtime re-renders from `page.js` and Beasties-inlined critical
CSS is lost. This was a non-obvious failure mode — the build produced correct
HTML but the runtime served a re-rendered version. See
[`architecture/decisions.md`](../architecture/decisions.md) A6.

## L5 — Four discovery surfaces split attention; one primary is better

The 2026-07-03 decision to hide three of four discovery surfaces and make the
quiz primary was a measurement-driven consolidation. The hidden surfaces stay
functional (SEO + deep links + cross-links from the quiz result) — only the
main entry points were removed. Do not add a fifth discovery surface. See
[`product/discovery-funnel.md`](../product/discovery-funnel.md).

## L6 — The daily ritual merge dropped scoring deliberately

The `today-little-log` merge brought habits, journal, and check-ins but
deliberately dropped TLL's scoreboard, focus timer, tasks, and scoring. The
product stance is "we don't shame you for missed days." Commitments have
streaks; daily habits do not. See [`architecture/decisions.md`](../architecture/decisions.md)
A4 and [`archive/merge-plan-tll.md`](archive/merge-plan-tll.md).

## L7 — `prisma/` is a legacy directory name; Drizzle is the ORM

The seed script at `prisma/seed.ts` uses Drizzle, not Prisma. `src/db/schema.ts`
is the source of truth. New contributors and agents repeatedly assume Prisma
from the directory name — correct them. See
[`architecture/decisions.md`](../architecture/decisions.md) A7.

## L8 — better-auth tables are `auth_*`; legacy PascalCase tables are app-owned

The `auth_` prefix avoids case-insensitive collisions with the legacy
`User`/`Account`/`Session`/`VerificationToken` tables (preserved from the
NextAuth era). better-auth reads only the `auth_*` tables; the PascalCase
tables are app-owned and referenced by `Timeline`, `Commitment`, etc. Do not
rename one set to match the other without a coordinated migration. See
[`architecture/data-model.md`](../architecture/data-model.md).
