## Why

The public sitemap contains roughly 580 routes, but the live Fleet GEO audit
finds useful Markdown for only 2 of 250 sampled routes. Agents therefore discover
the corpus but cannot reliably read it without HTML/JavaScript, while the
existing `/api/ai` catalog advertises one surface whose Markdown target is
missing.

## What Changes

- Add Markdown content negotiation and `.md` alternates for every public sitemap
  route.
- Derive Markdown from the same canonical source data and route loaders that
  feed human pages, preserving headings, prose, lists, and links without relying
  on streamed React HTML.
- Keep fixed discovery files (`llms.txt`, `llms-full.txt`, `index.md`, and
  `/api/ai`) authoritative and return explicit Markdown errors instead of HTML
  shells for invalid `.md` paths.
- Make `/api/ai` truthful by giving each bounded surface a same-origin Markdown
  target that exists in the sitemap.
- Correct repeated canonical, title, and social-image failures on representative
  public content families without changing their visual design.

## Capabilities

### New Capabilities

- `public-route-markdown`: Every sitemap-listed public document has a useful,
  deterministic Markdown representation through negotiation and a `.md`
  alternate.

### Modified Capabilities

None.

## Impact

- `agent-edge.mjs` and `worker.mjs` gain an async public-document Markdown
  boundary before OpenNext's normal HTML response path.
- Public discovery catalog payloads and generated/static agent files stay
  aligned.
- Route-family metadata for hobbies, journeys, experiences, editorial articles,
  and bucket lists gains self-referencing canonicals and complete social cards.
- No new production dependencies, schema changes, migrations, redesign, or
  deployment are required.
