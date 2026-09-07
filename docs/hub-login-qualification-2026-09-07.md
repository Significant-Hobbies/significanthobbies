# Private Hub login qualification — 2026-09-07

The source repair keeps the private Hub on Live's authenticated origin, while the Hub repository still owns its renderer and data. This is local qualification only. [Issue #154](https://github.com/Significant-Hobbies/significanthobbies/issues/154) retains deployment and hosted sign-in verification.

## Verified behavior

- Apex `/hub` redirects to the fixed `https://live.significanthobbies.com/hub` entry. Live delegates exactly that page through its existing Hub binding.
- Guests and expired/revoked sessions reach `/login?callbackUrl=%2Fhub`. Existing `returnTo=/hub` links retain that one destination. Sign-in errors keep retry and a public directory exit visible.
- Actual Live `better-auth` test-provider sign-up issued host-only session cookies. The existing session endpoint verified them before Hub rendering. Native bearer verification used the same issued token and identity for synthetic Setline writes.
- Two independent browser accounts created one and two Setline records through the existing sync mutation API. Each Hub showed its own count; revisiting the first account after the second wrote still showed one record.
- Expiring the second account's real local `auth_session.expiresAt` while retaining its browser cookie returned to one sign-in prompt. Actual sign-out revoked the first account and produced the same destination-preserving prompt.
- An unavailable auth connector returned HTTP 502 without a redirect. Unit tests also cover missing bindings, transport errors, invalid identity payloads, fixed host/path allowlists and no-store responses.
- Private successes, redirects and errors cannot opt into shared CDN caching. The two obsolete `06` product badges now derive from the five-item product array.

## Evidence and method

[Machine receipt](evidence/hub-login-2026-09-07/receipt.json), [guest login](evidence/hub-login-2026-09-07/guest-login.png), [first account Hub](evidence/hub-login-2026-09-07/alpha-hub.png), [second account Hub](evidence/hub-login-2026-09-07/beta-hub.png), and [cancelled login](evidence/hub-login-2026-09-07/cancelled-login.png) contain synthetic data only. The login, cancellation and Hub screenshots were visually inspected. No session token, cookie value or password is retained in these receipts.

An isolated Live checkout used the existing local-only D1 migrations and `ENABLE_TEST_AUTH=1` with Next development mode. Hub used a second ephemeral local D1 instance and its real Worker handler. A local TLS adapter ran the actual Live edge-routing helpers and Hub handler, forwarding auth/session requests to the actual Live Next routes. Chrome resolved the two production hostnames to loopback on port 5280; the adapter added only that local port to redirect destinations. This exercises browser cookie host isolation and actual session verification without contacting production services.

The temporary development server needed webpack for symlinked existing dependencies and `allowedDevOrigins` for its loopback hostname adapter. Its development websocket also needed forwarding for hydration. Those changes were confined to the disposable checkout. Final browser checks asserted the login wrapper reached opacity 1, clicked the real Google button with no local provider configured and observed the retry message. External analytics and shared remote widgets were blocked. No production configuration, identities, provider credentials or databases changed.

## Checks and remaining gates

Hub full `npm run check` passes: generated types, TypeScript, 53 Worker tests and deploy dry-run. `swift test` passes 16 tests. Live `pnpm quality` passes 586 tests plus formatting, lint, types, Astro diagnostics, coverage and repository quality gates. Three added Playwright login tests pass locally and join Live's existing desktop CI suite. Live's optimized `pnpm build` also passes in the isolated checkout with its original Next configuration restored.

The local test provider is not Google OAuth. This does not prove deployed service-binding topology, real provider cancellation, production session retention, owner access policy, or all five native apps' live sync. Calorie is honestly unavailable in the synthetic Hub because that connector was not configured. Review and authorize deployment separately, then record both exact deployed revisions and a real hosted sign-in/return/expiry/isolation journey before calling the private Hub shareable. The public directory remains `https://significanthobbies.com/`; the proposed authenticated entry is `https://live.significanthobbies.com/hub`.

Task audit: Hub issues #147 (shared design foundation) and #154 remain open; no open Hub PRs. Live has no open issues or PRs, with this cross-repository work tracked in Hub #154. No issue was closed on local evidence alone.
