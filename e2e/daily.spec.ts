import { expect, test } from '@playwright/test';

test.describe('Daily ritual & manifesto', () => {
  test('/daily redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/daily');
    // Should redirect to /login since auth is required
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain('/login');
  });

  test('/manifesto loads and shows the mortality frame', async ({ page }) => {
    await page.goto('/manifesto');
    await expect(page.locator('h1')).toContainText('Manifesto');
    // The 4,000 weeks truth
    await expect(page.getByText(/4,000 weeks/)).toBeVisible();
    // Two dimensions — match the bold labels in the manifesto body
    await expect(page.locator('article').getByText('Daily.')).toBeVisible();
    await expect(page.locator('article').getByText('Living.')).toBeVisible();
    // The journal as bridge
    await expect(page.getByText(/journal is the bridge/i)).toBeVisible();
  });

  test('/manifesto has working CTAs', async ({ page }) => {
    await page.goto('/manifesto');
    const hobbiesLink = page.getByRole('link', { name: 'Find a hobby' });
    await expect(hobbiesLink).toBeVisible();
    const bucketListLink = page.getByRole('link', { name: 'Start a bucket list' });
    await expect(bucketListLink).toBeVisible();
  });

  test('nav includes Daily link', async ({ page }) => {
    await page.goto('/hobbies');
    // The Daily nav link should be visible on desktop
    await expect(page.getByRole('link', { name: 'Daily' }).first()).toBeVisible();
  });

  test('footer includes Daily section', async ({ page }) => {
    await page.goto('/hobbies');
    await expect(page.getByText("Today's ritual")).toBeVisible();
  });
});
