---
title: Scheduled jobs
description: GitHub Actions cron schedules for significanthobbies — production smoke probe every 6 hours and weekly quality check on Mondays. No in-app cron.
---

# Scheduled jobs

> All scheduled jobs are GitHub Actions cron workflows — there is no in-app
> cron, no Cloudflare Cron Triggers, no Durable Object alarms. Code and
> `.github/workflows/*.yml` are authoritative for schedules; this page is a
> summary.

## Smoke probe — every 6 hours

- **Workflow:** `.github/workflows/smoke.yml`
- **Schedule:** `0 */6 * * *` (every 6 hours) + `workflow_dispatch`
- **What:** Probes `https://significanthobbies.com/` with a 20s timeout.
  200 = OK. 429/1015 = Cloudflare zone-level rate-limit active (dashboard fix,
  not a code fix — see [`runbook.md`](runbook.md)). Anything else = unexpected
  failure.
- **User-Agent:** `smoke-probe/1.0`

## Weekly quality check — Mondays 09:00 UTC

- **Workflow:** `.github/workflows/weekly.yml`
- **Schedule:** `0 9 * * 1` (Mondays 09:00 UTC) + `workflow_dispatch`
- **What:** Runs `lint`, `typecheck`, `test`, `build` if the scripts exist.
  Broader than the CI gate (which runs lint + typecheck + test:coverage on
  push/PR). Catches drift that passes per-PR CI but breaks the full build.

## CI — push/PR to main

- **Workflow:** `.github/workflows/ci.yml`
- **Trigger:** push or PR to `main`/`master`
- **What:** `lint`, `typecheck`, `test:coverage` (v8 thresholds on core
  `src/lib` modules). See [`development/testing.md`](../development/testing.md).

## Docs check — docs/ changes

- **Workflow:** `.github/workflows/docs.yml` (added in this consolidation)
- **Trigger:** push to `main` or PR touching `docs/**`, `STATUS.md`,
  `AGENTS.md`, `README.md`, `docs-site/**`,
  `scripts/docs-check-links.mjs`, or the workflow itself.
- **What:** two jobs. `docs-check` runs `node scripts/docs-check-links.mjs`
  (link + frontmatter validation, no network, Node built-ins only).
  `docs-build` then installs the `significanthobbies-docs` workspace and runs
  `pnpm run build` in `docs-site/` (Blume build). See
  [`maintenance.md`](../maintenance.md).

## Deploy — manual

- **Workflow:** `.github/workflows/deploy.yml`
- **Trigger:** `workflow_dispatch` only (not on push)
- **What:** Full Cloudflare deploy + edge cache purge + smoke check. See
  [`runbook.md`](runbook.md).
