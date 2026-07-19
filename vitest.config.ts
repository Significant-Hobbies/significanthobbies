import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

// Plain Vitest config (formerly @saas-maker/test-config/vitest factory).
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.next', '.wrangler', 'e2e/**'],
    testTimeout: 15_000,
    coverage: {
      provider: 'v8',
      // Selective thresholds on core logic modules with co-located tests,
      // following the swe-interview-prep fleet model. UI/config/data files
      // are excluded so thresholds reflect real logic coverage, not surface
      // area. Add a file here when it gains a co-located *.test.ts.
      include: [
        'src/lib/accountability-circles.ts',
        'src/lib/bucket-list-insights.ts',
        'src/lib/hobby-roadmap.ts',
        'src/lib/insights.ts',
        'src/lib/personality.ts',
        'src/lib/rate-limit.ts',
        'src/lib/recommendations.ts',
        'src/lib/rediscovery.ts',
        'src/lib/slug.ts',
        'src/lib/trajectory.ts',
      ],
      exclude: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.d.ts',
        '**/index.ts',
        'node_modules',
        'dist',
        '.next',
        '.wrangler',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '~': resolve(__dirname, './src'),
    },
  },
});
