---
title: Architecture overview
description: Runtime shape — Cloudflare Worker (OpenNext) + Astro landing overlay + Turso/Drizzle + better-auth. Request flow, build pipeline, and the edge cache layer.
---

# Architecture overview

> The runtime shape and the non-obvious pieces. Durable decisions and the why
> behind each live in [`decisions.md`](decisions.md). The data model lives in
> [`data-model.md`](data-model.md).

## Request flow

```
Browser → Cloudflare Worker `significanthobbies` (OpenNext, worker.mjs)
  ├── GET / (anon) → ASSETS binding → overlaid Astro static hero (no Worker invocation)
  ├── GET / (authed) → Astro HTML inline location.replace('/dashboard')
  └── all other routes → OpenNext Next.js 16 App Router handlers
        ├── Turso (libSQL) via Drizzle ORM
        ├── better-auth Google OAuth sessions
        └── PostHog analytics via posthog-js wrapper
```

`worker.mjs` is a custom Worker entry that wraps OpenNext. For cacheable anon
HTML paths it consults `caches.default` first and only falls through to the
Next handler on a miss — eliminating the Worker cold-start path for warm-cache
hits on marketing/tool pages. Cache headers are explicit (`public, max-age=3600,
s-maxage=86400, stale-while-revalidate=604800`) because s-maxage-only was
getting marked DYNAMIC at the zone level.

The cacheable path list lives in `worker.mjs` (`CACHEABLE_EXACT`,
`CACHEABLE_PREFIXES`). Add new public marketing/tool routes there when they
should be edge-cached.

## Astro landing overlay

`landing-astro/` is a separate Astro package (pnpm workspace member) that
builds the static hero + below-fold sections for `GET /`. The build pipeline
overlays its output into `.open-next/assets/` so the Worker's `ASSETS` binding
serves it directly. `wrangler.toml` uses `run_worker_first = ["/*", "!/"]` so
the Worker is skipped entirely for anon `GET /` — no cold-start TTFB on the
LCP path. Auth redirect is inline in `landing-astro/src/layouts/Layout.astro`
(`location.replace('/dashboard')`). Next.js `page.tsx` is an auth-only
fallback.

See [`decisions.md`](decisions.md) A1 for why this split exists.

## Build pipeline

`scripts/cf-build.mjs` orchestrates the deploy build:

1. `next build` (webpack) + `scripts/run-inline-critical-css.mjs` (Beasties
   inlines critical CSS into prerendered HTML).
2. Patches the sparse pnpm store for OpenNext monorepo resolution.
3. `opennextjs-cloudflare` builds into `.open-next/`.
4. `scripts/run-overlay-astro-landing.mjs` overlays the Astro landing into
   `.open-next/assets/`.

`open-next.config.ts` uses `staticAssetsIncrementalCache` so prerendered HTML
(including Beasties-inlined CSS) is served from the assets binding instead of
re-rendering the React tree on every request. Without this override the
runtime re-renders from `page.js` and the inlined CSS is lost. Most routes are
prerendered at build time; a few opt into ISR (`revalidate`) or
`force-dynamic` — see [`decisions.md`](decisions.md) A6 for the exceptions and
the caveat that ISR routes are served from the last build output under this
cache.

## Preview environment

`wrangler.toml` defines an `env.preview` worker (`significanthobbies-preview`)
that deploys to `*.workers.dev` with no production routes. PR deploys use
`wrangler deploy --env preview` so they never touch the prod domain. The
preview env inherits observability and limits but explicitly empties `routes`
to avoid conflicts with the prod worker that owns `significanthobbies.com/*`.

## Storage

- **Turso (libSQL)** — production DB `significanthobbies`. Local dev uses
  `file:./dev.db`. Drizzle ORM is the only access layer; `src/db/schema.ts` is
  the source of truth.
- **Durable Objects** — re-exported from `worker.mjs` (`DOQueueHandler`,
  `DOShardedTagCache`, `BucketCachePurge`) so wrangler can resolve bindings at
  deploy time. These come from OpenNext; do not redefine them.
- **Workers AI** — `[ai]` binding in `wrangler.toml` (free tier, no API key).
  Used by the Lumi coach weekly review via `getCloudflareContext().env.AI`.

## Auth

better-auth with Google OAuth only. `src/server/auth/config.ts` is the config;
`src/lib/auth.ts` wires it to Drizzle with the schema mapping. Auth tables are
prefixed `auth_` (`auth_user`, `auth_session`, `auth_account`,
`auth_verification`) to avoid case-insensitive collisions with the legacy
PascalCase app tables (`User`, `Account`, `Session`, `VerificationToken`) which
are preserved from the Prisma era and still referenced by app code. See
`src/db/schema.ts` for the full mapping comment.

## Agent indexing surfaces

`agent-edge.mjs` (called from `worker.mjs`) serves `llms.txt`, `llms-full.txt`,
`/api/ai`, and markdown negotiation for agent/LLM crawlers. These are
fleet-standard surfaces — see
`fleet-ops/docs/agent-indexing-standard.md` (in the fleet workspace).
