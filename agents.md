# AGENTS.md — significanthobbies

> Concise agent bootloader. Depth lives in [`docs/`](docs/index.md). Live state
> in [`STATUS.md`](STATUS.md). Full map at [`docs/index.md`](docs/index.md).

## Shared fleet standard

Also read and follow the shared fleet-level agent standard at `../AGENTS.md`.
Treat this repository as owned product code: protect production stability,
keep changes scoped, verify work, and record durable follow-up tasks when
something remains incomplete or blocked.

## What this is

A life planner with two dimensions. **Daily** (private): one ritual page with
AM/PM prompts, habit check-ins, and a compulsory journal entry. **Living**
(opt-in public): hobby discovery, timeline builder, bucket lists, side quests,
SEO blog, and public user profiles. The mortality frame (life grid, manifesto)
connects both dimensions. Deployed at `significanthobbies.com` on Cloudflare
Workers via OpenNext.

## Stack

- **Framework:** Next.js 16 (App Router, React 19) + TypeScript (strict)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **DB:** Turso (libSQL) via Drizzle ORM. Local dev: `file:./dev.db`
- **Auth:** better-auth (Google OAuth)
- **Testing:** Vitest (unit, co-located in `src/lib/*.test.ts`), Playwright (e2e in `e2e/`)
- **Deploy:** Cloudflare Workers (`significanthobbies`) via `@opennextjs/cloudflare`
- **Package manager:** pnpm (workspace: `.` + `landing-astro` + `docs-site`)

## Essential commands

```bash
pnpm install
cp .env.example .env          # fill in DATABASE_URL, BETTER_AUTH_SECRET, GOOGLE_CLIENT_*
pnpm db:push                  # apply Drizzle schema to local SQLite (dev.db)
pnpm db:seed                  # seed hobby catalog (tsx prisma/seed.ts — legacy dir name)
pnpm dev                      # next dev on localhost:3000

pnpm typecheck                # tsc --noEmit
pnpm test                     # vitest run
pnpm test:coverage            # vitest with v8 coverage thresholds on core src/lib
pnpm test:e2e                 # playwright (assumes pnpm dev on :3000)
pnpm lint                     # biome check .
pnpm build                    # next build + inline critical CSS

pnpm docs:check               # markdown link + frontmatter validation (no deps)
pnpm docs:build               # blume build (presentation layer only) → docs-site/dist/
```

Full command list in `package.json`. Schema changes: edit `src/db/schema.ts`,
`pnpm db:push` (dev) or `pnpm db:generate` (migration). **Do not run prod
migrations or deploys.**

## Critical constraints

- **Do not deploy, migrate, release, or rotate credentials.** Production
  deploys are manual (`workflow_dispatch`) and operator-owned.
- **Do not read, print, or commit secrets** (`.env`, `.env.local`, `.dev.vars`,
  Turso tokens, OAuth secrets). Local secret hygiene is operator-owned. See
  [`docs/operations/security-audit.md`](docs/operations/security-audit.md).
- **`prisma/` is a legacy directory name.** The seed script uses Drizzle.
  `src/db/schema.ts` is the source of truth. Do not reintroduce Prisma.
- **No scoring on daily practice.** Habits are simple check-ins. Commitments
  have streaks; the daily ritual does not. See
  [`docs/architecture/decisions.md`](docs/architecture/decisions.md) A4.
- **The hobby quiz is the single primary discovery UX.** Do not re-surface
  `/hobbies`, `/explore`, `/journeys` from the homepage/nav/footer until the
  7-day PostHog funnel readout is in. See
  [`docs/product/discovery-funnel.md`](docs/product/discovery-funnel.md).
- **Astro owns anon `GET /`.** Do not add per-request dynamic content to the
  homepage without rebuilding the Astro overlay. See
  [`docs/architecture/decisions.md`](docs/architecture/decisions.md) A1.
- **Pre-push hook** runs `pnpm lint` + a secret-pattern scan. Do not weaken
  the secret patterns; exclude false-positive file patterns instead.
- **Markdown in `docs/` is the source of truth.** Blume only renders it. See
  [`docs/maintenance.md`](docs/maintenance.md).

## Documentation navigation

| If you want to… | Read |
| --- | --- |
| Live status / blockers / next steps | [`STATUS.md`](STATUS.md) |
| Product thesis, two dimensions, brand | [`docs/product/overview.md`](docs/product/overview.md) |
| Discovery funnel (quiz-as-primary) | [`docs/product/discovery-funnel.md`](docs/product/discovery-funnel.md) |
| Runtime shape (Worker, Astro overlay, storage) | [`docs/architecture/overview.md`](docs/architecture/overview.md) |
| Durable architectural decisions + the why | [`docs/architecture/decisions.md`](docs/architecture/decisions.md) |
| Data model + invariants enforced by indexes | [`docs/architecture/data-model.md`](docs/architecture/data-model.md) |
| Dev workflow (setup, schema, CI, build) | [`docs/development/workflows.md`](docs/development/workflows.md) |
| Testing (Vitest, Playwright, coverage) | [`docs/development/testing.md`](docs/development/testing.md) |
| Operations runbook (deploy, cache, failures) | [`docs/operations/runbook.md`](docs/operations/runbook.md) |
| Scheduled jobs (smoke, weekly, CI, docs) | [`docs/operations/jobs.md`](docs/operations/jobs.md) |
| Security audit | [`docs/operations/security-audit.md`](docs/operations/security-audit.md) |
| Durable learnings | [`docs/knowledge/learnings.md`](docs/knowledge/learnings.md) |
| Failed approaches / resolved traps | [`docs/knowledge/failed-approaches.md`](docs/knowledge/failed-approaches.md) |
| How to edit this docs system | [`docs/maintenance.md`](docs/maintenance.md) |
| Full docs map | [`docs/index.md`](docs/index.md) |

## Documentation-maintenance rules

1. **One fact, one home.** If a fact lives in code, link to the code. If a
   fact has a canonical doc, edit that doc — do not add a second home.
2. **Do not duplicate easily-discoverable facts** (route lists, script names,
   binding config, schema fields). Link to the code instead.
3. **Do not invent information.** Mark unresolved questions in `STATUS.md`.
4. **Preserve snapshots.** `docs/knowledge/archive/` files are snapshots — do
   not rewrite their bodies to "update" them. Update the current doc and let
   the archive stay a snapshot.
5. **Prefer `git mv`** when reorganizing so rename history is preserved.
6. **Validate before committing docs changes:** `pnpm docs:check`.
7. Full rules in [`docs/maintenance.md`](docs/maintenance.md).

## Active context

See [`STATUS.md`](STATUS.md) for the current objective, active work, blockers,
and next steps. Do not start new discovery or progression features before the
7-day quiz-funnel readout.
