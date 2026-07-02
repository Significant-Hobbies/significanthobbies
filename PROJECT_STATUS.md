# significanthobbies — PROJECT STATUS

Last updated: 2026-07-02

## Why / What

A life planner with two dimensions. **Daily** (private): one daily ritual page — AM/PM prompts, habit check-ins, compulsory journal entry. **Living** (opt-in public): hobbies, bucket lists, side quests, timelines. The mortality frame (life grid, manifesto) connects both. The journal is the bridge between daily practice and life aspirations.

**Users:** Signed-in users via Google OAuth; guest timeline builders with auto-save; visitors browsing public journeys and hobby directory.

**Constraints:** Deployed on Cloudflare Workers at `significanthobbies.com`; **Astro owns `GET /`** (static overlay + `run_worker_first` bypass); Next.js handles all app/SEO/API routes. Single primary discovery UX not yet chosen.

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

CI: `.github/workflows/deploy.yml` — auto-deploy on `main`, preview on PR. `.github/workflows/ci.yml` — lint + typecheck + `test:coverage` (v8 thresholds on core `src/lib` modules).

**Entrypoints:** `worker.mjs` · Next.js App Router handlers · `scripts/cf-build.mjs` · `landing-astro/`.

Build pipeline (`scripts/cf-build.mjs`): Next build → patch sparse pnpm store for OpenNext → opennextjs-cloudflare → Astro landing overlay into `.open-next/assets/`. Preview env deploys to `significanthobbies-preview.*.workers.dev` without touching prod routes.

## Timeline

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
- **Discovery**: `/explore`, `/hobbies`, `/hobbies/[hobby]`, `/hobbies/category/[category]`, `/hobbies/random`, `/find-your-hobby`, `/search`.
- **Content/SEO**: bucket lists, side quests, compare journeys, hobby guides (`hobbies-for-resume`, mental health, adults, cheap hobbies, etc.).
- **Tools**: time calculator, cost calculator.
- **Account**: `/dashboard`, `/settings`, `/login`, `/get-started`.
- **Manifesto**: `/manifesto` — mortality frame as mission, not feature.

### Features shipped

- **Daily ritual** (`/daily`): AM/PM prompts, habit check-ins (simple, no scoring), compulsory journal entry, inline habit management. Merged from today-little-log.
- **Dashboard integration**: today's habits summary + journal prompt alongside commitments and life grid.
- **Manifesto** (`/manifesto`): mortality frame as mission, two dimensions (Daily + Living), journal as bridge.
- Timeline builder with drag/drop phases and hobbies.
- Insights: rekindled hobbies, persistence tracking, phase-by-phase changes.
- PNG/JSON export of timelines.
- Public profiles and shared timeline URLs.
- Discovery suggestions and hobby directory (60-concept taxonomy documented).
- Product expansion concepts documented: recommendations, side quests, XP/badges, SEO pages, comparisons, quizzes, famous journeys.

## Todo / Planned / Deferred / Blocked

### Planned

1. ~~**Decommission today-little-log**~~ — TLL repo marked archived/merged (2026-07-02). Domain redirect from `today-little-log.pages.dev` to `significanthobbies.com` still pending operator action when ready. No data migration needed.
2. Tighten timeline creation and sharing loop so a first-time user can produce a meaningful public journey quickly.
3. Decide which discovery path is primary: taxonomy browsing, recommendations, quiz, or famous journey inspiration.
4. Turn side quests, XP, and badges into a coherent progression system only if they improve hobby follow-through.
5. Review raw HTML rendering paths before making them user-sourced.
6. Wire habits and commitments — allow a habit to be linked to a commitment (e.g. "practice guitar" habit auto-stamps the commitment).

### Deferred

- Broad social-network features behind strong personal timeline and discovery value.
- Paid coaching, marketplace, and creator monetization.
- Large content/SEO expansion until core hobby journey loop is sharper.
- Single primary discovery UX not yet chosen among taxonomy / recommendations / quiz / famous journeys.
- Discovery paths not yet prioritized into a single primary UX.
- Side quests, XP, and badges documented as concepts but not a coherent progression system.
- Audit residuals: review `dangerouslySetInnerHTML` in `hobbies-for-resume/page.tsx` and `side-quests-client.tsx` if data becomes user-sourced; local `.env.local` secret hygiene is operator-owned.
- First-time user journey to a meaningful public timeline still needs tightening.

### Blocked

- (none)
