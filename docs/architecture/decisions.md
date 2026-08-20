---
title: Architectural decisions
description: Durable architectural decisions for significanthobbies and the why behind each. Astro overlay, JSON-in-SQLite, quiz-as-primary discovery, no-scoring daily ritual, edge cache, OpenNext static-assets cache.
---

# Architectural decisions

> Durable choices and the why behind each. Historical design narrative is
> preserved in [`knowledge/archive/design-2026-03-01.md`](../knowledge/archive/design-2026-03-01.md)
> and [`knowledge/archive/side-quests-design-2026-03-06.md`](../knowledge/archive/side-quests-design-2026-03-06.md).
> This page keeps the choices that still constrain the current codebase.

## A1 — Astro and Next.js render the same Hub at `GET /`

**Decision:** The anonymous Hub is a static Astro site (`landing-astro/`)
overlaid into `.open-next/assets/`. The Worker runs first for `/`: anonymous
requests are served directly from the ASSETS binding while auth-bearing requests
reach the equivalent Next.js Hub. Both paths show the same seven-product directory.

**Why:** The homepage is the LCP path and the highest-traffic page. Serving the
anonymous response from the ASSETS binding avoids starting OpenNext. Astro is
also a better fit for static marketing content than Next.js App Router. The
fleet perf push (2026-06-20) required sub-second TTFB on `/`.

**Constraint:** Demo timelines moved to `GET /api/demo-timelines` because the
Astro HTML is static — it cannot render per-request data. Any new
homepage-embedded dynamic content must either be fetched client-side or moved
to a Next route. V1 deliberately has none. The Astro overlay must be rebuilt
and redeployed when Hub copy changes; it is not ISR.

## A2 — JSON-in-SQLite for structured user data

**Decision:** Structured fields (`phases`, `pins`, `versions`,
`completedQuests`, `earnedBadges`, `intentions`, `items`) are stored as JSON
strings in `text` columns, parsed/serialized in server actions. Not normalized
into separate tables.

**Why:** The data is read and written as a whole unit per parent record
(timeline, bucket list, user). Normalizing would add join complexity and
migration burden without enabling any query pattern the product actually needs.
SQLite handles JSON text well and Drizzle's `text` columns are simple.

**Constraint:** No indexed queries on nested fields. If a future feature needs
to query "all timelines containing hobby X in any phase," that requires either
a full scan with JSON parsing in app code or a denormalized join table. Do not
assume JSON-in-SQLite scales to that case without measuring. See
[`data-model.md`](data-model.md).

## A3 — The hobby quiz is the single primary discovery UX

**Decision:** `/find-your-hobby` remains Live's primary discovery surface.
`/hobbies`, `/explore`, and `/journeys` stay reachable through deep links, SEO,
and Live cross-links rather than becoming separate products in the Hub.

**Why:** Four discovery surfaces split attention and dilute measurement. The
quiz is the most focused, interactive, single-purpose flow with the clearest
payoff. Chosen 2026-07-03; see
[`product/discovery-funnel.md`](../product/discovery-funnel.md) for the
7-day PostHog funnel and decision rule.

**Constraint:** Do not re-surface the hidden surfaces until the 7-day funnel
readout is in. Do not add a fifth discovery surface. The hidden routes and
their SEO pages must stay functional — they are linked from the quiz result.

## A4 — No scoring, no streaks on daily practice

**Decision:** Habits are simple boolean check-ins. No scoreboard, no min/ideal/
max, no monthly calendar, no streak count, no XP for daily practice. The
journal entry is compulsory for the PM ritual but not scored.

**Why:** "We don't rank you against other people. Your weeks are your own. We
don't shame you for missed days." Scoring daily practice turns reflection into
performance, which is the opposite of the product's emotional goal. This stance
came over explicitly from the `today-little-log` merge — see
[`knowledge/archive/merge-plan-tll.md`](../knowledge/archive/merge-plan-tll.md).

**Constraint:** Commitments (`/commitments`) do have streak math and streak
badges (7/30/100/365-day) — but commitments are hobby-specific multi-day goals
with proof stamps, not the daily ritual. The two systems are deliberately
separate. Do not add streaks to habits or journal entries.

## A5 — Edge cache for anon marketing/tool HTML

**Decision:** `worker.mjs` maintains an explicit allowlist (`CACHEABLE_EXACT`,
`CACHEABLE_PREFIXES`) of anon HTML paths that are edge-cached via
`caches.default` with `public, max-age=3600, s-maxage=86400,
stale-while-revalidate=604800`. All other paths pass through to OpenNext.

