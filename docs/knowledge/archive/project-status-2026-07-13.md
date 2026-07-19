# significanthobbies — PROJECT STATUS (snapshot 2026-07-13)

> **Archive snapshot.** The detailed live-status log was preserved here when
> `STATUS.md` was introduced as the short live-status view. Do not edit this
> body to "update" it — update [`STATUS.md`](../../../STATUS.md) instead. This
> snapshot is kept for historical reference and reachable via the Blume build.

Last updated: 2026-07-13

## Why / What

A life planner with two dimensions. **Daily** (private): one daily ritual page — AM/PM prompts, habit check-ins, compulsory journal entry. **Living** (opt-in public): hobbies, bucket lists, side quests, timelines. The mortality frame (life grid, manifesto) connects both. The journal is the bridge between daily practice and life aspirations.

**Users:** Signed-in users via Google OAuth; guest timeline builders with auto-save; visitors browsing public journeys and hobby directory.

**Constraints:** Deployed on Cloudflare Workers at `significanthobbies.com`; **Astro owns `GET /`** (static overlay + `run_worker_first` bypass); Next.js handles all app/SEO/API routes. **Primary discovery UX chosen: the hobby quiz (`/find-your-hobby`)** — the other three discovery surfaces (taxonomy directory `/hobbies`, community explore `/explore`, famous journeys `/journeys`) are hidden from the homepage/nav/footer and measured via a 7-day PostHog funnel.

**IN scope:** Timeline builder, public sharing, hobby directory/SEO pages, discovery tools, Turso persistence, Astro anon `/` overlay, PR preview env, daily ritual (habits + journal + AM/PM prompts), manifesto.

**OUT of scope:** Broad social network, paid coaching/marketplace/creator monetization, large SEO expansion until core journey loop sharpens, coherent XP/badges progression until follow-through value proven, scoring/streaks (no gamification of daily practice), focus timer, productivity tracking.

## Dependencies

### External

- **Turso (libSQL):** Production DB `significanthobbies`.
- **better-auth:** Google OAuth sessions.
- **PostHog:** Product analytics via `posthog-js` wrapper.
- **html-to-image:** Client-side timeline PNG export.
- **Env files:** `.env.example` — Turso, auth, analytics keys for deploy validation.

### Internal (fleet)

- **SaaS Maker widgets:** Feedback, changelog, testimonials embeds via `@saas-maker/feedback`, changelog, testimonials.
- **Local astro landing scripts:** Astro landing overlay via `landing-astro/` + `scripts/run-overlay-astro-landing.mjs` for fleet perf on anon GET `/`.

### Stack & commands

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind v4 · Vitest · Playwright · Cloudflare Workers via `@opennextjs/cloudflare` · Turso · Drizzle ORM · better-auth Google OAuth · shadcn/ui · `@dnd-kit` · html-to-image · PostHog · `@saas-maker/feedback`, changelog, testimonials · local `scripts/run-*-astro-landing.mjs`.

| Command | Purpose |
| --- | --- |
| `pnpm install` | Install deps |
| `cp .env.example .env` | Local env |
| `pnpm dev` | Local Next dev |
| `pnpm db:push` / `db:seed` / `db:studio` / `db:generate` | Drizzle push / seed (`prisma/seed.ts`) / studio / generate |
| `pnpm build` | next build + astro-landing inline-css |
| `pnpm cf:build` | `scripts/cf-build.mjs` + populateCache |
| `pnpm validate:env:deploy` / `pnpm deploy` | validate + cf:build + wrangler deploy --minify |
| `pnpm preview` | opennextjs-cloudflare preview |
| `pnpm typecheck` / `pnpm test` / `pnpm test:coverage` / `pnpm test:e2e` / `pnpm test:e2e:ui` | TS + vitest (v8 coverage thresholds on core `src/lib` modules) + playwright |
| `pnpm lint` / `pnpm check` | lint + biome check |
| `pnpm content <command>` | Validate, create, inspect, export, apply receipts to, and report on versioned content packages |

