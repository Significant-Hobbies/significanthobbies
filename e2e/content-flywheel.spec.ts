import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const ARTICLE_PATH = '/blog/side-quests';
const ARTICLE_URL = `https://significanthobbies.com${ARTICLE_PATH}`;

test.describe('Significant content discovery routes', () => {
  test('publishes canonical SEO and source-aligned Article structured data', async ({ page }) => {
    await page.goto(ARTICLE_PATH);

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', ARTICLE_URL);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', ARTICLE_URL);

    const structuredData = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((scripts) => scripts.map((script) => JSON.parse(script.textContent ?? '{}')));
    const article = structuredData.find((entry) => entry['@type'] === 'Article');
    expect(article).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Article',
      mainEntityOfPage: ARTICLE_URL,
    });
    expect(article.headline).toBe(await page.locator('h1').textContent());
    expect(structuredData.some((entry) => entry['@type'] === 'VideoObject')).toBe(false);
  });

  test('negotiates the LLM index as Markdown and exposes valid video discovery XML', async ({
    request,
  }) => {
    const markdown = await request.get('/llms-full.txt', {
      headers: { Accept: 'text/markdown' },
    });
    expect(markdown.ok()).toBe(true);
    expect(markdown.headers()['content-type']).toContain('text/markdown');
    expect(markdown.headers().vary).toContain('Accept');
    expect(await markdown.text()).toContain('](https://significanthobbies.com/blog/side-quests):');

    const videoSitemap = await request.get('/video-sitemap.xml');
    expect(videoSitemap.ok()).toBe(true);
    expect(videoSitemap.headers()['content-type']).toContain('application/xml');
    expect(await videoSitemap.text()).toMatch(
      /^<\?xml version="1\.0" encoding="UTF-8"\?><urlset[^>]+><\/urlset>$/
    );
  });

  test('uses actual permanent redirects for retired video destinations', async ({ request }) => {
    const index = await request.get('/videos', { maxRedirects: 0 });
    expect(index.status()).toBe(308);
    expect(index.headers().location).toBe('/blog');

    const detail = await request.get('/videos/side-quests', { maxRedirects: 0 });
    expect(detail.status()).toBe(308);
    expect(detail.headers().location).toBe('/blog/side-quests');
  });

  test('keeps affected pages accessible and landmark-complete', async ({ page }) => {
    for (const path of ['/blog', ARTICLE_PATH]) {
      await page.goto(path);
      await page.addStyleTag({
        content: `
          *, *::before, *::after {
            animation: none !important;
            transition: none !important;
          }
          [style*="opacity"] { opacity: 1 !important; }
          [class*="scroll-reveal"] {
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
          }
        `,
      });
      await expect(page.locator('main#main')).toHaveCount(1);
      await expect(page.locator('main#main h1')).toHaveCount(1);
      await expect(page.getByRole('navigation')).toBeVisible();
      await expect(page.getByRole('contentinfo')).toBeVisible();

      const results = await new AxeBuilder({ page }).exclude('iframe').analyze();
      expect(results.violations).toEqual([]);
    }
  });

  test('does not introduce horizontal overflow at phone, tablet, or desktop widths', async ({
    page,
  }) => {
    for (const viewport of [
      { width: 320, height: 740 },
      { width: 768, height: 1024 },
      { width: 1440, height: 900 },
    ]) {
      await page.setViewportSize(viewport);
      for (const path of ['/blog', ARTICLE_PATH]) {
        await page.goto(path);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        );
        expect(overflow, `${path} overflow at ${viewport.width}px`).toBeLessThanOrEqual(1);
      }
    }
  });
});
