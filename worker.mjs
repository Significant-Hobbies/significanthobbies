// worker.mjs — custom Worker entry that wraps OpenNext with edge cache.
//
// The OpenNext-generated worker (`./.open-next/worker.js`) is imported as
// the inner handler. For GET / requests we consult `caches.default` first
// and only fall through to the Next handler on a miss — eliminating the
// Worker cold-start path entirely for warm-cache hits on the homepage.
//
// Cache headers are explicit so CF Edge actually treats the response as
// cacheable (s-maxage-only was getting marked DYNAMIC at the zone level;
// using caches.default sidesteps the zone-level Cache Rules requirement).
//
// All non-GET, non-`/` requests pass straight through to OpenNext.

import openNext from './.open-next/worker.js';
import { withTiming } from './timing.mjs';
import { handleAgentEdge } from './agent-edge.mjs';
import { handleCachedPublicRouteMarkdown } from './agent-route-markdown.mjs';

// Durable Objects must be re-exported from the entry that wrangler.toml
// points at, otherwise the bindings can't resolve them at deploy time.
export {
  DOQueueHandler,
  DOShardedTagCache,
  BucketCachePurge,
} from './.open-next/worker.js';

const CACHE_CONTROL = 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800';
const DATA_CACHE_CONTROL = new Map([
  ['/sitemap.xml', 'public, max-age=300, s-maxage=3600'],
  ['/video-sitemap.xml', 'public, max-age=300, s-maxage=3600'],
]);
// Public marketing + free-tool surfaces (anon HTML only).
const CACHEABLE_EXACT = new Set([
  '/',
  '/explore',
  '/tools',
  '/hobbies',
  '/compare',
  '/find-your-hobby',
  '/get-started',
  '/starter-kits',
  '/manifesto',
  '/what-are-significant-hobbies',
  '/hobbies-for-adults',
  '/hobbies-for-mental-health',
  '/hobbies-for-resume',
  '/hobbies-to-try',
  '/cheap-hobbies',
  '/side-quests',
  '/bucket-lists',
  '/bucket-list-ideas',
  '/bucket-list-before-30',
  '/bucket-list-before-50',
  '/travel-bucket-list',
  '/how-to-make-a-bucket-list',
  '/life-bingo',
  '/blog',
  '/about',
  '/search',
  '/hobbies/random',
  '/privacy',
  '/terms',
  '/sitemap.xml',
  '/video-sitemap.xml',
]);
const CACHEABLE_PREFIXES = [
  '/tools',
  '/blog',
  '/hobbies',
  '/bucket-lists',
  '/hobbies/category',
  '/experiences',
  '/journeys',
];
function isCacheableDocumentPath(pathname) {
  if (!pathname) return false;
  if (CACHEABLE_EXACT.has(pathname)) return true;
  for (const prefix of CACHEABLE_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return true;
  }
  return false;
}

function cacheControlForPath(pathname) {
  return DATA_CACHE_CONTROL.get(pathname) ?? CACHE_CONTROL;
}

function isCacheableContentType(pathname, contentType) {
  if (DATA_CACHE_CONTROL.has(pathname)) return contentType.includes('xml');
  return contentType.includes('text/html');
}

// Skip cache when ANY of these cookies are present — covers the better-auth
// session in both prod (__Secure-) and dev variants so signed-in users
// always see live SSR (e.g. redirect to /library).
const AUTH_COOKIE_FRAGMENTS = ['session_token', 'session-token'];
const LIVE_HOST = 'live.significanthobbies.com';

function hasAuthCookie(request) {
  const cookie = request.headers.get('cookie');
  if (!cookie) return false;
  return AUTH_COOKIE_FRAGMENTS.some((c) => cookie.includes(c));
}

