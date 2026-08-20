# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Adults who want to live more intentionally use the Significant Hobbies family
to discover interests, write privately, build repeatable practices, and shape
longer-lived plans.
Signed-out visitors can explore the mortality frame, discovery content, and
explicitly public Living surfaces before choosing whether to create an account.

## Product Purpose

Significant Hobbies is becoming a family of focused personal products:

- **Significant Hobbies** is the read-only directory and future dashboard.
- **Live** owns bucket lists, hobbies, commitments, timelines, side quests,
  discovery, and the optional small new thing for today.
- **Journal** owns private AM/PM writing and its archive.
- **Habits** owns simple, non-scoring practice check-ins.
- **History** remains part of Live and helps the user understand the life
  accumulating behind their plans.

The mortality frame connects the family by making finite time concrete. Success
means helping a person notice what matters, return to it, and keep a truthful
record without turning reflection into competition.

## Positioning

The family connects hobby discovery, private reflection, repeatable practice,
and a user-owned account of how interests evolve over a life. It is not a
generic productivity suite or social feed: Journal writing stays private, Live
publication is opt-in per item, and progress systems are limited to surfaces
where proof is the explicit job.

## Operating Context

- The public product runs at `significanthobbies.com`.
- `/` is the same seven-product directory for signed-out and signed-in visitors.
- `/live-more`, `/journal`, and `/habits` are the current same-origin product
  routes; `/daily` is a compatibility doorway to Journal and Habits.
- The hobby quiz is the single primary discovery path while its funnel is being
  evaluated.
- Authenticated users manage timelines, commitments, habits, journal entries,
  bucket lists, quests, trajectory, and profile settings.
- Cloudflare Workers/OpenNext serves the application; Cloudflare D1 stores
  authenticated application data through Drizzle. Signed-out private work
  remains in IndexedDB on the current origin.
- Production database migrations and deployments are manual and
  operator-owned.

## Capabilities and Constraints

- Journal writing has no public visibility field or sharing API.
- Habits are boolean check-ins with no score, streak, XP, or shame loop.
- Commitments are separate hobby-specific goals with optional public
  visibility, proof stamps, and commitment-only streak badges.
- Hidden discovery routes remain functional but must not be re-surfaced before
  the quiz-funnel decision.
- Anonymous marketing and tool HTML follows the existing Astro/Worker cache
  boundary.
- The Hub has no shared database, summaries, assistant, or write actions in V1.
- Existing private data must survive target deletion and reversible product
  changes.

## Brand Commitments

The established name is Significant Hobbies. The documented voice is a wise
friend who has lived well and wants the same for the user: encouraging,
specific, grounded, and never gamified or shaming.

## Evidence on Hand

Current product truth is recorded in `PROJECT_STATUS.md`; product and
architectural decisions live under `docs/product/` and `docs/architecture/`.
The repository contains real hobby, experience, and sample-preview content.
No testimonials, customer counts, or external benchmark claims are established
and none should be invented.

## Product Principles

1. Let Live, Journal, and Habits own distinct jobs while preserving explicit
   links between related records.
2. Keep private work private and publication explicitly opt-in.
3. Let the mortality frame create urgency without scoring or shame.
4. Prefer one focused discovery path over multiplying surfaces.
5. Preserve user writing and history through safe, additive changes.

## Accessibility & Inclusion

Core flows must remain keyboard accessible, responsive, readable with reduced
motion, and understandable without color alone. Discovery data includes
cross-cutting needs such as gentle versus active activities so people with
different mobility, energy, and life stages are not silently excluded.
