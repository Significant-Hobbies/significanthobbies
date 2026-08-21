import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import {
  buildPersonalDataInventory,
  unavailablePersonalDataInventory,
} from '~/lib/personal-data-inventory';

import { PersonalDataInventory } from './personal-data-inventory';

describe('PersonalDataInventory', () => {
  it('renders connected counts and provenance without raw payloads', () => {
    const inventory = buildPersonalDataInventory({
      generatedAt: '2026-08-21T10:00:00.000Z',
      source: 'personal-platform',
      summaries: [
        {
          domain: 'journal',
          activeCount: 2,
          lastUpdatedAt: '2026-08-21T09:00:00.000Z',
          latest: { occurredOn: '2026-08-21', body: 'private journal body' },
          source: 'personal-platform',
        },
      ],
    });

    const html = renderToString(<PersonalDataInventory inventory={inventory} />);

    expect(html).toContain('Platform read confirmed');
    expect(html).toContain('2 records');
    expect(html).toContain('Personal Platform D1');
    expect(html).not.toContain('private journal body');
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