**Why:** Cloudflare zone-level Cache Rules were marking s-maxage-only responses
as DYNAMIC. Using `caches.default` directly in the Worker sidesteps the
zone-level rule requirement and gives sub-second TTFB on warm-cache hits for
marketing and free-tool pages.

**Constraint:** The allowlist must be updated when new public marketing/tool
routes are added, or they will not be edge-cached. Authed requests are never
cached (the Worker checks auth state before consulting the cache). Do not add
user-specific routes to the allowlist.

## A6 — OpenNext static-assets incremental cache

**Decision:** `open-next.config.ts` uses `staticAssetsIncrementalCache` so
prerendered HTML is served from the ASSETS binding instead of re-rendering the
React tree on every request.

**Why:** This is what makes the Beasties-inlined critical CSS actually reach
the browser. Without an incremental cache the runtime re-renders from
`page.js` and the inlined CSS is lost. Most routes are prerendered at build
time, so serving prerendered HTML from the assets binding is the correct
default.

**Constraint:** A few routes opt into runtime behaviour and are the exception,
not the rule: `src/app/hobbies/[hobby]/page.tsx` and `src/app/explore/page.tsx`
use `export const revalidate` (ISR — 3600s and 300s respectively),
`src/app/sitemap.ts`, `src/app/history/page.tsx`, and
`src/app/timelines/recent/page.tsx` use `export const dynamic =
'force-dynamic'`; the sitemap needs a request-scoped D1 binding. With the static-assets incremental cache, ISR routes are
served from the last build output rather than revalidating on the OpenNext
runtime — verify a new `revalidate` route actually updates before relying on
it, and grep `src/app` for `revalidate`/`dynamic` for the current set. See
[`operations/runbook.md`](../operations/runbook.md) for the cache-purge
procedure.

## A7 — Drizzle over Prisma, better-auth over NextAuth

**Decision:** The v1 design (2026-03-01) specified Prisma + NextAuth v5. The
current codebase uses Drizzle ORM + better-auth. `src/db/schema.ts` is the
source of truth; `prisma/seed.ts` is legacy naming only (it uses Drizzle now).

**Why:** Drizzle is lighter on Cloudflare Workers and has a first-class D1
adapter. better-auth has a cleaner Drizzle adapter and simpler Google
OAuth than NextAuth v5 at the time of migration. The legacy PascalCase tables
(`User`, `Account`, `Session`, `VerificationToken`) are preserved because app
code references them; better-auth uses `auth_`-prefixed tables to avoid
case-insensitive collisions.

**Constraint:** Do not reintroduce Prisma. Do not rename the legacy PascalCase
tables without a coordinated migration of all references. The `prisma/`
directory name is legacy — do not add Prisma schema files there.

## A8 — Commitments and habits are separate systems

**Decision:** A commitment is a multi-day goal to show up daily for a specific
hobby (e.g. "30 days of guitar") with proof URL stamps and streak badges. A
habit is a general daily check-in (e.g. "drink water") with no scoring. The two
do not auto-link.

**Why:** Commitments are about sustained practice of a specific hobby with
evidence; habits are about daily rhythm. Conflating them would import scoring
into the daily ritual (violating A4) and import journal-style reflection into
commitments (which are about proof, not reflection).

**Constraint:** The planned "wire habits and commitments" feature (see
[`STATUS.md`](../../STATUS.md)) would allow a habit to *optionally* be linked
to a commitment so checking the habit auto-stamps the commitment — but only if
the user explicitly links them. Do not auto-link by default.

## A9 — Auth saves work; it does not unlock it

**Decision:** Anonymous visitors can use the product. Signing in exists to make
work durable, not to grant access. Two consequences:

1. **Every guard preserves the return path.** Route guards redirect to
   `loginPath('/that-route')` (`src/lib/auth-routing.ts`), never a bare
   `/login`. The "continue as guest" link derives its destination from the same
   callback via `guestRouteFor`, and may only point at surfaces that render
   without a session.
2. **Private work uses one explicit storage authority.** Signed-out work is
   stored locally; signed-in work is owner-scoped in D1. Routes consume that
   authority rather than each inventing a guest mode.

