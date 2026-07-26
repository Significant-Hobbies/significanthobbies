import { expect, test } from '@playwright/test';

/**
 * The browsable corpus. Everything here must work without a session — this is
 * the surface that answers "what is possible", and gating it would repeat the
 * mistake the mortality frame had (decisions.md A9).
 */
test.describe('Experiences', () => {
  test('lists the whole corpus for a signed-out visitor', async ({ page }) => {
    await page.goto('/experiences');
    await expect(page).toHaveURL(/\/experiences$/);
    await expect(page.getByRole('heading', { name: 'Things you could do.' })).toBeVisible();
    await expect(page.getByText(/^\d+ of \d+$/)).toBeVisible();
    await expect(page.locator('main li').first()).toBeVisible();
  });

  test('exposes exactly one main landmark and one h1', async ({ page }) => {
    await page.goto('/experiences');
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('main#main h1')).toHaveCount(1);
  });

  test('search narrows the list and reports the count', async ({ page }) => {
    await page.goto('/experiences');
    const counter = page.getByText(/^\d+ of \d+$/);
    const before = Number((await counter.textContent())?.match(/^(\d+)/)?.[1]);

    await page.getByLabel('Search everything').fill('marathon');
    await expect(counter).not.toHaveText(`${before} of ${before}`);
    const after = Number((await counter.textContent())?.match(/^(\d+)/)?.[1]);
    expect(after).toBeGreaterThan(0);
    expect(after).toBeLessThan(before);
  });

  test('a filter that matches nothing says so rather than showing an empty page', async ({
    page,
  }) => {
    await page.goto('/experiences');
    await page.getByLabel('Search everything').fill('zzzzqqqq');
    await expect(page.getByText(/Nothing matches that/)).toBeVisible();
  });

  test('category and kind filters compose', async ({ page }) => {
    await page.goto('/experiences');
    await page.getByRole('button', { name: 'Places' }).click();
    await page.getByRole('button', { name: 'Travel', exact: true }).click();
    const counter = page.getByText(/^\d+ of \d+$/);
    const shown = Number((await counter.textContent())?.match(/^(\d+)/)?.[1]);
    // Every destination is travel, so this is the destination count.
    expect(shown).toBe(75);
  });

  test('opens a detail page with a first step and a working cross-reference', async ({ page }) => {
    await page.goto('/experiences/stonehenge-england');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Stonehenge');
    await expect(page.getByRole('heading', { name: 'How you would actually start' })).toBeVisible();
    await expect(page.locator('ol li')).not.toHaveCount(0);

    // The famous cross-reference points at a bucket list, not a journey.
    const href = await page.getByRole('link', { name: 'Barack Obama' }).getAttribute('href');
    expect(href).toBe('/bucket-lists/barack-obama');
    const res = await page.request.get(href as string);
    expect(res.status()).toBe(200);
  });

  /**
   * Entries with no written description deliberately have no page — 150 pages
   * whose only unique content is their own heading would be thin, and thin
   * pages are a site-wide signal.
   */
  test('a title-only idea has no page, and neither does a nonsense slug', async ({ page }) => {
    for (const slug of ['see-the-northern-lights-in-iceland-or-norway', 'not-a-real-thing']) {
      const res = await page.request.get(`/experiences/${slug}`, { failOnStatusCode: false });
      expect(res.status(), slug).toBe(404);
    }
  });

  test('onward links from a detail page actually go somewhere', async ({ page }) => {
    await page.goto('/experiences/stonehenge-england');
    const related = page
      .getByRole('heading', { name: 'If this appeals, so might these' })
      .locator('xpath=following-sibling::ul[1]')
      .getByRole('link');
    await expect(related.first()).toBeVisible();
    const href = await related.first().getAttribute('href');
    expect(href).toMatch(/^\/experiences\//);
  });
});
