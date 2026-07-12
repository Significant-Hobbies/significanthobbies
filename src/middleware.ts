import { type NextRequest, NextResponse } from 'next/server';

import { isAgentReadablePath } from '~/lib/agent-routes';

const PROTECTED_PREFIXES = ['/dashboard', '/profile', '/settings', '/setup', '/journeys'];

function getSessionCookie(req: NextRequest) {
  return (
    req.cookies.get('better-auth.session_token') ??
    req.cookies.get('__Secure-better-auth.session_token')
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const acceptsMarkdown =
    req.method === 'GET' && req.headers.get('accept')?.toLowerCase().includes('text/markdown');

  if (acceptsMarkdown && isAgentReadablePath(pathname)) {
    const markdownUrl = new URL('/api/agent-content', req.nextUrl);
    markdownUrl.searchParams.set('path', pathname);
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-agent-path', pathname);
    return NextResponse.rewrite(markdownUrl, { request: { headers: requestHeaders } });
  }

  // Anon GET `/` is static Astro HTML (landing-astro overlay + run_worker_first).
  // This hop only runs when a `/` request reaches OpenNext (signed-in fallback).
  if (pathname === '/' && getSessionCookie(req)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (!isProtected) {
    const response = NextResponse.next();
    response.headers.set(
      'Link',
      '</llms.txt>; rel="alternate"; type="text/plain", </sitemap.xml>; rel="sitemap"; type="application/xml"'
    );
    return response;
  }

  if (!getSessionCookie(req)) {
    const loginUrl = new URL('/login', req.nextUrl);
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
