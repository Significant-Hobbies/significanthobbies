import { describe, expect, it } from 'vitest';

import {
  columnsForVerifiedJournalContext,
  journalContextFromColumns,
  journalContextValue,
  parseJournalContextValue,
} from './journal-context';

describe('journal context', () => {
  it('round-trips timeline and commitment selector values', () => {
    const timeline = { kind: 'timeline' as const, id: 'timeline-1' };
    const commitment = { kind: 'commitment' as const, id: 'commitment-1' };

    expect(parseJournalContextValue(journalContextValue(timeline))).toEqual(timeline);
    expect(parseJournalContextValue(journalContextValue(commitment))).toEqual(commitment);
    expect(parseJournalContextValue('')).toBeNull();
  });

  it('rejects malformed selector values', () => {
    expect(() => parseJournalContextValue('hobby:guitar')).toThrow('Invalid journal context');
    expect(() => parseJournalContextValue('timeline:')).toThrow('Invalid journal context');
    expect(() => parseJournalContextValue('missing-separator')).toThrow('Invalid journal context');
  });

  it('maps exactly one stored context back to a reference', () => {
    expect(journalContextFromColumns('timeline-1', null)).toEqual({
      kind: 'timeline',
      id: 'timeline-1',
    });
    expect(journalContextFromColumns(null, 'commitment-1')).toEqual({
      kind: 'commitment',
      id: 'commitment-1',
    });
    expect(journalContextFromColumns(null, null)).toBeNull();
    expect(() => journalContextFromColumns('timeline-1', 'commitment-1')).toThrow(
      'more than one context'
    );
  });

  it('builds mutually exclusive persistence columns after ownership verification', () => {
    const timeline = { kind: 'timeline' as const, id: 'timeline-1' };
    const commitment = { kind: 'commitment' as const, id: 'commitment-1' };

    expect(columnsForVerifiedJournalContext(timeline, timeline)).toEqual({
      timelineId: 'timeline-1',
      commitmentId: null,
    });
    expect(columnsForVerifiedJournalContext(commitment, commitment)).toEqual({
      timelineId: null,
      commitmentId: 'commitment-1',
    });
    expect(columnsForVerifiedJournalContext(null, null)).toEqual({
      timelineId: null,
      commitmentId: null,
    });
  });

  it('rejects missing, mismatched, and cross-owner verification results', () => {
    const requested = { kind: 'timeline' as const, id: 'timeline-1' };

    expect(() => columnsForVerifiedJournalContext(requested, null)).toThrow(
      'Journal context not found'
    );
    expect(() =>
      columnsForVerifiedJournalContext(requested, {
        kind: 'timeline',
        id: 'another-users-timeline',
      })
    ).toThrow('Journal context not found');
    expect(() =>
      columnsForVerifiedJournalContext(requested, {
        kind: 'commitment',
        id: requested.id,
      })
    ).toThrow('Journal context not found');
  });
});
