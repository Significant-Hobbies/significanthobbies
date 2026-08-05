import { expect, test } from '@playwright/test';

test.describe('SEO', () => {
  test('homepage has correct meta tags', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title).toContain('Significant Hobbies');
  });

  test('pillar page exists', async ({ page }) => {
    await page.goto('/what-are-significant-hobbies');
    await expect(page.locator('h1')).toContainText('Significant Hobbies');
  });

  test('sitemap is accessible', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    expect(response?.status()).toBe(200);
  });

  test('robots.txt is accessible', async ({ page }) => {
    const response = await page.goto('/robots.txt');
    expect(response?.status()).toBe(200);
  });

  // Every one of these pages exists to rank. All eleven shipped with **no
  // `<h1>` at all**: their hero used TextGenerateEffect, which rendered a
  // `motion.div`, so the single most important on-page element was absent.
  const SEO_PAGES = [
    '/journeys',
    '/bucket-lists',
    '/what-are-significant-hobbies',
    '/hobbies-for-adults',
    '/hobbies-for-resume',
    '/hobbies-for-mental-health',
    '/hobbies-to-try',
    '/cheap-hobbies',
    '/bucket-list-before-30',
    '/bucket-list-before-50',
    '/travel-bucket-list',
  ] as const;

  for (const route of SEO_PAGES) {
    test(`${route} has exactly one h1`, async ({ page }) => {
      const res = await page.goto(route);
      expect(res?.status(), `${route} should render`).toBeLessThan(400);
      await expect(page.locator('h1'), `${route} needs exactly one h1`).toHaveCount(1);
      await expect(page.locator('h1')).not.toBeEmpty();
    });
  }

  // /journeys and /journeys/[slug] were in the middleware's PROTECTED_PREFIXES,
  // so every anonymous visitor and crawler was bounced to /login — despite being
  // a static catalog of famous people with no session or DB access, and despite
  // docs/product/discovery-funnel.md promising these stay reachable via SEO.
  for (const route of ['/journeys', '/journeys/steve-jobs', '/hobbies', '/explore'] as const) {
    test(`${route} is reachable without a session`, async ({ page }) => {
      const res = await page.goto(route);
      expect(res?.status()).toBeLessThan(400);
      expect(page.url(), `${route} must not redirect to login`).not.toContain('/login');
    });
  }

  test('protected pages have noindex', async ({ page }) => {
    await page.goto('/login');
    const robotsMeta = page.locator('meta[name="robots"]');
    if ((await robotsMeta.count()) > 0) {
      const content = await robotsMeta.getAttribute('content');
      expect(content).toContain('noindex');
    }
  });
});
