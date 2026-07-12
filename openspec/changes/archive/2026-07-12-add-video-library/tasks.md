## 1. Content model and validation

- [x] 1.1 Add the typed published-video catalog, validation helpers, relation lookups, and cross-channel metadata output
- [x] 1.2 Add unit tests for required fields, unique slugs and intents, chapter ordering, draft isolation, and entity lookup

## 2. Video discovery surfaces

- [x] 2.1 Build the video library and dedicated watch route with canonical metadata and draft-safe not-found behavior
- [x] 2.2 Build accessible video cards, one-player watch presentation, chapters, takeaways, transcript sections, and related actions
- [x] 2.3 Add matching `VideoObject`/`Clip` structured data, stable Open Graph presentation, and video analytics hooks
- [x] 2.4 Add standard sitemap and dedicated video sitemap coverage from the shared catalog
- [x] 2.5 Add related-video discovery to hobby pages and canonicalize the relevant hobby and blog routes

## 3. Agent-readable discovery

- [x] 3.1 Add concise and expanded LLM indexes for public knowledge surfaces
- [x] 3.2 Add allowlisted Markdown rendering for core, hobby, blog, Life Bingo, video-library, and watch routes
- [x] 3.3 Add Accept-header negotiation with canonical provenance, caching variation, and content-use signals
- [x] 3.4 Document the audited Cloudflare crawler restrictions as an explicit post-deploy policy decision

## 4. SEO quality and verification

- [x] 4.1 Fix audited heading, canonical, and social-image gaps without creating duplicate page intent
- [x] 4.2 Add route and schema tests for HTML, Markdown, LLM indexes, video metadata, and private-route exclusion
- [x] 4.3 Run unit tests, typecheck, production build, local SEO audits, responsive browser QA, and accessibility checks
- [x] 4.4 Update `PROJECT_STATUS.md`, archive the OpenSpec change, and commit the verified release
