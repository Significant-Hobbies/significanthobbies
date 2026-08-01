import { expect, test } from '@playwright/test';

const LOCAL_ROUTES = [
  '/dashboard',
  '/commitments',
  '/daily',
  '/life-plan',
  '/look-back',
  '/settings',
  '/setup',
  '/timeline',
  '/trajectory',
] as const;

test.describe('private work is locally available without an account', () => {
  for (const route of LOCAL_ROUTES) {
    test(`${route} renders without a login redirect`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBeLessThan(400);
      expect(page.url()).not.toContain('/login');
    });
  }

  test('bucket list intent retains the anonymous creation path', async ({ page }) => {
    await page.goto('/bucket-list');
    await page.waitForURL(/\/life-bingo/);
    expect(page.url()).toContain('/life-bingo');
  });
});
