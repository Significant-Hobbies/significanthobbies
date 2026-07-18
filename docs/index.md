---
title: significanthobbies docs
description: A life planner with two dimensions (Daily + Living). Product, architecture, development, operations, and durable learnings for the significanthobbies Cloudflare Workers app.
---

# significanthobbies docs

> Source of truth is the Markdown in this `docs/` tree (plus the code). Blume
> renders it; it does not own it. See
> [`maintenance.md`](maintenance.md) for how to edit this knowledge system.

**significanthobbies** is a life planner with two dimensions. **Daily**
(private): one ritual page with AM/PM prompts, habit check-ins, and a
compulsory journal entry. **Living** (opt-in public): hobby discovery,
timeline builder, bucket lists, side quests, SEO blog, and public user
profiles. The mortality frame (life grid, manifesto) connects both dimensions.
Deployed at `significanthobbies.com` on Cloudflare Workers via OpenNext.

- **Live status:** [`STATUS.md`](../STATUS.md)
- **Agent bootloader:** [`AGENTS.md`](../AGENTS.md)
- **Public README:** [`README.md`](../README.md)

## Start here

| If you want to… | Read |
| --- | --- |
| Understand what this product is and is not | [`product/overview.md`](product/overview.md) |
| Understand the discovery funnel and why the quiz is primary | [`product/discovery-funnel.md`](product/discovery-funnel.md) |
| See the runtime shape (Worker, Astro overlay, storage) | [`architecture/overview.md`](architecture/overview.md) |
| Understand the non-obvious architectural choices | [`architecture/decisions.md`](architecture/decisions.md) |
| See the data model and the invariants enforced by indexes | [`architecture/data-model.md`](architecture/data-model.md) |
| Run the app locally / ship a change | [`development/workflows.md`](development/workflows.md) |
| Run tests and understand coverage gates | [`development/testing.md`](development/testing.md) |
| Deploy, purge cache, or diagnose a production issue | [`operations/runbook.md`](operations/runbook.md) |
| See the scheduled jobs (smoke, weekly, CI, docs) | [`operations/jobs.md`](operations/jobs.md) |
| Read the security audit | [`operations/security-audit.md`](operations/security-audit.md) |

## Full map

### Product

- [`product/overview.md`](product/overview.md) — thesis, two dimensions, users,
  brand, design principles, what we deliberately do not do
- [`product/discovery-funnel.md`](product/discovery-funnel.md) — quiz-as-primary
  decision, PostHog 3-step funnel, hidden surfaces, decision rule

### Architecture

- [`architecture/overview.md`](architecture/overview.md) — request flow, Astro
  overlay, build pipeline, preview env, storage, auth, agent indexing
- [`architecture/decisions.md`](architecture/decisions.md) — 8 durable
  decisions (Astro overlay, JSON-in-SQLite, quiz-as-primary, no-scoring, edge
  cache, static-assets cache, Drizzle/better-auth, commitments vs habits) and
  the why behind each
- [`architecture/data-model.md`](architecture/data-model.md) — table groups,
  JSON-in-SQLite pattern, unique indexes that enforce invariants

### Development

- [`development/workflows.md`](development/workflows.md) — local setup, schema
  changes, branching, pre-push hook, CI gates, build, content CLI
- [`development/testing.md`](development/testing.md) — Vitest + Playwright,
  coverage thresholds, what is and is not tested

### Operations

- [`operations/runbook.md`](operations/runbook.md) — deploy, cache purge,
  failure modes (1015 rate-limit, stale overlay, missing CSS, sparse-store)
- [`operations/jobs.md`](operations/jobs.md) — smoke (6h), weekly (Mon),
  CI (push/PR), docs (docs/ changes), deploy (manual)
- [`operations/security-audit.md`](operations/security-audit.md) — 2026-03-28
  audit snapshot, open action items

### Knowledge

- [`knowledge/learnings.md`](knowledge/learnings.md) — 8 durable lessons
  (Astro overlay, LCP, edge cache, static-assets cache, discovery
  consolidation, no-scoring, Drizzle, auth tables)
- [`knowledge/failed-approaches.md`](knowledge/failed-approaches.md) — 6
  resolved traps (1015, s-maxage, sparse-store, Prisma/NextAuth, four
  discovery surfaces, scoring daily practice)
- [`knowledge/new-things.md`](knowledge/new-things.md) — study queue for
  non-standard tech in this repo
- [`knowledge/research/`](knowledge/research/) — durable research data:
  famous hobby journeys (v1 + v2), blog keyword research, seasonal content
- [`knowledge/archive/`](knowledge/archive/) — preserved snapshots (TLL merge
  plan, project recommendation context, project status 2026-07-13, v1 design,
  side-quests design)

### Meta

- [`maintenance.md`](maintenance.md) — how to edit this docs system, validation,
  and Blume build

## Conventions

- Markdown in this tree is the source of truth. Code and `wrangler.toml` /
  `package.json` / `src/db/schema.ts` remain authoritative for implementation
  details.
- One fact, one home. If a fact lives in code, link to the code instead of
  restating it.
- Historical snapshots live under `knowledge/archive/` and are linked from the
  current docs that supersede them. Do not edit archive bodies to "update"
  them; update the current doc and let the archive stay a snapshot.
- Mark unresolved questions explicitly (see `STATUS.md` → "Unresolved
  questions").
