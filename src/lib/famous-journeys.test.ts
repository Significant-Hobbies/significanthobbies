import { describe, expect, it } from 'vitest';

import { FAMOUS_JOURNEYS, journeysForHobby } from './famous-journeys';
import { ALL_HOBBIES } from './hobbies';

/**
 * The bridge from the hobby catalogue into the 35 lives.
 *
 * famous-journeys.ts is the largest content file in the repo and had exactly
 * one inbound link, from a page that is not itself in the nav. These tests
 * hold the door open.
 */
describe('journeysForHobby', () => {
  it('reaches a meaningful share of the catalogue', () => {
    const covered = ALL_HOBBIES.filter((h) => journeysForHobby(h).length > 0);
    expect(covered.length).toBeGreaterThan(50);
  });

  it('finds the matches worth finding', () => {
    expect(journeysForHobby('Calligraphy').map((m) => m.name)).toContain('Steve Jobs');
    expect(journeysForHobby('Chess').map((m) => m.name)).toContain('Bill Gates');
  });

  /**
   * Whole-word, so a hobby is never matched by a longer word containing it.
   *
   * Note the limit: phase entries carry parentheticals, and a standalone word
   * inside one is a legitimate hit — "Read" matches Franklin's "Reading
   * (couldn't remember a time when he couldn't read)". That is the matcher
   * working, not failing, and no catalogue hobby is a bare word fragment.
   */
  it('does not match on substrings', () => {
    expect(journeysForHobby('Ches')).toHaveLength(0);
    expect(journeysForHobby('Guita')).toHaveLength(0);
    expect(journeysForHobby('alligraphy')).toHaveLength(0);
  });

  it('returns one mention per person, capped', () => {
    for (const hobby of ALL_HOBBIES) {
      const mentions = journeysForHobby(hobby);
      expect(mentions.length).toBeLessThanOrEqual(4);
      expect(new Set(mentions.map((m) => m.slug)).size).toBe(mentions.length);
    }
  });

  it('only ever points at a journey that exists', () => {
    const slugs = new Set(FAMOUS_JOURNEYS.map((j) => j.slug));
    for (const hobby of ALL_HOBBIES) {
      for (const m of journeysForHobby(hobby)) {
        expect(slugs.has(m.slug), `${hobby} → ${m.slug}`).toBe(true);
        expect(m.phase.length).toBeGreaterThan(0);
        expect(m.as.length).toBeGreaterThan(0);
      }
    }
  });

  it('is empty rather than throwing for an unknown hobby', () => {
    expect(journeysForHobby('Nonexistent pastime')).toHaveLength(0);
    expect(journeysForHobby('')).toHaveLength(0);
  });
});
