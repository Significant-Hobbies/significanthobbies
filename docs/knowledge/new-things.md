---
title: New things — study queue
description: Short stubs for non-standard tech in this repo — JSON-in-SQLite, Astro overlay, dnd-kit, html-to-image, personality scoring, life-phase analysis. 3-5 lines each.
---

# new-things — study queue

Short stubs for non-standard tech in this repo. 3–5 lines each. Fill `Why here:`
yourself after learning; never invent rationale.

## Hobby timeline data modeling with JSON-in-SQLite
- What: Storing structured data (phases, completedQuests, earnedBadges) as JSON strings in text columns instead of normalized tables
- Why here: TBD
- Gotcha (from code): JSON-in-SQLite pattern — parsed/serialized in server actions, not normalized into separate tables; simpler schema but no indexed queries on nested fields
- Source: https://www.sqlite.org/json1.html

## Astro overlay on Next.js (run_worker_first)
- What: Landing page is Astro, main app is Next.js — deployed as an overlay with `run_worker_first` bypass
- Why here: TBD
- Gotcha (from code): `scripts/cf-build.mjs` runs `node scripts/run-overlay-astro-landing.mjs --strict` (invoked by `pnpm cf:build`, not plain `pnpm build`) — overlays the Astro build onto `.open-next/assets/`; Astro owns `GET /`
- Source: https://docs.astro.build/en/guides/integrations-guide/

## Personality-based recommendation scoring
- What: Quiz-based personality scoring that maps to hobby archetypes for recommendations
- Why here: TBD
- Gotcha (from code): `src/lib/personality.ts:70-80` — `buildCategoryCounts` counts non-deduplicated hobby entries across all phases to determine category breakdown, then maps to archetypes
- Source: https://en.wikipedia.org/wiki/Personality_test

## dnd-kit drag-drop timeline
- What: Using dnd-kit for accessible drag-drop timeline editor — modern alternative to react-beautiful-dnd
- Why here: TBD
- Gotcha (from code): uses `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` — accessible by default (keyboard reordering), unlike react-beautiful-dnd
- Source: https://dndkit.com/

## html-to-image for client-side timeline export
- What: Client-side PNG export of timeline using html-to-image — no server rendering
- Why here: TBD
- Gotcha (from code): `html-to-image: 1.11.13` — renders DOM to canvas then to PNG; CORS images can break it, so all assets must be same-origin or CORS-enabled
- Source: https://github.com/tsayen/dom-to-image

## Life phase pattern analysis
- What: Analyzing hobby patterns across life phases to generate insights (breadth, depth, consistency, variety)
- Why here: TBD
- Gotcha (from code): `src/lib/personality.ts:70-80` — category counts built from timeline phases, then mapped to archetype traits — the analysis is only as good as the phase boundaries the user draws
- Source: https://en.wikipedia.org/wiki/Sequence_analysis
