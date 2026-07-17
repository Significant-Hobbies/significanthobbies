# SignificantHobbies

**Product:** [significanthobbies.com](https://significanthobbies.com)


Map your hobby history across life phases. Visualize insights. Share your journey. Discover what to explore next.

## Deployment & External Services

| Concern | Service |
|---------|---------|
| Hosting | Cloudflare Workers (`significanthobbies`) via `@opennextjs/cloudflare`; routes `significanthobbies.com` + `www.significanthobbies.com`. PRs deploy a `significanthobbies-preview` env on `*.workers.dev`. |
| Database | Turso (libSQL); Drizzle ORM |
| Auth | better-auth + Google OAuth |
| Analytics | PostHog (via `local posthog-js wrapper`) |
| CI/CD | GitHub Actions (`.github/workflows/deploy.yml`) — manual production deploy from `main` |

## Quick Start

```bash
pnpm install
cp .env.example .env          # fill in your values
pnpm db:push                  # apply Drizzle schema to local SQLite (dev.db)
pnpm db:seed
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | `file:./dev.db` for local, `libsql://...` for Turso |
| `TURSO_AUTH_TOKEN` | Turso only | Token from `turso db tokens create <db>` |
| `BETTER_AUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Yes | `http://localhost:3000` in dev |
| `GOOGLE_CLIENT_ID` | Yes | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Yes | From Google Cloud Console |

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Add Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID + Secret into `.env`

## Turso (Production Database)

```bash
# Install CLI
brew install tursodatabase/tap/turso
turso auth login

# Create database
turso db create significanthobbies

# Get URL and token
turso db show significanthobbies --url
turso db tokens create significanthobbies

# Update .env
DATABASE_URL="libsql://significanthobbies-<org>.turso.io"
TURSO_AUTH_TOKEN="<token>"
```

## Running Tests

```bash
pnpm test            # vitest unit + accessibility
pnpm test:e2e        # playwright (assumes pnpm dev is running on :3000)
pnpm test:e2e:ui     # playwright UI mode
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Google sign in |
| `/setup` | Set your username (first login) |
| `/timeline/new` | Build a new timeline |
| `/timeline/[id]` | View your timeline with insights |
| `/timeline/[id]/edit` | Edit your timeline |
| `/t/[slug]` | Shared timeline (public/unlisted) |
| `/u/[username]` | User profile + hobby portfolio |
| `/hobbies` | Browse hobby categories |
| `/hobbies/[hobby]` | Hobby detail + who does it |
| `/explore` | Aggregate trends (coming soon) |

## Stack

- **Framework**: Next.js 16 App Router + TypeScript
- **Database**: Drizzle + Turso (libSQL / SQLite)
- **Auth**: better-auth (Google OAuth)
- **UI**: Tailwind CSS v4 + shadcn/ui + @dnd-kit for drag/drop
- **Export**: html-to-image (client-side PNG)
- **Testing**: Vitest + Playwright (e2e), Lighthouse CI

## Features

- **Timeline builder** — drag/drop phases, add hobbies, auto-save for guests
- **Insights** — rekindled hobbies, persistence tracking, phase-by-phase changes
- **Export** — beautiful PNG card + JSON export
- **Profile** — `/@username` portfolio of your public timelines
- **Discovery** — personalized hobby suggestions + directory
- **Guest mode** — build and export without an account

<!-- ACTIVE-AI-TASK-LOG:START -->
## Active AI Task Log

This section is maintained by the SaaS Maker Active-AI product/design loop so future agents do not reopen duplicate UI tasks.

- Business lane: P1 Explore
- Rule: do not create another broad "improve the UI" task unless the acceptance criteria differ materially from the tasks listed here.
- Source of truth for task status: SaaS Maker task board. README entries are durable context only.

| Task | Status | Priority | Last known note |
| --- | --- | --- | --- |
| `df83bb7f` significanthobbies: fix Cloudflare 1015 rate-limit blocking homepage | done | high | 2026-05-25 17:07:37 |
| `4692120d` significanthobbies: add sample hobby journey and start CTA | done | medium | 2026-05-26: added SampleJourneyCard to hero, simplified copy, updated primary CTA to "Start your hobby map →" |
| `6f687fd4` significanthobbies: add share-preview proof card | done | medium | 2026-05-26: added ShareProofSection to landing — dark card preview with phase labels, personality archetype, share action strip (copy/Twitter/WhatsApp/PNG), "What your friends see" label, and "Share your map →" primary CTA |
| `d9e4af4d` significanthobbies: add example gallery empty state | done | low | 2026-05-26: CommunityGallery now shows 3 static sample cards with "Sample" badge + "Build and share yours →" CTA instead of returning null when demos are empty |
<!-- ACTIVE-AI-TASK-LOG:END -->
