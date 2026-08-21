import { describe, expect, it } from 'vitest';

import { LiveReadError, parseLiveReadQuery } from './personal-platform-live';

describe('Personal Platform Live reads', () => {
  it('bounds pagination and keeps sensitive fields opt-in', () => {
    const query = parseLiveReadQuery(
      new URL(
        'https://significanthobbies.com/api/personal-platform/live/records?start=2026-01-01&end=2028-12-31&q=Kyoto&limit=10&includeSensitive=true'
      )
    );
    expect(query).toEqual({
      q: 'Kyoto',
      startYear: 2026,
      endYear: 2028,
      limit: 10,
      offset: 0,
      includeSensitive: true,
    });
  });

  it('rejects invalid ranges and unbounded pages', () => {
    expect(() =>
      parseLiveReadQuery(
        new URL(
          'https://significanthobbies.com/api/personal-platform/live/records?start=2028&end=2026'
        )
      )
    ).toThrow(LiveReadError);
    expect(() =>
      parseLiveReadQuery(
        new URL('https://significanthobbies.com/api/personal-platform/live/records?limit=500')
      )
    ).toThrow(LiveReadError);
  });
});
