import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

// Plain Vitest config (formerly @saas-maker/test-config/vitest factory).
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.next', '.wrangler', 'e2e/**'],
    testTimeout: 15_000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '~': resolve(__dirname, './src'),
    },
  },
});
