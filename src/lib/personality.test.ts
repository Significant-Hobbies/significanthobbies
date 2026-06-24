import { describe, expect, it } from 'vitest';

import { computePersonality } from './personality';
import type { Phase } from './types';

// ─── helpers ─────────────────────────────────────────────────────────────────

function makePhase(id: string, order: number, hobbyNames: string[]): Phase {
  return {
    id,
    label: `Phase ${id}`,
    order,
    hobbies: hobbyNames.map((name) => ({ name })),
  };
}

// ─── empty / blank canvas ─────────────────────────────────────────────────────

describe('Blank Canvas', () => {
  it('returns Blank Canvas for empty phases array', () => {
    const result = computePersonality([]);
    expect(result.archetype.name).toBe('Blank Canvas');
  });

  it('returns Blank Canvas when all phases have no hobbies', () => {
    const phases = [makePhase('1', 0, []), makePhase('2', 1, [])];
    const result = computePersonality(phases);
    expect(result.archetype.name).toBe('Blank Canvas');
  });

  it('returns empty categoryBreakdown for empty input', () => {
    const result = computePersonality([]);
    expect(result.categoryBreakdown).toEqual({});
  });

  it('returns zero traits for empty input', () => {
    const result = computePersonality([]);
    expect(result.traits).toEqual({ breadth: 0, depth: 0, consistency: 0, variety: 0 });
  });

  it('returns a default narrative for empty input', () => {
    const result = computePersonality([]);
    expect(typeof result.narrative).toBe('string');
    expect(result.narrative.length).toBeGreaterThan(0);
  });
});

// ─── Renaissance Explorer ─────────────────────────────────────────────────────

describe('Renaissance Explorer', () => {
  // 5+ unique categories
  const phases = [
    makePhase('1', 0, ['Drawing', 'Guitar', 'Running', 'Reading', 'Cooking', 'Woodworking']),
  ];

  it('detects Renaissance Explorer with 6 unique categories', () => {
    const result = computePersonality(phases);
    expect(result.archetype.name).toBe('Renaissance Explorer');
  });

  it('Renaissance Explorer across multiple phases', () => {
    const multi = [
      makePhase('1', 0, ['Drawing', 'Guitar']),
      makePhase('2', 1, ['Running', 'Reading']),
      makePhase('3', 2, ['Cooking', 'Volunteering']),
    ];
    const result = computePersonality(multi);
    expect(result.archetype.name).toBe('Renaissance Explorer');
  });
});

// ─── Deep Specialist ──────────────────────────────────────────────────────────

describe('Deep Specialist', () => {
  it('detects Deep Specialist when top-2 individual categories cover 70%+ and no thematic group hits 50%', () => {
    // Physical(4) + Creative(4) = 8/9 = 88.9% top-2
    // Physical thematic group (Physical+Outdoor) = 4/9 = 44% — not dominant
    // Creative thematic group (Creative+Music) = 4/9 = 44% — not dominant
    // → Deep Specialist
    const phases = [
      makePhase('1', 0, [
        'Running',
        'Cycling',
        'Hiking',
        'Yoga', // 4 Physical
        'Drawing',
        'Painting',
        'Photography',
        'Writing', // 4 Creative
        'Cooking', // 1 Culinary (minority)
      ]),
    ];
    const result = computePersonality(phases);
    expect(result.archetype.name).toBe('Deep Specialist');
  });

  it('does NOT label Deep Specialist when a thematic group dominates (uses themed archetype instead)', () => {
    // 6 Physical → Action Hero, even though top-1 category = 75%
    const phases = [
      makePhase('1', 0, ['Running', 'Cycling', 'Hiking', 'Yoga', 'Gym', 'Swimming', 'Drawing']),
    ];
    const result = computePersonality(phases);
    // Physical group dominates at 6/7 = 85.7% → Action Hero wins
    expect(result.archetype.name).toBe('Action Hero');
  });
});

// ─── Creative Soul ────────────────────────────────────────────────────────────

