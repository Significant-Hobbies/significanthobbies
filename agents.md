# SignificantHobbies

Map your hobby history across life phases. Visualize insights. Share your journey. Discover what to explore next.

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19, React Compiler enabled)
- **Language**: TypeScript (strict mode)
- **Database**: Prisma 7 + Turso (libSQL/SQLite) via `@prisma/adapter-libsql`
- **Auth**: NextAuth v4 with Google OAuth, PrismaAdapter
- **Styling**: Tailwind CSS v4 (PostCSS plugin), `tw-animate-css`
- **UI Components**: shadcn/ui (new-york style, Radix primitives, Lucide icons)
- **Validation**: Zod v4
- **Testing**: Vitest (unit, jsdom env) + Playwright (e2e, `./e2e/` dir)
- **Package Manager**: pnpm
- **Integrations**: SaaS Maker SDK (feedback, analytics, changelog, testimonials)
- **Other**: dnd-kit (drag/drop), Recharts (charts), html-to-image (PNG export), nanoid, Sonner, next-themes

## Architecture

```
src/
  app/                      # Next.js App Router pages
    _components/            # Landing page client components
    api/auth/[...nextauth]/ # NextAuth route handler
    blog/                   # Blog pages (static content)
    dashboard/              # Authenticated user dashboard
    explore/                # Community exploration (aggregate trends)
    find-your-hobby/        # Quiz to discover hobbies
    hobbies/                # Hobby directory (browse by category, detail pages)
    hobbies-for-*/          # SEO content pages
    journeys/               # Famous hobby journeys
    side-quests/            # 50 curated micro-adventures (gamified)
    timeline/               # Core feature: create/view/edit timelines
      new/                  # Timeline builder
      [id]/                 # View + edit timeline
    u/[username]/           # Public user profiles + shared timelines
  components/
    timeline-builder/       # Builder components (phase cards, hobby input, drag/drop)
    timeline-view/          # View components (insights, export, comments, likes)
    ui/                     # shadcn/ui primitives
  lib/
    actions/                # Server Actions (all "use server")
      timeline.ts           # CRUD for timelines, likes, comments, pins
      user.ts               # Username, profile, follow, quest sync
      quests.ts             # Complete/uncomplete quests, badge evaluation
    types.ts                # Core types: Phase, HobbyEntry, TimelineData, etc.
    insights.ts             # Timeline analysis (rekindled hobbies, persistence)
    personality.ts          # Hobby personality profiling
    recommendations.ts      # Hobby suggestions engine
    hobbies.ts              # Hobby categories master list
    side-quests.ts          # 50 curated quests (static data)
    badges.ts               # Badge evaluation logic
    blog-posts.ts           # Blog content (static)
    famous-journeys.ts      # Famous people hobby journeys (static)
  server/
    auth/config.ts          # NextAuth options
    db.ts                   # Prisma client singleton (libSQL adapter)
prisma/
  schema.prisma             # DB schema
  seed.ts                   # Seed script
  migrations/               # Prisma migrations
middleware.ts               # Auth middleware
```

## Data Model (Prisma)

- **User**: NextAuth user + `username`, `birthYear`, `bio`, `completedQuests` (JSON), `earnedBadges` (JSON)
- **Timeline**: `phases` (JSON string of Phase[]), `pins`, `versions` (JSON snapshots), `visibility`, `slug`
- **Like**: User-Timeline unique pair
- **Comment**: User-Timeline with body (280 char max)
- **Follow**: Follower-Following unique pair

Key pattern: structured data stored as JSON strings in SQLite text columns, parsed/serialized in server actions.

## Conventions

- **Path aliases**: `@/*` and `~/*` both resolve to `./src/*` (tilde preferred)
- **Server Actions**: all in `src/lib/actions/`, use Zod validation, call `revalidatePath`
- **Client components**: suffixed with `-client.tsx` alongside server page.tsx
- **Auth pattern**: `getServerSession(authOptions)` in server actions; `useSession()` in client
- **Static content**: blog posts, hobby data, famous journeys, side quests all as TS arrays in `lib/`
- **SEO**: dynamic OG images, JSON-LD, `sitemap.ts`, `robots.txt`

## Commands

```bash
pnpm dev              # Start dev server (port 3000)
pnpm build            # prisma generate + next build
pnpm test             # Vitest (unit tests)
pnpm test:e2e         # Playwright e2e tests
pnpm lint             # ESLint
pnpm db:push          # Push schema to database
pnpm db:studio        # Open Prisma Studio
pnpm db:generate      # Regenerate Prisma client
```

## Environment Variables

```
DATABASE_URL           # "file:./dev.db" for local, "libsql://..." for Turso
TURSO_AUTH_TOKEN       # Turso auth token (production only)
NEXTAUTH_SECRET        # Random secret for NextAuth sessions
NEXTAUTH_URL           # "http://localhost:3000" in dev
GOOGLE_CLIENT_ID       # Google OAuth client ID
GOOGLE_CLIENT_SECRET   # Google OAuth client secret
NEXT_PUBLIC_SAASMAKER_API_KEY  # SaaS Maker API key (optional)
```

## Current State

**Done:**
- Timeline builder with drag/drop phases and hobby entries
- Timeline insights, hobby personality profiling, recommendations engine
- PNG export and JSON export
- User profiles with public timelines
- Social features: likes, comments, follows
- Side Quests (50 micro-adventures with badge system)
- Timeline pins and version history
- Hobby directory with categories and detail pages
- SEO content pages, blog system, famous hobby journeys
- Find Your Hobby quiz, comparison tools
- Guest mode, Google OAuth, dynamic OG images
- E2e tests (Playwright) for major pages

**Not done:**
- Explore page (partially built, "coming soon")
- Dark mode (next-themes installed but not fully wired)
- Email notifications, PWA
