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
- `trajectory.test.ts` — month-end window logic, chart series extraction,
  era summaries, JSON number parsing
- `json-ld.test.ts` (in `src/components/`) — JSON-LD structured data

The pure modules (`commitments.ts`, `mortality.ts`, `personality.ts`,
`insights.ts`, `bucket-list-insights.ts`, `life-bingo.ts`, `trajectory.ts`)
are the highest-value test targets — they have no DB/auth dependencies and
are the core product logic.

## Performance flow contract

[`codevetter.performance.json`](../../codevetter.performance.json) binds the
exact bucket-list suggestion scale workload to its deterministic output test.
CodeVetter uses that snapshot-bound relationship for local incumbent-versus-candidate
acceptance; it does not replace `pnpm test` or make a production-performance
claim.

## Native tests — XCTest

`pnpm quality:native` selects an available iPhone simulator, regenerates the
checked-in Xcode project, runs 9 core unit tests and 4 UI tests, produces a
code-signed-off Release simulator build, and enforces the current production
coverage ratchet through `xccov`. DerivedData stays outside the repository.
The 63.20% floor allows for Xcode's small cross-version executable-line
denominator drift while preserving a no-regression floor for both established
observations.
The same command also applies the checked-in `swift-format` no-regression
baseline; existing diagnostics are tracked in GitHub issue #89.

## E2E tests — Playwright

In `e2e/`. Run with `pnpm test:e2e` (assumes `pnpm dev` is running on :3000) or
`pnpm test:e2e:ui` for interactive mode. Specs:

- `landing.spec.ts` — homepage
- `blog.spec.ts` — blog routes
- `content-flywheel.spec.ts` — content package routes, canonical/OG/JSON-LD,
  retired-video redirects, landmarks, axe accessibility, overflow at
  320/768/1440 widths
- `daily.spec.ts` — daily ritual
- `trajectory.spec.ts` — Trajectory redirect + nav visibility
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
- The Astro Hub overlay is covered by the `landing` Playwright project and the
  deploy smoke check in `.github/workflows/deploy.yml` (verifies the Hub heading
  and exactly seven product cards in the overlaid HTML).
- The edge cache layer in `worker.mjs` is tested via the production smoke
  workflow (`.github/workflows/smoke.yml`) every 6 hours.

## Authenticated e2e (added 2026-07-25)

Google OAuth is the only production sign-in path, and Playwright cannot complete
an OAuth round-trip. For a long time that meant **zero authenticated coverage**:
every logged-in surface was asserted only through its unauthenticated redirect,
and the logged-in UI could not be reviewed at all.

`src/lib/auth.ts` now enables better-auth's own email provider behind two
independent gates — `NODE_ENV !== 'production'` **and** `ENABLE_TEST_AUTH === '1'`.
Tests therefore sign in through the real session path; nothing fabricates a cookie
and nothing reads `BETTER_AUTH_SECRET`.

```bash
pnpm dev:test-auth          # dev server with the gated provider on
pnpm test:e2e               # e2e/authenticated.spec.ts skips if it is off
```

`e2e/fixtures/auth.ts` exposes an `authedPage` fixture that signs up (idempotent)
then signs in. It skips the whole file when the endpoint returns 404, so a plain
`pnpm dev` server does not produce a wall of failures.

### Signed-out previews

`e2e/preview.spec.ts` covers the `/daily` and `/trajectory` previews
([`decisions.md`](../architecture/decisions.md) A9). It asserts absence as much as
presence: no journal textarea, no Save button, no habit manager, no trajectory
write affordance. Those are the assertions that keep the preview from quietly
becoming a surface that discards real input.

The matching guard lives in `e2e/authenticated.spec.ts` — the preview must never
render for a signed-in user, who would otherwise be reading a stranger's month
believing it was their own.

`e2e/guest-access.spec.ts` covers the redirect contract for the surfaces that are
still gated: each carries its own route as `callbackUrl`, and every "continue as
guest" destination is fetched to prove it renders without a session.

### The e2e suite in CI

`.github/workflows/ci.yml` now has an `e2e` job (added 2026-07-25) running the
`desktop` and `landing` projects on every push and PR. Before that it ran only
`lint`, `typecheck` and `test:coverage`, so **Playwright had never run in CI** —
which is why several specs sat failing for a long time, two of them correctly
(`/journeys` gated from crawlers, eleven SEO pages with no `<h1>`) plus a 500 on
`/llms-full.txt`.

The job uses a throwaway local D1 database with `db:migrate:local` + `db:seed`, and
`ENABLE_TEST_AUTH=1` so the authenticated specs run rather than skip. No real
credentials are involved. The device-matrix projects (`mobile`, `tablet`,
`wide`) are left out: they re-run the same specs at other widths.

Failures triaged 2026-07-25 fell into three genuinely different buckets, and the
distinction matters — two of the three were real product bugs the specs had
caught correctly:

