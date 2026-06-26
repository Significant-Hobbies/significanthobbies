import { describe, expect, it } from 'vitest';

import {
  getBucketListArchetype,
  getBucketListSuggestions,
  getCelebrityMatch,
} from './bucket-list-insights';
import { FAMOUS_BUCKET_LISTS } from './famous-bucket-lists';

// ─── helpers ─────────────────────────────────────────────────────────────────

function itemsWith(cats: Array<string | null>): Array<{ category: string | null }> {
  return cats.map((category) => ({ category }));
}

// ─── getBucketListArchetype ──────────────────────────────────────────────────

describe('getBucketListArchetype', () => {
  it('returns null for an empty list', () => {
    expect(getBucketListArchetype([])).toBeNull();
  });

  it('returns null when all items have no category', () => {
    expect(getBucketListArchetype(itemsWith([null, null, null]))).toBeNull();
  });

  it('returns the dominant single-category archetype', () => {
    const result = getBucketListArchetype(itemsWith(['travel', 'travel', 'adventure']));
    expect(result).not.toBeNull();
    expect(result?.id).toBe('wanderer');
    expect(result?.name).toBe('The World Wanderer');
  });

  it('resolves ties by picking the first sorted category', () => {
    const result = getBucketListArchetype(itemsWith(['adventure', 'creative']));
    // equal counts → sort is stable on value; adventure sorts before creative
    expect(result?.id).toBe('daredevil');
  });

  it('returns the Renaissance Soul when 3+ categories tie for the top', () => {
    const result = getBucketListArchetype(
      itemsWith(['travel', 'adventure', 'creative', 'social', 'humanitarian'])
    );
    expect(result?.id).toBe('renaissance');
    expect(result?.name).toBe('The Renaissance Soul');
  });

  it('ignores unknown category strings', () => {
    const result = getBucketListArchetype(itemsWith(['unknown', 'travel']));
    expect(result?.id).toBe('wanderer');
  });
});

// ─── getCelebrityMatch ───────────────────────────────────────────────────────

describe('getCelebrityMatch', () => {
  it('returns null for an empty list', () => {
    expect(getCelebrityMatch([])).toBeNull();
  });

  it('returns null when items have no recognized categories', () => {
    expect(getCelebrityMatch(itemsWith([null, 'unknown']))).toBeNull();
  });

  it('returns a real match when categories overlap meaningfully', () => {
    // Will Smith is adventure-heavy; give the user several adventure items.
    const result = getCelebrityMatch(itemsWith(['adventure', 'adventure', 'adventure']));
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThan(0);
    expect(result!.slug).toBeTruthy();
    expect(result!.sharedCategories.length).toBeGreaterThan(0);
  });

  it('caps the score at 100', () => {
    // Construct a user whose category vector is a strict subset of a famous
    // person's, repeated many times — score should never exceed 100.
    const result = getCelebrityMatch(itemsWith(Array(20).fill('adventure')));
    if (result) expect(result.score).toBeLessThanOrEqual(100);
  });

  it('returns a strong match for a single-category user when the overlap is real', () => {
    // A humanitarian-only user legitimately matches Oprah (humanitarian-heavy,
    // small list → high cosine score). This must NOT be filtered out.
    const result = getCelebrityMatch(itemsWith(['humanitarian']));
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThanOrEqual(15);
  });

  it('never returns a match that is both weak and single-category', () => {
    // The guard's contract: a returned match always has either a real score
    // (≥15) or at least two shared categories. A diluted user (many items,
    // thin overlap) should not produce a broken "1% match".
    const diluted = itemsWith(['travel', 'adventure', 'creative', 'achievement', 'social']);
    const result = getCelebrityMatch(diluted);
    if (result) {
      const ok = result.score >= 15 || result.sharedCategories.length >= 2;
      expect(ok).toBe(true);
    }
  });

  it('the returned slug always resolves to a real famous list', () => {
    const result = getCelebrityMatch(itemsWith(['adventure', 'creative', 'achievement']));
    if (!result) return;
    const found = FAMOUS_BUCKET_LISTS.find((l) => l.slug === result.slug);
    expect(found).toBeDefined();
    expect(found?.name).toBe(result.name);
  });
});

// ─── getBucketListSuggestions ────────────────────────────────────────────────

describe('getBucketListSuggestions', () => {
  it('returns up to the requested count', () => {
    const out = getBucketListSuggestions([], 6);
    expect(out.length).toBeLessThanOrEqual(6);
    expect(out.length).toBeGreaterThan(0);
  });

  it('respects the count argument', () => {
    expect(getBucketListSuggestions([], 3).length).toBeLessThanOrEqual(3);
    expect(getBucketListSuggestions([], 2).length).toBeLessThanOrEqual(2);
  });

  it('is deterministic for the same inputs and seed', () => {
    const existing = [{ title: 'Run a marathon', category: 'achievement' }];
    const a = getBucketListSuggestions(existing, 6, 1);
    const b = getBucketListSuggestions(existing, 6, 1);
    expect(a.map((s) => s.title)).toEqual(b.map((s) => s.title));
  });

  it('changes when the seed changes', () => {
    const existing = [{ title: 'Run a marathon', category: 'achievement' }];
    const a = getBucketListSuggestions(existing, 6, 1);
    const b = getBucketListSuggestions(existing, 6, 2);
    // Not guaranteed to differ every time, but at least one ordering should
    // differ across a few seeds.
    const someSeedDiffers = [2, 3, 4, 5].some(
      (seed) =>
        getBucketListSuggestions(existing, 6, seed)
          .map((s) => s.title)
          .join('|') !== a.map((s) => s.title).join('|')
    );
    expect(someSeedDiffers).toBe(true);
  });

  it('filters out suggestions too similar to an existing item (Jaccard ≥ 0.5)', () => {
    // "Run a marathon" exists; the pool contains "Run a marathon" — it must
    // not be suggested. A near-duplicate like "Run a half marathon" should
    // also be excluded by token overlap.
    const existing = [{ title: 'Run a marathon', category: 'achievement' }];
    const out = getBucketListSuggestions(existing, 50, 0);
    const titles = out.map((s) => s.title.toLowerCase());
    expect(titles).not.toContain('run a marathon');
  });

  it('does not filter out genuinely different items that share a common word', () => {
    // "See the Northern Lights in Iceland" vs "See the cherry blossoms in Kyoto"
    // share only the stopword "the" + "see" (length 3, kept) — Jaccard is low,
    // so the second should still be suggestible.
    const existing = [{ title: 'See the Northern Lights in Iceland', category: 'travel' }];
    const out = getBucketListSuggestions(existing, 50, 0);
    const titles = out.map((s) => s.title.toLowerCase());
    expect(titles).toContain('see the cherry blossoms in kyoto');
  });

  it('biases toward gap categories the user is missing', () => {
    // User only has achievement items; suggestions should include non-achievement
    // categories (the gaps), not only achievement ones.
    const existing = [
      { title: 'Run a marathon', category: 'achievement' as const },
      { title: 'Earn a black belt', category: 'achievement' as const },
    ];
    const out = getBucketListSuggestions(existing, 6, 0);
    const cats = new Set(out.map((s) => s.category));
    const hasGap = [...cats].some((c) => c !== 'achievement');
    expect(hasGap).toBe(true);
  });

  it('every returned suggestion has a title, category, and emoji', () => {
    const out = getBucketListSuggestions([], 6);
    for (const s of out) {
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.category).toBeTruthy();
      expect(s.emoji.length).toBeGreaterThan(0);
    }
  });
});
