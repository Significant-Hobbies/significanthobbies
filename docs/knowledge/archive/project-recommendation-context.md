# Project Recommendation Context (archive)

> **Archive snapshot.** A CodeVetter Repo Unpacked-inspired audit generated
> 2026-06-06 for Starboard recommendations. Preserved as a historical record
> of the project's feature map and stack inventory at that point. Current
> product framing lives in [`../product/overview.md`](../../product/overview.md)
> and current architecture in [`../architecture/overview.md`](../../architecture/overview.md).

Generated: 2026-06-06T21:14:19.621Z (tooling note refreshed 2026-06-20)

This file is a CodeVetter Repo Unpacked-inspired audit written for Starboard recommendations. It is intentionally local, evidence-oriented, and safe to commit: it records product context, feature areas, stack inventory, and recommendation guidance without secrets or environment values.

**2026-06-20:** Removed `@saas-maker/eslint-config`, `@saas-maker/prettier-config`, `@saas-maker/tsconfig`, `@saas-maker/test-config`, and `@saas-maker/astro-landing`. Local eslint/biome configs and astro overlay scripts.

## Project Identity

- Slug: `significanthobbies`
- Registry description: Personal hobby mapping and journey visualization tool.
- Product grouping: `public-ready`
- Source path: `significanthobbies`

## Product Context

Personal hobby mapping and journey visualization tool.

Significant Hobbies is a hobby timeline and discovery app. It helps users map hobby history across life phases, understand patterns, share public journeys, and discover meaningful next hobbies.

SignificantHobbies Map your hobby history across life phases. Visualize insights. Share your journey. Discover what to explore next. Deployment & External Services Concern Service --------- --------- Hosting Cloudflare Workers significanthobbies via @opennextjs/cloudflare ; routes significanthobbies.com + www.significanthobbies.com . PRs deploy a significanthobbies-preview env on .workers.dev . Database Turso libSQL ; Drizzle ORM Auth better-auth + Google OAuth Analytics PostHog via local posthog-js wrapper CI/CD GitHub Actions .github/workflows/deploy.yml — auto-deploy to Cloudflare on push to main , preview deploy on PR

## Feature Map

- **Cloudflare and deploy**: Workers, Pages, edge runtime, queues, storage, and deploy automation. Keywords: cloudflare, worker, workers, pages, edge, deploy, wrangler, queue.
- **Auth and identity**: Auth, OAuth, sessions, users, permissions, and account flows. Keywords: auth, oauth, identity, session, user, permission, login, nextauth.
- **Content and media**: Content production, video, reels, documents, markdown, and publishing workflows. Keywords: content, media, video, reel, markdown, document, publish, editor.
- **Database and storage**: SQL, document storage, migrations, cache, queues, vectors, and persistence. Keywords: database, db, sql, sqlite, postgres, turso, libsql, drizzle.
- **UI workflows**: Dashboards, tables, forms, component systems, charts, and user workflows. Keywords: ui, ux, dashboard, table, component, react, next, tailwind.
- **Repo intelligence**: Repository understanding, metadata enrichment, code review, and evidence reports. Keywords: review, static, analysis, diff, history, evidence, verification.
- **Search and discovery**: Search, ranking, recommendations, feeds, semantic retrieval, and discovery UX. Keywords: search, discovery, recommend, ranking, semantic, feed, index, retrieval.

## Runtime Surfaces and Entrypoints

- `src/app/.well-known/security.txt/route.ts`
- `src/app/about/page.tsx`
- `src/app/api/auth/[...all]/route.ts`
- `src/app/api/check-username/route.ts`
- `src/app/api/hobbies/route.ts`
- `src/app/api/subscribe/route.ts`
- `src/app/blog/[slug]/page.tsx`
- `src/app/blog/page.tsx`
- `src/app/cheap-hobbies/page.tsx`
- `src/app/compare-journeys/page.tsx`
- `src/app/compare/page.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/explore/page.tsx`
- `src/app/find-your-hobby/page.tsx`
- `src/app/get-started/page.tsx`
- `src/app/hobbies-for-adults/page.tsx`
- `src/app/hobbies-for-mental-health/page.tsx`
- `src/app/hobbies-for-resume/page.tsx`
- `src/app/hobbies-to-try/page.tsx`
- `src/app/hobbies/[hobby]/page.tsx`
- `src/app/hobbies/category/[category]/page.tsx`
- `src/app/hobbies/page.tsx`
- `src/app/hobbies/random/page.tsx`
- `src/app/humans.txt/route.ts`
- `src/app/journeys/[slug]/page.tsx`
- `src/app/journeys/page.tsx`
- `src/app/layout.tsx`
- `src/app/login/page.tsx`
- `src/app/page.tsx`
- `src/app/privacy/page.tsx`
- `src/app/search/page.tsx`
- `src/app/settings/page.tsx`
- `src/app/setup/page.tsx`
- `src/app/side-quests/page.tsx`
- `src/app/starter-kits/page.tsx`
- `src/app/terms/page.tsx`
- `src/app/timeline/[id]/edit/page.tsx`
- `src/app/timeline/[id]/page.tsx`
- `src/app/timeline/new/page.tsx`
- `src/app/timeline/page.tsx`
- `src/app/timelines/recent/page.tsx`
- `src/app/tools/cost-calculator/page.tsx`

## Current Stack

