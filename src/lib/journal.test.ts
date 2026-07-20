import { describe, expect, it } from 'vitest';

import { buildJournalDateWindow, hasJournalContent } from './journal';

describe('journal', () => {
  describe('buildJournalDateWindow', () => {
    it('returns an ascending window ending on today', () => {
      expect(buildJournalDateWindow('2026-07-20', 4)).toEqual([
        '2026-07-17',
        '2026-07-18',
        '2026-07-19',
        '2026-07-20',
      ]);
    });

    it('crosses month and year boundaries in UTC', () => {
      expect(buildJournalDateWindow('2026-01-02', 4)).toEqual([
        '2025-12-30',
        '2025-12-31',
        '2026-01-01',
        '2026-01-02',
      ]);
    });

    it('rejects malformed dates and invalid lengths', () => {
      expect(() => buildJournalDateWindow('July 20, 2026')).toThrow();
      expect(() => buildJournalDateWindow('2026-02-31')).toThrow();
      expect(() => buildJournalDateWindow('2026-07-20', 0)).toThrow();
    });
  });

  describe('hasJournalContent', () => {
    it('accepts meaningful AM or PM writing', () => {
      expect(hasJournalContent({ amEntry: 'Begin gently.', pmEntry: null })).toBe(true);
      expect(hasJournalContent({ amEntry: null, pmEntry: 'Kept going.' })).toBe(true);
    });

    it('treats missing and whitespace-only entries as unwritten', () => {
      expect(hasJournalContent(null)).toBe(false);
      expect(hasJournalContent({ amEntry: '   ', pmEntry: '\n' })).toBe(false);
    });
  });
});
