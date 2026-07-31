# significanthobbies — PROJECT STATUS

> Short live-status view. Detailed historical status log preserved at
> [`docs/knowledge/archive/project-status-2026-07-13.md`](docs/knowledge/archive/project-status-2026-07-13.md).
> Update this file when durable current or shipped product truth changes. Do
> not let deploy-version snapshots accumulate here — put those in the archive.

Last updated: 2026-07-31

## Why / What

Ship and operate **significanthobbies** — a life planner with two dimensions
(Daily + Living) — at `significanthobbies.com` on Cloudflare Workers. The
mortality frame (life grid, manifesto) connects both dimensions. The journal
is the bridge between daily practice and life aspirations.

## Dependencies

- Cloudflare Workers/OpenNext, Turso/libSQL, Drizzle, better-auth Google OAuth,
  and PostHog.

## Timeline

- **2026-07-31:** Made the journal an actual private bridge to Living: each
  daily entry can optionally relate to one owned timeline or non-abandoned
  commitment, with server ownership checks and safe target deletion. The
  additive migration is generated but production migration/deployment remains
  manual.
- **2026-07-31:** Removed the anonymous landing page's intentional idle-time
  LCP delay and late font swap. Production-equivalent mobile Lighthouse
  improved from 92 / 3.31s LCP to 99 / 1.97s LCP across three-run profiles,
  with zero CLS; production deployment remains manual.
- **2026-07-29:** Added an owned `/changelog` with verified shipped outcomes
  and direct GitHub Roadmap and Source links.
- **2026-07-13:** Merged the Significant Content flywheel after strict OpenSpec,
  test, browser, typecheck, and production-build validation. No content was
  published or scheduled and no deployment was run.

Historical milestones live in
[`docs/knowledge/archive/project-status-2026-07-13.md`](docs/knowledge/archive/project-status-2026-07-13.md).

## Products

- Public product at `https://significanthobbies.com`.
- Daily practice, Living planning, discovery, public profiles, and content
  surfaces in one Cloudflare Worker.

## Features (shipped)

- **Runtime:** Cloudflare Worker `significanthobbies` (OpenNext) + Astro
  landing overlay for anon `GET /`. Turso (libSQL) + Drizzle ORM +
  better-auth Google OAuth. PostHog analytics.
- **Owned product history:** public editorial changelog at `/changelog`.
- **Two dimensions shipped:** Daily ritual (`/daily` — AM/PM prompts, habits,
  compulsory journal) and Living (timelines, bucket lists, side quests,
  public profiles, SEO blog, discovery quiz).
- **Journal reader and Living bridge built locally:** `/daily` pairs today's
  AM/PM writing with a private, read-only 21-day date rail. An entry may
  optionally relate to one owned timeline or non-abandoned commitment and route
  back to that plan. The link creates no proof, progress, score, streak, or
  public activity; production migration/deployment remains operator-owned.
- **Front door (2026-07-26):** `/life-in-weeks` is a new anonymous surface —
  one birth year in, the whole life grid out, then a turn toward what the
  remaining weeks are for. The mortality frame previously existed only behind
  Google OAuth, so the most affecting thing the product does was unreachable
  for a first-time visitor. It is now the single hero CTA on a video-led Astro
  landing and the closing link on `/manifesto`.
- **Mortality maths corrected everywhere (2026-07-26):** every surface now
  derives weeks remaining from conditional life expectancy. The old fixed
  4,000-week frame told a 71-year-old they had ~270 weeks left and anyone past
  77 exactly zero, on `/dashboard`, `/daily`, `/trajectory`, `/look-back`,
  `/commitments` and their public profile. See
  [`docs/architecture/decisions.md`](docs/architecture/decisions.md) A10.
- **The corpus is reachable (2026-07-26):** every "thing you could do" the
  product owns is now importable data rather than a const inside a page
  component. 322 experiences at `/experiences`, each with its own page; the
  suggestion engine reads all of them where it previously had a private
  52-item pool. 122 hobbies gained twelve cross-cutting facets, so "gentle,
  cheap, screen-free" is two clicks rather than unanswerable. See
  [`docs/architecture/decisions.md`](docs/architecture/decisions.md) A11.
