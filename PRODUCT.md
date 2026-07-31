# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Adults who want to live more intentionally use Significant Hobbies to discover
interests, record daily practice privately, and shape longer-lived plans.
Signed-out visitors can explore the mortality frame, discovery content, and
explicitly public Living surfaces before choosing whether to create an account.

## Product Purpose

Significant Hobbies is a life planner with two connected dimensions:

- **Daily** is a private AM/PM ritual with simple habit check-ins and journal
  writing.
- **Living** is the user's set of hobbies, commitments, timelines, bucket
  lists, side quests, and opt-in public profiles.

The mortality frame connects both by making finite time concrete. Success means
helping a person notice what matters, return to it, and keep a truthful record
without turning reflection into competition.

## Positioning

The product combines hobby discovery, private daily reflection, and a
user-owned account of how interests evolve over a life. It is not a generic
habit scorer or social feed: Daily writing stays private, Living publication is
opt-in per item, and progress systems are limited to surfaces where proof is
the explicit job.

## Operating Context

- The public product runs at `significanthobbies.com`.
- `/daily` is the private ritual and includes a read-only signed-out sample.
- The hobby quiz is the single primary discovery path while its funnel is being
  evaluated.
- Authenticated users manage timelines, commitments, habits, journal entries,
  bucket lists, quests, trajectory, and profile settings.
- Cloudflare Workers/OpenNext serves the application; Turso/libSQL stores
  application data through Drizzle.
- Production database migrations and deployments are manual and
  operator-owned.

## Capabilities and Constraints

- Journal writing has no public visibility field or sharing API.
- Daily habits are boolean check-ins with no score, streak, XP, or shame loop.
- Commitments are separate hobby-specific goals with optional public
  visibility, proof stamps, and commitment-only streak badges.
- Hidden discovery routes remain functional but must not be re-surfaced before
  the quiz-funnel decision.
- Anonymous marketing and tool HTML follows the existing Astro/Worker cache
  boundary.
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

1. Connect Daily reflection to Living plans without making reflection proof.
2. Keep private work private and publication explicitly opt-in.
3. Let the mortality frame create urgency without scoring or shame.
4. Prefer one focused discovery path over multiplying surfaces.
5. Preserve user writing and history through safe, additive changes.

## Accessibility & Inclusion

Core flows must remain keyboard accessible, responsive, readable with reduced
motion, and understandable without color alone. Discovery data includes
cross-cutting needs such as gentle versus active activities so people with
different mobility, energy, and life stages are not silently excluded.
