import { expect, test } from '@playwright/test';

test.describe('signed-out private surfaces are local-first', () => {
  test('/daily exposes editable local habits and journal', async ({ page }) => {
    await page.goto('/daily');
    await expect(page.getByLabel('Preview notice')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Manage' })).toBeVisible();
    await expect(page.locator('#daily-journal-entry')).toBeVisible();
    await expect(page.locator('body')).toContainText('this device');
  });

  test('/trajectory exposes an editable local contract', async ({ page }) => {
    await page.goto('/trajectory');
    await expect(page.getByLabel('Preview notice')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Set this trajectory' })).toBeVisible();
    await expect(page.getByText('Saved privately on this device')).toBeVisible();
  });

  test('private local surfaces stay out of the search index', async ({ page }) => {
    for (const route of ['/daily', '/trajectory']) {
      await page.goto(route);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    }
  });
});
