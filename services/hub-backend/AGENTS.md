# Hub Backend agent instructions

Also follow the repository standard in `../../AGENTS.md`.

## Product boundary

This repository owns the shared Cloudflare synchronization and semantic API
layer for the Significant Hobbies personal app family. Domain apps remain
standalone and local-first. Calorie keeps its existing Worker and D1; this
platform can reach it only through the typed connector in `src/calorie.ts`.

## Commands

```bash
npm ci
npm run types
npm run typecheck
npm test
swift test --package-path ../..
npm run check
```

Never deploy, create or migrate a remote D1 database, activate production
authentication, or retire CloudKit without explicit operator approval. Local D1
migrations and tests are safe.
