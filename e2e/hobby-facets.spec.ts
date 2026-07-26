import { expect, test } from '@playwright/test';

/**
 * Facet browsing on /hobbies. The ten categories answer "what kind of thing is
 * this"; facets answer "would this fit my life", which is the question someone
 * with limited mobility or a small budget is actually asking.
 */
test.describe('Hobby facets', () => {
  test('offers facet filters to a signed-out visitor', async ({ page }) => {
    await page.goto('/hobbies');
    await expect(page.getByRole('heading', { name: 'Browse by what suits you' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Gentle on the body' })).toBeVisible();
  });

  test('narrows conjunctively and can be cleared', async ({ page }) => {
    await page.goto('/hobbies');
    const status = page.getByText(/hobbies\. Pick a filter|match all/);
    const total = Number((await status.textContent())?.match(/^(\d+)/)?.[1]);
    expect(total).toBe(122);

    await page.getByRole('button', { name: 'Gentle on the body' }).click();
    const afterOne = Number((await status.textContent())?.match(/^(\d+)/)?.[1]);
    expect(afterOne).toBeLessThan(total);

    await page.getByRole('button', { name: 'Cheap to start' }).click();
    const afterTwo = Number((await status.textContent())?.match(/^(\d+)/)?.[1]);
    expect(afterTwo).toBeLessThanOrEqual(afterOne);

    await page.getByRole('button', { name: 'Clear' }).click();
    await expect(status).toContainText(`${total} hobbies`);
  });

  /** The reason the facets exist: an older visitor can find something. */
  test('gentle + cheap + screen-free leaves a usable set', async ({ page }) => {
    await page.goto('/hobbies');
    for (const label of ['Gentle on the body', 'Cheap to start', 'No screen']) {
      await page.getByRole('button', { name: label }).click();
    }
    const links = page
      .locator('section', { hasText: 'Browse by what suits you' })
      .getByRole('link');
    expect(await links.count()).toBeGreaterThan(8);
  });

  test('every result links to a hobby page that exists', async ({ page }) => {
    await page.goto('/hobbies');
    await page.getByRole('button', { name: 'Gentle on the body' }).click();
    const first = page
      .locator('section', { hasText: 'Browse by what suits you' })
      .getByRole('link')
      .first();
    const href = await first.getAttribute('href');
    expect(href).toMatch(/^\/hobbies\//);
    const res = await page.request.get(href as string);
    expect(res.status()).toBe(200);
  });
});
