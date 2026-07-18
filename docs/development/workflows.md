---
title: Development workflows
description: Local setup, common commands, schema changes, branching, pre-push hook, and CI gates for significanthobbies.
---

# Development workflows

> The full command list lives in `package.json` scripts and `AGENTS.md` — this
> page covers the workflows that are non-obvious or have gotchas.

## Local setup

```bash
pnpm install
cp .env.example .env          # fill in DATABASE_URL, BETTER_AUTH_SECRET, GOOGLE_CLIENT_*
pnpm db:push                  # apply Drizzle schema to local SQLite (dev.db)
pnpm db:seed                  # seed hobby catalog (tsx prisma/seed.ts — legacy dir name)
pnpm dev                      # next dev on localhost:3000
```

The `prisma/` directory is legacy naming — the seed script uses Drizzle now.
Do not add Prisma schema files there. See
[`architecture/decisions.md`](../architecture/decisions.md) A7.

## Schema changes

1. Edit `src/db/schema.ts` (the source of truth).
2. `pnpm db:push` to apply to local `dev.db` (fast iteration).
3. `pnpm db:generate` to generate a migration file in `drizzle/` (for
   production). Commit the generated migration.
4. Production applies migrations via Turso — ask the operator before running
   against prod. Agents must not run prod migrations (see `AGENTS.md`).

## Branching

`main` is the only long-lived branch. Feature work uses short-lived branches.
Production deploys are manual (`workflow_dispatch` on
`.github/workflows/deploy.yml`) — `main` is not an automatic production
trigger. PRs deploy a preview env on `significanthobbies-preview.*.workers.dev`
via `wrangler deploy --env preview`.

## Pre-push hook

`.husky/pre-push` runs `pnpm lint` (biome) and a secret-pattern scan across
tracked files. The scan matches common secret formats (OpenAI, AWS, GitHub
tokens, Google API keys, Slack tokens, private keys) and aborts the push on a
hit. Excludes `.example`, `.sample`, test, fixture, mock, and vendor paths. If
the scan false-positives on a non-secret, exclude the file pattern in the hook
— do not weaken the secret patterns.

## CI gates

`.github/workflows/ci.yml` runs on push/PR to `main`:
- `pnpm lint` (biome check)
- `pnpm typecheck` (tsc --noEmit)
- `pnpm test:coverage` (vitest with v8 coverage thresholds on core `src/lib`
  modules)

`.github/workflows/weekly.yml` runs Mondays 09:00 UTC: lint, typecheck, test,
build. A broader sanity check than CI.

`.github/workflows/docs.yml` (added in this consolidation) runs the markdown
link checker and Blume build on docs/ changes. See
[`maintenance.md`](../maintenance.md).

## Build for Cloudflare

`pnpm build` produces the Next.js build + inlined critical CSS. `pnpm cf:build`
runs `scripts/cf-build.mjs` (the full OpenNext + Astro overlay pipeline) and
`opennextjs-cloudflare populateCache local`. The deploy command is
`pnpm deploy` (= `validate:env:deploy && cf:build && wrangler deploy --minify`)
— but agents must not deploy (see `AGENTS.md`). See
[`architecture/overview.md`](../architecture/overview.md) for the build
pipeline detail and [`operations/runbook.md`](../operations/runbook.md) for the
deploy procedure.

## Content CLI

`pnpm content <command>` runs `scripts/content-cli.ts` for versioned content
packages (validate, create, inspect, export, apply receipts, report). The
content package document is `src/content/content-packages.json` (currently
empty — packages are added when topics are selected). Schemas live in
`src/content/schemas/`. This is the Significant Content flywheel — see
`STATUS.md` and the content-flywheel branch note in
[`knowledge/archive/project-status-2026-07-13.md`](../knowledge/archive/project-status-2026-07-13.md).
