## Why

Trajectory currently records four independent ideals and monthly reflections, but it does not help a person turn a chosen direction into repeatable decisions. A single living contract—grounded in constraints and intent, then made adaptive through a decision policy and feedback loop—gives the feature a sharper focusing job.

## What Changes

- Replace the primary `/trajectory` experience with one private active trajectory contract at a time.
- Capture four concise parts: constraints, intent, decision policy, and feedback loop, plus a user-selected weekly or monthly review cadence.
- Let users review the active contract by recording an observed signal and choosing to continue, adjust, complete, or release it.
- Version adjusted contracts and show a private history of prior versions and review decisions.
- Preserve existing bucket-era and monthly-reflection data without reinterpreting or deleting it; the legacy data model remains intact but is no longer the primary UI.
- Keep the experience unscored, private, and free of automatic judgment.

## Capabilities

### New Capabilities

- `trajectory-contract`: Create, review, adjust, and close one active private trajectory contract with version history.

### Modified Capabilities

None.

## Impact

- Adds additive Drizzle tables and a generated local migration; no production migration is run.
- Reworks `/trajectory`, its server actions, preview data, and focused unit tests.
- The existing daily month-end bucket nudge will be removed because the new contract owns its own weekly or monthly review cadence.
- No new production dependency, public API, sharing surface, deployment, or scoring system is introduced.
