import { expect, test } from '@playwright/test';

import { completeLocalOnboarding } from './fixtures/local-onboarding';

test.describe('signed-out private surfaces are local-first', () => {
  test.beforeEach(async ({ page }) => {
    await completeLocalOnboarding(page);
  });

  test('/journal exposes editable local writing', async ({ page }) => {
    await page.goto('/journal');
    await expect(page.getByLabel('Preview notice')).toHaveCount(0);
    await expect(page.locator('#journal-entry')).toBeVisible();
    await expect(page.locator('body')).toContainText('this device');
  });

  test('/habits exposes editable local practices', async ({ page }) => {
    await page.goto('/habits');
    await expect(page.getByLabel('Preview notice')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Manage' })).toBeVisible();
    await expect(page.locator('#journal-entry')).toHaveCount(0);
  });

  test('/trajectory exposes an editable local contract', async ({ page }) => {
    await page.goto('/trajectory');
    await expect(page.getByLabel('Preview notice')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Set this trajectory' })).toBeVisible();
    await expect(page.getByText('Saved privately on this device')).toBeVisible();
  });

  test('private local surfaces stay out of the search index', async ({ page }) => {
    for (const route of ['/journal', '/habits', '/trajectory']) {
      await page.goto(route);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    }
  });
});
