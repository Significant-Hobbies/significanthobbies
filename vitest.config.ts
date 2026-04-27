import { resolve } from 'path';

import { defineVitestConfig } from '@saas-maker/test-config/vitest';

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