CI: `.github/workflows/deploy.yml` — manual production deploy from `main`. `.github/workflows/ci.yml` — lint + typecheck + `test:coverage` (v8 thresholds on core `src/lib` modules).

**Entrypoints:** `worker.mjs` · Next.js App Router handlers · `scripts/cf-build.mjs` · `landing-astro/`.

Build pipeline (`scripts/cf-build.mjs`): Next build → patch sparse pnpm store for OpenNext → opennextjs-cloudflare → Astro landing overlay into `.open-next/assets/`. Preview env deploys to `significanthobbies-preview.*.workers.dev` without touching prod routes.

## Timeline

- **2026-07-13 — Significant content web acceptance:** extracted deterministic Article/VideoObject metadata and video-sitemap builders, added Markdown content negotiation with `Vary: Accept`, and exercised the real blog routes for canonical/OG/Article JSON-LD, 308 retired-video redirects, landmarks, axe accessibility, and horizontal overflow at 320/768/1440 widths. The audit fixed real muted-text contrast failures. Focused tests, typecheck, and the 265-page production build pass; package-backed video metadata is additionally covered by a deterministic fixture because canonical content currently has no published video package.
- **2026-07-13** — Implemented the Significant Hobbies half of the content flywheel on `feature/significant-content-flywheel`: versioned JSON packages and receipts, deterministic CLI, legacy/package blog adapter, canonical article enrichment, hobby/LLM discovery, video sitemap, and permanent retired-video redirects. Pending review/merge and the separate Reel Pipeline/OpenClaw work; no content, upload, deploy, post, or schedule was created.
- **2026-07-12** — Completed the explicitly approved Life Bingo exception: private and shareable bucket lists with list and Bingo presentations.
- **2026-07-03** — Chose the hobby quiz (`/find-your-hobby`) as the single primary discovery UX. Hid the other three discovery surfaces (taxonomy `/hobbies`, community `/explore`, famous journeys `/journeys`) from the homepage, nav, and footer (code retained, just unreachable from the main entry point). Instrumented the quiz with a canonical 3-step PostHog funnel: `discovery_started` → `discovery_engaged` → `hobby_committed` (7-day conversion window).
- **2026-07-02** — Merged today-little-log into significanthobbies. Added daily ritual (`/daily`), 4 new DB tables (habits, habit_logs, journal_entries, daily_checkins), dashboard integration (habits + journal summary), nav/footer/manifesto updated to reflect two dimensions (Daily + Living).
- **2026-07-02** — Added global try/catch error handler to OpenNext worker (`worker.mjs`).
- **2026-06-20 — Hybrid Astro `/`:** Full static landing in `landing-astro/` (hero + below-fold sections); overlaid into `.open-next/assets`; Worker skips invocation on `GET /`; Next `page.tsx` is auth-only fallback; demo timelines moved to `GET /api/demo-timelines`.
- **Platform hardening:** Custom `cf-build.mjs` fixes OpenNext + pnpm monorepo sparse-store resolution; PR preview environment without prod route conflicts; dependency hygiene (removed unused `lighthouse` devDependency).

## Products

| Surface | URL |
| --- | --- |
| Primary | `https://significanthobbies.com` |
| WWW | `https://www.significanthobbies.com` |
| PR preview | `significanthobbies-preview.<account>.workers.dev` (`wrangler deploy --env preview`) |

## Features (shipped)

### Architecture

- Browser → Cloudflare Worker `significanthobbies` (OpenNext, `worker.mjs`).
- Anon GET `/` served from ASSETS binding via overlaid Astro static hero; app routes hit Next.js 16 App Router handlers.
- Turso (libSQL) + Drizzle ORM + better-auth Google OAuth for persistence and sessions.
- PostHog analytics via `posthog-js` wrapper.
- Custom `cf-build.mjs` fixes OpenNext + pnpm monorepo sparse-store resolution.
- PR preview environment on separate worker name without prod route conflicts.
- Guest mode with auto-save for timeline builder; setup flow for username on first login (`/setup`).

