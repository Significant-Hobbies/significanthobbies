import { describe, expect, it } from 'vitest';
import {
  createRemixDraft,
  generateLifeBingo,
  getBingoLines,
  getBingoProgress,
  replacementSquare,
} from './life-bingo';

describe('generateLifeBingo', () => {
  it('creates a deterministic 3x3 board with unique concrete prompts', () => {
    const draft = generateLifeBingo({
      horizon: 'season',
      intentions: ['adventure', 'creativity', 'connection'],
      boldness: 'brave',
      seed: 'summer-2026',
    });

    expect(draft.size).toBe(3);
    expect(draft.items).toHaveLength(9);
    expect(new Set(draft.items.map((square) => square.text)).size).toBe(9);
    expect(draft.items.every((square) => square.text.length > 10)).toBe(true);
    expect(draft.items.some((square) => square.effort === 'tiny')).toBe(true);
    expect(draft.items.some((square) => square.effort === 'medium')).toBe(true);
  });

  it('places the unexpected wildcard in the center of a 5x5 board', () => {
    const draft = generateLifeBingo({
      horizon: 'year',
      intentions: ['nature', 'play', 'learning'],
      boldness: 'bold',
      seed: 'year-2026',
    });

    expect(draft.items).toHaveLength(25);
    expect(draft.items[12]).toMatchObject({ text: 'Something unexpected', isWildcard: true });
    expect(new Set(draft.items.map((square) => square.text)).size).toBe(25);
  });

  it('replaces a square without duplicating another prompt', () => {
    const draft = generateLifeBingo({
      horizon: 'month',
      intentions: ['play', 'connection', 'wellbeing'],
      boldness: 'cozy',
      seed: 'replace-me',
    });
    const replacement = replacementSquare({ draft, squareId: draft.items[0]!.id, seed: 'new-one' });

    expect(replacement).not.toBeNull();
    expect(draft.items.map((square) => square.text)).not.toContain(replacement?.text);
  });
});

describe('bingo progress', () => {
  it('detects horizontal, vertical, and diagonal lines', () => {
    const draft = generateLifeBingo({
      horizon: 'month',
      intentions: ['adventure', 'nature', 'play'],
      boldness: 'brave',
      seed: 'lines',
    });
    const completedIndexes = new Set([0, 1, 2, 3, 4, 6, 8]);
    const items = draft.items.map((square, index) =>
      completedIndexes.has(index) ? { ...square, completedAt: '2026-07-12' } : square
    );
    const lines = getBingoLines(items, 3);

    expect(lines.map((line) => `${line.kind}-${line.index}`)).toEqual(
      expect.arrayContaining(['row-0', 'column-0', 'diagonal-0', 'diagonal-1'])
    );
    expect(getBingoProgress({ items, size: 3 })).toMatchObject({
      completed: 7,
      total: 9,
      percentage: 78,
    });
  });

  it('does not report lines for an invalid grid', () => {
    expect(getBingoLines([], 5)).toEqual([]);
  });
});

describe('createRemixDraft', () => {
  it('keeps prompts while clearing completion and reflections', () => {
    const source = generateLifeBingo({
      horizon: 'season',
      intentions: ['creativity'],
      boldness: 'cozy',
      seed: 'source',
    });
    source.items[0] = { ...source.items[0]!, completedAt: '2026-07-12', note: 'A good day' };

    const remix = createRemixDraft(source);
    expect(remix.items.map((square) => square.text)).toEqual(
      source.items.map((square) => square.text)
    );
    expect(remix.items.every((square) => !square.completedAt && !square.note)).toBe(true);
  });
});
