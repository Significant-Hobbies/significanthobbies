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

  test('opens every product landing', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Live/ })).toHaveAttribute(
      'href',
      'https://live.significanthobbies.com'
    );
    await expect(
      page.locator('a.product-card[href="https://calorie.significanthobbies.com"]')
    ).toHaveAttribute('href', 'https://calorie.significanthobbies.com');
    await expect(page.getByRole('link', { name: /Journal/ })).toHaveAttribute(
      'href',
      'https://journal.significanthobbies.com'
    );
    await expect(page.getByRole('link', { name: /Habits/ })).toHaveAttribute(
      'href',
      'https://habits.significanthobbies.com'
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

test.describe('Live landing (Astro overlay)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/live');
  });

  test('preserves the cinematic landing on the Live domain contract', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('What will you do');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://live.significanthobbies.com'
    );
    expect(
      await page
        .getByRole('link', { name: /See my life in weeks/ })
        .evaluate((link) => (link as HTMLAnchorElement).href)
    ).toBe('https://significanthobbies.com/life-in-weeks');
  });

  test('meets the automated accessibility baseline', async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
