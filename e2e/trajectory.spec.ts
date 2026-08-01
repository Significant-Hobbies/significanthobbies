import { expect, test } from '@playwright/test';

// E2E for the local-first Trajectory feature plus nav visibility. Authenticated
// database behavior is also covered by e2e/authenticated.spec.ts.

test.describe('Trajectory', () => {
  test('/trajectory saves anonymous work on this device across reloads', async ({ page }) => {
    const res = await page.goto('/trajectory');
    expect(res?.status()).toBeLessThan(400);
    expect(page.url()).not.toContain('/login');
    await expect(page.getByText('Saved privately on this device')).toBeVisible();

    await expect(page.getByLabel('Trajectory map')).toBeVisible();
    await page
      .getByRole('textbox', { name: 'Constraints', exact: true })
      .fill('Limited weekday energy.');
    await page.getByRole('button', { name: 'Frame intent' }).click();
    await page.getByRole('textbox', { name: 'Intent', exact: true }).fill('Make small films.');
    await page.getByRole('button', { name: 'Frame decision policy' }).click();
    await page
      .getByRole('textbox', { name: 'Decision policy', exact: true })
      .fill('Prefer publishing over polishing.');
    await page.getByRole('button', { name: 'Frame feedback loop' }).click();
    await page
      .getByRole('textbox', { name: 'Feedback loop', exact: true })
      .fill('Review what happened each Sunday.');
    await page.getByRole('button', { name: 'Set this trajectory' }).click();
    await expect(page.getByText('Current trajectory')).toBeVisible();

    await page.reload();
    await expect(page.getByLabel('Trajectory map')).toBeVisible();
    await expect(page.getByText('Make small films.', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Review this trajectory' }).click();
    await page.getByLabel('Observed signal').fill('Short edits were easy to return to.');
    await page.getByRole('button', { name: 'Save review and continue' }).click();
    await expect(page.getByText('Short edits were easy to return to.')).toBeVisible();
  });

  test('nav leads to the combined history surface', async ({ page }) => {
    await page.goto('/hobbies');
    await expect(page.getByRole('link', { name: 'See History' })).toHaveAttribute(
      'href',
      '/look-back'
    );
  });

  test('/trajectory is not indexable by search engines', async ({ page }) => {
    // The route renders private local content to anonymous visitors, so noindex
    // has to be asserted on the page itself rather than on a login redirect. The
    // quiz stays the single indexable discovery surface.
    await page.goto('/trajectory');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });
});
