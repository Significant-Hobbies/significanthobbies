# Security Audit — significanthobbies
**Date**: 2026-03-28 | **Status**: Paused

## Secrets in Git History
Clean. No `.env`, `.pem`, `.key`, or service-account files found in git history.
`.gitignore` correctly excludes `.env`, `.env.local`, `.env.*.local`, `.env.vercel.tmp`.

## Credentials on Disk
**HIGH RISK**: `.env.local` contains live production secrets on disk:
- Turso DB URL + auth token (JWT)
- Better Auth secret
- Google OAuth client ID + secret (`GOCSPX-...`)
- SaaSMaker API key (`pk_0d4e...`)

Historical `.env.vercel.tmp` references are stale; active deploy is Cloudflare Workers.
`.env` has only placeholder/dev values -- low risk.

## Deployment
Deployed on Cloudflare Workers via `@opennextjs/cloudflare` and Wrangler.
No wide-open CORS patterns in source code. CORS errors in browser logs are from external SaaSMaker API.

## Code Security
- `dangerouslySetInnerHTML` used in 5 files -- mostly for JSON-LD structured data (safe) and static content. The usage in `hobbies-for-resume/page.tsx` and `side-quests-client.tsx` should be reviewed if data source changes from static to user-generated.
- API keys loaded via `process.env` -- no hardcoded secrets in source.

## Action Items
- [ ] Keep local env files uncommitted; do not inspect or copy secrets during routine agent work.
- [ ] Rotate Turso auth token, Better Auth secret, and Google OAuth secret if local disk exposure is considered risky.
- [ ] Audit `dangerouslySetInnerHTML` in `hobbies-for-resume/page.tsx` if data becomes user-sourced
