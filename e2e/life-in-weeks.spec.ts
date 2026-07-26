import { expect, test } from '@playwright/test';

/**
 * `/life-in-weeks` is the anonymous front door: the mortality frame used to be
 * reachable only from the dashboard, which meant the most affecting thing the
 * product does sat behind Google OAuth. These tests hold that door open.
 */
test.describe('Life in weeks', () => {
  test('exposes exactly one main landmark', async ({ page }) => {
    await page.goto('/life-in-weeks');
    // app/layout.tsx wraps every page in <main id="main">. This page rendered
    // its own <main> inside that, nesting two landmarks so a screen reader was
    // offered a choice between them. Caught on production, not by the existing
    // axe check — that asserts on `main#main`, which a nested unnamed <main>
    // leaves at a count of one.
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('main#main h1')).toHaveCount(1);
  });

  test('renders and computes for a signed-out visitor', async ({ page }) => {
    await page.goto('/life-in-weeks');

    // No redirect to /login — the whole point.
    await expect(page).toHaveURL(/\/life-in-weeks$/);
    await expect(page.getByRole('heading', { name: 'Your life, in weeks.' })).toBeVisible();

    await page.getByLabel('What year were you born?').fill('1990');
    await page.getByRole('button', { name: 'Show me' }).click();

    await expect(page.getByText(/That leaves roughly/)).toBeVisible();
    await expect(page.getByText(/Saturdays\./)).toBeVisible();
    await expect(page).toHaveURL(/\/life-in-weeks$/);
  });

  /**
   * The regression this page was rebuilt around. Subtracting age from a fixed
   * 77-year average told a 64-year-old they had ~12 summers left; the real
   * figure is around 21. Wrong, and wrong in the cruellest available direction.
   */
  test('gives an older visitor a truthful number of summers', async ({ page }) => {
    await page.goto('/life-in-weeks');
    await page.getByLabel('What year were you born?').fill('1962');
    await page.getByRole('button', { name: 'Show me' }).click();

    const summers = page.getByText(/\d+ summers/);
    await expect(summers).toBeVisible();

    const text = (await summers.textContent()) ?? '';
    const count = Number(text.match(/(\d+) summers/)?.[1]);
    expect(count).toBeGreaterThan(15);
    expect(count).toBeLessThan(25);
  });

  test('never shows a zero, however old the visitor', async ({ page }) => {
    await page.goto('/life-in-weeks');
    await page.getByLabel('What year were you born?').fill('1930');
    await page.getByRole('button', { name: 'Show me' }).click();

    await expect(page.getByText(/That leaves roughly/)).toBeVisible();
    await expect(page.getByText(/roughly 0 Saturdays/)).toHaveCount(0);
    await expect(page.getByText(/\b0 summers/)).toHaveCount(0);
  });

  test('rejects a non-year instead of drawing a bogus grid', async ({ page }) => {
    await page.goto('/life-in-weeks');
    await page.getByLabel('What year were you born?').fill('banana');
    await page.getByRole('button', { name: 'Show me' }).click();

    // Scoped by id: Next's own route announcer is also role="alert".
    await expect(page.locator('#birth-year-error')).toBeVisible();
    await expect(page.getByText(/That leaves roughly/)).toHaveCount(0);
  });

  test('remembers the year on a return visit, with no account', async ({ page }) => {
    await page.goto('/life-in-weeks');
    await page.getByLabel('What year were you born?').fill('1975');
    await page.getByRole('button', { name: 'Show me' }).click();
    await expect(page.getByText(/That leaves roughly/)).toBeVisible();

    await page.reload();
    await expect(page.getByLabel('What year were you born?')).toHaveValue('1975');
    await expect(page.getByText(/That leaves roughly/)).toBeVisible();
  });

  test('offers only routes that work without signing in', async ({ page }) => {
    await page.goto('/life-in-weeks');
    await page.getByLabel('What year were you born?').fill('1990');
    await page.getByRole('button', { name: 'Show me' }).click();

    for (const name of [/Find something to do/, /List what you still want to do/]) {
      const href = await page.getByRole('link', { name }).getAttribute('href');
      expect(href).toBeTruthy();
      const res = await page.request.get(href as string);
      expect(res.status(), `${href} must render for a guest`).toBe(200);
      expect(res.url(), `${href} must not bounce to /login`).not.toContain('/login');
    }
  });
});