**Why:** Surfaces divide by *when* they deliver value, not by privacy. The
single-session surfaces — the quiz, `/life-bingo`, `/side-quests`, the timeline
builder, the calculators — already keep localStorage as the source of truth and
mirror to the DB only once signed in. Their whole value lands in one visit.

Longitudinal surfaces (`/daily`, `/trajectory`, `/history`, `/commitments`, and
Today) keep accumulated history locally when signed out. The UI states that the
work lives on this device; signing in changes the authority to D1 and enables
cross-device durability. Local data may be explicitly imported, but is never
silently treated as account data.

**Constraints:**

- Local records are versioned and scoped by feature; the application-wide
  authority decides whether local or D1 is canonical.
- Account writes still require server-side ownership checks. Client state is
  never evidence of ownership.
- Importing local work into an account is deliberate, idempotent, and
  dismissible. It must not overwrite newer account data silently.
- Private app routes stay `noindex`; local availability does not make them
  public discovery surfaces, so A3 still holds.

## A10 — Remaining life expectancy is conditional, everywhere

**Decision:** Every surface that shows weeks remaining derives them from
`remainingYears()` in `src/lib/mortality.ts`, a published period-life-table
curve. `buildLifeGrid` draws to `weeksLived + weeksRemaining`, so the grid's
length is personal. `LIFE_EXPECTANCY_WEEKS` survives only as the fallback for a
user who has not given a birth year.

**Why:** Life expectancy at birth is not life expectancy at your age.
Subtracting age from ~77 is the intuitive sum and it gets steadily more wrong
the older the reader is — at 71 it predicts about 6 more years against a real
figure near 14 — and past 77 it returns zero.

This was shipped first on `/life-in-weeks` only, on the reasoning that the
dashboard could carry the abstraction because its reader had already opted in.
That was wrong, and the asymmetry was worse than either model on its own: a
71-year-old met an honest number on the anonymous page, signed up on the
strength of it, and was then told by `/dashboard` that they had 270 weeks left.
Anyone past 77 got a fully dark grid and a literal zero — including on their
public profile at `/u/[username]`. The signup was the punishment.

The curve's two defining properties — monotonic decrease, never zero — are
asserted across every age in both `mortality.test.ts` (via `buildLifeGrid`, for
every birth year 1900-2025) and `life-in-weeks.test.ts` (via `remainingYears`,
ages 0-120), with regressions pinning the 64- and 71-year-old cases.

**Constraints:**

- The colour encoding is inverted relative to a progress bar. Weeks already
  spent recede (`bg-muted`, opaque); weeks remaining are lit in gold. The page
  is arguing that the remainder is open space, and a grid that makes the past
  the bright part argues the opposite.
- The spent layer must stay opaque. A translucent class lets the lit layer
  bleed through and the two states merge.
- `/life-in-weeks` stores the birth year in `localStorage` only. Nothing is
  sent to a server and no account is involved, which is what the page promises
  in its own copy.
- Weeks *lived* and weeks *stamped* are different numbers and must never share
  a label. The dashboard read "3,734 weeks stamped" off `weeksLived`, crediting
  a 71-year-old with 3,734 practice sessions they had not done.
- The grid's row count is personal, so nothing may assume ~77 rows or a
  4,000-cell array. `LifeGrid` derives its axis label from `cells.length`.

## A11 — A page per experience, and facets over the hobby catalogue

**Decision:** Every one of the 322 experiences has a page at
`/experiences/<slug>`, browsable and filterable at `/experiences`. Hobbies keep
their single category and gain twelve cross-cutting facets, filterable on
`/hobbies`.

**Why:** The corpus audit found roughly 700 distinct possibilities in the repo
and one source wired to an engine. The rest were consts inside page components
— unreachable by any code, and reachable by a person only if they happened to
land on the right SEO page. A product whose thesis is "show people what is
possible" cannot keep its possibilities in a render tree.

Facets exist because a category answers *what kind of thing is this* and a
person is asking *would this fit my life*. Those are different questions, and
the catalogue could only answer the first. `gentle` is the one that matters
most: it is what lets someone with limited mobility, an injury, or eighty years
behind them find anything at all.

**Constraints:**

- **Every entry must carry written prose.** Pages were withheld from the 147
  title-only ideas until each had a description, because a page whose only
  unique content is its own heading is thin, and thin pages are a *site-wide*
  signal that would drag down the 122 hobby pages that already work. If a new
  idea is added without a sentence, it must not get a page.
