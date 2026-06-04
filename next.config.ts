import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // Keep libsql stack external so workerd-compatible exports resolve at runtime via wrangler
  serverExternalPackages: [
    "@libsql/client",
    "@libsql/hrana-client",
    "@libsql/isomorphic-ws",
    "@libsql/isomorphic-fetch",
    "libsql",
    "drizzle-orm",
  ],
  images: {
    unoptimized: true, // Required for Cloudflare Pages edge runtime
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" }, // Google OAuth avatars
      { protocol: "https", hostname: "api.dicebear.com" }, // DiceBear avatars
    ],
  },
  async headers() {
    return [
      {
        // CF Edge requires both max-age (browser) and explicit CDN-Cache-Control
        // to actually cache HTML at edge. revalidate=3600 alone emitted only
        // s-maxage which CF marked DYNAMIC, costing a full Worker cold-start
        // per visitor on the demo-timelines homepage.
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
          },
          {
            key: "CDN-Cache-Control",
            value: "public, s-maxage=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