- **Discovery:** the hobby quiz (`/find-your-hobby`) is the single primary
  discovery UX (2026-07-03). The other three surfaces (`/hobbies`, `/explore`,
  `/journeys`) are hidden from homepage/nav/footer; code intact, reachable
  via deep links/SEO/cross-links.
- **Content flywheel:** versioned JSON content packages, deterministic CLI,
  receipts, blog integration, performance feedback, and agent/video discovery
  are merged on `main`. The canonical package document remains intentionally
  empty until topics are selected.
- **Docs:** consolidated into a canonical `docs/` tree with Blume as the
  presentation layer.
- **Product cleanup (2026-07-25):** an audit found several surfaces that looked
  like features but were not. Removed the arcs façade (table never written,
  `/arcs` permanently empty, and it fed wrong numbers to the insights panel) and
  five badges no evaluator could award. Fixed the day-boundary bug (`dayDate`
  was resolved in UTC despite being documented user-local), made habit cadence
  real, closed two privacy leaks, and wired two implemented-but-uncalled actions
  (`syncQuestProgress`, `closeEra`). Detail in
  [`docs/knowledge/learnings.md`](docs/knowledge/learnings.md).
- **Auth is optional again (2026-07-25).** All 12 route guards used a bare
  `redirect('/login')`, so signing in from `/trajectory` landed on `/dashboard` —
  the login page had accepted and validated `callbackUrl` all along and nothing
  ever sent it. Guards now preserve the return path, and "continue as guest"
  follows the same intent instead of a hardcoded `/timeline/new` (one of its old
  targets, `/bucket-list/new`, itself required a session). `/daily` and
  `/trajectory` now render a read-only signed-out preview of one sample month
  rather than a wall. The longitudinal/single-session split and its constraints
  are recorded as [`decisions.md`](docs/architecture/decisions.md) A9.

## Routes with no inbound UI links (deliberate, not forgotten)

Checked 2026-07-25. Routes are preserved by default per the fleet standard; these
are parked with a reason rather than deleted.

| Route | Why it has no links |
| --- | --- |
| `/timelines/recent` | Duplicates `/explore` (both list `PUBLIC` timelines by recency). `/explore` is the designated community surface and is deliberately hidden pending the quiz-funnel readout, so linking either would undercut that experiment. Also absent from `sitemap.ts`. Revisit with the funnel decision. |
| `/compare` | Static hobby-vs-hobby SEO page, no user data. It is in `sitemap.ts` and indexable, so crawlers are its intended audience; internal links are optional. |
| `/explore` | Intentionally hidden — see [`docs/product/discovery-funnel.md`](docs/product/discovery-funnel.md). |
| `/hobbies`, `/journeys` | Same as `/explore`. Reachable via deep links, SEO, and quiz cross-links. |

`/life-plan` was in this category and is now linked from the account dropdown: it
is not a `/dashboard` duplicate (archetype, life balance, and the only surface
rendering bucket-item quest chains) and it is `noindex`, so surfacing it does not
touch the discovery experiment.

**Resolved 2026-07-25:** user profiles are now in `sitemap.ts`. Only users with a
username *and* at least one `PUBLIC` timeline are listed — an empty profile is a
thin page, and `PRIVATE`/`UNLISTED` content is never advertised. `lastModified`
tracks the newest public timeline update, the query is capped at 5000 rows, and it
returns `[]` on failure so a database hiccup degrades the sitemap rather than
500ing it and taking the static entries down with it.

Private app routes stay out of the sitemap by design: `/daily`, `/dashboard`,
`/trajectory`, `/commitments`, `/life-plan`, `/bucket-list`, and `/look-back` are
all `noindex` and auth-gated, so listing them would point crawlers at a login
redirect and contradict their own robots directive. `/search` is in the sitemap
and is genuinely public — that one is consistent.

### Deploy fingerprint

- **Worker:** `significanthobbies` (prod) / `significanthobbies-preview` (PR)
- **Routes:** `significanthobbies.com/*`, `www.significanthobbies.com/*`
- **Deploy trigger:** manual `workflow_dispatch` on `.github/workflows/deploy.yml`
- **DB:** Turso `significanthobbies` (libSQL)

## Work queue

Open work is tracked only in [GitHub Issues](https://github.com/Significant-Hobbies/significanthobbies/issues).
An open issue is a to-do, a linked pull request is in progress, and merge plus
issue closure makes the work done.
