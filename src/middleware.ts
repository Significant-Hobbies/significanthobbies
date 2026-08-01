import { type NextRequest, NextResponse } from 'next/server';

function getSessionCookie(req: NextRequest) {
  return (
    req.cookies.get('better-auth.session_token') ??
    req.cookies.get('__Secure-better-auth.session_token')
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Anon GET `/` is static Astro HTML (landing-astro overlay + run_worker_first).
  // This hop only runs when a `/` request reaches OpenNext (signed-in fallback).
  if (pathname === '/' && getSessionCookie(req)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Private top-level workspaces choose local or account storage themselves.
  // Owner-specific database record routes retain their server-side ownership
  // checks; the proxy must not prevent local-ready pages from rendering.
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
