import { type NextRequest, NextResponse } from 'next/server';

const PROTECTED_PREFIXES = ['/dashboard', '/profile', '/settings', '/setup', '/journeys'];

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

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (!isProtected) return NextResponse.next();

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
