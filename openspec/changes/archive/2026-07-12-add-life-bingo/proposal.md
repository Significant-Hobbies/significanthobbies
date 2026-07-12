## Why

Significant Hobbies currently asks users to reflect on an existing hobby history before it gives them a reason to return. A Bucket List creates a fast, playful entry point: people can turn a desired life chapter into concrete experiences, complete them over time, and end with a beautiful artifact worth sharing. Life Bingo is the board-shaped creation and sharing mode for that same list, not a separate product object.

## What Changes

- Add a Bucket List workspace with list and Bingo views backed by one shared set of items.
- Add a public Life Bingo landing and board-shaped creation flow that works without an account and creates a bucket list.
- Generate an editable 3×3 or 5×5 experience set from a small set of intentions, with curated suggestions rather than generic productivity goals.
- Let users edit, reshuffle, complete, and reflect on individual squares.
- Persist guest lists locally and authenticated lists in Turso.
- Add owner and public list routes with private, unlisted, and public visibility.
- Export boards as polished share images and make shared boards easy to remix.
- Add one Bucket List entry point to primary navigation and the authenticated dashboard; keep Life Bingo as campaign/share language.
- Let users add curated Side Quests to their bucket list without duplicating Side Quest progress or creating another content type.
- Add responsive, accessible interactions and purpose-built visual styling that feels like a collectible life artifact.

## Capabilities

### New Capabilities

- `bucket-list-management`: Guest-friendly list generation, editing, persistence, and list/Bingo presentation modes.
- `bucket-list-progress`: Item completion, reflection, progress, bingo detection, and Side Quest intake.
- `bingo-presentation-sharing`: Visibility controls, public board viewing, remixing, and image export.

### Modified Capabilities

None.

## Impact

- New routes under `src/app/bucket-list/`, with `src/app/life-bingo/` as the public acquisition entry and `src/app/b/[slug]/` as the concise share route.
- New reusable components under `src/components/bucket-list/`.
- New curated board-generation logic and types under `src/lib/`.
- New validated server actions and a `BucketList` Drizzle table.
- Dashboard and navigation updates.
- Drizzle migration, unit coverage for generation and bingo detection, and Playwright coverage for the guest flow.
- No new runtime dependencies or external storage services.
