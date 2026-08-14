import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');
const sitemapSource = readSource('src/app/sitemap.ts');

function staticSitemapRoutes() {
  return [...sitemapSource.matchAll(/url: `\$\{baseUrl\}(\/[^`$]+)`/g)].map((match) => match[1]);
}

describe('sitemap canonical contract', () => {
  it('keeps machine-readable discovery resources out of the HTML sitemap', () => {
    for (const resource of ['/llms.txt', '/llms-full.txt', '/index.md']) {
      expect(sitemapSource).not.toContain(`url: \`\${baseUrl}${resource}\``);
    }
  });

  it('gives every literal HTML sitemap route an explicit canonical', () => {
    for (const route of staticSitemapRoutes()) {
      const routeDirectory = join('src/app', route.slice(1));
      const metadataSources = ['page.tsx', 'layout.tsx']
        .map((file) => join(routeDirectory, file))
        .filter((file) => existsSync(file))
        .map(readSource)
        .join('\n');

      expect(metadataSources, `${route} must resolve to an App Router page`).not.toBe('');
      expect(metadataSources, `${route} must declare its own canonical`).toMatch(/canonical\s*:/);
    }
  });

  it('covers the root and dynamic sitemap route families', () => {
    const homeSource = readSource('src/app/page.tsx');
    expect(homeSource).toContain("canonical: 'https://significanthobbies.com'");
    expect(homeSource).not.toMatch(/robots\s*:\s*\{\s*index:\s*false/);

    for (const routeSource of [
      'src/app/hobbies/category/[category]/page.tsx',
      'src/app/u/[username]/page.tsx',
    ]) {
      expect(readSource(routeSource), `${routeSource} must declare a dynamic canonical`).toMatch(
        /canonical\s*:/
      );
    }
  });
});
