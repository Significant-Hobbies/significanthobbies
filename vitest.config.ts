import { defineVitestConfig } from '@saas-maker/test-config/vitest';
import { resolve } from 'path';

export default defineVitestConfig({
  environment: 'jsdom',
  exclude: ['e2e/**'],
  extend: {
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
  },
});