- **`firstSteps` is not `generateQuestChain`.** The chain is templated on
  category alone, so all 75 travel items produced identical body copy with a
  noun swapped — acceptable inside the app where a user sees one, not across
  175 indexable pages where it was most of the body. `firstSteps` weaves in the
  entry's own description, region or horizon, and cross-reference. A test holds
  bodies above 95% unique across the whole set.
- **Every hobby takes a position on `gentle` vs `active`.** They are mutually
  exclusive and one is required — an unlabelled hobby silently vanishes from
  the filter that matters most. Anything involving kneeling, carrying, or
  standing for hours is `active`, Gardening included.
- **Slug collisions resolve to the richer record.** "Run a marathon" is both an
  idea and a before-50 milestone. Ideas iterate first, so first-writer-wins
  handed three shared titles to the version with no description and cost each
  the page it had earned.
- Destination cross-references point at `FAMOUS_BUCKET_LISTS`, not
  `famous-journeys`. The two share some names but are separate sets.

## A12 — Journal context is a private link, not proof

**Decision:** One private `JournalEntry` may optionally reference either one
owned `Timeline` or one owned, non-abandoned `Commitment`. The daily writer and
recent-entry reader show a quiet route back to that Living plan.

**Why:** Daily and Living were described as one product, but the relationship
stopped at copy: journal rows knew only their author and date. One explicit
context makes a reflection about practice navigable without turning the journal
into a second commitments system or a public content surface.

**Constraints:**

- Context ownership is checked by the server using both the target id and the
  authenticated user id. A client-supplied id is never trusted by itself.
- An entry has at most one context. The database check prevents simultaneous
  timeline and commitment references.
- Deleting the target clears only the reference via `ON DELETE SET NULL`; the
  private writing survives.
- Linking a commitment creates no stamp, proof, streak, badge, habit log,
  notification, visibility change, or social activity.
- Signed-out daily previews do not offer context selection or persistence.

## A13 — The first public timeline is a separate consent step

**Decision:** Completed onboarding leads to the new-timeline builder, which may reuse
the authenticated user's persisted dropped-hobby answer as one editable `Now`
phase. The first save remains `PRIVATE`; only a subsequent owner action can add
it to the public profile.

**Why:** Onboarding previously ended after one habit and sent the user to a dashboard
whose highest-value empty state was another link. Even after finding the
builder, the user repeated context they had already provided, saved into a
private owner view, and had to infer that a small visibility menu was the path
to the public profile. The core creation-and-sharing loop existed, but the
handoffs made it feel like several unrelated products.

Folding publication into Save was rejected. A timeline can contain a personal
history, and “finish onboarding” is not consent to make that history discoverable.
The product should make the public path obvious without making it automatic.

**Constraints:**

- Onboarding-specific prefill reads existing authenticated `onboardingData`; it does
  not put the hobby answer in the URL or create a second onboarding store.
- Onboarding waits for the existing answer save before offering the timeline
  handoff, so fast navigation cannot lose the starter hobby.
- Direct and signed-out `/timeline/new` visits keep the template-first builder.
- The first-save query marker is presentation state only. The prompt also
  requires owner identity and current `PRIVATE` visibility.
- Publication continues through `setTimelineVisibility`, whose server-side
  ownership check is authoritative.
- “Keep it private” changes no data. Publishing one timeline changes no other
  profile item, journal entry, or account setting.

## A14 — Habit-to-commitment links are context, never evidence

**Decision:** One private `Habit` may optionally reference one owned,
non-abandoned `Commitment`. The relationship is always chosen explicitly while
creating or managing the habit; names are never matched automatically.

**Why:** Habits and commitments are deliberately different systems, but a user
practicing the same hobby in both had to keep the relationship in their head.
One quiet planning link makes the daily action navigable without lowering the
proof standard of commitments.

**Constraints:**

- The server verifies both habit and commitment ownership. Only commitments
  whose status is not `abandoned` may be selected.
- Creating, changing, checking, or unchecking a linked habit creates no stamp,
  proof, commitment progress, streak, badge, visibility change, notification,
  or public activity.
- There is no inferred or name-based default. An omitted choice stays null.
- Deleting a commitment clears the nullable reference with
  `ON DELETE SET NULL`; the habit and its check-in history survive.
- The signed-out daily preview exposes no relationship controls.

## A15 — Public hobby artifacts are shareable, not a social network

**Decision:** Public profiles and timelines no longer expose follows, likes, or
comments. Explore ranks and summarizes public timelines from their phases,
hobbies, spans, and update time rather than engagement data. The three legacy
social tables remain declared but have no runtime readers or writers.

