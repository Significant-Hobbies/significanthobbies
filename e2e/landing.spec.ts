import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * The anonymous landing page, which is **Astro**, not Next.js
 * (decisions.md A1 — `run_worker_first` excludes `/`, so the Worker never sees
 * an anonymous `GET /`). Signed-in requests bypass the static asset in the
 * Worker and reach the private Next.js home. So the production landing itself
 * is exercised through the dedicated Astro project.
 *
 * This spec therefore runs only under the `landing` Playwright project, which
 * points at a built Astro preview. Every other project ignores it.
 *
 * It previously asserted "Discover your hobby story", nav links named
 * Discover / Explore / Quiz, and "What will your hobby story reveal?" — none of
 * which exist in `landing-astro/` OR in `src/app/page.tsx`. The copy had moved
 * on and the spec had been failing against both targets for a long time, unseen,
 * because CI never ran Playwright.
 */

test.describe('Landing page (Astro overlay)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('serves the hero as a real h1', async ({ page }) => {
    // Exactly one h1, and it is the hero — not the aria-hidden #lcp-shell that
    // paints the same words before hydration.
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    await expect(h1).toContainText('What will you do');
    await expect(h1).toContainText('with the time you have?');
  });

  test('uses the cinematic hero as a decorative, muted loop', async ({ page }) => {
    const video = page.locator('video.cinematic-hero__video');
    await expect(video).toHaveCount(1);
    await expect(video).toHaveAttribute('poster', '/hero/hobby-horizon-poster.jpg');
    await expect(video.locator('source')).toHaveAttribute('src', '/hero/hobby-horizon.mp4');
    await expect(video).toHaveAttribute('autoplay', '');
    await expect(video).toHaveAttribute('muted', '');
    await expect(video).toHaveAttribute('playsinline', '');
    await expect(video).toHaveAttribute('preload', 'auto');
    await expect(video).toHaveAttribute('width', '1280');
    await expect(video).toHaveAttribute('height', '720');

    const posterPreload = page.locator(
      'link[rel="preload"][as="image"][href="/hero/hobby-horizon-poster.jpg"]'
    );
    await expect(posterPreload).toHaveAttribute('type', 'image/jpeg');
    await expect(posterPreload).toHaveAttribute('fetchpriority', 'high');
  });

  test('states the no-signup promise, which the product actually honours', async ({ page }) => {
    // Load-bearing copy: /life-bingo, /timeline/new, the quiz and the calculators
    // all work with no account, and /daily and /trajectory now preview
    // (decisions.md A9). If this line goes, that claim needs revisiting.
    // Stated twice — once as the hero footnote, once inside the sub-headline —
    // so this asserts presence rather than uniqueness.
    await expect(page.getByText(/No sign-up required/i).first()).toBeVisible();
  });

  test('its calls to action point at surfaces that need no account', async ({ page }) => {
    const hrefs = await page
      .locator('a[href^="/"]')
      .evaluateAll((els) => els.map((e) => e.getAttribute('href')));
    expect(hrefs.length, 'the landing page should link somewhere').toBeGreaterThan(0);
    // Both destinations render for anonymous visitors; linking a guarded route
    // from the landing page would put a login wall in the primary funnel.
    expect(hrefs).toContain('/life-in-weeks');
    expect(hrefs).toContain('/timeline/new');
    expect(hrefs).toContain('/bucket-lists');
  });

  test('carries a title and description for crawlers', async ({ page }) => {
    expect(await page.title()).toContain('Significant Hobbies');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{40,}/);
  });

  test('is indexable — unlike the logged-in surfaces', async ({ page }) => {
    const robots = page.locator('meta[name="robots"]');
    if ((await robots.count()) > 0) {
      await expect(robots).not.toHaveAttribute('content', /noindex/);
    }
  });

  test('meets the automated accessibility baseline', async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
