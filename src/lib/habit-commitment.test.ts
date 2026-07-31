import { describe, expect, it } from 'vitest';

import {
  habitCommitmentIdForVerifiedTarget,
  habitCommitmentLabel,
  parseHabitCommitmentValue,
} from './habit-commitment';

describe('habit commitment link', () => {
  it('keeps an explicit verified commitment id', () => {
    expect(habitCommitmentIdForVerifiedTarget('commitment-1', 'commitment-1')).toBe('commitment-1');
  });

  it('keeps an omitted choice unlinked instead of inferring a target', () => {
    expect(parseHabitCommitmentValue('')).toBeNull();
    expect(habitCommitmentIdForVerifiedTarget(null, null)).toBeNull();
  });

  it('rejects missing and cross-owner verification results', () => {
    expect(() => habitCommitmentIdForVerifiedTarget('commitment-1', null)).toThrow(
      'Habit commitment not found'
    );
    expect(() =>
      habitCommitmentIdForVerifiedTarget('commitment-1', 'another-users-commitment')
    ).toThrow('Habit commitment not found');
  });

  it('normalizes selector input and rejects unbounded ids', () => {
    expect(parseHabitCommitmentValue('  commitment-1  ')).toBe('commitment-1');
    expect(() => parseHabitCommitmentValue('x'.repeat(129))).toThrow('Invalid habit commitment');
  });

  it('builds a stable private-plan label', () => {
    expect(habitCommitmentLabel('Guitar', 30)).toBe('Guitar · 30-day commitment');
    expect(habitCommitmentLabel('  ', 7)).toBe('Untitled hobby · 7-day commitment');
  });
});
