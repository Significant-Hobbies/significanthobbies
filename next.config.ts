import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactCompiler: true,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Keep libsql stack external so workerd-compatible exports resolve at runtime via wrangler
  serverExternalPackages: [
    '@libsql/client',
    '@libsql/hrana-client',
    '@libsql/isomorphic-ws',
    '@libsql/isomorphic-fetch',
    'libsql',
    'drizzle-orm',
  ],
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
