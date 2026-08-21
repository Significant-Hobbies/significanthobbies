import { describe, expect, it } from 'vitest';

import { buildPersonalDataInventory } from './personal-data-inventory';

describe('buildPersonalDataInventory', () => {
  it('maps the Personal Platform snapshot in a stable product order', () => {
    const inventory = buildPersonalDataInventory({
      generatedAt: '2026-08-21T10:00:00.000Z',
      source: 'personal-platform',
      summaries: [
        {
          domain: 'journal',
          activeCount: 2,
          lastUpdatedAt: '2026-08-21T09:00:00.000Z',
          latest: { occurredOn: '2026-08-21', body: 'private writing' },
          source: 'personal-platform',
        },
        {
          domain: 'live',
          activeCount: 1,
          lastUpdatedAt: '2026-08-20T09:00:00.000Z',
          latest: { title: 'See the northern lights', notes: 'private plans' },
          source: 'personal-platform',
        },
        {
          domain: 'calorie',
          status: 'connected',
          source: 'calorie-service',
          summary: {
            entryCount: 3,
            lastUpdatedAt: '2026-08-21T08:00:00.000Z',
            totals: { calories: 1240, proteinG: 86.5 },
          },
        },
      ],
    });

    expect(inventory.status).toBe('connected');
    expect(inventory.domains.map((domain) => domain.domain)).toEqual([
      'live',
      'journal',
      'habits',
      'calorie',
      'setline',
      'kith',
      'anchor',
    ]);
    expect(inventory.domains[0]).toMatchObject({
      count: 1,
      latestLabel: 'See the northern lights',
      status: 'connected',
    });
    expect(inventory.domains[1]).toMatchObject({
      count: 2,
      latestLabel: 'Entry from 2026-08-21',
    });
    expect(inventory.domains[3]).toMatchObject({
      count: 3,
      countScope: 'today',
      latestLabel: '1,240 kcal · 86.5 g protein',
    });
    expect(inventory.domains[2].status).toBe('unavailable');
  });

  it('does not carry journal bodies or relationship notes into the Hub model', () => {
    const inventory = buildPersonalDataInventory({
      summaries: [
        {
          domain: 'journal',
          activeCount: 1,
          latest: { occurredOn: '2026-08-21', body: 'do not render this journal body' },
          source: 'personal-platform',
        },
        {
          domain: 'kith',
          activeCount: 1,
          latest: {
            personName: 'Rahul',
            kind: 'conversation',
            note: 'do not render this relationship note',
          },
          source: 'personal-platform',
        },
      ],
    });
    const renderedModel = JSON.stringify(inventory);

    expect(renderedModel).not.toContain('do not render this journal body');
    expect(renderedModel).not.toContain('do not render this relationship note');
    expect(renderedModel).toContain('Entry from 2026-08-21');
    expect(renderedModel).toContain('Interaction with Rahul');
  });

  it('fails closed on a malformed response', () => {
    const inventory = buildPersonalDataInventory({ source: 'personal-platform' });

    expect(inventory.status).toBe('unavailable');
    expect(inventory.domains).toHaveLength(7);
    expect(inventory.domains.every((domain) => domain.status === 'unavailable')).toBe(true);
  });
});
