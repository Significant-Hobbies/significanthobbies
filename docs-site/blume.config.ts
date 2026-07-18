import { defineConfig } from 'blume';

// Blume is the PRESENTATION layer only. The committed Markdown under ../docs/
// is the source of truth. Do not add Blume-specific frontmatter that the docs
// depend on to make sense — plain Markdown must read correctly on its own.
// See ../docs/maintenance.md.
export default defineConfig({
  title: 'significanthobbies',
  description:
    'A life planner with two dimensions (Daily + Living). Product, architecture, development, operations, and durable learnings for the significanthobbies Cloudflare Workers app.',

  content: {
    // Markdown source of truth — one level up so the docs tree stays at the
    // repo root alongside AGENTS.md / STATUS.md / README.md.
    root: '../docs',
    // Exclude non-markdown assets from being treated as pages (Blume already
    // defaults to **/*.{md,mdx}; this is explicit).
    include: ['**/*.md', '**/*.mdx'],
  },

  search: {
    // Local, no hosted service. Archive snapshots are searchable too so
    // historical context is reachable, but each archive page carries a banner
    // pointing to its current successor.
    provider: 'orama',
  },

  ai: {
    // Emit llms.txt so the docs site is agent-indexable.
    llmsTxt: true,
  },

  seo: {
    sitemap: true,
    robots: true,
  },

  deployment: {
    output: 'static',
    // Update this to the real docs domain when publishing. Left configurable
    // so the repo is not coupled to a specific host.
    site: 'https://docs.significanthobbies.com',
  },
});
