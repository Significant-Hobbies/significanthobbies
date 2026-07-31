## Context

Habits are private, low-pressure check-ins. Commitments are stronger promises
whose progress is evidenced by explicit proof stamps. Both live in the same
product loop, but they intentionally have different evidence standards.

The link therefore belongs on the habit as optional planning context. It must be
chosen by the owner, validated on every write, and remain independent from both
`HabitLog` and `Stamp`.

## Goals / Non-Goals

**Goals:**

- Let the owner choose, change, or clear one commitment per habit.
- Limit choices to the owner's commitments that have not been abandoned.
- Keep the related plan visible without making the daily card denser or louder.
- Preserve the habit and its history if the related commitment is deleted.
- Make the no-automatic-progress boundary explicit in code, tests, and copy.

**Non-Goals:**

- Matching habits and commitments by name.
- Creating stamps or proof from habit check-ins.
- Changing commitment streaks, status, visibility, or profile publication.
- Supporting multiple commitments per habit.
- Exposing linking controls in signed-out preview mode.
- Applying a production migration or deploying.

## Decisions

### Store one nullable commitment foreign key on Habit

`Habit.commitmentId` references `Commitment.id` with `ON DELETE SET NULL`.
This directly represents the product relationship, keeps reads inexpensive,
and preserves habits and logs when a commitment is deleted. A join table would
add lifecycle complexity for a one-to-zero-or-one relationship.

### Validate ownership and eligibility on every write

The server resolves a requested commitment only when it belongs to the current
user and its status is not `abandoned`. Habit updates also match both habit ID
and owner ID. An invalid requested ID is rejected rather than silently linked.

The client receives only owned, eligible choices. Client filtering alone is not
an authorization boundary.

### Keep check-ins and commitment evidence separate

`toggleHabitLog` remains unchanged and touches only `HabitLog`. Linking or
checking a habit does not call commitment or stamp actions. Tests cover the
pure validation boundary and the schema relationship; product copy tells the
owner that the link is context, not proof or progress.

### Make linking explicit in the existing habit manager

The creation form gains an optional commitment selector. Existing habits show
the same selector only while Manage mode is open, and the card shows a quiet
link to Commitments when a relationship exists.

There is no inferred default, including when habit and commitment names match.
The signed-out preview retains sample check-ins and exposes no management
controls.

## Risks / Trade-offs

- **A forged commitment ID crosses accounts** → Every create/update verifies
  both commitment ownership and non-abandoned status on the server.
- **A deleted commitment strands a habit** → The nullable foreign key uses
  `ON DELETE SET NULL`; a migration test exercises the behavior.
- **Users mistake a check-in for proof** → UI copy and focused tests preserve
  the no-stamp/no-progress contract.
- **Card density increases on mobile** → Use one muted context line and place
  editing controls inside the existing Manage mode, then review at 390, 768,
  and 1440 pixels.