export default {
  fetch: withTiming(async function fetch(request, env, ctx) {
    const requestUrl = new URL(request.url);
    if (requestUrl.hostname === LIVE_HOST && requestUrl.pathname !== '/') {
      requestUrl.hostname = 'significanthobbies.com';
      return Response.redirect(requestUrl, 308);
    }

    // Agent / LLM indexing surfaces (fleet GEO standard)
    // `/llms-full.txt` is owned by the application because it is generated
    // from the complete editorial corpus. The portable fallback must not mask
    // that richer route with its generic product brief.
    if (requestUrl.pathname !== '/llms-full.txt') {
      const agent = handleAgentEdge(request);
      if (agent) return agent;
    }
    try {
      const markdown = await handleCachedPublicRouteMarkdown(
        request,
        async (sourcePath) => {
          const sourceUrl = new URL('/api/ai/markdown', request.url);
          sourceUrl.searchParams.set('path', sourcePath);
          const sourceResponse = await openNext.fetch(
            new Request(sourceUrl, {
              headers: {
                Accept: 'text/markdown',
                'x-fleet-markdown-source': '1',
              },
            }),
            env,
            ctx
          );
          if (!sourceResponse.ok) return null;
          const contentType = sourceResponse.headers.get('content-type') || '';
          if (!contentType.toLowerCase().includes('text/markdown')) return null;
          return sourceResponse.text();
        },
        {
          cache: caches.default,
          cacheEnabled: !hasAuthCookie(request),
          waitUntil: (promise) => ctx.waitUntil(promise),
        }
      );
      if (markdown) return markdown;

      if (request.method !== 'GET') {
        return openNext.fetch(request, env, ctx);
      }
      const url = requestUrl;
      if (!isCacheableDocumentPath(url.pathname)) {
        return openNext.fetch(request, env, ctx);
      }
      // Auth-bearing requests pass straight through; the user is likely
      // going to be redirected by middleware to /library or /dashboard.
      const isLiveLanding = url.hostname === LIVE_HOST && url.pathname === '/';
      if (hasAuthCookie(request) && !isLiveLanding) {
        return openNext.fetch(request, env, ctx);
      }

      // Short-circuit: the Astro landing is overlaid into
      // `.open-next/assets/index.html` by `scripts/overlay-astro-landing.mjs`.
      // For anon GET /, serve straight from the assets binding instead of
      // booting the full OpenNext stack (next-server, middleware handler,
      // Beasties pipeline, etc.). Cuts TTFB from ~250ms to ~30ms.
      //
      // Only the Astro overlay at `/` is static; marketing pages use the edge
      // HTML cache. Leave content encoding to Cloudflare's response boundary.
      // Manually piping this body through CompressionStream caused the timing
      // wrapper and CDN to encode it again, leaving browsers with gzip bytes
      // rendered as text after the cached variants crossed.
      if (env.ASSETS && url.pathname === '/') {
        const assetRequest = isLiveLanding
          ? new Request(new URL('/live.html', request.url), request)
          : request;
        const assetResp = await env.ASSETS.fetch(assetRequest);
        // The assets binding answers If-None-Match revalidations with 304.
        // Pass those through — falling through would serve the wrong page.
        if (assetResp.status === 304) {
          const headers = new Headers(assetResp.headers);
          headers.set('Cache-Control', CACHE_CONTROL);
          headers.set('x-edge-cache', 'ASSET');
          return new Response(null, { status: 304, headers });
        }
        if (assetResp.ok && assetResp.body) {
          const headers = new Headers(assetResp.headers);
          headers.set('Cache-Control', CACHE_CONTROL);
          headers.set('x-edge-cache', 'ASSET');

          return new Response(assetResp.body, {
            status: assetResp.status,
            statusText: assetResp.statusText,
            headers,
          });
        }
      }

      const cache = caches.default;
      const cached = await cache.match(request);
      if (cached) {
        const hit = new Response(cached.body, cached);
        hit.headers.set('x-edge-cache', 'HIT');
        return hit;
      }

      const response = await openNext.fetch(request, env, ctx);

      // Only cache 2xx HTML responses — never error pages or redirects.
      const contentType = response.headers.get('content-type') ?? '';
      if (
        response.status !== 200 ||
        response.headers.has('set-cookie') ||
        !isCacheableContentType(url.pathname, contentType)
      ) {
        return response;
      }

      // Read the body into memory once so we can hand the same bytes to
      // both the client response and the cache.put. The earlier pattern
      // (`new Response(response.body, response)` then `.clone()`) was
      // silently dropping the inlined critical-CSS chunk somewhere in the
      // stream-fork; reading once and constructing both responses from
      // the same Uint8Array sidesteps the streaming edge case entirely.
      const body = await response.arrayBuffer();
      const headers = new Headers(response.headers);
      headers.set('Cache-Control', cacheControlForPath(url.pathname));

      const cacheable = new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
      ctx.waitUntil(cache.put(request, cacheable.clone()));

      const clientResponse = new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
      clientResponse.headers.set('x-edge-cache', 'MISS');
      return clientResponse;
    } catch (err) {
      console.error(
        `[error] ${request.method} ${new URL(request.url).pathname}:`,
        err.message,
        err.stack
      );
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }),
};
