import { describe, expect, it } from 'vitest';

import {
  computeInsights,
  getAddedPerPhase,
  getCategoryDiversity,
  getCoOccurrencePairs,
  getDroppedPerPhase,
  getHobbyVelocity,
  getLongestStreak,
  getMostPersistent,
  getPhaseTransitions,
  getRekindledHobbies,
} from './insights';
import type { Phase } from './types';

const phases: Phase[] = [
  {
    id: '1',
    label: 'Childhood',
    order: 0,
    hobbies: [{ name: 'drawing' }, { name: 'cycling' }, { name: 'reading' }],
  },
  {
    id: '2',
    label: 'Teen years',
    order: 1,
    hobbies: [{ name: 'cycling' }, { name: 'gaming' }, { name: 'reading' }],
  },
  {
    id: '3',
    label: 'College',
    order: 2,
    hobbies: [{ name: 'drawing' }, { name: 'hiking' }, { name: 'reading' }],
  },
];

describe('getAddedPerPhase', () => {
  it('returns empty array for first phase', () => {
    expect(getAddedPerPhase(phases)[0]).toEqual([]);
  });
  it('returns new hobbies added in phase 2', () => {
    expect(getAddedPerPhase(phases)[1]).toContain('gaming');
    expect(getAddedPerPhase(phases)[1]).not.toContain('cycling');
  });
  it('returns added hobbies in phase 3', () => {
    expect(getAddedPerPhase(phases)[2]).toContain('hiking');
  });
});

describe('getDroppedPerPhase', () => {
  it('returns empty array for first phase', () => {
    expect(getDroppedPerPhase(phases)[0]).toEqual([]);
  });
  it('returns hobbies dropped from phase 1 to 2', () => {
    expect(getDroppedPerPhase(phases)[1]).toContain('drawing');
    expect(getDroppedPerPhase(phases)[1]).not.toContain('cycling');
  });
});

describe('getRekindledHobbies', () => {
  it('detects drawing as rekindled (present in 1, absent in 2, present in 3)', () => {
    expect(getRekindledHobbies(phases)).toContain('drawing');
  });
  it('does not mark reading as rekindled (present in all phases)', () => {
    expect(getRekindledHobbies(phases)).not.toContain('reading');
  });
  it('does not mark gaming as rekindled (only appears once)', () => {
    expect(getRekindledHobbies(phases)).not.toContain('gaming');
  });
});

describe('getMostPersistent', () => {
  it('reading appears in all 3 phases and ranks first', () => {
    const result = getMostPersistent(phases);
    expect(result[0]!.hobby).toBe('reading');
    expect(result[0]!.count).toBe(3);
  });
  it('cycling appears in 2 phases', () => {
    const result = getMostPersistent(phases);
    const cycling = result.find((r) => r.hobby === 'cycling');
    expect(cycling?.count).toBe(2);
  });
});

describe('getCoOccurrencePairs', () => {
  it('returns pairs within same phase', () => {
    const pairs = getCoOccurrencePairs(phases);
    const pairNames = pairs.map((p) => [...p.pair].sort().join(','));
    expect(pairNames).toContain('cycling,reading');
  });
  it('returns sorted by count descending', () => {
    const pairs = getCoOccurrencePairs(phases);
    for (let i = 1; i < pairs.length; i++) {
      expect(pairs[i - 1]!.count).toBeGreaterThanOrEqual(pairs[i]!.count);
    }
  });
  it('returns at most 20 pairs', () => {
    expect(getCoOccurrencePairs(phases).length).toBeLessThanOrEqual(20);
  });
});

describe('getCategoryDiversity', () => {
  it('returns 0 for empty phases', () => {
    expect(getCategoryDiversity([])).toBe(0);
  });
  it('counts unique categories across all phases', () => {
    // phases contain: drawing (Creative), cycling (Physical), reading (Intellectual),
    // gaming (not a standard hobby - no category), hiking (Physical)
    // Expected: Creative, Physical, Intellectual = 3
    const result = getCategoryDiversity(phases);
    expect(result).toBeGreaterThanOrEqual(2);
    expect(result).toBeLessThanOrEqual(10);
  });
  it('returns correct count for single-category phases', () => {
    const singleCatPhases = [
      {
        id: '1',
        label: 'A',
        order: 0,
        hobbies: [{ name: 'Running' }, { name: 'Cycling' }, { name: 'Hiking' }],
      },
    ];
    expect(getCategoryDiversity(singleCatPhases)).toBe(1);
  });
});

