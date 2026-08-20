import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('Significant Hobbies Hub (Astro overlay)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('introduces the personal app collection', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Your personal apps, in one place.');
    await expect(page.getByRole('heading', { name: 'The collection' })).toBeVisible();
  });

  test('shows all seven products once', async ({ page }) => {
    for (const name of ['Live', 'Journal', 'Habits', 'Calorie', 'Setline', 'Kith', 'Anchor']) {
      await expect(page.getByRole('heading', { name, exact: true })).toHaveCount(1);
    }
  });

  test('opens only products with an honest available destination', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Live/ })).toHaveAttribute('href', '/live-more');
    await expect(
      page.locator('a.product-card[href="https://calorie.significanthobbies.com"]')
    ).toHaveAttribute('href', 'https://calorie.significanthobbies.com');
    await expect(page.getByRole('heading', { name: 'Journal' }).locator('..')).not.toHaveAttribute(
      'href'
    );
  });

  test('states the current integration boundary', async ({ page }) => {
    await expect(page.getByText('No combined database yet.')).toBeVisible();
    await expect(page.getByText('Read-only Hub')).toBeVisible();
  });

  test('carries indexable metadata', async ({ page }) => {
    expect(await page.title()).toContain('Significant Hobbies');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{40,}/);
    await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute('content', /noindex/);
  });

  test('meets the automated accessibility baseline', async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