describe('Creative Soul', () => {
  it('detects Creative Soul when Creative + Music > 50%', () => {
    const phases = [makePhase('1', 0, ['Drawing', 'Painting', 'Guitar', 'Piano', 'Running'])];
    // Creative(2) + Music(2) = 4/5 = 80%
    const result = computePersonality(phases);
    expect(result.archetype.name).toBe('Creative Soul');
  });

  it('Creative Soul only on Creative (no Music)', () => {
    const phases = [makePhase('1', 0, ['Drawing', 'Painting', 'Photography', 'Reading'])];
    // Creative(3) = 3/4 = 75%
    const result = computePersonality(phases);
    expect(result.archetype.name).toBe('Creative Soul');
  });
});

// ─── Action Hero ──────────────────────────────────────────────────────────────

describe('Action Hero', () => {
  it('detects Action Hero when Physical + Outdoor > 50%', () => {
    const phases = [makePhase('1', 0, ['Running', 'Hiking', 'Cycling', 'Camping', 'Reading'])];
    // Physical(3) + Outdoor(1) = 4/5 = 80%
    const result = computePersonality(phases);
    expect(result.archetype.name).toBe('Action Hero');
  });
});

// ─── Mind Builder ─────────────────────────────────────────────────────────────

describe('Mind Builder', () => {
  it('detects Mind Builder when Intellectual + Gaming > 50%', () => {
    const phases = [makePhase('1', 0, ['Reading', 'Chess', 'Coding', 'Video games', 'Running'])];
    // Intellectual(3) + Gaming(1) = 4/5 = 80%
    const result = computePersonality(phases);
    expect(result.archetype.name).toBe('Mind Builder');
  });
});

// ─── Social Butterfly ─────────────────────────────────────────────────────────

describe('Social Butterfly', () => {
  it('detects Social Butterfly when Social + Culinary > 50%', () => {
    const phases = [
      makePhase('1', 0, ['Volunteering', 'Hosting dinners', 'Cooking', 'Baking', 'Running']),
    ];
    // Social(2) + Culinary(2) = 4/5 = 80%
    const result = computePersonality(phases);
    expect(result.archetype.name).toBe('Social Butterfly');
  });
});

// ─── Maker ───────────────────────────────────────────────────────────────────

describe('Maker', () => {
  it('detects Maker when Making + Collecting > 50%', () => {
    const phases = [
      makePhase('1', 0, ['Woodworking', '3D printing', 'Vinyl records', 'Coins', 'Running']),
    ];
    // Making(2) + Collecting(2) = 4/5 = 80%
    const result = computePersonality(phases);
    expect(result.archetype.name).toBe('Maker');
  });
});

// ─── Balanced Explorer ────────────────────────────────────────────────────────

describe('Balanced Explorer', () => {
  it('detects Balanced Explorer with 3-4 categories, none dominating', () => {
    // 2 Physical, 2 Creative, 2 Intellectual → 3 categories, each at 33%
    const phases = [
      makePhase('1', 0, ['Running', 'Cycling', 'Drawing', 'Painting', 'Reading', 'Chess']),
    ];
    const result = computePersonality(phases);
    expect(result.archetype.name).toBe('Balanced Explorer');
  });

  it('detects Balanced Explorer with exactly 4 categories, none at 50%', () => {
    const phases = [makePhase('1', 0, ['Running', 'Drawing', 'Reading', 'Cooking'])];
    // 4 categories, each 25%
    const result = computePersonality(phases);
    expect(result.archetype.name).toBe('Balanced Explorer');
  });
});

// ─── Category Breakdown ───────────────────────────────────────────────────────

describe('categoryBreakdown', () => {
  it('sums to 100 for a simple case', () => {
    const phases = [makePhase('1', 0, ['Running', 'Drawing', 'Reading'])];
    const result = computePersonality(phases);
    const total = Object.values(result.categoryBreakdown).reduce((s, v) => s + v, 0);
    expect(total).toBe(100);
  });

  it('sums to 100 for a multi-phase case', () => {
    const phases = [
      makePhase('1', 0, ['Running', 'Cycling', 'Drawing']),
      makePhase('2', 1, ['Guitar', 'Piano', 'Cooking']),
      makePhase('3', 2, ['Reading', 'Chess']),
    ];
    const result = computePersonality(phases);
    const total = Object.values(result.categoryBreakdown).reduce((s, v) => s + v, 0);
    expect(total).toBe(100);
  });

  it('has correct dominant category percentage', () => {
    // 4 Physical out of 4 total
    const phases = [makePhase('1', 0, ['Running', 'Cycling', 'Hiking', 'Yoga'])];
    const result = computePersonality(phases);
    expect(result.categoryBreakdown.Physical).toBe(100);
  });

  it('handles unknown/uncategorized hobbies as Other', () => {
    const phases = [makePhase('1', 0, ['UnknownHobby123', 'AnotherMystery'])];
    const result = computePersonality(phases);
    expect(result.categoryBreakdown.Other).toBe(100);
  });
});

