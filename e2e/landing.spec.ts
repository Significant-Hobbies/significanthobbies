import { expect, test } from '@playwright/test';

test.describe('Landing page', () => {
  test('loads and shows hero content', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText('Discover your hobby story')).toBeVisible();
  });

  test('has navigation links', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Discover' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Explore' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Quiz' })).toBeVisible();
  });

  test('archetype preview section is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('What will your hobby story reveal?')).toBeVisible();
  });
});
