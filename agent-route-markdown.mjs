const PUBLIC_EXACT_PATHS = new Set([
  '/',
  '/about',
  '/blog',
  '/bucket-list-before-30',
  '/bucket-list-before-50',
  '/bucket-list-ideas',
  '/bucket-lists',
  '/changelog',
  '/cheap-hobbies',
  '/compare',
  '/experiences',
  '/explore',
  '/find-your-hobby',
  '/get-started',
  '/hobbies',
  '/hobbies-for-adults',
  '/hobbies-for-mental-health',
  '/hobbies-for-resume',
  '/hobbies-to-try',
  '/hobbies/random',
  '/how-to-make-a-bucket-list',
  '/journeys',
  '/life-bingo',
  '/life-in-weeks',
  '/manifesto',
  '/privacy',
  '/search',
  '/side-quests',
  '/starter-kits',
  '/terms',
  '/tools',
  '/tools/cost-calculator',
  '/tools/time-calculator',
  '/travel-bucket-list',
  '/what-are-significant-hobbies',
]);

const PUBLIC_PATH_PREFIXES = [
  '/blog/',
  '/bucket-lists/',
  '/experiences/',
  '/hobbies/',
  '/hobbies/category/',
  '/journeys/',
];

const FIXED_AGENT_PATHS = new Set(['/api/ai', '/index.md', '/llms-full.txt', '/llms.txt']);

/**
 * Handle Markdown negotiation and explicit `.md` alternates for public
 * server-rendered documents.
 *
 * `loadMarkdown` must read from the application's canonical route data rather
 * than fetching this wrapper, so Markdown requests cannot recurse.
 *
 * @param {Request} request
 * @param {(sourcePath: string, request: Request) => Promise<string | null>} loadMarkdown
 * @returns {Promise<Response | null>}
 */
export async function handlePublicRouteMarkdown(request, loadMarkdown) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return null;

  const requestedUrl = new URL(request.url);
  if (FIXED_AGENT_PATHS.has(requestedUrl.pathname)) return null;

  const explicitMarkdown = isMarkdownAlternatePath(requestedUrl.pathname);
  const sourcePath = explicitMarkdown
    ? htmlPathFromMarkdown(requestedUrl.pathname)
    : normalizePath(requestedUrl.pathname);

  if (explicitMarkdown && !isPublicAgentDocumentPath(sourcePath)) {
    return markdownError(404, 'Not found', requestedUrl.pathname, request.method);
  }
  if (!explicitMarkdown && (!wantsMarkdown(request) || !isPublicAgentDocumentPath(sourcePath))) {
    return null;
  }

  const markdown = await loadMarkdown(sourcePath, request);
  if (!markdown) {
    return markdownError(404, 'Public document unavailable', sourcePath, request.method);
  }

  const markdownPath = markdownPathFor(sourcePath);
  return new Response(request.method === 'HEAD' ? null : markdown, {
    status: 200,
    headers: {
      'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
      'Content-Location': markdownPath,
      'Content-Type': 'text/markdown; charset=utf-8',
      Link: `<${sourcePath}>; rel="canonical"; type="text/html"`,
      Vary: 'Accept',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export function isPublicAgentDocumentPath(pathname) {
  const path = normalizePath(pathname);
  if (PUBLIC_EXACT_PATHS.has(path)) return true;
  if (/^\/u\/[^/]+$/.test(path)) return true;
  return PUBLIC_PATH_PREFIXES.some(
    (prefix) => path.startsWith(prefix) && path.length > prefix.length
  );
}

export function isAgentReadableSitemapPath(pathname) {
  const path = normalizePath(pathname);
  return FIXED_AGENT_PATHS.has(path) || isPublicAgentDocumentPath(path);
}

export function markdownPathFor(pathname) {
  const path = normalizePath(pathname);
  return path === '/' ? '/index.md' : `${path}.md`;
}

export function htmlPathFromMarkdown(pathname) {
  const path = normalizePath(pathname);
  if (path === '/index.md') return '/';
  if (path.endsWith('/index.md')) return normalizePath(path.slice(0, -'/index.md'.length));
  return normalizePath(path.slice(0, -'.md'.length));
}

function isMarkdownAlternatePath(pathname) {
  return pathname.endsWith('.md');
}

function wantsMarkdown(request) {
  if (request.headers.get('x-fleet-markdown-source') === '1') return false;
  const accept = (request.headers.get('accept') || '').toLowerCase();
  if (!accept.includes('text/markdown')) return false;
  if (!accept.includes('text/html')) return true;
  return accept.indexOf('text/markdown') < accept.indexOf('text/html');
}

function normalizePath(pathname) {
  if (!pathname || pathname === '/') return '/';
  const withLeadingSlash = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return withLeadingSlash.replace(/\/{2,}/g, '/').replace(/\/+$/, '') || '/';
}

function markdownError(status, title, path, method) {
  const body = `# ${title}\n\nNo public Markdown surface is available for \`${path}\`.\n`;
  return new Response(method === 'HEAD' ? null : body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'text/markdown; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
