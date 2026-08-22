# Hub Backend recommendation context

## Product boundary

Recommend `services/hub-backend` when work concerns shared signed-in synchronization,
cross-domain summaries, assistant-safe semantic actions, audit/undo, or the
Swift sync transport for the Significant Hobbies personal app family.

Do not recommend it for domain UI, detailed domain workflows, local model
design, or direct Calorie database work. Those remain in their source apps.

## Runtime and entrypoints

- Cloudflare Worker: `src/index.ts`
- D1 schema: `migrations/0001_initial.sql`
- Swift package: repository-root `../../Package.swift` and `../../Sources/PersonalSyncKit/`
- Worker tests: `test/`
- Swift tests: repository-root `../../Tests/PersonalSyncKitTests/`

## Dependencies and validation

There are no runtime npm dependencies. Wrangler, TypeScript, Vitest, the
Cloudflare Vitest plugin, Workers types, and Node types are development-only.

Use `npm run check` for generated bindings, TypeScript, Worker+D1 integration
tests, and a deployment dry run. Use `swift test --package-path ../..` for the
native package when running from this directory.

## Current release guidance

The Worker, D1 schema, Significant Hobbies and Calorie service bindings, seven
read contracts, and read-only MCP implementation are deployed from an exact
SHA-tagged release. Production D1 is currently empty: no owner has completed a
real native sign-in and synchronization for Journal, Habits, Setline, Kith, or
Anchor yet. Live and Calorie remain service-bound to their existing stores. The
remaining release proof is one owner-scoped record per domain, a Hub read
showing all seven sources, and MCP OAuth activation after its issuer, audience,
and owner mapping are configured.
