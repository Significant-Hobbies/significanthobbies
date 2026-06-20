import type { PlaywrightTestConfig } from '@playwright/test';
import { defineConfig, devices } from '@playwright/test';

// Plain Playwright config (formerly @saas-maker/test-config/playwright factory, inlined).
const ci = Boolean(process.env.CI);

const projects: PlaywrightTestConfig['projects'] = [
  { name: 'smoke', testMatch: /.*\.smoke\.spec\.ts/, use: { ...devices['Desktop Chrome'] } },
  { name: 'mobile', use: { ...devices['Pixel 7'] } },
  { name: 'tablet', use: { ...devices['iPad Pro 11'] } },
  { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
  { name: 'wide', use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } } },
];

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: ci,
  retries: ci ? 2 : 0,
  workers: ci ? 2 : undefined,
  reporter: ci
    ? [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/junit.xml' }]]
    : 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: ci ? 'retain-on-failure' : 'off',
  },
  projects,
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
