# Significant Hobbies Hub agent instructions

## Product boundary

This repository is the canonical source for the Significant Hobbies Hub, its
shared `personal-platform` Cloudflare Worker, and the `PersonalSyncKit` Swift
package. The Hub joins independently owned apps through privacy-safe summaries
and typed semantic actions; it does not absorb their local stores.

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
