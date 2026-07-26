import { describe, expect, it } from 'vitest';

import { ALL_EXPERIENCES, EXPERIENCE_CATEGORIES, EXPERIENCES_BY_CATEGORY } from './experiences';
import { getBucketListSuggestions } from './bucket-list-insights';

describe('experiences corpus', () => {
  it('covers all six categories with real content in each', () => {
    expect(EXPERIENCE_CATEGORIES).toHaveLength(6);
    for (const category of EXPERIENCE_CATEGORIES) {
      const group = EXPERIENCES_BY_CATEGORY[category];
      expect(group.ideas.length, `${category} should not be empty`).toBeGreaterThan(15);
      expect(group.emoji).toBeTruthy();
      expect(group.label).toBeTruthy();
    }
  });

  it('flattens to every idea, tagged with its category', () => {
    const total = EXPERIENCE_CATEGORIES.reduce(
      (n, c) => n + EXPERIENCES_BY_CATEGORY[c].ideas.length,
      0
    );
    expect(ALL_EXPERIENCES).toHaveLength(total);
    expect(total).toBeGreaterThanOrEqual(145);
    for (const e of ALL_EXPERIENCES) {
      expect(e.title.length).toBeGreaterThan(3);
      expect(EXPERIENCE_CATEGORIES).toContain(e.category);
    }
  });

  it('has no duplicate titles', () => {
    const seen = ALL_EXPERIENCES.map((e) => e.title.toLowerCase().trim());
    expect(new Set(seen).size).toBe(seen.length);
  });
});

/**
 * The regression this module exists to prevent.
 *
 * The suggestion engine used to carry its own 52-item SUGGESTION_POOL, a
 * near-duplicate of the 145 ideas that were unreachable inside
 * `src/app/bucket-list-ideas/page.tsx`. Users were shown a third of the
 * material the product already owned, and adding one idea meant writing it
 * twice for it to appear in both places.
 */
describe('the suggestion engine reads the shared corpus', () => {
  it('can reach substantially more than the old private pool', () => {
    const out = getBucketListSuggestions([], 120, 0);
    expect(out.length).toBe(120);
  });

  /**
   * The gap/familiar split used to return only its gap half when one side was
   * empty. An empty list is exactly that case — every category is a gap and
   * `familiar` has nothing — so the newest user, with the least to go on, was
   * shown two ideas where everyone else got four.
   */
  it('returns the full count for a brand-new user with an empty list', () => {
    expect(getBucketListSuggestions([], 4, 0)).toHaveLength(4);
    expect(getBucketListSuggestions([], 8, 0)).toHaveLength(8);
  });

  it('suggests only things that exist in the corpus', () => {
    const corpus = new Set(ALL_EXPERIENCES.map((e) => e.title));
    for (const s of getBucketListSuggestions([], 50, 0)) {
      expect(corpus.has(s.title), `${s.title} should come from the corpus`).toBe(true);
    }
  });

  it('still spans categories rather than emptying one bucket first', () => {
    const cats = new Set(getBucketListSuggestions([], 12, 0).map((s) => s.category));
    expect(cats.size).toBeGreaterThan(1);
  });
});
