import { describe, expect, it } from 'vitest';

import {
  getPublicExperience,
  publicTimelineRecord,
  searchPublicExperiences,
  searchPublicHobbies,
} from './mcp-public';

describe('public MCP projections', () => {
  it('bounds and filters hobby results', () => {
    const result = searchPublicHobbies(new URLSearchParams({ facet: 'gentle', limit: '3' }));
    expect(result.items).toHaveLength(3);
    expect(result.items.every((item) => item.facets.includes('gentle'))).toBe(true);
    expect(result.nextOffset).toBe(3);
  });

  it('returns stable experience detail with bounded related records', () => {
    const search = searchPublicExperiences(new URLSearchParams({ q: 'marathon', limit: '5' }));
    expect(search.items.length).toBeGreaterThan(0);
    const item = getPublicExperience(search.items[0]!.slug);
    expect(item?.canonicalUrl).toContain('/experiences/');
    expect(item?.related.length).toBeLessThanOrEqual(6);
  });

  it('fails closed for non-public timeline records', () => {
    const base = {
      id: 'timeline-1',
      title: 'Visible title',
      slug: 'visible-title',
      phases: '[]',
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-02T00:00:00Z'),
      userName: 'Owner',
      userUsername: 'owner',
    };
    expect(publicTimelineRecord({ ...base, visibility: 'PRIVATE' })).toBeNull();
    expect(publicTimelineRecord({ ...base, visibility: 'UNLISTED' })).toBeNull();
    expect(publicTimelineRecord({ ...base, visibility: 'PUBLIC' })?.id).toBe('timeline-1');
  });

  it('normalizes legacy timestamps without failing the public timeline projection', () => {
    const base = {
      id: 'timeline-1',
      title: 'Visible title',
      visibility: 'PUBLIC',
      slug: 'visible-title',
      phases: '[]',
      userName: 'Owner',
      userUsername: 'owner',
    };

    expect(
      publicTimelineRecord({
        ...base,
        createdAt: 1_767_225_600,
        updatedAt: '2026-01-02T00:00:00.000Z',
      })
    ).toMatchObject({
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    });
    expect(
      publicTimelineRecord({
        ...base,
        createdAt: null,
        updatedAt: new Date('invalid'),
      })
    ).toMatchObject({ createdAt: null, updatedAt: null });
  });
});