### Platform & perf

- App deploys to Cloudflare Workers for `significanthobbies.com` and `www.significanthobbies.com`.
- **Astro landing overlay (2026-06-20)**: anon GET `/` served from ASSETS binding via overlaid static hero (fleet perf push).
- Custom `cf-build.mjs` fixes OpenNext + pnpm monorepo sparse-store resolution.
- PR preview environment without prod route conflicts.
- Dependency hygiene: removed unused `lighthouse` devDependency (shadcn kept for UI scaffolding).

### Auth & data

- Turso/Drizzle persistence; better-auth Google OAuth.
- Setup flow for username on first login (`/setup`).
- Guest mode with auto-save for timeline builder.

### Core product routes

- **Daily ritual**: `/daily` — AM/PM prompts, habit check-ins, compulsory journal entry. Private by default.
- **Timeline**: `/timeline/new`, `/timeline/[id]`, `/timeline/[id]/edit`, `/timelines/recent`.
- **Public sharing**: `/u/[username]`, `/u/[username]/[slug]` public journeys.
- **Discovery**: `/find-your-hobby` (primary — hobby quiz), `/explore`, `/hobbies`, `/hobbies/[hobby]`, `/hobbies/category/[category]`, `/hobbies/random`, `/search`. The taxonomy (`/hobbies`), community (`/explore`), and famous journeys (`/journeys`) surfaces are hidden from the homepage/nav/footer; the quiz is the single primary discovery entry point.
- **Content/SEO**: bucket lists, side quests, compare journeys, hobby guides (`hobbies-for-resume`, mental health, adults, cheap hobbies, etc.).
- **Life Bingo**: `/life-bingo`, `/bucket-list`, `/bucket-list/[id]`, and public `/b/[slug]` sharing.
- **Tools**: time calculator, cost calculator.
- **Account**: `/dashboard`, `/settings`, `/login`, `/get-started`.
- **Manifesto**: `/manifesto` — mortality frame as mission, not feature.

### Features shipped

- Life Bingo list creation, completion tracking, Bingo presentation, visibility controls, and public sharing.
- **Daily ritual** (`/daily`): AM/PM prompts, habit check-ins (simple, no scoring), compulsory journal entry, inline habit management. Merged from today-little-log.
- **Dashboard integration**: today's habits summary + journal prompt alongside commitments and life grid.
- **Manifesto** (`/manifesto`): mortality frame as mission, two dimensions (Daily + Living), journal as bridge.
- Timeline builder with drag/drop phases and hobbies.
- Insights: rekindled hobbies, persistence tracking, phase-by-phase changes.
- PNG/JSON export of timelines.
- Public profiles and shared timeline URLs.
- Discovery suggestions and hobby directory (60-concept taxonomy documented).
- Product expansion concepts documented: recommendations, side quests, XP/badges, SEO pages, comparisons, quizzes, famous journeys.

## Discovery funnel — PostHog measurement plan

**Chosen primary discovery UX:** the hobby quiz at `/find-your-hobby` (2026-07-03).

**Why the quiz:** it is the most focused, interactive, single-purpose discovery surface — a guided 5-question flow with a clear payoff (archetype + personalized hobby recommendations + a saveable experiment plan). It already had the most complete instrumentation and produces a concrete next step toward commitment (recommended hobbies with first steps → save plan → build timeline). The other three surfaces (taxonomy browsing `/hobbies`, community explore `/explore`, famous journeys `/journeys`) are broader/lower-intent and split attention.

**Hidden (not deleted):** `/hobbies`, `/explore`, `/journeys` removed from the homepage (Astro landing `CommunitySamples` + `FinalCta`), the top nav, and the footer. Their code and routes are intact — they remain reachable via deep links, SEO pages, and cross-links from the quiz result. Only the main entry points were changed so the quiz is the single primary discovery path.

