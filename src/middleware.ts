import { type NextRequest,NextResponse } from "next/server";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/profile",
  "/settings",
  "/setup",
  "/journeys",
];

function getSessionCookie(req: NextRequest) {
  return (
    req.cookies.get("better-auth.session_token") ??
    req.cookies.get("__Secure-better-auth.session_token")
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Signed-in visitors landing on the marketing page are sent straight to
  // their dashboard, preserving the previous SSR redirect without forcing
  // `/` to render dynamically. The username check still happens server-side
  // when /dashboard loads.
  //
  // psi-swarm flagged TTFB ≈ 2.32s on the SSR path that did
  // getServerAuthSession() + a DB read for demo timelines per request.
  // Moving this hop to middleware lets `/` render as static ISR.
  if (pathname === "/" && getSessionCookie(req)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Cache anon `/` briefly at the edge — long TTLs (we previously had
  // s-maxage=86400) strand visitors on stale HTML pointing to chunk
  // hashes from the previous build, which 404 and trip GlobalError. 60s
  // matches `revalidate` in page.tsx so misses cost one Worker invocation
  // and recover automatically after a deploy.
  if (pathname === "/") {
    const res = NextResponse.next();
    res.headers.set(
      "Cache-Control",
      "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
    );
    res.headers.set(
      "CDN-Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=300",
    );
    return res;
  }

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (!isProtected) return NextResponse.next();

  if (!getSessionCookie(req)) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
