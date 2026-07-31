## Why

The private daily journal is described as the bridge between daily practice and
the user's longer-lived plans, but an entry currently records only a date and
writing. Giving an entry one optional, owned Living context makes that product
thesis true without turning reflection into proof, scoring, or public activity.

## What Changes

- Let a signed-in user optionally relate a journal entry to one of their own
  timelines or commitments.
- Persist at most one related context per entry and clear the reference safely
  if the target is deleted.
- Show the selected context while writing and while reading recent entries,
  with a route back to the related private surface.
- Validate target ownership on the server and leave the journal structurally
  private.
- Do not create commitment stamps, habit logs, scores, streaks, notifications,
  or social activity from a journal link.

## Capabilities

### New Capabilities

- `journal-context`: Optional, private links from a daily journal entry to one
  owned timeline or commitment, including selection, persistence, display, and
  ownership rules.

### Modified Capabilities

None.

## Impact

- Drizzle journal schema and a generated SQLite migration.
- Daily journal read/save actions and their ownership validation.
- Signed-in `/daily` data loading and journal writer/history presentation.
- Preview data types remain compatible but do not offer link selection.
- Current product, data-model, and architectural-decision documentation.
- No new dependency, production migration, deployment, or public-data surface.
