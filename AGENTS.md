# Significant Hobbies Hub agent instructions

## Product boundary

The owner retired the Significant Hobbies Hub product on 2026-10-26 because
the applications were not being used together. Do not build Hub features,
run growth work, or reopen its cross-app qualification study without a new
explicit owner decision.

This repository remains the source for the `PersonalSyncKit` Swift package
and the shared `personal-platform` compatibility service. Anchor, Kith,
Calorie and Setline import the package; Live delegates compatibility routes.
Keep required dependency, security and compatibility maintenance available.
Retirement does not authorize deleting stored records, shutting down shared
authentication/sync, or changing the standalone applications' data authorities.

Live belongs in `Significant-Hobbies/live`. Journal belongs in
`Significant-Hobbies/journal`. Do not reintroduce their product source here.

## Commands

```bash
npm --prefix services/hub-backend ci
npm run check
npm run test:worker
npm run test:swift
```

Never copy secrets between Workers, alter production bindings, migrate D1, or
change native data authorities without explicit operator approval.