**Why:** The controls persisted interaction data but the product had no
notification inbox, follower discovery, activity feed, or return loop. They
therefore promised a broad social experience the product explicitly does not
intend to build and distracted from the complete outcome: publishing and
sharing a meaningful hobby journey.

Adding notifications was rejected. It would expand a small truthfulness fix
into a new social system whose value has not been established.

**Constraints:**

- Existing profile sharing and timeline share, compare, export, visibility, and
  owner-edit actions remain available.
- No active route or server action reads or writes `Like`, `Comment`, or
  `Follow`.
- The tables, indexes, relationships, and historical rows remain intact. This
  decision authorizes no destructive migration or data deletion.
- Any future export, reuse, or removal of historical social data requires a
  separate explicit decision.

## A16 — Four private surfaces own the product loop

**Decision:** The post-onboarding private application has a dashboard at `/`
plus three canonical sections: Live More (`/live-more`), Daily (`/daily`), and
History (`/history`). The former `/dashboard`, `/life-plan`, and
`/look-back` routes are removed rather than maintained as parallel products.

**Why:** Separate dashboard, planning, bucket-list, mortality, timeline, and
trajectory homes made the product feel like a collection of features. The four
destinations follow the person's actual loop: act today, imagine more, keep a
daily record, and understand the life accumulating behind them.

**Constraints:**

- Astro continues to own production anonymous `GET /`. In the application,
  signed-out visitors without a completed local profile see the public landing,
  signed-out people with one see the local dashboard, signed-in people with
  completed onboarding see the account dashboard, and signed-in incomplete
  accounts continue at `/onboarding`. The SH wordmark is the dashboard's home
  control, so “Today” is not a separate navigation section.
- Live More may link to focused tools, but its owned list, yearly goals, and
  corpus-backed discovery are the orchestration layer.
- “Discover new things” uses the full experience corpus and supports refresh,
  dismiss, direct save, and a small-step route. It is an internal inspiration
  engine, not a fifth global destination or a replacement for A3's public quiz.
- Daily remains non-scoring. Its journal may pair with one optional, reversible
  small new thing for the day without turning it into a streak or score.
  History groups timeline, mortality, reflection, and Trajectory without
  presenting a lifespan estimate as a prediction.
- Before onboarding, the signed-out shell exposes public inspiration rather
  than empty private sections. Signed-in incomplete accounts continue at
  `/onboarding`; Live More, Daily, History, and the dashboard use
  `onboardingCompletedAt` in account mode and the versioned onboarding profile
  in local mode.
- Navigation names only Live More, Daily, and History. With no external legacy users,
  obsolete compatibility routes are removed instead of preserved indefinitely.

## A17 — Live, Journal, and Habits are separate product surfaces

**Decision:** A16's combined Daily surface and post-onboarding dashboard are
superseded. Live (`/live-more`) owns bucket lists, discovery, side quests,
commitments, timelines, History, and the optional small new thing. Journal
(`/journal`) owns AM/PM writing and the private archive. Habits (`/habits`) owns
non-scoring check-ins. `/daily` is a small compatibility doorway to Journal and
Habits. `/` is the read-only Significant Hobbies Hub for all visitors; it links
to the seven focused products without reading or combining their data.

**Why:** The combined product asked one destination to serve three different
intentions: decide what to live, reflect on the day, and repeat a practice. The
Journal and Habits jobs are useful on their own; separating them makes each
surface easier to return to and lets Significant Hobbies evolve into a family
of personal products without losing the current Live product.

**Constraints:**

- This first split changes product boundaries and routes, not storage. Existing
  D1 tables and signed-out IndexedDB records remain authoritative and intact.
- The Hub is a static directory in this phase. It has no summary API, shared
  database, assistant, write action, or embedded product interface.
- Journal and Habits fetch and mutate only their own domain records. History no
  longer retrieves either domain for its narrative.
- The optional small new thing remains stored in the existing journal-entry
  envelope for compatibility, but its interface and mutation live in Live.
- All three products remain on the same origin until a separate synchronization
  contract exists. Moving signed-out IndexedDB data across subdomains without
  that contract would strand local records.
- The next architecture decision must define product synchronization and
  identity before `journal.significanthobbies.com`,
  `habits.significanthobbies.com`, or `live.significanthobbies.com` becomes an
  independent deployment boundary.
