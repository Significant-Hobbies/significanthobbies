## Context

Significant Hobbies is a Next.js App Router application with better-auth, Drizzle/Turso, Tailwind, and existing guest-first timeline behavior. Bucket Lists need to work before sign-in, persist after sign-in, render safely on public routes, and export entirely in the browser without adding storage or image-processing infrastructure. Life Bingo is a creation preset and presentation mode for the same underlying list.

The feature should feel lighter and more immediate than the timeline builder. Its core object is a list of desired experiences that can be seen as a practical list or a visual Bingo board.

## Goals / Non-Goals

**Goals:**

- Let a first-time visitor create a meaningful bucket list in under one minute.
- Make the Bingo view visually strong enough to share before or after completion.
- Support guest use, authenticated persistence, public viewing, remixing, and PNG export.
- Reuse the existing auth, database, analytics, and `html-to-image` stack.
- Keep all server mutations authenticated, owner-scoped, and Zod-validated.

**Non-Goals:**

- Photo uploads or a new object-storage service.
- Multiplayer editing, comments, reactions, leaderboards, streaks, or notifications.
- AI API calls for generation; suggestions remain deterministic and curated.
- Arbitrary visual design tooling or freeform canvas editing.

## Decisions

### Store the bucket list as a first-class row with JSON items

Add a `BucketList` table with indexed ownership and slug fields plus JSON text for items. Each item can be placed in the Bingo grid but remains the same item in list view. This matches the repository's existing JSON-in-SQLite approach while allowing visibility and ownership queries without parsing content.

Alternative considered: separate `BucketList` and `BingoBoard` tables. That would make users decide which product object they are creating and duplicate completion, visibility, export, and sharing behavior.

### Use curated deterministic generation

`src/lib/life-bingo.ts` will own campaign prompts, board presets, seeded selection, and bingo detection while shared bucket-list types live in `src/lib/bucket-list.ts`. Generation balances low-, medium-, and high-effort experiences and prevents duplicate text. The center of a 5×5 Bingo layout is the fixed “Something unexpected” item.

Alternative considered: generate content through an LLM. That adds latency, cost, moderation risk, and inconsistent copy to the most important first-run interaction.

### Use localStorage as the guest source of truth

The client stores a versioned guest list draft. After authentication, the user returns to the workspace, which offers to save the same draft to their account. Server rows remain the source of truth once a list has been saved.

Alternative considered: encode the full board in the URL. Twenty-five editable reflections can exceed practical URL lengths and expose private notes.

### Separate creation, ownership, and public viewing

- `/bucket-list` is the owner workspace and canonical navigation destination.
- `/bucket-list/[id]` edits a persisted list in List or Bingo view.
- `/life-bingo` explains and creates the board-shaped guest preset.
- `/b/[slug]` is a read-only public or unlisted Bingo artifact with a remix action.

The public route receives sanitized parsed data and never exposes private lists or ownership controls.

### Treat sharing as an artifact, not a generic link

The Bingo surface has a fixed visual composition and an export mode that hides controls. `html-to-image` generates a story-friendly PNG. Public viewers can remix the items into a new local guest list.

### Keep Side Quests as a source, not a duplicate destination

Side Quests remain curated micro-adventure definitions and keep their existing completion system. “Add to Bucket List” copies the quest label and source id into a bucket-list item. This creates a useful bridge without merging the two concepts or duplicating a Side Quest record.

### Use a restrained field-journal visual system

The feature uses warm paper, deep ink, emerald, clay, marigold, sky, and moss. Square colors communicate variety, while small typographic labels, subtle paper grain, imperfect completion stamps, and asymmetric editorial accents prevent the grid from looking like generic shadcn cards. Motion is limited to square completion, bingo-line celebration, and gentle entry transitions.

### Preserve safe sign-in return paths

The login form will accept a validated relative callback path. Guest drafts remain in localStorage across OAuth navigation, allowing the builder to recover them after sign-in.

## Risks / Trade-offs

- [Large JSON updates on every saved edit] → Debounce authenticated saves and keep board payload limits strict.
- [Guest drafts can be cleared by the browser] → Explain that sign-in is required for durable cross-device persistence.
- [Curated suggestions can feel generic] → Use intention, boldness, horizon, and lightweight remix controls to personalize selection.
- [Public reflections can expose sensitive text] → Default every saved board to private and make visibility changes explicit.
- [PNG export can vary across browsers] → Keep the export surface self-contained, avoid remote images, and cover modern Chromium in Playwright.

## Migration Plan

1. Generate and review a Drizzle migration that creates `BucketList` and its indexes.
2. Deploy application code and schema together through the existing manual production process.
3. The change is additive; rollback removes routes and actions while leaving the unused table harmlessly in place.

## Open Questions

None blocking. Photo memories, collaborative boards, and reminder delivery remain explicit follow-up candidates after usage data shows repeat engagement.