- Languages: `Astro`, `TypeScript`
- Frameworks/tools: `Astro`, `Cloudflare Workers`, `Drizzle`, `Next.js`, `OpenNext Cloudflare`, `Playwright`, `Radix UI`, `React`, `Tailwind CSS`, `Vitest`
- Config files:
- `drizzle.config.ts`
- `landing-astro/astro.config.mjs`
- `landing-astro/wrangler.toml`
- `next.config.ts`
- `playwright.config.ts`
- `vitest.config.ts`
- `wrangler.toml`

## OSS Already In Use

Direct dependencies:
- `@astrojs/sitemap`
- `@dnd-kit/core`
- `@dnd-kit/sortable`
- `@dnd-kit/utilities`
- `@fontsource-variable/geist`
- `@libsql/client`
- `@radix-ui/react-avatar`
- `@radix-ui/react-dialog`
- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-label`
- `@radix-ui/react-scroll-area`
- `@radix-ui/react-select`
- `@radix-ui/react-separator`
- `@radix-ui/react-slot`
- `@radix-ui/react-tabs`
- `@radix-ui/react-tooltip`
- `@saas-maker/changelog-widget`
- `@saas-maker/feedback`
- `@saas-maker/sdk`
- `@saas-maker/testimonials`
- `@tailwindcss/vite`
- `astro`
- `better-auth`
- `class-variance-authority`
- `clsx`
- `drizzle-orm`
- `html-to-image`
- `lucide-react`
- `nanoid`
- `next`
- `next-themes`
- `posthog-js`
- `react`
- `react-dom`
- `sonner`
- `tailwind-merge`
- `tailwindcss`
- `zod`

Development dependencies:
- `@axe-core/playwright`
- `@opennextjs/cloudflare`
- `@playwright/test`
- `@tailwindcss/postcss`
- `@testing-library/jest-dom`
- `@testing-library/react`
- `@types/node`
- `@types/react`
- `@types/react-dom`
- `@vitest/coverage-v8`
- `babel-plugin-react-compiler`
- `beasties`
- `dotenv`
- `drizzle-kit`
- `eslint`
- `eslint-config-next`
- `husky`
- `jsdom`
- `lighthouse`
- `lightningcss`
- `shadcn`
- `tailwindcss`
- `tsx`
- `tw-animate-css`
- `typescript`
- `vitest`
- `wrangler`

Package scripts:
- `astro`
- `build`
- `cf:build`
- `db:generate`
- `db:push`
- `db:seed`
- `db:studio`
- `deploy`
- `dev`
- `lint`
- `prepare`
- `preview`
- `start`
- `test`
- `test:e2e`
- `test:e2e:ui`
- `test:watch`
- `typecheck`
- `validate:env:deploy`

## Testing and Quality Signals

- `e2e/blog.spec.ts`
- `e2e/explore.spec.ts`
- `e2e/hobbies.spec.ts`
- `e2e/journeys.spec.ts`
- `e2e/landing.spec.ts`
- `e2e/mobile.spec.ts`
- `e2e/quiz.spec.ts`
- `e2e/seo.spec.ts`
- `e2e/tools.spec.ts`
- `playwright.config.ts`
- `src/lib/accountability-circles.test.ts`
- `src/lib/hobby-roadmap.test.ts`
- `src/lib/insights.test.ts`
- `src/lib/personality.test.ts`
- `src/lib/recommendations.test.ts`
- `src/lib/rediscovery.test.ts`
- `vitest.config.ts`

## Recommendation Guidance

Good matches:
- Repos that strengthen cloudflare and deploy without replacing already-installed libraries.
- Repos that strengthen auth and identity without replacing already-installed libraries.
- Repos that strengthen content and media without replacing already-installed libraries.
- Repos that strengthen database and storage without replacing already-installed libraries.
- Repos that strengthen ui workflows without replacing already-installed libraries.
- Repos that strengthen repo intelligence without replacing already-installed libraries.
- Repos that strengthen search and discovery without replacing already-installed libraries.
- Tools with concrete support for src, page.tsx, radix-ui, hobby, timeline, hobbies, route.ts, api.
- Implementation repos, SDKs, CLIs, testing utilities, adapters, and focused libraries are higher value than generic awesome lists.

Avoid recommending:
- Do not recommend packages already listed under direct or development dependencies unless the task is migration research.
- Do not recommend broad framework replacements unless the project context explicitly calls for a rewrite.
- Downrank curated lists, archived repos, stale demos, and generic UI kits that do not map to the feature catalog.

## Evidence Read

Primary docs and handoff files:
- `PROJECT_STATUS.md`
- `README.md`
- `agents.md`
- `docs/README.md`
- `docs/famous-hobby-journeys-research-v2.md`
- `docs/famous-hobby-journeys-research.md`
- `docs/keyword-research-blogs.md`
- `docs/seasonal-content-research.md`

Package manifests:
- `landing-astro/package.json`
- `package.json`

Inventory notes:
- Files scanned: 288
- This pass uses deterministic repo inventory plus local documentation/source-path evidence. It does not claim a full manual line-by-line review of every source file.

## Confidence

Confidence: **high**

Why:
- PROJECT_STATUS.md present
- README.md present
- 42 entrypoint/runtime files identified
- package dependencies inventoried
- 17 test/quality files identified

Refresh command:

```bash
cd /Users/sarthak/Desktop/fleet/starboard
pnpm fleet:audit-recommendation-context
pnpm fleet:extract-projects
```
