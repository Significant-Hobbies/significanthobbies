# agents.md — significanthobbies

## Purpose
Hobby discovery and journaling platform — timeline builder, quiz-based recommendations, gamification (XP, badges, side-quests), SEO blog, and public user profiles.

## Stack
- Framework: Next.js 16 (App Router, React 19)
- Language: TypeScript (strict)
- Styling: Tailwind CSS v4 + shadcn/ui
- DB: Turso (libSQL) via Drizzle ORM. Local dev: `file:./dev.db`
- Auth: NextAuth v4 (Google OAuth) + `@auth/drizzle-adapter`
- Testing: Vitest (unit, co-located in `src/lib/*.test.ts`), Playwright (e2e in `e2e/`)
- Deploy: Vercel
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
    explore/              # Aggregate trends
    hobbies/              # Hobby directory + detail pages
    blog/                 # SEO blog content
    dashboard/            # User dashboard
    find-your-hobby/      # Quiz / recommendation flow
    compare/              # Hobby comparison
    u/[username]/         # Public user profiles
  components/
    timeline-builder/     # Drag-drop timeline editor (dnd-kit)
    timeline-view/        # Read-only timeline display
    ui/                   # shadcn primitives
  db/schema.ts            # Drizzle schema (source of truth)
  lib/
    actions/              # Server actions ("use server", Zod-validated)
    hobbies.ts            # 60-concept hobby taxonomy (static TS array)
    recommendations.ts    # Hobby suggestion logic
    insights.ts           # Timeline insight computations
    personality.ts        # Quiz personality scoring
    side-quests.ts        # Quest definitions (50 micro-adventures, static)
    famous-journeys.ts    # Celebrity journey data (static)
    badges.ts             # Badge evaluation logic
  server/auth/            # NextAuth config
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
- **Drag-drop timeline** via dnd-kit. Timeline export via `html-to-image` (client-side PNG).
- **Guest mode**: timeline builder works without sign-in (URL state). Sign-in required for persistence.
- **Public profiles** at `/u/[username]`.
- **SEO-first**: many routes are static/ISR pages targeting hobby keywords. Full sitemap at `src/app/sitemap.ts`.
- **SaaS Maker**: feedback, testimonials, changelog-widget, analytics all live.
- Pre-push hook runs lint.

## Active context
