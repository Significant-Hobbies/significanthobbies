---
title: Operations runbook
description: Deploy procedure, smoke checks, edge cache purge, the Cloudflare 1015 rate-limit trap, and common failure modes for significanthobbies on Cloudflare Workers.
---

# Operations runbook

> Production deploys are manual and operator-owned. Agents must not deploy (see
> `AGENTS.md`). This runbook is for the operator and for diagnosing issues.

## Deploy (production)

Trigger: `.github/workflows/deploy.yml` → `workflow_dispatch` from `main`.

The workflow:
1. `node scripts/cf-build.mjs` — builds `.open-next/` (Next + Astro overlay).
   Does **not** run `populateCache` (that needs Cloudflare creds).
2. `wrangler deploy --minify` via `cloudflare/wrangler-action@v3` with
   `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets.
3. Best-effort edge cache purge for `https://significanthobbies.com/` and
   `https://www.significanthobbies.com/` via the Cloudflare API. Uses
   `continue-on-error: true` — a missing `cache_purge` permission (401) must
   not fail a good deploy.
4. Smoke check: fetches the homepage and verifies the Hub heading and exactly
   seven product cards in the overlaid HTML.

If the smoke check fails, the deploy is considered stale — the Astro overlay
did not rebuild or the cache was not purged. Re-run the workflow; if it
persists, manually purge the cache (see below).

## Deploy (preview / PR)

PRs deploy to `significanthobbies-preview.<account>.workers.dev` via
`wrangler deploy --env preview`. The preview env has no production routes
(`routes = []` in `wrangler.toml`) so it never touches the prod domain. The
preview worker name is `significanthobbies-preview`.

## Manual edge cache purge

```bash
# Resolve the zone ID
zone_id=$(curl -fsS -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/zones?name=significanthobbies.com" \
  | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const j=JSON.parse(d);process.stdout.write(j.result?.[0]?.id||'')})")

# Purge / (and www)
curl -fsS -X POST "https://api.cloudflare.com/client/v4/zones/$zone_id/purge_cache" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"files":["https://significanthobbies.com/","https://www.significanthobbies.com/"]}'
```

The deploy workflow purges the **whole zone** (`purge_everything`), not just
`/`. It used to purge only the homepage, which left every edge-cached path
serving pre-deploy HTML for up to a day: `worker.mjs` caches its
`CACHEABLE_EXACT` set plus everything under `/hobbies`, `/blog`,
`/bucket-lists` and `/tools` with `s-maxage=86400`. A deploy on 2026-07-26
shipped a new `/hobbies` and production kept serving the previous one — right
hobby count in the code, wrong one on the page.

Use the single-file form above only for a landing hotfix that skips a full
deploy (e.g. rebuilding the Astro overlay by hand).

**Why `/` is not enough to verify a deploy:** anon `GET /` is static Astro HTML
that skips the Worker entirely ([decisions.md](../architecture/decisions.md)
A1), so it tells you nothing about the cached HTML paths. The deploy also smoke
checks `/hobbies`, which does go through the Worker cache.

**Checking a cached page by hand.** `worker.mjs` keys `caches.default` on the
full request URL, so a query string is a guaranteed miss:

```bash
# Fresh render — proves what the deployed code produces
curl -s "https://significanthobbies.com/hobbies?cb=$RANDOM" | grep -c 'Browse by what suits you'

# What a real visitor gets, plus whether it came from cache
curl -sI https://significanthobbies.com/hobbies | grep -i x-edge-cache
```

A `Cache-Control: no-cache` **request header does not bypass the Worker cache** —
it is a hint to the CDN, and `cache.match()` ignores it. Using it to verify a
deploy will show you the stale copy and make a good release look broken.

Purge propagation is asynchronous. A cached path can stay stale for a minute or
two after `purge_everything` returns success; that is timing, not a failed
deploy. Confirm with the cache-busted URL before concluding anything.

## Failure modes

### Deploy build fails but every local build passed

**Symptom:** `deploy.yml` fails in `node scripts/cf-build.mjs` while
`pnpm build` is green on your machine. `wrangler` never runs, so production is
untouched — check the step list before assuming a partial deploy.

**Cause:** the deployed Worker has no `DB` binding, or its D1 schema migration
has not been applied. Local development uses `wrangler.local.toml`, while a
remote deploy uses the explicitly configured binding in `wrangler.toml`; a
green local build does not prove that remote operator step happened.

Check the deployment's bindings and D1 migration list before retrying. Do not
apply a remote migration just to diagnose a build failure.

**Rule:** server routes must not import from `'use client'` modules. An unused
import is silently fine, which is what makes this class of bug survive review —
the failure only appears on the path that calls it.

### Cloudflare 1015 rate-limit on homepage

**Symptom:** `smoke.yml` reports HTTP 429 or 1015 on the homepage probe.
**Cause:** A zone-level rate-limit rule in the Cloudflare dashboard is
throttling requests to `/`. This is a dashboard config issue, not a code issue.
**Fix:** Remove or relax the zone-level rate limit rule in the Cloudflare
dashboard. The Worker's own `caches.default` layer does not rate-limit. See
the `smoke.yml` case statement — it explicitly calls out 429/1015 as a
dashboard rate-limit, not a deploy problem.

### Stale Astro overlay

**Symptom:** Deploy smoke check fails — fewer than five sections or a missing
`id="lcp-shell"`.
**Cause:** `scripts/cf-build.mjs` did not overlay the Astro build into
`.open-next/assets/`, or the cache was not purged after a successful overlay.
**Fix:** Re-run the deploy workflow. If it persists, verify
`scripts/run-overlay-astro-landing.mjs` ran (check workflow logs) and manually
purge the edge cache.

### Inlined critical CSS missing

**Symptom:** Homepage renders without inlined critical CSS (FOUC, larger LCP).
**Cause:** `open-next.config.ts` is not using `staticAssetsIncrementalCache`,
or a route was added with `revalidate` which bypasses the static-assets cache.
**Fix:** Confirm `open-next.config.ts` uses `staticAssetsIncrementalCache`. Do
not add `revalidate` to routes without revisiting the cache override — see
[`architecture/decisions.md`](../architecture/decisions.md) A6.

### OpenNext + pnpm sparse-store resolution

**Symptom:** `cf-build.mjs` fails with module resolution errors during the
OpenNext build.
**Cause:** pnpm monorepo sparse-store does not resolve nested deps the way
OpenNext expects.
**Fix:** `scripts/cf-build.mjs` patches the sparse store. If you change the
pnpm workspace structure or add a new workspace member, verify the patch still
applies. See [`architecture/overview.md`](../architecture/overview.md).

## Production smoke probe

`.github/workflows/smoke.yml` runs every 6 hours (`0 */6 * * *`) and probes
`https://significanthobbies.com/` with a 20s timeout. 200 = OK; 429/1015 =
rate-limit (see above); anything else = unexpected failure. The probe uses
`User-Agent: smoke-probe/1.0`.

## Observability

`wrangler.toml` enables `[observability]` with `head_sampling_rate = 0.1` (10%
head sampling) for both prod and preview. CPU limit is 30000ms. Logs are in
the Cloudflare dashboard under the `significanthobbies` Worker.
