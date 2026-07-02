import { describe, expect, it } from 'vitest';

import {
  LIFE_EXPECTANCY_WEEKS,
  birthDateFromYear,
  buildLifeGrid,
  weekIndexForDay,
  weeksLived,
  yearsLived,
} from './mortality';

describe('mortality', () => {
  describe('birthDateFromYear', () => {
    it('returns Jan 1 of the given year', () => {
      const d = birthDateFromYear(1990);
      expect(d).not.toBeNull();
      expect(d!.getFullYear()).toBe(1990);
      expect(d!.getMonth()).toBe(0);
      expect(d!.getDate()).toBe(1);
    });

    it('returns null for missing or implausible years', () => {
      expect(birthDateFromYear(null)).toBeNull();
      expect(birthDateFromYear(undefined)).toBeNull();
      expect(birthDateFromYear(1800)).toBeNull();
      expect(birthDateFromYear(new Date().getFullYear() + 1)).toBeNull();
    });
  });

  describe('weeksLived', () => {
    it('counts whole weeks since birth', () => {
      const now = new Date(2026, 6, 2); // Thu Jul 2 2026
      const birth = new Date(2026, 5, 4); // Jun 4 2026 — 28 days = 4 weeks
      expect(weeksLived(birth, now)).toBe(4);
    });

    it('returns 0 for no birth date', () => {
      expect(weeksLived(null)).toBe(0);
    });

    it('returns 0 when birth is in the future', () => {
      expect(weeksLived(new Date(2099, 0, 1), new Date(2026, 0, 1))).toBe(0);
    });
  });

  describe('yearsLived', () => {
    it('converts weeks to whole years', () => {
      const birth = new Date(1990, 0, 1);
      const now = new Date(2026, 6, 2);
      // ~36.5 years → 36
      expect(yearsLived(birth, now)).toBe(Math.floor(weeksLived(birth, now) / 52));
    });
  });

  describe('weekIndexForDay', () => {
    it('returns the 0-indexed week for a given day', () => {
      const birth = new Date(2026, 0, 1);
      expect(weekIndexForDay(birth, '2026-01-08')).toBe(1);
      expect(weekIndexForDay(birth, '2026-01-01')).toBe(0);
    });

    it('returns null when day is before birth', () => {
      expect(weekIndexForDay(new Date(2026, 5, 1), '2026-01-01')).toBeNull();
    });

    it('returns null when birth is null', () => {
      expect(weekIndexForDay(null, '2026-01-01')).toBeNull();
    });
  });

  describe('buildLifeGrid', () => {
    it('produces one cell per week up to LIFE_EXPECTANCY_WEEKS', () => {
      const grid = buildLifeGrid(new Date(2026, 0, 1), new Set(), new Date(2026, 0, 15));
      expect(grid.cells).toHaveLength(LIFE_EXPECTANCY_WEEKS);
      expect(grid.totalWeeks).toBe(LIFE_EXPECTANCY_WEEKS);
    });

    it('marks lived vs future weeks', () => {
      const grid = buildLifeGrid(new Date(2026, 0, 1), new Set(), new Date(2026, 0, 15));
      // 2 weeks lived (Jan 1 → Jan 15 = 14 days = 2 weeks)
      expect(grid.weeksLived).toBe(2);
      expect(grid.cells[0].lived).toBe(true);
      expect(grid.cells[1].lived).toBe(true);
      expect(grid.cells[2].lived).toBe(false);
    });

    it('lights up stamped weeks', () => {
      const birth = new Date(2026, 0, 1);
      const stamped = new Set([0, 1, 5]);
      const grid = buildLifeGrid(birth, stamped, new Date(2026, 0, 15));
      expect(grid.cells[0].stamped).toBe(true);
      expect(grid.cells[1].stamped).toBe(true);
      expect(grid.cells[2].stamped).toBe(false);
      expect(grid.cells[5].stamped).toBe(true);
    });

    it('handles missing birth with all-future grid', () => {
      const grid = buildLifeGrid(null, new Set());
      expect(grid.weeksLived).toBe(0);
      expect(grid.weeksRemaining).toBe(LIFE_EXPECTANCY_WEEKS);
      expect(grid.cells.every((c) => c.lived === false)).toBe(true);
    });
  });
});
