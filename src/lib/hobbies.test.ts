import { describe, expect, it } from 'vitest';

import { HOBBY_CATEGORIES, getCategoryForHobby, isStrenuous, pickAcrossEffort } from './hobbies';

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
