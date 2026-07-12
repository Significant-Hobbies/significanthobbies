## 1. Domain and persistence

- [x] 1.1 Add bucket-list item types, curated Life Bingo generation, progress calculation, and bingo-line detection
- [x] 1.2 Add unit tests for generation balance, uniqueness, free-center placement, progress, and 3×3/5×5 bingo detection
- [x] 1.3 Add the `BucketList` Drizzle schema and generate an additive migration
- [x] 1.4 Add Zod-validated, owner-scoped bucket-list create, update, delete, and visibility server actions

## 2. Guest creation experience

- [x] 2.1 Build the Life Bingo landing page with a real interactive board preview and clear creation entry point
- [x] 2.2 Build the guided horizon, intention, and boldness flow with instant curated generation
- [x] 2.3 Build localStorage draft persistence, recovery, List/Bingo switching, item editing, replacement, and reorder controls
- [x] 2.4 Preserve guest drafts through the existing Google sign-in flow and allow authenticated saving

## 3. Bucket-list experience

- [x] 3.1 Build responsive field-journal List and Bingo surfaces with accessible item states
- [x] 3.2 Build completion and reflection interactions with accurate progress and bingo celebrations
- [x] 3.3 Build the authenticated Bucket List owner route with autosave, visibility controls, and deletion
- [x] 3.4 Build client-side PNG export with a clean story-friendly artifact layout

## 4. Sharing and product connections

- [x] 4.1 Build the public/unlisted `/b/[slug]` route with private-board protection and metadata
- [x] 4.2 Add safe remixing that copies prompts but clears completion state and reflections
- [x] 4.3 Add one Bucket List navigation/dashboard surface and add “Add to Bucket List” intake from Side Quests
- [x] 4.4 Add sitemap and social metadata coverage for the new public entry surface

## 5. Verification and polish

- [x] 5.1 Add Playwright coverage for guest creation, editing, completion, recovery, and remixing
- [x] 5.2 Run unit tests, typecheck, migration validation, and production build; fix all feature-related failures
- [x] 5.3 Run responsive browser QA and an accessibility/visual design pass on landing, builder, owner, and public routes
- [x] 5.4 Update `PROJECT_STATUS.md`, archive the OpenSpec change, and record any intentionally deferred follow-up work
