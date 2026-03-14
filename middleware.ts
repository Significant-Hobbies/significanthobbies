import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Skip API routes, setup, and login pages
    if (
      pathname.startsWith("/api") ||
      pathname === "/setup" ||
      pathname === "/login"
    ) {
      return NextResponse.next();
    }

    // If authenticated but no username, redirect to /setup to complete onboarding
    if (token && !token.username) {
      return NextResponse.redirect(new URL("/setup", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl;
        // Protect edit routes
        if (pathname.match(/^\/timeline\/.*\/edit$/)) {
          return !!token;
        }
        // Protect setup page
        if (pathname === "/setup") {
          return !!token;
        }
        return true;
      },
    },
  },
);

export const config = {
  matcher: [
    "/timeline/:path*",
    "/explore",
    "/search",
    "/settings",
    "/setup",
    "/dashboard",
    "/side-quests",
    "/u/:path*",
  ],
};
