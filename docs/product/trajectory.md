---
title: Trajectory — monthly life-review against your own ideals
description: A private monthly life-review across four buckets (Health, Finance, Knowledge, Relationships). Users author free-form ideals per bucket and reflect monthly against them. No score. Eras make goalpost-moving visible.
---

# Trajectory — monthly life-review against your own ideals

> **Status:** proposed (2026-07-19). Not yet built. This doc is the design
> artifact; schema and routes do not exist yet. See
> [`STATUS.md`](../../STATUS.md) → Unresolved questions.

## The thesis

People keep moving the goalposts on themselves and then feeling behind. The
finish line drifts silently in their head, so no amount of progress ever
registers as progress. Trajectory externalizes the finish line as a committed
artifact, then shows the gap between where you are and where you said you
wanted to be. The gap *is* the score; the app never computes one.

This is the same "zoom out" muscle as the
[mortality frame](overview.md#two-dimensions) (life grid, manifesto) and the
[daily ritual](overview.md), at a third cadence:

- **Daily ritual** — micro: AM/PM prompts, habits, journal.
- **Trajectory** — monthly: reflection against your ideals.
- **Mortality frame** — macro: life grid, finite-life reminder.

Three scales, one thesis: progress is personal, and visible progress is the
antidote to hedonic drift.

## What it is not

- **Not a score.** No 1-10, no computed rating, no app opinion of the user's
  life. The user reads their own trajectory against their own ideal. This
  deliberately diverges from typical "life score" apps and from the
  no-scoring principle in
  [`architecture/decisions.md`](../architecture/decisions.md) A4 — that
  decision was about *daily practice*; Trajectory extends the same instinct
  to monthly review.
- **Not public.** Private-only. No visibility field, no public API, no
  sharing. Finance especially. This matches the daily ritual's privacy
  stance in [`overview.md`](overview.md).
- **Not a habit tracker.** No streaks on Trajectory itself. The "holding
  ground" framing reuses the streaks *language* from commitments but does
  not import the streaks *mechanism*.

## Mechanism

### Buckets

Four fixed buckets, part of the product's point of view:

1. **Health**
2. **Finance**
3. **Knowledge**
4. **Relationships**

Fixed for v1. Adding/renaming buckets is an open question, not a v1 feature.

### Ideals

Each bucket has a free-form ideal the user authors (1-3 sentences). Examples:

- *Finance:* "12 months of runway, no high-interest debt, investing 20% of
  income."
- *Health:* "Work out 3x/week, 7h sleep avg, feel energetic most days."
- *Knowledge:* "Read 2 books/month, going deep in one domain."
- *Relationships:* "3 people I'd call in a crisis, weekly meaningful contact
  with family."

The ideal is stable until the user explicitly changes it (see Eras).

### Monthly input

Once a month, per bucket, the user writes:

- A short free-form reflection ("this month I…").
- Optional numeric inputs where the ideal has numbers (runway months,
  workout count, sleep avg, books read). Numbers are user-supplied; the app
  does not derive or judge them.

No score. No rating. The reflection + the numbers (if any) are the monthly
record. The system displays:

- The ideal as a reference line (for numeric ideals) or as anchored text
  (for descriptive ideals).
- The stack of monthly reflections, readable as a history per bucket.
- A trajectory chart for any numeric inputs, plotted against the ideal line.

The gap between current and ideal is what the user reads. That is the whole
point.

## Eras

Changing an ideal opens a new era. The old target line stays visible on the
graph; the new one appears alongside. A cliff at an era boundary is
annotated "new goalpost set," not hidden — this is the thesis drawn
literally.

On closing an era, the user answers one question:

> *Did you reach this ideal?*

- **Yes** → era marked **completed** (celebrated).
- **No** → era marked **abandoned** (visible, not celebrated).

The user is the one who knows whether they genuinely got there. The act of
declaring it is itself the self-awareness moment the feature exists to
create. The system does not auto-judge completion from a threshold.

**Era list gets as much screen real estate as the chart.** The chart shows
trajectory; the era list shows whether the user keeps moving the goalpost on
themselves. A run of abandoned eras is the most important signal the
feature produces, and it must be legible, not buried.

## Graph framing

- **Within an era:** trajectory/trend is the headline, raw numbers
  secondary. Flat lines framed as "holding ground" (reuses the streaks
  *language* from commitments, not the mechanism).
- **Don't draw a line until 3 data points exist within an era.** One or two
  dots read as noise or grimness; three is the minimum for a trend.
- **Skipped months are missing.** No interpolation. A gap is a gap.
- **Across eras:** era count + completion rate is the headline, not
  absolute numbers. Growth shows up as completed arcs, not an endless
  climb.

## Surface

- **Standalone `/trajectory` page** (private): organized *by bucket*, not
  as a global chart + separate era list. Each of the 4 buckets gets its
  own section: current ideal (editable), trajectory chart (numeric ideals
  only), and that bucket's era history inline. See "Era list density"
  below for the layout.
- **Month-end prompt in the daily ritual** nudges the user to fill in their
  monthly reflection. One private system, two cadences — same pattern as
  the journal being the bridge between daily practice and life aspirations.

## Resolved design choices (2026-07-19)

1. **Skipped months:** missing, no interpolation. A skipped month does not
   reset any "holding ground" framing — it is just a gap on the chart.
2. **Bucket mutability:** fixed 4 for v1. Adding custom buckets will be
   considered based on adoption, not designed upfront.
3. **Numeric input shape:** free-form. Users type whatever numbers map to
   their ideal; no fixed per-bucket schema. Faster to build, matches the
   free-form ideal philosophy.
4. **Month-end prompt timing:** the prompt is active on the last day of the
   month *and* the first day of the next month — a 2-day window so users
   who miss the last day still get a clean nudge on the first.
5. **Era list density:** per-bucket era lists, all visible inline — no
   "view all" affordance in v1. Within a bucket's section: active era
   expanded (full ideal text, current reflection, chart against this
   era's target line); completed and abandoned eras as one-line summaries
   (`Finance · Mar–Aug 2026 · ✓ reached` / `· ✗ abandoned`), clickable
   to expand. Abandoned eras get the same visual weight as completed —
   not hidden, not red — to avoid reintroducing the gamification the
   product rejects. Revisit only if a single bucket accumulates 10+ eras
   and the page gets unwieldy; that pattern is itself a signal worth
   surfacing, not hiding.

## Open questions

None. Design is complete and ready for a build plan.

## Status

Built 2026-07-19 (local dev). Design complete; all five open questions
resolved. Build plan executed: schema in `src/db/schema.ts`, pure module
`src/lib/trajectory.ts` (35 unit tests, coverage above thresholds), server
actions `src/lib/actions/trajectory.ts`, `/trajectory` route + components,
daily ritual month-end nudge, nav link, e2e spec. Not yet deployed —
production deploy is operator-owned. See
[`trajectory-build-plan.md`](trajectory-build-plan.md) for the full build
plan and [`STATUS.md`](../../STATUS.md) → Unresolved questions.
