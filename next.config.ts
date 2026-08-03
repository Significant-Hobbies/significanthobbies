import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
import type { NextConfig } from 'next';

initOpenNextCloudflareForDev({ configPath: './wrangler.local.toml' });

const nextConfig: NextConfig = {
  output: 'standalone',
  // This repository is independently deployable even though a Fleet lockfile
  // exists above it. Without an explicit trace root, Next nests the standalone
  // app under `.next/standalone/significanthobbies/`, while OpenNext expects
  // `.next/standalone/.next/` and cannot find pages-manifest.json.
  outputFileTracingRoot: process.cwd(),
  reactCompiler: true,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  serverExternalPackages: ['drizzle-orm'],
  images: {
    unoptimized: true, // Required for Cloudflare Pages edge runtime
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }, // Google OAuth avatars
      { protocol: 'https', hostname: 'api.dicebear.com' }, // DiceBear avatars
    ],
  },
  async redirects() {
    return [
      { source: '/videos', destination: '/blog', permanent: true },
      { source: '/videos/:slug', destination: '/blog/:slug', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        // Keep `/` cache window short — long TTLs strand visitors on stale
        // HTML pointing to chunk hashes the next deploy invalidated. 60s
        // matches `revalidate` in page.tsx; misses cost one Worker hit and
        // recover automatically after a deploy.
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
