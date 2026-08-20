import { expect, test } from '@playwright/test';

import { completeLocalOnboarding } from './fixtures/local-onboarding';

const LOCAL_ROUTES = [
  '/commitments',
  '/settings',
  '/onboarding',
  '/timeline',
  '/trajectory',
] as const;

test.describe('private work is locally available without an account', () => {
  test('root is the public product Hub before local onboarding', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole('heading', { name: 'Your personal apps, in one place.' })
    ).toBeVisible();
  });

  test('the Hub remains the front door after local onboarding', async ({ page }) => {
    await completeLocalOnboarding(page);
    await page.goto('/');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('link', { name: /Live/ }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Journal', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Habits', exact: true })).toBeVisible();
  });

  test('public navigation does not expose the private workspace before onboarding', async ({
    page,
  }) => {
    await page.goto('/hobbies');
    await expect(page.getByRole('link', { name: 'Journal', exact: true })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Habits', exact: true })).toHaveCount(0);
    if (!(await page.getByRole('link', { name: 'Possibilities' }).isVisible())) {
      await page.getByRole('button', { name: 'Open menu' }).click();
    }
    await expect(page.getByRole('link', { name: 'Possibilities' })).toBeVisible();
  });

  for (const route of [
    '/live-more',
    '/journal',
    '/habits',
    '/history',
    '/trajectory',
    '/bucket-list',
  ] as const) {
    test(`${route} starts with onboarding`, async ({ page }) => {
      await page.goto(route);
      await page.waitForURL(/\/onboarding$/);
    });
  }

  for (const route of LOCAL_ROUTES) {
    test(`${route} renders without a login redirect`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBeLessThan(400);
      expect(page.url()).not.toContain('/login');
    });
  }

  test('bucket list is a complete local workspace after onboarding', async ({ page }) => {
    await completeLocalOnboarding(page);
    await page.goto('/bucket-list');
    await expect(page).toHaveURL(/\/bucket-list$/);
    await page.getByLabel('Something you want to do').fill('Sleep under the stars');
    await page.getByRole('button', { name: 'Add to my list' }).click();
    await expect(page.getByText('Sleep under the stars')).toBeVisible();
    await page.reload();
    await expect(page.getByText('Sleep under the stars')).toBeVisible();
    await page.getByRole('button', { name: 'Complete Sleep under the stars' }).click();
    await expect(page.getByRole('button', { name: 'Reopen Sleep under the stars' })).toBeVisible();
  });
});