// ─── Traits ───────────────────────────────────────────────────────────────────

describe('traits', () => {
  it('breadth is 0 for empty phases', () => {
    expect(computePersonality([]).traits.breadth).toBe(0);
  });

  it('breadth is non-zero when categories are present', () => {
    const phases = [makePhase('1', 0, ['Running', 'Drawing'])];
    const result = computePersonality(phases);
    expect(result.traits.breadth).toBeGreaterThan(0);
    expect(result.traits.breadth).toBeLessThanOrEqual(1);
  });

  it('breadth approaches 1 when all 10 categories are covered', () => {
    const phases = [
      makePhase('1', 0, [
        'Drawing', // Creative
        'Guitar', // Music
        'Running', // Physical
        'Reading', // Intellectual
        'Video games', // Gaming
        'Gardening', // Outdoor
        'Cooking', // Culinary
        'Vinyl records', // Collecting
        'Woodworking', // Making
        'Volunteering', // Social
      ]),
    ];
    const result = computePersonality(phases);
    expect(result.traits.breadth).toBe(1);
  });

  it('depth is 1 when all hobbies are from one category', () => {
    const phases = [makePhase('1', 0, ['Running', 'Cycling', 'Swimming'])];
    const result = computePersonality(phases);
    expect(result.traits.depth).toBe(1);
  });

  it('depth is less than 1 when hobbies span multiple categories', () => {
    const phases = [makePhase('1', 0, ['Running', 'Cycling', 'Drawing', 'Painting'])];
    const result = computePersonality(phases);
    expect(result.traits.depth).toBeLessThan(1);
    expect(result.traits.depth).toBeGreaterThan(0);
  });

  it('consistency is 1 when same hobbies appear in all phases', () => {
    const phases = [
      makePhase('1', 0, ['Running', 'Reading']),
      makePhase('2', 1, ['Running', 'Reading']),
      makePhase('3', 2, ['Running', 'Reading']),
    ];
    const result = computePersonality(phases);
    expect(result.traits.consistency).toBe(1);
    expect(result.traits.variety).toBe(0);
  });

  it('consistency is 0 when every phase has unique hobbies', () => {
    const phases = [
      makePhase('1', 0, ['Running']),
      makePhase('2', 1, ['Drawing']),
      makePhase('3', 2, ['Reading']),
    ];
    const result = computePersonality(phases);
    // None appear in 50%+ of phases (each only in 1/3 = 33%)
    expect(result.traits.consistency).toBe(0);
    expect(result.traits.variety).toBe(1);
  });

  it('variety + consistency = 1', () => {
    const phases = [
      makePhase('1', 0, ['Running', 'Drawing']),
      makePhase('2', 1, ['Running', 'Reading']),
    ];
    const result = computePersonality(phases);
    expect(result.traits.consistency + result.traits.variety).toBeCloseTo(1);
  });

  it('all traits are between 0 and 1', () => {
    const phases = [
      makePhase('1', 0, ['Running', 'Drawing', 'Reading']),
      makePhase('2', 1, ['Running', 'Guitar']),
    ];
    const result = computePersonality(phases);
    for (const [key, val] of Object.entries(result.traits)) {
      expect(val, `trait ${key}`).toBeGreaterThanOrEqual(0);
      expect(val, `trait ${key}`).toBeLessThanOrEqual(1);
    }
  });
});

// ─── Narrative ────────────────────────────────────────────────────────────────

