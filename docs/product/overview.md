---
title: Product overview
description: SignificantHobbies — a life planner with two dimensions (Daily + Living). Product thesis, users, brand, design principles, and the mortality frame.
---

# Product overview

> A life planner with two dimensions. **Daily** (private): one ritual page with
> AM/PM prompts, habit check-ins, and a compulsory journal entry. **Living**
> (opt-in public): hobby discovery, timeline builder, bucket lists, side
> quests, SEO blog, and public user profiles. The mortality frame (life grid,
> manifesto) connects both dimensions.

## Register

product

## Users

People in their 20s–40s who feel the pull of unlived experiences — curious about their own hobbies, dimly aware of their bucket list, but without a structured place to track either. They open the app in a reflective moment: a Sunday evening, a birthday, a slow week at work. They're not productivity obsessives. They're people who sense that life is going faster than they planned and want to be more intentional about it. Secondary users are people who discover the app through SEO ("famous bucket lists", "hobby quiz") and convert through inspiration.

## Product Purpose

A companion for living intentionally — helping people discover their hobbies, build their bucket list, and track a life worth remembering. The core loop: discover (quiz, famous journeys, famous bucket lists) → capture (timelines, bucket list items) → reflect (dashboard insights, personality archetype, celebrity match). The bucket list is the newest and highest-leverage surface: it answers "what do I want to do with my life?" rather than just "what are my hobbies?"

Lumi is the mascot: an amber/gold guiding light. Warm, aspirational, never preachy. "Your guiding light toward a life worth remembering."

## Brand Personality

Purposeful · Warm · Aspirational

Voice: A wise friend who has lived well and wants the same for you. Encouraging without being cheerleader-y. Honest without being blunt. Believes deeply that the unexamined hobby life is not worth living.

Emotional goal: users should feel seen, inspired, and gently nudged — not tracked, graded, or optimized.

## Anti-references

- **LinkedIn / resume trackers**: career-achievement framing, status signaling, cold blues and grays
- **Generic bucket list apps**: clipart checkboxes, holiday-brochure travel photos, "1000 places to see before you die" energy
- **Hustle culture dashboards**: streaks, OKRs, completion rates as performance metrics, red/green gamification overload
- **Overly minimal / cold**: white void, single weight sans, no warmth or character — the "we're serious" design that forgets humans use the product

## Design Principles

1. **Warmth first, function always** — every surface should feel like a thoughtful friend, not a form. But the forms must work perfectly.
2. **Inspire before you capture** — show people what's possible (famous lists, archetypes, suggestions) before asking them to input anything. Inspiration gates capture.
3. **Privacy as default dignity** — bucket list items are private unless the user chooses otherwise. Never make someone feel surveilled by their own app.
4. **Lumi earns her screen time** — the mascot appears at moments of genuine guidance (empty states, first-run, suggestions), not as decoration on every page.
5. **Progress is personal, not performative** — progress bars and completion stats exist to encourage the user, not to rank them against others.

## Accessibility & Inclusion

- WCAG AA minimum. Body text ≥4.5:1, large/bold text ≥3:1.
- Reduced motion support on all animations (globals.css already has prefers-reduced-motion fallbacks).
- Lumi is described via aria-label; decorative instances are aria-hidden.
- Color is never the only signal — category tags use both emoji and text labels.

## Two dimensions

The product merged with `today-little-log` on 2026-07-02 (see
[`knowledge/archive/merge-plan-tll.md`](../knowledge/archive/merge-plan-tll.md)).
The merge produced one coherent thesis:

- **Daily (private):** one `/daily` ritual page — AM/PM prompts, habit
  check-ins (simple, no scoring), compulsory journal entry at the bottom.
  Structurally private: no visibility field, no public API, no sharing.
- **Living (opt-in public):** hobbies, bucket lists, side quests, timelines,
  public profiles. Opt-in public per item.
- **The journal is the bridge.** You write about practicing your hobby, and
  that connects to your timeline and commitments.
- **The mortality frame connects both.** A finite life is the reason daily
  practice and life aspirations both matter. The life grid (`src/lib/mortality.ts`)
  and the manifesto (`/manifesto`) make this concrete.

### What we deliberately do not do

- No scoring, no streaks on daily practice. "We don't shame you for missed
  days." Habits are simple check-ins.
- No broad social network, paid coaching, marketplace, or creator monetization.
- No large SEO expansion until the core hobby journey loop sharpens.
- No coherent XP/badge progression system until follow-through value is proven.

## Discovery — the quiz is primary

The hobby quiz at `/find-your-hobby` is the single primary discovery UX
(chosen 2026-07-03). The other three discovery surfaces — taxonomy directory
(`/hobbies`), community explore (`/explore`), famous journeys (`/journeys`) —
are hidden from the homepage/nav/footer but their code and routes are intact;
they remain reachable via deep links, SEO pages, and cross-links from the quiz
result. Re-surface only if the 7-day PostHog funnel underperforms.

See [`discovery-funnel.md`](discovery-funnel.md) for the funnel measurement
plan.
