import { describe, expect, it } from 'vitest';

import { sitemapLastModified } from './sitemap-last-modified';

describe('sitemapLastModified', () => {
  const fallback = new Date('2026-08-01T00:00:00.000Z');

  it('preserves valid dates and parses epoch timestamps', () => {
    const date = new Date('2026-07-31T12:00:00.000Z');

    expect(sitemapLastModified(date, fallback)).toBe(date);
    expect(sitemapLastModified(1_785_604_560, fallback).toISOString()).toBe(
      '2026-08-01T17:16:00.000Z'
    );
    expect(sitemapLastModified('1785604560000', fallback).toISOString()).toBe(
      '2026-08-01T17:16:00.000Z'
    );
  });

  it('falls back when migrated values cannot produce a valid date', () => {
    expect(sitemapLastModified(new Date('invalid'), fallback)).toBe(fallback);
    expect(sitemapLastModified('not-a-date', fallback)).toBe(fallback);
    expect(sitemapLastModified(null, fallback)).toBe(fallback);
  });
});
