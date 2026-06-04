# landing-astro

Static Astro port of the significanthobbies.com `/` route. Deploys to
Cloudflare Pages, intended to take over `/` from the Next.js Workers
deploy once verified.

## Why a separate project?

The landing is fully static: no DB, no auth, no per-user content. The
Next.js Workers deploy reads `getDemoTimelines()` from Turso every
request (psi-swarm flagged TTFB ≈ 2.32s on the SSR path), and ships
the full React + Tailwind v4 + shadcn runtime for the LCP path. The
reference Astro setups in the fleet (`sarthakagrawal/`,
`linkchat/landing-astro/`) land p75 LCP ≈ 360 ms on the same Pages
runtime; this project mirrors that recipe.

## Stack

- Astro 5 — `output: 'static'`, `inlineStylesheets: 'always'`,
  `format: 'file'` (no `/index.html` trailing-slash redirects).
- Tailwind CSS v4 via `@tailwindcss/vite`.
- Lightning CSS — transformer + minifier (fleet web-stack standard,
  see `../../AGENTS.md` → "Fleet web stack standard").
- `@astrojs/sitemap`.
- Cloudflare Pages — see `wrangler.toml`
  (`pages_build_output_dir = "dist"`).

No SSR adapter, no React, no client JS. The landing visuals
(decorative orbs, floating hobby emojis, dark share cards, gold sheen
passes, scroll-triggered reveals) are all pure CSS — the keyframes
copied from `src/app/globals.css` do the work unchanged.

## Commands

```bash
pnpm install
pnpm dev      # astro dev → http://localhost:4321
pnpm build    # static HTML → dist/
pnpm preview  # serve dist/ locally
pnpm deploy   # wrangler pages deploy dist/ to project
              # `significanthobbies-landing`
```

## Structure

```
landing-astro/
  astro.config.mjs          # Mirrors fleet/sarthakagrawal — static
                            # output, inlineStylesheets: 'always',
                            # Lightning CSS, Tailwind v4 plugin.
  wrangler.toml             # CF Pages, pages_build_output_dir = "dist".
  src/
    pages/index.astro       # Composes the 10 landing sections.
    layouts/Layout.astro    # Meta tags, Geist font preload, JSON-LD.
    components/             # Per-section .astro ports.
      Hero.astro            # Headline + orbs + emojis + sample card.
      Archetypes.astro      # 8-up archetype grid.
      ValueProps.astro      # Three-up "Free / Yours / Reflection".
      FeatureCards.astro    # PhaseMap, BarChart, HobbyTags SVGs.
      HowItWorks.astro      # 3-step stepper (desktop + mobile).
      Gallery.astro         # Sample timeline cards.
      ShareProof.astro      # "What your friends see" share card.
      ExportCta.astro       # Second dark export card preview.
      BlogTeaser.astro      # Three featured blog posts.
      Footer.astro          # Wordmark + nav + tagline.
    styles/landing.css      # Trimmed port of src/app/globals.css —
                            # keeps palette, keyframes, animation
                            # utilities, scroll-reveal classes.
  public/_headers           # CF Pages cache + security headers.
```

## Compromises vs. the Next.js original

The React landing had four places with real interactivity. The static
port handles each as follows:

- **`useInView` IntersectionObserver hooks** — every "fade up as you
  scroll" effect in `LandingClient` was driven by a `useInView` ref +
  inline-style branching. Replaced with the CSS classes
  `.scroll-reveal*` (already defined in the source `globals.css`), which
  use `animation-timeline: view()` to do the same thing in pure CSS.
  Browsers without scroll-driven animations (older Safari, Firefox)
  render the final state immediately — no fallback observer.

- **`<Nav />` from `layout.tsx`** — the React layout always renders a
  top nav. The static landing intentionally omits it (the deck CTAs
  cover sign-in / start). Visitors that click `/timeline/new`,
  `/journeys`, `/hobbies`, `/blog`, `/explore`, `/get-started` hit the
  Next.js Worker, which still owns those routes and renders the nav
  there. Post-cutover this is the only page without the global nav.

- **`SaaSMakerTestimonialsSection` + `SaaSMakerChangelogSection`** —
  React-only widgets that fetch from SaaS Maker at render time. Not
  ported. Bring them back via a static API render or an Astro
  `client:idle` island if the conversion data shows they matter.

- **Demo timelines from Turso** — `page.tsx` reads `getDemoTimelines()`
  and falls back to a static `SAMPLE_DEMO_TIMELINES` array when none
  are PUBLIC. The static port renders the same three curated samples
  (Alex / Jamie / Morgan) directly in `Gallery.astro`. **Update the
  inline array there when curation changes** — the live `/explore`
  page still owns real-data discovery.

- **Hard-coded blog teasers** — `BlogTeaser` reads
  `blogPosts.slice(0, 3)` from `src/lib/blog-posts.ts`. The static
  port hard-codes the current top three (`side-quests`,
  `why-hobbies-matter`, `how-to-choose-a-hobby`). Update
  `BlogTeaser.astro` when the canonical catalog re-orders.

- **OG / Twitter image** — Next.js generates `/opengraph-image` via
  the `opengraph-image.tsx` file convention. The Astro layout points
  `og:image` at `https://significanthobbies.com/opengraph-image`;
  post-cutover the Worker still owns that route, so the URL keeps
  resolving.

- **PostHog click events** — `AnalyticsProvider` mounts on the
  Next.js layout. Not ported. The Worker still owns every funnel
  route, so downstream events fire on conversion. Add PostHog later
  via an Astro layout `<script>` if upper-funnel attribution matters.

## Cutover (NOT done yet)

This deploy is **additive**. The Next.js Workers deploy at
significanthobbies.com is untouched. Cutover requires:

1. `pnpm install && pnpm build` — verify clean. Done at deploy time.
2. `pnpm deploy` — push to the Pages project
   `significanthobbies-landing`. QA the preview URL against the
   Next.js version.
3. **Cutover blocker — middleware redirect**: `src/middleware.ts` in
   the Next.js project redirects signed-in users from `/` to
   `/dashboard` based on the `better-auth.session_token` cookie.
   Pure-static Pages can't run this check. Before cutover, either:
   - Move the redirect into a tiny Workers route in front of Pages
     (Workers reads the cookie, 302s to `/dashboard` or passes
     through to the Pages asset), OR
   - Move the redirect client-side via a tiny `<script>` in
     `Layout.astro` (worse — flashes the marketing page first), OR
   - Accept that signed-in users see the marketing landing once, click
     "Start your hobby map", and bounce into the Worker-owned
     `/dashboard` route from there.
4. In the Cloudflare dashboard, route `significanthobbies.com/`
   (exact) → Pages project; leave `significanthobbies.com/*` on the
   Worker. Verify the Worker still owns `/dashboard/*`,
   `/timeline/*`, `/journeys/*`, `/u/[username]`, `/blog/*`,
   `/api/*`, etc.
5. Run psi-swarm against `significanthobbies.com/`, confirm LCP
   < 500 ms p75 desktop.
6. Delete `src/app/page.tsx`, `src/app/_components/landing-client.tsx`
   from the significanthobbies root **only after** the route is
   observably stable for ~a week and the redirect logic is moved.
