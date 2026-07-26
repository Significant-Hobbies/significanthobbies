import { describe, expect, it } from 'vitest';

import {
  ALL_EXPERIENCES,
  DESTINATIONS,
  EXPERIENCE_CATEGORIES,
  EXPERIENCE_ENTRIES,
  EXPERIENCES_BY_CATEGORY,
  findExperience,
  firstSteps,
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
   * Every entry now carries written prose — the 147 title-only ideas were
   * described, so the whole corpus is pageable rather than the 175 that had
   * descriptions to begin with.
   */
  it('gives every entry a page, because every entry now says something', () => {
    expect(PAGED_EXPERIENCES).toHaveLength(EXPERIENCE_ENTRIES.length);
    expect(EXPERIENCE_ENTRIES.filter((e) => !e.description)).toHaveLength(0);
  });

  it('holds every description to a real sentence, not a restated title', () => {
    for (const e of PAGED_EXPERIENCES) {
      const words = (e.description ?? '').trim().split(/\s+/);
      expect(words.length, e.title).toBeGreaterThanOrEqual(8);
      expect(words.length, e.title).toBeLessThanOrEqual(30);
      // A description that merely repeats the title tells the reader nothing.
      expect(e.description?.toLowerCase(), e.title).not.toBe(e.title.toLowerCase());
    }
  });

  it('has no two entries sharing a description', () => {
    const all = PAGED_EXPERIENCES.map((e) => e.description);
    expect(new Set(all).size).toBe(all.length);
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

  it('links every row on the browse list, now that all of them have a page', () => {
    for (const e of EXPERIENCE_ENTRIES) expect(e.description, e.title).toBeTruthy();
  });
});

describe('first steps are not one paragraph reused 175 times', () => {
  /**
   * `generateQuestChain` is templated on category alone, so every travel item
   * produced identical body copy with the title swapped in. On 175 indexable
   * pages that is most of the body, repeated — the thing that makes a set of
   * pages read as templated rather than written.
   */
  it('reads differently for two destinations in different regions', () => {
    const europe = PAGED_EXPERIENCES.find((e) => e.region === 'europe');
    const asia = PAGED_EXPERIENCES.find((e) => e.region === 'asia');
    if (!europe || !asia) throw new Error('expected a destination in each region');
    const a = firstSteps(europe)
      .map((s) => s.body)
      .join(' ');
    const b = firstSteps(asia)
      .map((s) => s.body)
      .join(' ');
    expect(a).not.toBe(b);
  });

  it('reads differently for a milestone and a destination', () => {
    const milestone = PAGED_EXPERIENCES.find((e) => e.kind === 'milestone');
    const destination = PAGED_EXPERIENCES.find((e) => e.kind === 'destination');
    if (!milestone || !destination) throw new Error('expected one of each');
    expect(firstSteps(milestone).map((s) => s.title)).not.toEqual(
      firstSteps(destination).map((s) => s.title)
    );
  });

  it('weaves each entry own description into its opening step', () => {
    for (const entry of PAGED_EXPERIENCES.slice(0, 40)) {
      expect(firstSteps(entry)[0].body, entry.title).toContain(entry.description ?? '');
    }
  });

  it('mentions the cross-referenced person where there is one', () => {
    const withFamous = PAGED_EXPERIENCES.filter((e) => e.famous);
    expect(withFamous.length).toBeGreaterThan(0);
    for (const e of withFamous) {
      const joined = firstSteps(e)
        .map((s) => `${s.title} ${s.body}`)
        .join(' ');
      expect(joined).toContain(e.famous?.name ?? '');
    }
  });

  /** The bodies across the whole set should be mostly distinct, not near-clones. */
  it('produces mostly-unique bodies across every paged entry', () => {
    const bodies = PAGED_EXPERIENCES.map((e) =>
      firstSteps(e)
        .map((s) => s.body)
        .join(' ')
    );
    const unique = new Set(bodies).size;
    expect(unique / bodies.length).toBeGreaterThan(0.95);
  });

  it('always gives at least three steps', () => {
    for (const e of PAGED_EXPERIENCES) {
      expect(firstSteps(e).length, e.title).toBeGreaterThanOrEqual(3);
    }
  });
});
