---
title: Discovery funnel — PostHog measurement plan
description: The hobby quiz is the single primary discovery UX. PostHog 3-step funnel, decision rule, and the hidden discovery surfaces.
---

# Discovery funnel — PostHog measurement plan

> **Chosen primary discovery UX:** the hobby quiz at `/find-your-hobby`
> (2026-07-03). Product development is paused pending the 7-day funnel
> readout — see [`STATUS.md`](../../STATUS.md).

## Why the quiz

The quiz is the most focused, interactive, single-purpose discovery surface —
a guided 5-question flow with a clear payoff (archetype + personalized hobby
recommendations + a saveable experiment plan). It already had the most complete
instrumentation and produces a concrete next step toward commitment
(recommended hobbies with first steps → save plan → build timeline). The other
three surfaces (taxonomy browsing `/hobbies`, community explore `/explore`,
famous journeys `/journeys`) are broader/lower-intent and split attention.

## Hidden (not deleted)

`/hobbies`, `/explore`, `/journeys` were removed from the homepage (Astro
landing `CommunitySamples` + `FinalCta`), the top nav, and the footer. Their
code and routes are intact — they remain reachable via deep links, SEO pages,
and cross-links from the quiz result. Only the main entry points were changed
so the quiz is the single primary discovery path.

## Funnel (7-day conversion window in PostHog)

| Step | Event | Fired when | Properties |
| --- | --- | --- | --- |
| 1 | `discovery_started` | Quiz page viewed (mount) | `surface: "quiz"` |
| 2 | `discovery_engaged` | Quiz completed → personalized recommendations shown | `surface`, `archetype`, `top_categories` |
| 3 | `hobby_committed` | User saves the experiment plan **or** clicks "Build your hobby timeline" from the result | `surface`, `method` (`save_plan` \| `timeline_start`), `archetype`, `hobbies` |

All events carry `project_id: "significanthobbies"`. Implementation:
`trackDiscoveryFunnel` in `src/lib/analytics.ts`; fired from
`src/app/find-your-hobby/quiz-client.tsx`. Legacy detail events
(`discovery_quiz_start`, `discovery_quiz_complete`,
`discovery_recommendations_viewed`, `recommendation_started`,
`recommendation_saved`, `discovery_shared`) remain for granular analysis.

## Decision rule

Measure for 7 days. If `discovery_started → hobby_committed` conversion is
strong, keep the quiz as primary and consider retiring the hidden surfaces. If
weak, re-surface one alternative and re-measure.

## Status

The 7-day PostHog quiz-funnel evidence has not been supplied in-repo; closure
cannot be marked complete without the operator readout. See
[`STATUS.md`](../../STATUS.md) → Blockers.
