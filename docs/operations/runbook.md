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
4. Smoke check: fetches the homepage and verifies:
   - `location.replace('/dashboard')` is present (auth redirect in Astro HTML)
   - ≥5 `<section>` elements (full Astro landing, not a stale/partial overlay)
   - `id="lcp-shell"` is present (LCP shell in overlaid index.html)

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

The deploy workflow does this automatically, but if you push a landing change
without a full deploy (e.g. hotfix the Astro overlay), purge manually.

## Failure modes

### Cloudflare 1015 rate-limit on homepage

**Symptom:** `smoke.yml` reports HTTP 429 or 1015 on the homepage probe.
**Cause:** A zone-level rate-limit rule in the Cloudflare dashboard is
throttling requests to `/`. This is a dashboard config issue, not a code issue.
**Fix:** Remove or relax the zone-level rate limit rule in the Cloudflare
dashboard. The Worker's own `caches.default` layer does not rate-limit. See
the `smoke.yml` case statement — it explicitly calls out 429/1015 as a
dashboard rate-limit, not a deploy problem.

### Stale Astro overlay

**Symptom:** Deploy smoke check fails — missing `location.replace('/dashboard')`,
<5 sections, or missing `id="lcp-shell"`.
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
