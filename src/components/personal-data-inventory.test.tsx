import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import {
  buildPersonalDataInventory,
  unavailablePersonalDataInventory,
} from '~/lib/personal-data-inventory';

import { PersonalDataInventory } from './personal-data-inventory';

describe('PersonalDataInventory', () => {
  it('renders connected counts and provenance without raw payloads', () => {
    const inventory = buildPersonalDataInventory(
      {
        generatedAt: '2026-08-21T10:00:00.000Z',
        source: 'personal-platform',
        summaries: [
          {
            domain: 'live',
            activeCount: 1,
            lastUpdatedAt: '2026-08-21T08:00:00.000Z',
            latest: { title: 'See the northern lights' },
            source: 'significant-hobbies-service',
          },
          {
            domain: 'journal',
            activeCount: 2,
            lastUpdatedAt: '2026-08-21T09:00:00.000Z',
            latest: { occurredOn: '2026-08-21', body: 'private journal body' },
            source: 'personal-platform',
          },
        ],
      },
      {
        items: [
          {
            id: 'event-1',
            domain: 'journal',
            eventType: 'journal.updated',
            occurredAt: '2026-08-21T09:00:00.000Z',
            summary: 'private activity summary',
          },
        ],
      }
    );

    const html = renderToString(<PersonalDataInventory inventory={inventory} />);

    expect(html).toContain('Platform read confirmed');
    expect(html).toContain('2 records');
    expect(html).toContain('Personal Platform D1');
    expect(html).toContain('Significant Hobbies D1 connector');
    expect(html).not.toContain('private journal body');
    expect(html).toContain('Recent sync activity');
    expect(html).toContain('Journal</span> record');
    expect(html).toContain('updated');
    expect(html).not.toContain('private activity summary');
  });

  it('renders an honest non-empty failure state', () => {
    const html = renderToString(
      <PersonalDataInventory inventory={unavailablePersonalDataInventory()} />
    );

    expect(html).toContain('Platform read unavailable');
    expect(html).toContain('The directory is still available.');
    expect(html).not.toContain('0 records');
  });
});
