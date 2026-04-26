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
};

export default nextConfig;
