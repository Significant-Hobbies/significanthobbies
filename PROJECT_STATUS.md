# Project Status

Last updated: 2026-06-20

## Current Scope

Significant Hobbies is a hobby timeline and discovery app. It helps users map hobby history across life phases, understand patterns, share public journeys, and discover meaningful next hobbies.

## Done

- The app deploys to Cloudflare Workers through OpenNext for `significanthobbies.com` and `www.significanthobbies.com`.
- Turso/Drizzle, better-auth Google, and PostHog are part of the documented architecture.
- Core routes exist for landing, login, setup, timeline creation/view/edit, public shared timelines, user profiles, hobbies, and an explore surface.
- Dependency hygiene: removed unused `lighthouse` and `shadcn` devDependencies (maintenance-only; no product scope change).
- Timeline builder, insights, PNG/JSON export, public profiles, discovery suggestions, guest mode, and hobby directory concepts are documented.
- Product expansion ideas include a 60-concept hobby taxonomy, recommendations, side quests, XP/badges, SEO pages, comparisons, quizzes, and famous journeys.
- Current audit residuals are documented.

## Planned Next

1. Tighten the timeline creation and sharing loop so a first-time user can produce a meaningful public journey quickly.
2. Decide which discovery path is primary: taxonomy browsing, recommendations, quiz, or famous journey inspiration.
3. Turn side quests, XP, and badges into a coherent progression system only if they improve hobby follow-through.
4. Review any raw HTML rendering paths before making them user-sourced.

## Deferred / Parked

- Broad social-network features are deferred behind strong personal timeline and discovery value.
- Paid coaching, marketplace, and creator monetization are parked.
- Large content/SEO expansion is deferred until the core hobby journey loop is sharper.