**Funnel (7-day conversion window in PostHog):**

| Step | Event | Fired when | Properties |
| --- | --- | --- | --- |
| 1 | `discovery_started` | Quiz page viewed (mount) | `surface: "quiz"` |
| 2 | `discovery_engaged` | Quiz completed → personalized recommendations shown | `surface`, `archetype`, `top_categories` |
| 3 | `hobby_committed` | User saves the experiment plan **or** clicks "Build your hobby timeline" from the result | `surface`, `method` (`save_plan` \| `timeline_start`), `archetype`, `hobbies` |

All events carry `project_id: "significanthobbies"`. Implementation: `trackDiscoveryFunnel` in `src/lib/analytics.ts`; fired from `src/app/find-your-hobby/quiz-client.tsx`. Legacy detail events (`discovery_quiz_start`, `discovery_quiz_complete`, `discovery_recommendations_viewed`, `recommendation_started`, `recommendation_saved`, `discovery_shared`) remain for granular analysis.

**Decision rule:** measure for 7 days. If `discovery_started → hobby_committed` conversion is strong, keep the quiz as primary and consider retiring the hidden surfaces. If weak, re-surface one alternative and re-measure.

## Todo / Planned / Deferred / Blocked

### Planned

1. ~~**Decommission today-little-log**~~ — TLL repo marked archived/merged (2026-07-02). Domain redirect from `today-little-log.pages.dev` to `significanthobbies.com` still pending operator action when ready. No data migration needed.
2. Tighten timeline creation and sharing loop so a first-time user can produce a meaningful public journey quickly.
3. ~~**Decide which discovery path is primary**~~ — Chosen 2026-07-03: the hobby quiz (`/find-your-hobby`). The other three surfaces (taxonomy `/hobbies`, community `/explore`, famous journeys `/journeys`) are hidden from the homepage/nav/footer. Measure the quiz funnel for 7 days in PostHog before re-evaluating.
4. Turn side quests, XP, and badges into a coherent progression system only if they improve hobby follow-through.
5. Review raw HTML rendering paths before making them user-sourced.
6. Wire habits and commitments — allow a habit to be linked to a commitment (e.g. "practice guitar" habit auto-stamps the commitment).
7. **Closure gate:** capture the 7-day quiz funnel result in PostHog, then freeze the winning discovery path and pause feature development.
8. Review and merge the Significant Hobbies content-flywheel branch after the shared cross-repository OpenSpec verification is complete; the canonical package document intentionally remains empty until topics are selected.

### Deferred

- Broad social-network features behind strong personal timeline and discovery value.
- Paid coaching, marketplace, and creator monetization.
- Large content/SEO expansion until core hobby journey loop is sharper.
- ~~Single primary discovery UX not yet chosen among taxonomy / recommendations / quiz / famous journeys.~~ Chosen 2026-07-03 (quiz). Re-open only if the 7-day PostHog funnel underperforms.
- ~~Discovery paths not yet prioritized into a single primary UX.~~ Done 2026-07-03.
- The three hidden discovery surfaces (`/hobbies`, `/explore`, `/journeys`) remain fully built and reachable via deep links / SEO / cross-links from the quiz result; they are only removed from the homepage/nav/footer entry points so the quiz is the single primary discovery path. Re-surface if the quiz funnel validates.
- Side quests, XP, and badges documented as concepts but not a coherent progression system.
- Audit residuals: review `dangerouslySetInnerHTML` in `hobbies-for-resume/page.tsx` and `side-quests-client.tsx` if data becomes user-sourced; local `.env.local` secret hygiene is operator-owned.
- First-time user journey to a meaningful public timeline still needs tightening.
- Product development is paused pending the 7-day quiz funnel evidence; no new discovery or progression features should start before that readout.

### Blocked

- 7-day PostHog quiz-funnel evidence has not been supplied in-repo; closure cannot be marked complete without the operator readout.
