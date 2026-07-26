import { describe, expect, it } from 'vitest';

import {
  ALL_HOBBIES,
  ALL_HOBBY_FACETS,
  facetsForHobby,
  getCategoryForHobby,
  HOBBY_CATEGORIES,
  HOBBY_FACETS,
  hobbiesWithFacets,
  isStrenuous,
  pickAcrossEffort,
} from './hobbies';

const physical = HOBBY_CATEGORIES.find((c) => c.name === 'Physical');

describe('pickAcrossEffort', () => {
  it('never returns an all-strenuous set for the Physical category', () => {
    const picked = pickAcrossEffort(physical?.hobbies ?? [], 3);
    expect(picked).toHaveLength(3);
    expect(picked.filter(isStrenuous).length).toBeLessThanOrEqual(1);
  });

  /**
   * The regression. The quiz used `hobbies.slice(0, 3)`, so every visitor whose
   * top category was Physical got Running / Cycling / Swimming regardless of
   * their answers, and the first instruction rendered under it was "Do one tiny
   * running session today" — served immediately after the mortality page.
   */
  it('does not open a Physical set with something strenuous', () => {
    const picked = pickAcrossEffort(physical?.hobbies ?? [], 3);
    expect(isStrenuous(picked[0])).toBe(false);
    expect(picked[0]).not.toBe('Running');
  });

  it('leaves categories with nothing strenuous in their authored order', () => {
    const intellectual = HOBBY_CATEGORIES.find((c) => c.name === 'Intellectual');
    const hobbies = intellectual?.hobbies ?? [];
    expect(pickAcrossEffort(hobbies, 3)).toEqual(hobbies.slice(0, 3));
  });

  it('still returns something when a category is entirely strenuous', () => {
    const picked = pickAcrossEffort(['Running', 'Climbing', 'Surfing'], 3);
    expect(picked).toHaveLength(3);
  });

  it('respects the limit', () => {
    expect(pickAcrossEffort(physical?.hobbies ?? [], 2)).toHaveLength(2);
  });
});

describe('catalog coverage for older visitors', () => {
  /**
   * These were all absent, so a visitor typing "Bridge" into the timeline hit
   * `getCategoryForHobby` returning undefined, bucketed as "Other", and
   * contributed nothing to their archetype or recommendations — their actual
   * life was invisible to the engine.
   */
  it.each([
    'Walking',
    'Golf',
    'Bridge',
    'Crosswords',
    'Genealogy',
    'Tai chi',
    'Choir',
    'Quilting',
    'Bowling',
    'Mahjong',
    'Sudoku',
    'Pilates',
  ])('%s is in the catalog and resolves to a category', (hobby) => {
    expect(getCategoryForHobby(hobby), `${hobby} should be catalogued`).toBeDefined();
  });

  it('has no duplicate hobbies across categories', () => {
    const all = HOBBY_CATEGORIES.flatMap((c) => c.hobbies).map((h) => h.toLowerCase());
    expect(new Set(all).size).toBe(all.length);
  });
});

describe('hobby facets', () => {
  it('covers every hobby in the catalogue, and nothing else', () => {
    const names = new Set(ALL_HOBBIES);
    const keys = Object.keys(HOBBY_FACETS);
    expect(keys).toHaveLength(names.size);
    for (const k of keys) expect(names.has(k), `${k} is not in the catalogue`).toBe(true);
    for (const n of names) expect(HOBBY_FACETS[n], `${n} has no facets`).toBeDefined();
  });

  it('uses only known facet ids, 3 to 6 per hobby', () => {
    const valid = new Set(ALL_HOBBY_FACETS);
    for (const [hobby, facets] of Object.entries(HOBBY_FACETS)) {
      expect(facets.length, hobby).toBeGreaterThanOrEqual(3);
      expect(facets.length, hobby).toBeLessThanOrEqual(6);
      expect(new Set(facets).size, `${hobby} has a duplicate facet`).toBe(facets.length);
      for (const f of facets) expect(valid.has(f), `${hobby}: ${f}`).toBe(true);
    }
  });

  /**
   * `gentle` is the facet that lets someone with limited mobility find
   * anything at all, so every hobby has to take a position — an unlabelled
   * hobby silently disappears from the one filter that matters most.
   */
  it('commits every hobby to exactly one of gentle or active', () => {
    for (const [hobby, facets] of Object.entries(HOBBY_FACETS)) {
      const gentle = facets.includes('gentle');
      const active = facets.includes('active');
      expect(gentle !== active, `${hobby} is ${gentle ? 'both' : 'neither'}`).toBe(true);
    }
  });

  it('keeps the gentle set genuinely gentle', () => {
    for (const hobby of ['Walking', 'Tai chi', 'Reading', 'Crosswords', 'Bridge']) {
      expect(facetsForHobby(hobby), hobby).toContain('gentle');
    }
    // Kneeling, carrying, standing for hours — none of these are gentle.
    for (const hobby of ['Gardening', 'Climbing', 'Running', 'Blacksmithing']) {
      expect(facetsForHobby(hobby), hobby).toContain('active');
    }
  });

  it('filters conjunctively, and an empty filter matches everything', () => {
    expect(hobbiesWithFacets([])).toHaveLength(ALL_HOBBIES.length);

    const gentleSolo = hobbiesWithFacets(['gentle', 'solo']);
    expect(gentleSolo.length).toBeGreaterThan(10);
    expect(gentleSolo.length).toBeLessThan(ALL_HOBBIES.length);
    for (const h of gentleSolo) {
      expect(facetsForHobby(h)).toEqual(expect.arrayContaining(['gentle', 'solo']));
    }
  });

  it('leaves a usable set for someone who wants gentle, cheap and screen-free', () => {
    const found = hobbiesWithFacets(['gentle', 'low-cost', 'screen-free']);
    expect(found.length).toBeGreaterThan(8);
  });
});
