---
name: Significant Hobbies
description: A life atlas for choosing, living, and remembering what matters.
colors:
  paper: "oklch(0.985 0.012 88)"
  ink: "oklch(0.20 0.025 72)"
  atlas-gold: "oklch(0.82 0.13 88)"
  lived-sage: "oklch(0.72 0.13 150)"
  quiet-ink: "oklch(0.46 0.018 72)"
  contour: "oklch(0.86 0.025 82)"
typography:
  display:
    fontFamily: "var(--font-serif), Georgia, serif"
    fontWeight: 500
    letterSpacing: "-0.02em"
  body:
    fontFamily: "var(--font-sans), system-ui, sans-serif"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  control: "12px"
  surface: "16px"
spacing:
  tight: "8px"
  group: "16px"
  section: "48px"
components:
  button-primary:
    backgroundColor: "{colors.atlas-gold}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
---

# Design System: Significant Hobbies

## Overview

**Creative North Star: “The Life Atlas”**

The interface is a map of a finite, inhabited life. Live uses paths, horizons, clusters, and wayfinding to turn possibility into a next move. History uses the same atlas language as chronology: week fields, dated markers, bends in direction, and remembered evidence. Journal and Habits are focused close-up scales of the same world.

The system is warm light mode by default: sunlit, colorful, energetic, and action-led. Live should make leaving the screen feel tempting. Journal is a calm ritual expressed through morning yellow or evening lavender and a substantial white writing surface. Habits uses lived sage and deliberately spare check-in rows. History is a personal almanac: yellow mortality, blue direction, and coral, lavender, or paper story passages. Gold indicates chosen direction; sage indicates lived evidence and learning. Content should feel placed in a landscape, not packed into a grid of interchangeable cards.

## Colors

Warm paper and dark olive ink make the whole product feel usable in daylight. Live More uses a restrained field palette—sun yellow, open-sky blue, coral, fresh green, and lilac—to distinguish kinds of possibility and create emotional lift. These colors belong to large, flat regions rather than decorative gradients. Atlas gold is reserved for direction; lived sage marks evidence, feedback, and completed experience.

Photography is candid, tactile evidence of ordinary adults living: hands making things, friends outdoors, accessible local adventures, natural daylight, real texture, and imperfect motion. Avoid generic stock smiles, luxury travel, staged influencer imagery, and motivational text embedded in images.

## Typography

Display serif gives reflective statements and life chapters gravity. The sans-serif workhorse carries controls, labels, and dense reading. Large type creates landmarks; small uppercase labels are used only for true map notation, not as a universal eyebrow.

## Layout

Primary pages use one dominant spatial field followed by quieter supporting passages. Related content connects through paths, timelines, alignment, and proximity before containers. Equal card grids are avoided unless the objects are genuinely equivalent. Desktop compositions can be asymmetric; mobile preserves the same semantic order as a vertical route.

Live leads with a verb and an immediate invitation. It must make the user want to choose an activity, not admire a planning system. Mortality belongs in History and acts as context, never as the dominant emotional register of the action surface.

The global shell exposes four direct destinations: Live, Journal, Habits, and History. Their shared visual language communicates family membership without merging their jobs.

## Elevation & Depth

Depth comes primarily from tonal layers and spatial overlap. Shadows are reserved for selected or floating controls and must have visible offset and soft blur. Wide surfaces do not combine a border with a generic ambient shadow.

## Shapes

Controls use 12px corners and major bounded surfaces use 16px corners. Paths, contour lines, week cells, and circular waypoints provide the characteristic geometry. Pills are reserved for compact status and filter controls.

## Components

### Navigation

The wordmark is `SH` with an accessible full name. Live, Journal, Habits, and History are direct links in that order on desktop and mobile. Yellow, lavender, sage, and blue active states keep the destinations distinct without creating four unrelated brands.

### Cards / Containers

Containers earn their boundary through interaction or meaningful grouping. Prefer open regions, dividers, map paths, and typographic hierarchy over stacks of bordered rounded rectangles.

### Buttons

Primary actions use atlas gold on night. Secondary actions use quiet tonal surfaces. All actions have explicit labels, visible focus, and at least a 44px touch target.

## Do's and Don'ts

### Do:

- **Do** make mortality concrete without using fear, score, or shame.
- **Do** connect possibilities, present action, and remembered evidence spatially.
- **Do** use real personal content as the visual material of private surfaces.
- **Do** make Live feel sunny, playful, physical, and in motion.
- **Do** keep Journal reflective and Habits immediate instead of rebuilding a combined Daily dashboard.

### Don't:

- **Don't** build pages from a grid of equal cards with icon-heading-description anatomy.
- **Don't** use progress metrics where reflection or simple check-in is the product job.
- **Don't** let decorative gradients, glass, or glow substitute for content and structure.
- **Don't** make the whole product feel like a memorial, archive, or solemn productivity system.