describe('narrative', () => {
  it('returns a string for empty phases', () => {
    const result = computePersonality([]);
    expect(typeof result.narrative).toBe('string');
  });

  it('returns a rooted narrative for single phase', () => {
    const phases = [makePhase('1', 0, ['Running', 'Cycling'])];
    const result = computePersonality(phases);
    expect(result.narrative).toContain('Physical');
  });

  it('reflects transition from physical to creative', () => {
    const phases = [
      makePhase('1', 0, ['Running', 'Cycling', 'Hiking']),
      makePhase('2', 1, ['Drawing', 'Painting', 'Photography']),
    ];
    const result = computePersonality(phases);
    expect(result.narrative).toContain('Physical');
    expect(result.narrative).toContain('Creative');
  });

  it('reflects three-phase journey', () => {
    const phases = [
      makePhase('1', 0, ['Running']),
      makePhase('2', 1, ['Drawing']),
      makePhase('3', 2, ['Reading']),
    ];
    const result = computePersonality(phases);
    expect(result.narrative).toContain('Physical');
    expect(result.narrative).toContain('Creative');
    expect(result.narrative).toContain('Intellectual');
  });

  it('collapses consecutive same-category phases in narrative', () => {
    // Physical → Physical → Creative: should read as Physical → Creative
    const phases = [
      makePhase('1', 0, ['Running']),
      makePhase('2', 1, ['Cycling']),
      makePhase('3', 2, ['Drawing']),
    ];
    const result = computePersonality(phases);
    // Should mention Physical once conceptually and Creative
    expect(result.narrative).toContain('Physical');
    expect(result.narrative).toContain('Creative');
    // Should NOT say "Started with Physical... explored Physical..."
    expect(result.narrative).not.toMatch(/Physical.*Physical/);
  });

  it('returns consistent narrative for same-category across all phases', () => {
    const phases = [
      makePhase('1', 0, ['Running']),
      makePhase('2', 1, ['Cycling']),
      makePhase('3', 2, ['Swimming']),
    ];
    const result = computePersonality(phases);
    expect(result.narrative).toContain('Physical');
  });
});

// ─── Phase ordering ───────────────────────────────────────────────────────────

describe('phase ordering', () => {
  it('uses order field, not array position, for narrative', () => {
    // Give phases out-of-order in array but order field is correct
    const phases = [
      makePhase('3', 2, ['Drawing']), // Creative (third)
      makePhase('1', 0, ['Running']), // Physical (first)
      makePhase('2', 1, ['Reading']), // Intellectual (second)
    ];
    const result = computePersonality(phases);
    // Narrative should be Physical → Intellectual → Creative
    expect(result.narrative).toContain('Physical');
    expect(result.narrative).toContain('Intellectual');
    expect(result.narrative).toContain('Creative');
    // Physical should appear before Creative in the narrative text
    const physIdx = result.narrative.indexOf('Physical');
    const creativeIdx = result.narrative.indexOf('Creative');
    expect(physIdx).toBeLessThan(creativeIdx);
  });
});

// ─── Single phase edge cases ──────────────────────────────────────────────────

describe('single phase', () => {
  it('handles single phase with one hobby', () => {
    const phases = [makePhase('1', 0, ['Running'])];
    const result = computePersonality(phases);
    expect(result.archetype.name).toBeTruthy();
    expect(result.traits.depth).toBe(1);
    expect(result.traits.breadth).toBeGreaterThan(0);
    const total = Object.values(result.categoryBreakdown).reduce((s, v) => s + v, 0);
    expect(total).toBe(100);
  });
});

// ─── Archetype shape ─────────────────────────────────────────────────────────

describe('archetype shape', () => {
  it('every archetype has name, emoji, and description', () => {
    const testCases: Phase[][] = [
      [],
      [makePhase('1', 0, ['Running', 'Drawing', 'Reading', 'Cooking', 'Guitar', 'Woodworking'])],
      [
        makePhase('1', 0, [
          'Running',
          'Cycling',
          'Hiking',
          'Yoga',
          'Gym',
          'Climbing',
          'Swimming',
          'Drawing',
        ]),
      ],
      [makePhase('1', 0, ['Drawing', 'Painting', 'Guitar', 'Piano', 'Running'])],
    ];
    for (const phases of testCases) {
      const result = computePersonality(phases);
      expect(typeof result.archetype.name).toBe('string');
      expect(result.archetype.name.length).toBeGreaterThan(0);
      expect(typeof result.archetype.emoji).toBe('string');
      expect(result.archetype.emoji.length).toBeGreaterThan(0);
      expect(typeof result.archetype.description).toBe('string');
      expect(result.archetype.description.length).toBeGreaterThan(0);
    }
  });
});
