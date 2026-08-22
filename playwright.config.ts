import type { PlaywrightTestConfig } from '@playwright/test';
import { defineConfig, devices } from '@playwright/test';

// Plain Playwright config (formerly @saas-maker/test-config/playwright factory, inlined).
const ci = Boolean(process.env.CI);

const APP_URL = 'http://localhost:3000';
// The anonymous landing page is a static Astro build, not a Next route
// (decisions.md A1). It needs its own server and its own baseURL.
const LANDING_PORT = process.env.LANDING_PORT ?? '4321';
const LANDING_URL = `http://localhost:${LANDING_PORT}`;
const PERSONAL_PLATFORM_FIXTURE_URL = 'http://127.0.0.1:4010/health';

/**
 * `landing.spec.ts` validates the production anonymous Astro overlay. The Next
 * server also owns a public fallback for local development, but the landing
 * project's contract remains the built Astro artifact served in production.
 */
const LANDING_SPEC = /landing\.spec\.ts/;

const projects: PlaywrightTestConfig['projects'] = [
  {
    name: 'smoke',
    testMatch: /.*\.smoke\.spec\.ts/,
    use: { ...devices['Desktop Chrome'] },
  },
  { name: 'mobile', testIgnore: LANDING_SPEC, use: { ...devices['Pixel 7'] } },
  { name: 'tablet', testIgnore: LANDING_SPEC, use: { ...devices['iPad Pro 11'] } },
  { name: 'desktop', testIgnore: LANDING_SPEC, use: { ...devices['Desktop Chrome'] } },
  {
    name: 'wide',
    testIgnore: LANDING_SPEC,
    use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
  },
  {
    name: 'landing',
    testMatch: LANDING_SPEC,
    use: { ...devices['Desktop Chrome'], baseURL: LANDING_URL },
  },
];

export default defineConfig({
  testDir: './e2e',
  // Generous in CI: the app runs under `next dev`, so the first request to each
  // route pays a compile. A cold /daily compile alone exceeded the 5s assertion
  // budget on a fresh checkout. Local runs keep the tighter numbers, which is
  // where a slow assertion is worth noticing.
  timeout: ci ? 90_000 : 30_000,
  expect: { timeout: ci ? 15_000 : 5_000 },
  fullyParallel: true,
  forbidOnly: ci,
  retries: ci ? 2 : 0,
  workers: ci ? 2 : undefined,
  reporter: ci
    ? [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/junit.xml' }]]
    : 'list',
  use: {
    baseURL: APP_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: ci ? 'retain-on-failure' : 'off',
  },
  projects,
  webServer: [
    {
      command: 'node scripts/personal-platform-e2e-fixture.mjs',
      url: PERSONAL_PLATFORM_FIXTURE_URL,
      reuseExistingServer: false,
      timeout: 10_000,
    },
    {
      // ENABLE_TEST_AUTH gates better-auth's email provider behind NODE_ENV too
      // (src/lib/auth.ts), so the authenticated specs run instead of skipping.
      command: 'pnpm dev:test-auth',
      url: APP_URL,
      reuseExistingServer: !ci,
      timeout: 60_000,
    },
    {
      // `astro preview` serves dist/, so it has to be built first.
      command: `pnpm --filter significanthobbies-landing-astro build && pnpm --filter significanthobbies-landing-astro preview --port ${LANDING_PORT}`,
      url: LANDING_URL,
      reuseExistingServer: !ci,
      timeout: 120_000,
    },
  ],
});
