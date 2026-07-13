import { describe, expect, it } from 'vitest';

import { editorialArticles, getEditorialArticle } from './editorial-content';

describe('editorial content adapter', () => {
  it('keeps one canonical article for every slug', () => {
    const slugs = editorialArticles.map((article) => article.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('preserves legacy blog detail lookup', () => {
    const legacy = editorialArticles.find((article) => !article.package);
    expect(legacy).toBeDefined();
    expect(getEditorialArticle(legacy!.slug)).toEqual(legacy);
  });
});
