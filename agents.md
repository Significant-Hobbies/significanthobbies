# agents.md — significanthobbies

## Shared Fleet Standard

Also read and follow the shared fleet-level agent standard at `../AGENTS.md`. Treat this repository as owned product code: protect production stability, keep changes scoped, verify work, and record durable follow-up tasks when something remains incomplete or blocked.

## Purpose
A life planner with two dimensions. **Daily** (private): one ritual page with AM/PM prompts, habit check-ins, and a compulsory journal entry. **Living** (opt-in public): hobby discovery, timeline builder, bucket lists, side quests, SEO blog, and public user profiles. The mortality frame (life grid, manifesto) connects both dimensions.

## Stack
- Framework: Next.js 16 (App Router, React 19)
- Language: TypeScript (strict)
- Styling: Tailwind CSS v4 + shadcn/ui
- DB: Turso (libSQL) via Drizzle ORM. Local dev: `file:./dev.db`
- Auth: better-auth (Google OAuth)
- Testing: Vitest (unit, co-located in `src/lib/*.test.ts`), Playwright (e2e in `e2e/`)
- Deploy: Cloudflare Workers (`significanthobbies`) via @opennextjs/cloudflare
- Package manager: pnpm

## Repo structure
```
src/
  app/
    page.tsx              # Landing
    setup/                # Username setup (first login)
    timeline/             # Timeline builder + viewer
    journeys/             # Famous celebrity hobby journeys
    side-quests/          # Quest board / gamification
    commitments/          # Multi-day practice commitments + daily proof stamps
    explore/              # Aggregate trends
    hobbies/              # Hobby directory + detail pages
    blog/                 # SEO blog content
    dashboard/            # User dashboard (life grid + commitments + daily summary)
    daily/                # Daily ritual (AM/PM prompts, habits, journal)
    manifesto/            # Mortality frame as mission
    find-your-hobby/      # Quiz / recommendation flow
    compare/              # Hobby comparison
    u/[username]/         # Public user profiles
  components/
    timeline-builder/     # Drag-drop timeline editor (dnd-kit)
    timeline-view/        # Read-only timeline display
    commitments/          # Start-commitment + log-stamp forms + commitment card
    daily-ritual.tsx      # Daily ritual client (AM/PM, habits, journal)
    life-grid.tsx         # "Life in weeks" mortality grid (4000 weeks)
    ui/                   # shadcn primitives
  db/schema.ts            # Drizzle schema (source of truth) — includes daily ritual tables (habits, habit_logs, journal_entries, daily_checkins)
  lib/
    actions/              # Server actions ("use server", Zod-validated)
    actions/daily.ts      # Daily ritual server actions (habits, journal, checkins)
    commitments.ts        # Streak math, proof-type inference, streak badges (pure)
    mortality.ts          # Weeks-lived + life-grid math from birthYear (pure)
    hobbies.ts            # 60-concept hobby taxonomy (static TS array)
    recommendations.ts    # Hobby suggestion logic
    insights.ts           # Timeline insight computations
    personality.ts        # Quiz personality scoring
    side-quests.ts        # Quest definitions (50 micro-adventures, static)
    famous-journeys.ts    # Celebrity journey data (static)
    badges.ts             # Badge evaluation logic
  server/auth/            # better-auth config
e2e/                      # Playwright specs
prisma/seed.ts            # Hobby catalog seed (uses Drizzle now — legacy dir name only)
drizzle.config.ts         # Turso dialect
```

## Key commands
```bash
pnpm dev              # next dev (localhost:3000)
pnpm build            # next build
pnpm test             # vitest run (unit)
pnpm test:e2e         # playwright test
pnpm db:push          # drizzle-kit push (apply schema to DB)
pnpm db:generate      # drizzle-kit generate (migration files)
pnpm db:studio        # drizzle-kit studio
pnpm db:seed          # tsx prisma/seed.ts (hobby catalog seed)
```

## Architecture notes
- **`prisma/` directory is legacy naming** — seed script now uses Drizzle. `src/db/schema.ts` is the source of truth.
- **JSON-in-SQLite pattern**: structured data (phases, completedQuests, earnedBadges) stored as JSON strings in text columns, parsed/serialized in server actions.
- **60-concept hobby taxonomy**: static TS array in `src/lib/hobbies.ts`. Recommendation engine uses quiz-based personality scoring.
- **Gamification**: 50 curated side-quests (micro-adventures), XP, badges, quest progress tracked in DB. `use-quest-progress.ts` hook manages state.
- **Commitments & stamps**: a commitment is an N-day (default 30) goal to show up daily for a hobby. Each calendar day the user logs a "stamp" — a proof URL (YouTube, photo, any URL) that they practiced. One stamp per day per commitment, enforced by a unique index on `(commitmentId, dayDate)`. Streak math (`src/lib/commitments.ts`) is pure and tested; streak badges (7/30/100/365-day) are merged into `earnedBadges` by the `logStamp` server action. The "life in weeks" mortality grid (`src/lib/mortality.ts` + `LifeGrid` component) lights up weeks that contain stamps.
- **Drag-drop timeline** via dnd-kit. Timeline export via `html-to-image` (client-side PNG).
- **Guest mode**: timeline builder works without sign-in (URL state). Sign-in required for persistence.
- **Public profiles** at `/u/[username]`.
- **SEO-first**: many routes are static/ISR pages targeting hobby keywords. Full sitemap at `src/app/sitemap.ts`.
- **SaaS Maker**: feedback, testimonials, changelog-widget live. (SaaS Maker analytics removed — PostHog is the analytics path.)
- Pre-push hook runs lint.
- **Deep Study theme**: saturated deep-teal body (OKLCH), cream ink, gold (Lumi) accents. Fraunces serif for display headings via `next/font`. Magic UI motion primitives (`motion` package) in `src/components/magicui/`. All colors are CSS tokens — avoid hardcoded stone/emerald/white.
- **Images**: curated Unsplash photos (free license) downloaded and optimized to WebP via `scripts/optimize-images.mjs` (uses `sharp`). Hero photo in `landing-astro/public/hero/`, category headers in `public/categories/`. Category image helpers in `src/lib/category-images.ts`.

<!-- FLEET-GUIDANCE:START -->

## Fleet Guidance

### Adding Tasks
- Add durable work items in SaaS Maker Cockpit Tasks when the task affects product behavior, deployment, user feedback, or fleet maintenance.
- Include the project slug, a concise title, acceptance criteria, priority/status, and links to relevant code, issues, traces, or dashboards.
- If task discovery starts locally in an editor or agent session, mirror the durable next step back into SaaS Maker before handoff.

### Using SaaS Maker
- Treat SaaS Maker as the system of record for project metadata, feedback, tasks, analytics, testimonials, changelog, and fleet visibility.
- Prefer API-first workflows through `fnd api`, the SDK, or widgets instead of one-off scripts when interacting with SaaS Maker features.
- Keep this agent file aligned with the project record when operating rules, integrations, or deployment conventions change.

### Free AI First
- Prefer free/local AI paths for routine development and analysis: the `free-ai` gateway, local models, provider free tiers, and cached context.
- Escalate to paid models only when complexity, correctness risk, or missing capability justifies the cost.
- Note any paid-AI use in the task or handoff when it materially affects cost, reproducibility, or future maintenance.

<!-- FLEET-GUIDANCE:END -->

## Active context
