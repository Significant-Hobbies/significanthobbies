# Product

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
