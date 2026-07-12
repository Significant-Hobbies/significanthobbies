## Context

Significant Hobbies already has a broad static hobby taxonomy, long-form blog posts, Side Quests, and a sitemap, but YouTube appears only as an iframe content block in one article. The production audit shows solid baseline HTML SEO while also revealing an incorrect or overly broad canonical pattern on some routes, two H1 elements on the homepage, no dedicated video discovery surface, and no Markdown content negotiation. Cloudflare's managed robots policy currently permits search indexing but blocks major model crawlers; application code must not silently override that production policy.

The application is deployed through OpenNext to Cloudflare Workers. The first video release must remain version-controlled, build-time safe, fast, and free of new services or database migrations.

## Goals / Non-Goals

**Goals:**

- Make each published video a complete, indexable content object with one canonical watch page.
- Build an editorial workflow that scales to many videos without allowing incomplete or duplicate entries to publish.
- Connect videos into the existing hobby, Side Quest, blog, and Bucket List graph.
- Provide valid video structured data, key moments, stable thumbnails, and video sitemap discovery.
- Serve concise Markdown representations of public knowledge pages to agents that explicitly request them.
- Fix adjacent audited SEO defects and add automated validation for the new surfaces.

**Non-Goals:**

- Uploading, transcoding, or hosting video files.
- Automatically scraping YouTube, importing captions, or generating transcripts with an AI provider.
- Adding a CMS, database table, runtime dependency, public API platform, MCP server, or agent action surface.
- Creating thin pages for every possible keyword or indexing draft/placeholder videos.
- Changing Cloudflare's managed crawler or content-training policy without explicit production approval.

## Decisions

### Use a validated version-controlled catalog

`src/lib/videos.ts` will define the content contract and published catalog. Every published item requires a stable slug, YouTube id, unique search intent, hobby relationship, upload date, ISO duration, thumbnail, editorial summary, takeaways, chapters, and optional transcript sections. Drafts can live outside the exported published catalog.

Alternative considered: store videos in Turso. A database would make authoring less reviewable, require a migration and admin interface, and still need validation before indexing.

### Treat watch pages as primary video pages

`/videos/[slug]` will render one visible YouTube iframe near the top, unique supporting text, chapters, related entities, and a concrete next action. The iframe remains present in rendered HTML and uses native lazy loading; it is not injected only after a click. This preserves crawlability while limiting unnecessary work below the fold.

Alternative considered: keep videos embedded only in blog posts. Google treats complementary embeds differently from dedicated watch pages, and the page intent becomes ambiguous.

### Generate video metadata from the same catalog

The page metadata, `VideoObject` JSON-LD, `Clip` key moments, Open Graph image, standard sitemap entry, and video sitemap entry all read from one normalized record. This prevents title, thumbnail, duration, and URL drift across discovery systems.

### Build a graph, not a new product silo

Videos relate to existing hobby slugs and may reference a Side Quest or article. Hobby pages show related published videos. Watch pages lead into the hobby guide and a prefilled Bucket List action. The video library is a discovery index, not another top-level personal object.

### Add agent-readable representations through negotiation and indexes

`/llms.txt` and `/llms-full.txt` expose a concise public index. Existing request middleware will rewrite supported public requests carrying `Accept: text/markdown` to an internal route that returns curated Markdown with canonical URL, summary, headings, and links. HTML remains the default, authenticated/private paths are never converted, and responses declare `Vary: Accept` plus the site's content-use policy.

Alternative considered: rely only on `llms.txt`. It helps discovery but still makes agents parse presentation-heavy HTML. Cloudflare's zone-level Markdown converter is preferable when available, but enabling it requires a Pro or Business plan and a production setting change outside this code release.

### Keep AI visibility grounded in normal search quality

Answer-first visible text, authorship/provenance, citations where appropriate, consistent JSON-LD, canonical URLs, and internal links are the core AI-search work. No invented “AI schema” will be added; Google states that AI search features use existing SEO requirements.

### Keep crawler policy explicit

The release will report the current managed robots restrictions and document the exact post-deploy decision. It will not claim that GPTBot or ClaudeBot can crawl while Cloudflare blocks them, and it will not change training permissions as a side effect of enabling search discovery.

## Risks / Trade-offs

- [The initial catalog may contain no owned videos] → Keep draft entries non-indexable and make the publishing contract ready for the first real YouTube id; never ship a fake video.
- [Transcripts can create thin or duplicate pages] → Require an original editorial summary and takeaways; transcripts support the watch page rather than being the only content.
- [Many embeds can hurt Core Web Vitals] → Render one iframe on a watch page, use native lazy loading elsewhere, and use thumbnails instead of players on indexes.
- [Middleware negotiation can affect browser caching] → Match only safe public GET routes, require an explicit Markdown Accept header, and send `Vary: Accept`.
- [Machine-readable pages can expose private content] → Maintain an allowlist of public route families and never query user/private data in the Markdown renderer.
- [Crawler access remains blocked after code ships] → Record the Cloudflare zone policy as an explicit release follow-up requiring owner approval.

## Migration Plan

1. Ship the content model, routes, metadata, tests, and agent-readable surfaces with only verified published video records.
2. Validate representative pages with the local SEO audit, schema assertions, accessibility checks, and a production build.
3. Deploy through the existing manual process; no schema migration is required.
4. After deployment, decide whether to allow search/retrieval crawlers in Cloudflare AI Crawl Control and whether the zone plan supports Markdown for Agents.
5. Roll back by removing the video and agent routes; existing hobby, blog, and user data remain unchanged.

## Open Questions

- The channel's first owned YouTube video ids, final thumbnails, upload dates, and transcripts are not yet present in the repository.
- Cloudflare crawler access and Markdown for Agents remain production-policy decisions requiring explicit approval.
