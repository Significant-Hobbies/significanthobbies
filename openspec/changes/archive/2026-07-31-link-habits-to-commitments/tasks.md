## 1. Data and server boundary

- [x] 1.1 Add the nullable `Habit.commitmentId` relationship, index, and
  generated migration with delete-to-null behavior.
- [x] 1.2 Add a typed commitment-choice helper and focused tests for explicit
  linking, invalid targets, and no automatic default.
- [x] 1.3 Add owned non-abandoned commitment choices plus create/update server
  actions that enforce both habit and commitment ownership.

## 2. Daily experience

- [x] 2.1 Load commitment choices on the authenticated daily page without
  exposing controls in signed-out preview mode.
- [x] 2.2 Add an optional commitment selector to habit creation and an editable
  selector for existing habits in Manage mode.
- [x] 2.3 Show quiet related-plan context on habit cards and state that
  check-ins do not create proof or commitment progress.

## 3. Verification and documentation

- [x] 3.1 Cover link parsing/validation, schema behavior, and daily UI behavior
  with focused tests.
- [x] 3.2 Capture preserve-mode design evidence at 390, 768, and 1440 pixels
  with independent critique and audit.
- [x] 3.3 Update product/data/decision docs and project status without recording
  operational work outside GitHub Issues.
- [x] 3.4 Run focused tests, full tests, lint, typecheck, docs checks, production
  build, migration simulation, and strict OpenSpec validation.
