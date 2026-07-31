## 1. Data model

- [x] 1.1 Add nullable timeline and commitment references, indexes, and a single-context check to `JournalEntry`.
- [x] 1.2 Generate and inspect the additive SQLite migration without applying it to production.

## 2. Server behavior

- [x] 2.1 Add typed journal-context choices and ownership validation to the daily actions.
- [x] 2.2 Return context ids with journal reads and persist or clear exactly one context during the journal upsert.
- [x] 2.3 Add focused tests for context parsing, single-context persistence inputs, and rejected invalid targets.

## 3. Daily journal experience

- [x] 3.1 Load lightweight owned timeline and non-abandoned commitment choices on the authenticated `/daily` route.
- [x] 3.2 Add an optional context selector to today's journal writer without changing the signed-out preview.
- [x] 3.3 Show a saved human-readable context link for today's entry and selected recent entries.

## 4. Verification and product truth

- [x] 4.1 Run targeted tests, typecheck, lint, production build, docs check, and strict OpenSpec validation.
- [x] 4.2 Complete the preserve-mode design review with 390, 768, and 1440 pixel browser evidence.
- [x] 4.3 Update current product, data-model, and architecture documentation with the shipped private-link behavior.
- [x] 4.4 Archive the completed OpenSpec change and update `PROJECT_STATUS.md`.