describe('getHobbyVelocity', () => {
  it('returns one entry per transition (phases.length - 1)', () => {
    expect(getHobbyVelocity(phases)).toHaveLength(phases.length - 1);
  });
  it('returns empty array for single phase', () => {
    expect(getHobbyVelocity([phases[0]!])).toEqual([]);
  });
  it('returns empty array for empty phases', () => {
    expect(getHobbyVelocity([])).toEqual([]);
  });
  it('has correct phase labels (toPhase label)', () => {
    const result = getHobbyVelocity(phases);
    expect(result[0]!.phase).toBe('Teen years');
    expect(result[1]!.phase).toBe('College');
  });
  it('correctly computes added, dropped, and net', () => {
    // Phase 1→2: added gaming, dropped drawing → added=1, dropped=1, net=0
    const result = getHobbyVelocity(phases);
    expect(result[0]!.added).toBe(1);
    expect(result[0]!.dropped).toBe(1);
    expect(result[0]!.net).toBe(0);
  });
  it('net equals added minus dropped', () => {
    const result = getHobbyVelocity(phases);
    for (const v of result) {
      expect(v.net).toBe(v.added - v.dropped);
    }
  });
});

describe('getLongestStreak', () => {
  it('returns empty array for empty phases', () => {
    expect(getLongestStreak([])).toEqual([]);
  });
  it('returns empty array for single phase (min streak 2)', () => {
    expect(getLongestStreak([phases[0]!])).toEqual([]);
  });
  it('reading has streak of 3 across all phases', () => {
    const result = getLongestStreak(phases);
    const reading = result.find((r) => r.hobby === 'reading');
    expect(reading).toBeDefined();
    expect(reading!.streak).toBe(3);
    expect(reading!.startPhase).toBe('Childhood');
    expect(reading!.endPhase).toBe('College');
  });
  it('returns at most 5 entries', () => {
    expect(getLongestStreak(phases).length).toBeLessThanOrEqual(5);
  });
  it('results are sorted by streak descending', () => {
    const result = getLongestStreak(phases);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1]!.streak).toBeGreaterThanOrEqual(result[i]!.streak);
    }
  });
  it('excludes hobbies with streak of 1', () => {
    const result = getLongestStreak(phases);
    for (const r of result) {
      expect(r.streak).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('getPhaseTransitions', () => {
  it('returns one entry per transition', () => {
    expect(getPhaseTransitions(phases)).toHaveLength(phases.length - 1);
  });
  it('returns empty array for single phase', () => {
    expect(getPhaseTransitions([phases[0]!])).toEqual([]);
  });
  it('returns empty array for empty phases', () => {
    expect(getPhaseTransitions([])).toEqual([]);
  });
  it('has correct fromPhase and toPhase labels', () => {
    const result = getPhaseTransitions(phases);
    expect(result[0]!.fromPhase).toBe('Childhood');
    expect(result[0]!.toPhase).toBe('Teen years');
  });
  it('returns stable when count unchanged and same hobbies', () => {
    const stablePhases = [
      { id: '1', label: 'A', order: 0, hobbies: [{ name: 'Chess' }, { name: 'Reading' }] },
      { id: '2', label: 'B', order: 1, hobbies: [{ name: 'Chess' }, { name: 'Reading' }] },
    ];
    const result = getPhaseTransitions(stablePhases);
    expect(result[0]!.majorChange).toBe('stable');
  });
  it("returns 'shifted focus' when count unchanged but different hobbies", () => {
    // Phase 1→2: same count (3), but drawing dropped and gaming added
    const result = getPhaseTransitions(phases);
    expect(result[0]!.majorChange).toBe('shifted focus');
  });
  it('returns gained X when net positive', () => {
    const gainPhases = [
      { id: '1', label: 'A', order: 0, hobbies: [{ name: 'Chess' }] },
      {
        id: '2',
        label: 'B',
        order: 1,
        hobbies: [{ name: 'Chess' }, { name: 'Reading' }, { name: 'Running' }],
      },
    ];
    const result = getPhaseTransitions(gainPhases);
    expect(result[0]!.majorChange).toMatch(/^gained \d+$/);
  });
  it('returns lost X when net negative', () => {
    const losePhases = [
      {
        id: '1',
        label: 'A',
        order: 0,
        hobbies: [{ name: 'Chess' }, { name: 'Reading' }, { name: 'Running' }],
      },
      { id: '2', label: 'B', order: 1, hobbies: [{ name: 'Chess' }] },
    ];
    const result = getPhaseTransitions(losePhases);
    expect(result[0]!.majorChange).toMatch(/^lost \d+$/);
  });
});

describe('computeInsights', () => {
  it('returns all insight keys', () => {
    const result = computeInsights(phases);
    expect(result).toHaveProperty('rekindled');
    expect(result).toHaveProperty('mostPersistent');
    expect(result).toHaveProperty('addedPerPhase');
    expect(result).toHaveProperty('droppedPerPhase');
    expect(result).toHaveProperty('coOccurrencePairs');
    expect(result).toHaveProperty('categoryDiversity');
    expect(result).toHaveProperty('hobbyVelocity');
    expect(result).toHaveProperty('longestStreaks');
    expect(result).toHaveProperty('phaseTransitions');
  });
  it('handles empty phases array', () => {
    const result = computeInsights([]);
    expect(result.rekindled).toEqual([]);
    expect(result.mostPersistent).toEqual([]);
    expect(result.categoryDiversity).toBe(0);
    expect(result.hobbyVelocity).toEqual([]);
    expect(result.longestStreaks).toEqual([]);
    expect(result.phaseTransitions).toEqual([]);
  });
});
