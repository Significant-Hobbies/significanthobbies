---
title: Testing
description: Vitest unit tests co-located in src/lib, Playwright e2e in e2e/, coverage thresholds on core src/lib modules, and the test commands.
---

# Testing

> Test config lives in `vitest.config.ts` and `playwright.config.ts`. This page
> covers what is tested, where, and the coverage gates.

## Unit tests — Vitest

Co-located in `src/lib/*.test.ts` next to the module under test. Run with
`pnpm test` (or `pnpm test:watch` / `pnpm test:coverage`). Coverage uses v8
with thresholds enforced on core `src/lib` modules — CI fails if coverage
drops below the threshold.

Tested modules (non-exhaustive — see `src/lib/*.test.ts` for the full list):
- `commitments.test.ts` — streak math, proof-type inference, streak badges
- `mortality.test.ts` — weeks-lived + life-grid math from birthYear
- `personality.test.ts` — quiz personality scoring + archetype mapping
- `recommendations.test.ts` — hobby suggestion logic
- `insights.test.ts` — timeline insight computations
- `bucket-list-insights.test.ts` — bucket list analytics
- `life-bingo.test.ts` — Bingo presentation logic
- `content-packages.test.ts` — versioned content package validation
- `editorial-seo.test.ts` / `editorial-content.test.ts` — SEO/content helpers
- `rate-limit.test.ts` — rate limiter
- `slug.test.ts` — slug generation
- `hobby-roadmap.test.ts` — roadmap generation
- `rediscovery.test.ts` — dropped-hobby rediscovery
- `accountability-circles.test.ts` — accountability circle logic
- `json-ld.test.ts` (in `src/components/`) — JSON-LD structured data

The pure modules (`commitments.ts`, `mortality.ts`, `personality.ts`,
`insights.ts`, `bucket-list-insights.ts`, `life-bingo.ts`) are the
highest-value test targets — they have no DB/auth dependencies and are the
core product logic.

## E2E tests — Playwright

In `e2e/`. Run with `pnpm test:e2e` (assumes `pnpm dev` is running on :3000) or
`pnpm test:e2e:ui` for interactive mode. Specs:

- `landing.spec.ts` — homepage
- `blog.spec.ts` — blog routes
- `content-flywheel.spec.ts` — content package routes, canonical/OG/JSON-LD,
  retired-video redirects, landmarks, axe accessibility, overflow at
  320/768/1440 widths
- `daily.spec.ts` — daily ritual
- `life-bingo.spec.ts` — bucket lists + Bingo presentation
- `quiz.spec.ts` — hobby quiz
- `hobbies.spec.ts`, `explore.spec.ts`, `journeys.spec.ts` — discovery surfaces
- `tools.spec.ts` — free tools
- `seo.spec.ts` — SEO surfaces
- `mobile.spec.ts` — mobile viewport

`@axe-core/playwright` is a devDep — accessibility assertions are in
`content-flywheel.spec.ts` and can be added to other specs.

## What is not tested

- Server actions (`src/lib/actions/`) hit the DB and are not unit-tested;
  coverage comes from e2e specs that exercise the full flow.
- The Astro landing overlay is tested via the deploy smoke check in
  `.github/workflows/deploy.yml` (verifies `location.replace('/dashboard')`,
  ≥5 sections, `id="lcp-shell"` in the overlaid HTML).
- The edge cache layer in `worker.mjs` is tested via the production smoke
  workflow (`.github/workflows/smoke.yml`) every 6 hours.
