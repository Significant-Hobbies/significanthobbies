import { describe, expect, it } from 'vitest';

import {
  ALL_EXPERIENCES,
  DESTINATIONS,
  EXPERIENCE_CATEGORIES,
  EXPERIENCE_ENTRIES,
  EXPERIENCES_BY_CATEGORY,
  findExperience,
  MILESTONES,
  PAGED_EXPERIENCES,
  relatedExperiences,
} from './experiences';
import { FAMOUS_BUCKET_LISTS } from './famous-bucket-lists';
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

  it('unions all three corpora, tagged with a category', () => {
    const ideas = EXPERIENCE_CATEGORIES.reduce(
      (n, c) => n + EXPERIENCES_BY_CATEGORY[c].ideas.length,
      0
    );
    expect(ideas).toBe(150);
    expect(MILESTONES).toHaveLength(100);
    expect(DESTINATIONS).toHaveLength(75);

    // The union minus the handful of genuine overlaps between the lists.
    expect(ALL_EXPERIENCES.length).toBeGreaterThan(300);
    expect(ALL_EXPERIENCES.length).toBeLessThanOrEqual(ideas + 100 + 75);

    for (const e of ALL_EXPERIENCES) {
      expect(e.title.length).toBeGreaterThan(3);
      expect(EXPERIENCE_CATEGORIES).toContain(e.category);
    }
  });

  it('gives every milestone a category, description and horizon', () => {
    for (const m of MILESTONES) {
      expect(EXPERIENCE_CATEGORIES, m.title).toContain(m.category);
      expect(m.description.length, m.title).toBeGreaterThan(10);
      expect(['before-30', 'before-50']).toContain(m.horizon);
    }
  });

  it('gives every destination a reason, and covers all five regions', () => {
    for (const d of DESTINATIONS) {
      expect(d.why.length, d.name).toBeGreaterThan(10);
    }
    expect(new Set(DESTINATIONS.map((d) => d.region)).size).toBe(5);
  });

  /**
   * The only cross-reference from the experience corpus into another corpus.
   * `/travel-bucket-list` renders it as a link to `/bucket-lists/<slug>`, so a
   * slug that stops resolving is a 404 on a live page.
   *
   * Asserted against FAMOUS_BUCKET_LISTS, not famous-journeys: the two share
   * some names but are separate sets, and `bill-clinton` exists only in the
   * former. Getting that backwards was my first guess.
   */
  it('resolves every destination cross-reference to a real bucket list', () => {
    const slugs = new Set(FAMOUS_BUCKET_LISTS.map((l) => l.slug));
    const refs = DESTINATIONS.filter((d) => d.famous);
    expect(refs.length).toBeGreaterThan(0);
    for (const d of refs) {
      expect(slugs.has(d.famous?.slug ?? ''), `${d.name} → ${d.famous?.slug}`).toBe(true);
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

describe('browsable entries', () => {
  it('indexes the whole corpus with unique, non-empty slugs', () => {
    expect(EXPERIENCE_ENTRIES.length).toBe(322);
    const slugs = EXPERIENCE_ENTRIES.map((e) => e.slug);
    expect(slugs.filter((s) => !s)).toHaveLength(0);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/);
  });

  /**
   * Ideas are iterated first and carry no description, so a naive
   * first-writer-wins dedupe handed three shared titles to the bare version and
   * cost them a page. The richer record has to win.
   */
  it('keeps the record with prose when two corpora share a title', () => {
    expect(PAGED_EXPERIENCES).toHaveLength(175);
    expect(PAGED_EXPERIENCES.length).toBe(MILESTONES.length + DESTINATIONS.length);
  });

  it('gives a page only to entries that have something to say', () => {
    for (const e of PAGED_EXPERIENCES) {
      expect(e.description?.length ?? 0, e.title).toBeGreaterThan(10);
    }
    const unpaged = EXPERIENCE_ENTRIES.filter((e) => !e.description);
    expect(unpaged.length).toBe(EXPERIENCE_ENTRIES.length - PAGED_EXPERIENCES.length);
  });

  it('resolves a known slug and rejects an unknown one', () => {
    const first = PAGED_EXPERIENCES[0];
    expect(findExperience(first.slug)?.title).toBe(first.title);
    expect(findExperience('not-a-real-experience')).toBeUndefined();
  });

  it('relates only within a category, never to itself', () => {
    const entry = PAGED_EXPERIENCES[0];
    const related = relatedExperiences(entry, 6);
    expect(related.length).toBeGreaterThan(0);
    for (const r of related) {
      expect(r.category).toBe(entry.category);
      expect(r.slug).not.toBe(entry.slug);
    }
  });
});

describe('onward links are actually clickable', () => {
  /**
   * "If this appeals, so might these" over six bare ideas is six dead rows.
   * Where a category has written entries, they lead.
   */
  it('prefers entries that have a page', () => {
    for (const entry of PAGED_EXPERIENCES.slice(0, 25)) {
      const related = relatedExperiences(entry, 6);
      expect(related.length, entry.title).toBeGreaterThan(0);
      expect(related[0].description, `${entry.title} → ${related[0].title}`).toBeTruthy();
    }
  });

  it('opens the browse list with something worth reading', () => {
    expect(EXPERIENCE_ENTRIES[0].description).toBeTruthy();
  });
});
