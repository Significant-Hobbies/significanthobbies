---
title: Maintaining this docs system
description: How to edit the significanthobbies docs tree, validate links, and build with Blume. Markdown is the source of truth; Blume is only the presentation layer.
---

# Maintaining this docs system

> Rules: Markdown in `docs/` is the source of truth. Blume only renders it.
> Code and executable config (`wrangler.toml`, `package.json`,
> `src/db/schema.ts`) remain authoritative for implementation details and
> schedules.

## Where things live

See [`index.md`](index.md) for the full map. Canonical homes:

- **Product framing** → `docs/product/`
- **Architecture + durable decisions + data model** → `docs/architecture/`
- **Dev workflow + testing gates** → `docs/development/`
- **Operations + runbooks + jobs + security audit** → `docs/operations/`
- **Durable learnings + failed approaches + study queue** → `docs/knowledge/`
- **Durable research data** → `docs/knowledge/research/`
- **Snapshots (TLL merge, old status, old designs)** → `docs/knowledge/archive/`
- **Live status** → `STATUS.md` (repo root, short)
- **Agent bootloader** → `AGENTS.md` (repo root, concise)
- **Public README** → `README.md` (repo root)

## Editing rules

1. **One fact, one home.** If a fact lives in code, link to the code instead of
   restating it. If a fact already has a canonical doc, edit that doc — do not
   add a second home.
2. **Do not duplicate easily-discoverable facts.** Route lists, script names,
   binding config, and schema fields belong in code/`package.json`/
   `wrangler.toml`/`src/db/schema.ts`; docs link to them.
3. **Do not invent information.** Mark unresolved questions explicitly in
   `STATUS.md` → "Unresolved questions".
4. **Preserve snapshots.** `docs/knowledge/archive/` files are snapshots. Do
   not rewrite their bodies to "update" them — update the current doc that
   supersedes them and let the archive stay a snapshot. Each archive file
   carries a banner pointing to its current successor.
5. **Keep pages focused.** Target 150–300 lines per markdown file. Split
   catch-all docs into per-topic pages.
6. **Prefer `git mv`** when reorganizing so rename history is preserved.
7. **Do not create empty folders or placeholder docs.** Every doc must have
   useful content.

## Linking

- Use relative links between docs (`../architecture/decisions.md`, not
  `docs/architecture/decisions.md` from a doc inside `docs/`).
- Link to code with repo-relative paths (`src/db/schema.ts`,
  `worker.mjs`) in backticks for code references, or as links for files worth
  opening.
- The link checker validates relative `.md`/image links and frontmatter. It
  does not fetch external URLs (no network in CI).

## Validation

```bash
# From repo root — check internal markdown links + frontmatter (no deps needed)
node scripts/docs-check-links.mjs
# or
pnpm docs:check

# Build the docs site with Blume (presentation layer only).
# No docs-site lockfile is committed yet, so use a plain install (the CI
# workflow does the same). Switch to --frozen-lockfile once one is committed.
pnpm install --filter significanthobbies-docs...
pnpm docs:build     # → docs-site/dist/
pnpm docs:preview
```

CI (`.github/workflows/docs.yml`) runs the link check then the Blume build on
pushes to `main` and PRs touching `docs/`, `STATUS.md`, `AGENTS.md`,
`README.md`, `docs-site/`, `scripts/docs-check-links.mjs`, or the workflow
itself.

## Blume

`docs-site/blume.config.ts` points Blume at `../docs` as the content root.
Blume generates a static site into `docs-site/dist/` (gitignored). The
committed Markdown is the source of truth; Blume is only the presentation and
search layer. Do not add Blume-specific frontmatter that the source-of-truth
docs depend on to make sense — plain Markdown must read correctly on its own.

`docs/knowledge/archive/` is included in the Blume build so historical
snapshots are reachable, but each archive page carries a banner that points to
its current successor.

The Blume package is isolated in `docs-site/` (a pnpm workspace member) so its
Astro deps do not pollute the Next.js app's `node_modules`. The root
`package.json` exposes `docs:check`, `docs:build`, and `docs:preview` scripts
that delegate to the `docs-site` workspace.

## When the live status changes

Update `STATUS.md` (repo root) — it is the short live-status view. When the
detailed status log accumulates deploy-version-specific or dated narrative,
move the old detailed snapshot into `docs/knowledge/archive/` with a dated
filename (e.g. `project-status-YYYY-MM-DD.md`) and a banner. Do not let
deploy-version-specific text accumulate in `STATUS.md`.

## Fleet boundary

This repo follows the fleet agent standard at `../AGENTS.md` (in the fleet
workspace). The fleet standard mandates `PROJECT_STATUS.md` as the durable
status file per project; this repo consolidates that into `STATUS.md` (short)
+ `docs/knowledge/archive/` (detailed snapshots) to avoid two homes for the
same fact. The old `PROJECT_STATUS.md` is archived as
`docs/knowledge/archive/project-status-2026-07-13.md`.
