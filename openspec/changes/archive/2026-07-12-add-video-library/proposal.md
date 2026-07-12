## Why

Significant Hobbies expects to publish a large YouTube catalog in a search category crowded with generic listicles and high-authority publishers. Videos need to become first-class, indexable hobby content that earns search traffic and moves viewers into a useful next action, rather than isolated embeds that slow pages down and send all discovery value to YouTube.

## What Changes

- Add a version-controlled video catalog with one canonical topic, hobby relationship, search intent, thumbnail, chapters, transcript, and publishing metadata per video.
- Add a dedicated, indexable watch page for every Significant Hobbies video where the video is the primary content.
- Add a video library and connect each video to its hobby page, relevant Side Quests, related articles, and a Bucket List action.
- Add unique metadata, `VideoObject` structured data, stable thumbnails, canonical URLs, and a dedicated video sitemap.
- Render YouTube through a lightweight, accessible facade so video pages remain fast without hiding the player from rendered HTML or requiring interaction for discovery.
- Add editorial quality gates that prevent thin transcript pages, duplicate-intent pages, and mass-produced keyword variants.
- Add analytics for video starts, meaningful watch interactions, chapter use, and transitions into hobby or Bucket List actions.
- Establish a repeatable YouTube-to-site publishing template so titles, descriptions, chapters, transcripts, thumbnails, and internal links stay consistent across both surfaces.
- Add agent-readable discovery through `llms.txt`, machine-friendly content negotiation, and explicit entity relationships while preserving the site's declared content-use policy.

## Capabilities

### New Capabilities

- `video-content-publishing`: A validated editorial content model and repeatable publishing workflow for YouTube videos, transcripts, chapters, thumbnails, and hobby relationships.
- `video-search-discovery`: Dedicated watch pages, video library discovery, structured data, video sitemap coverage, internal linking, performance, and conversion actions.
- `agent-content-discovery`: Agent-readable route indexes and Markdown representations of public editorial content with canonical provenance and content-use signals.

### Modified Capabilities

None.

## Impact

- New public routes under `src/app/videos/` and a video-specific sitemap route.
- New version-controlled content and validation utilities under `src/lib/` or `src/content/`.
- New reusable video player, transcript, chapter, and related-content components.
- Hobby detail pages and the primary sitemap gain video relationships and discovery links.
- Search and product analytics gain a small set of video-specific events.
- Public editorial routes gain Markdown content negotiation and `llms.txt` indexes; private and authenticated routes remain excluded.
- No database migration, new runtime dependency, CMS, video hosting system, or automated transcript generation in the first release.