1. **Real bugs the specs were right about.** `/journeys` sat in the
   middleware's `PROTECTED_PREFIXES`, so anonymous visitors and crawlers were
   redirected to `/login`. Eleven SEO pages had no `<h1>`. Both fixed; both now
   have regression tests in `seo.spec.ts`.
2. **A bad locator.** `daily.spec.ts` → "/manifesto has working CTAs" hit a
   strict-mode violation because two links match "Find a hobby" (the nav entry
   and the page CTA). Fixed by scoping to `article`.
3. **Genuinely environmental.** `landing.spec.ts` asserts hero copy on `/`.
   Anon `GET /` is static Astro HTML in production
   ([`decisions.md`](../architecture/decisions.md) A1), and `next dev` serves
   the Next.js `/` route instead — which redirects. The asserted copy
   ("Discover your hobby story") exists in **neither** `src/app/page.tsx` nor
   `landing-astro/`, so these specs are stale against both targets and need
   rewriting against whichever surface they mean to cover. Still open.

### The fresh-database 403 (resolved 2026-07-26)

For a long time the first authenticated test failed with
`Test sign-in failed (403)` against a **freshly created** local database and passed on
retry. Four hypotheses were tested and ruled out — cold Next compile, missing
account, better-auth rate limiting, and a missing request `Origin`. None was the
cause, and the `Origin` experiment made it measurably worse.

**Actual cause:** a successful sign-up already sets a session cookie, and
better-auth returns 403 from `sign-in/email` when the request context is
already authenticated. The fixture ran sign-up and sign-in unconditionally
through one shared cookie jar, so:

- **Fresh database** — sign-up succeeds, sets a session, the following sign-in
  is refused 403, first test fails.
- **Warm database** — sign-up fails ("already exists"), no cookie is set, the
  sign-in succeeds.

Which is why it only ever appeared on a new database. It also explains the two
observations that made it look mysterious: plain `curl` never reproduced it
because each invocation used a fresh cookie jar, and retrying the sign-in never
helped because the session cookie was still present on the retry.

Confirmed directly rather than inferred:

```
sign-up  (empty jar)      → 200, sets session_token
sign-in  (reusing jar)    → 403
sign-in  (no cookies)     → 200
```

`e2e/fixtures/auth.ts` now returns early when sign-up succeeds. Verified with
18/18 passing against a brand-new seeded database at `--retries=0`.

**Generalisable:** any auth endpoint may reject a credential exchange that a
client already holds a session for. When a fixture chains create-then-login
through one context, check whether the create step logged you in.

### Writing authenticated specs against persistent local D1

`e2e/authenticated.spec.ts` is serial, so **one failure blocks every test after
it**. For a long time the creed test failed and silently hid four more. If a run
reports "N did not run", fix the first failure before reading anything else into
the result.

Two failure modes cost the most to diagnose, both worth recognising on sight:

**Interacting before hydration.** `await expect(x).toBeVisible()` only proves the
server HTML arrived. Acting before React attaches is silent, not loud, and it
fails differently depending on the element:

| Element | Symptom |
| --- | --- |
| Controlled input | `fill()` reaches the DOM but not state. Hydration reverts it, the form sees an unchanged value, skips the write, and still shows a success toast — "the save silently did nothing". |
| Button | No handler yet, so the click does nothing and whatever it should reveal never appears. Surfaces one line later as "element not found". |

Both reproduce only where the route pays a cold `next dev` compile — CI under
two workers, almost never a warm local run. Use `waitForHydrated` from
`e2e/fixtures/hydration.ts`, which polls for React's own
`__reactFiber$…` / `__reactProps$…` keys rather than guessing a timeout:

```ts
import { waitForHydrated } from './fixtures/hydration';

await waitForHydrated(field);
await field.fill(value);
```

A retry-until-it-sticks loop was tried first and timed out in CI. For a toggle
button, retrying is actively wrong — the second click closes what the first
opened.

**Reusing a fixed entity name.** Local D1 state survives between local runs. A spec
that creates "Piano" every time hits `You already have an active commitment for
Piano` on its second run of the day, leaves the create form on that error, and
fails somewhere much later. Generate a unique name per run
(`` `Piano ${Date.now()}` ``) and scope locators to that entity's own card —
several cards render an identically-named "Stamp today" button, so an unscoped
locator races them.

Prefer unique-per-run data over `if (await x.count())` guards. A guard around a
test's **subject** lets it skip what it exists to check and still report green,
which is how an earlier version of the stamp test "passed" while stamping
nothing. Guards are acceptable only around *setup*, and only when the
precondition they establish is asserted immediately afterwards.

### Design review screenshots

```bash
pnpm dev:test-auth
node scripts/shots.mjs .shots      # desktop + mobile, all logged-in surfaces
```

Shots are taken with reduced motion forced. `.scroll-reveal` uses
`animation-timeline: view()`, whose progress stays at 0% — meaning `opacity: 0` —
for anything that never enters the scrollport, so a full-page capture otherwise
renders most of the page blank. The reduced-motion rules set `opacity: 1`, which
is also the correct accessibility fallback. Pass `SHOTS_MOTION=allow` to capture
with animation enabled.
