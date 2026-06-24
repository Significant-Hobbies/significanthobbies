import { expect, test } from '@playwright/test';

test.describe('Tools', () => {
  test('tools index page loads', async ({ page }) => {
    await page.goto('/tools');
    await expect(page.locator('h1')).toContainText('Tools');
    await expect(page.getByText('Time Calculator')).toBeVisible();
  });

  test('time calculator works', async ({ page }) => {
    await page.goto('/tools/time-calculator');
    await expect(page.locator('h1')).toContainText('Time Calculator');
    // Should show default free time calculation
    await expect(page.getByText(/hours/i)).toBeVisible();
  });

  test('compare page loads', async ({ page }) => {
    await page.goto('/compare');
    await expect(page.locator('h1')).toContainText('Compare');
  });
});
