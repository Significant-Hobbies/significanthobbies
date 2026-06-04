// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Mirrors fleet/sarthakagrawal/astro.config.mjs and
// fleet/linkchat/landing-astro/astro.config.mjs — the reference Astro
// setups in the fleet that already hit p75 LCP ≈ 360 ms on Cloudflare
// Pages. Pure static output (no SSR adapter) — the landing is just
// HTML + Tailwind utility classes + CSS keyframes. No client JS.
//
// Tailwind v4 via the @tailwindcss/vite plugin is the fleet web-stack
// standard for the Vite/Astro half of the ecosystem. Lightning CSS sits
// underneath as both transformer and minifier so the per-page CSS that
// `inlineStylesheets: 'always'` flat-inlines into each HTML file stays
// as small as possible. See ../AGENTS.md → "Fleet web stack standard".
export default defineConfig({
  site: 'https://significanthobbies.com',
  output: 'static',
  trailingSlash: 'never',
  // Emit `about.html` rather than `about/index.html` — no 308 redirect
  // on every link. Same as sarthakagrawal.pages.dev and karte.cc.
  build: {
    format: 'file',
    inlineStylesheets: 'always',
  },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
    css: { transformer: 'lightningcss' },
    build: { cssMinify: 'lightningcss' },
  },
});
