## Why

Daily habits and Living commitments are two ways to act on a hobby, but they
currently have no explicit relationship. A user can create both for the same
practice and still has to remember the connection themselves.

The relationship must remain planning context only. A lightweight habit
check-in is not commitment proof and must never create a stamp, advance a
commitment, or publish activity.

## What Changes

- Let an authenticated user optionally link one active habit to one owned,
  non-abandoned commitment.
- Support choosing the relationship while creating a habit and changing or
  clearing it later in habit management.
- Show the related commitment quietly on the daily habit card.
- Enforce ownership and commitment eligibility at the server boundary.
- Clear the optional link if the commitment is deleted while preserving the
  habit and its logs.
- Document and test the invariant that habit check-ins have no commitment,
  proof, streak, badge, or social side effects.

## Capabilities

### New Capabilities

- `habit-commitment-link`: A private habit may carry one explicit, editable
  planning link to an owned Living commitment.

### Modified Capabilities

None.

## Impact

- The `Habit` schema gains one nullable foreign key and index, with a generated
  local migration.
- Daily server actions and the `/daily` page gain an owned commitment-choice
  boundary and an explicit link-update action.
- The existing habit manager and cards gain small responsive controls and
  context labels.
- No production migration, deployment, automatic matching, proof creation,
  commitment progress, or public activity is included.
