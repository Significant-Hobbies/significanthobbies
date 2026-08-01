import { expect, test } from '@playwright/test';

test.describe('Daily ritual & manifesto', () => {
  test('/daily provides a local ritual instead of walling it off', async ({ page }) => {
    const res = await page.goto('/daily');
    expect(res?.status()).toBeLessThan(400);
    expect(page.url()).not.toContain('/login');
    await expect(page.getByLabel('Preview notice')).toHaveCount(0);
    await expect(page.locator('#daily-journal-entry')).toBeVisible();
  });

  test('/daily restores anonymous habits and journal writing after reload', async ({ page }) => {
    await page.goto('/daily');
    await page.getByRole('button', { name: 'Manage' }).click();
    await page.getByPlaceholder('Habit name (e.g. Read 20 pages)').fill('Walk after lunch');
    await page.getByRole('button', { name: 'Add habit' }).click();
    await expect(page.getByText('Walk after lunch')).toBeVisible();

    await page.locator('#daily-journal-entry').fill('I made room for a slower afternoon.');
    await page.getByRole('button', { name: /Save (morning|evening)/ }).click();
    await page.reload();
    await expect(page.getByText('Walk after lunch')).toBeVisible();
    await expect(page.locator('#daily-journal-entry')).toHaveValue(
      'I made room for a slower afternoon.'
    );
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
    // Scoped to the article: the nav also carries a "Find a Hobby" link, and an
    // unscoped accessible-name lookup matched both and failed strict mode.
    const article = page.locator('article');

    const hobbiesLink = article.getByRole('link', { name: 'Find a hobby' });
    await expect(hobbiesLink).toBeVisible();
    // "Working" should mean it points somewhere, not merely that it renders.
    // /hobbies is deliberately deep-link-only (see docs/product/discovery-funnel.md)
    // — reachable from here, absent from nav and footer.
    await expect(hobbiesLink).toHaveAttribute('href', '/hobbies');

    const bucketListLink = article.getByRole('link', { name: 'Start a bucket list' });
    await expect(bucketListLink).toBeVisible();
    await expect(bucketListLink).toHaveAttribute('href', '/bucket-lists');
  });

  test('nav includes Daily link', async ({ page }) => {
    await page.goto('/hobbies');
    if (!(await page.getByRole('link', { name: 'Daily', exact: true }).first().isVisible())) {
      await page.getByRole('button', { name: 'Open menu' }).click();
    }
    await expect(page.getByRole('link', { name: 'Daily' }).first()).toBeVisible();
  });

  test('footer includes Daily section', async ({ page }) => {
    await page.goto('/hobbies');
    await expect(page.getByText("Today's ritual")).toBeVisible();
  });
});
