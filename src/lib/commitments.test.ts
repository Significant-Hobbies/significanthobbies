import { describe, expect, it } from 'vitest';

import {
  computeStreak,
  dayIndexFor,
  evaluateStreakBadges,
  inferProofType,
  isCommitmentComplete,
  normalizeProofUrl,
  type StampRow,
} from './commitments';

function stamp(dayDate: string, dayIndex = 0): StampRow {
  return { dayDate, dayIndex, proofUrl: 'https://youtube.com/x', proofType: 'youtube', note: null };
}

describe('commitments', () => {
  describe('inferProofType', () => {
    it('detects youtube urls', () => {
      expect(inferProofType('https://www.youtube.com/watch?v=abc')).toBe('youtube');
      expect(inferProofType('https://youtu.be/abc')).toBe('youtube');
      expect(inferProofType('youtube.com/watch?v=abc')).toBe('youtube');
    });

    it('detects image and video extensions', () => {
      expect(inferProofType('https://imgur.com/x.png')).toBe('image');
      expect(inferProofType('https://site.com/clip.mp4')).toBe('video');
    });

    it('falls back to url or text', () => {
      expect(inferProofType('https://example.com/post')).toBe('url');
      expect(inferProofType('just some notes')).toBe('text');
      expect(inferProofType('')).toBe('text');
    });
  });

  describe('normalizeProofUrl', () => {
    it('prefixes https:// for bare domains', () => {
      expect(normalizeProofUrl('youtube.com/x')).toBe('https://youtube.com/x');
      expect(normalizeProofUrl('youtu.be/abc')).toBe('https://youtu.be/abc');
    });

    it('leaves full urls and text alone', () => {
      expect(normalizeProofUrl('https://example.com/x')).toBe('https://example.com/x');
      expect(normalizeProofUrl('some notes')).toBe('some notes');
      expect(normalizeProofUrl('')).toBe('');
    });
  });

  describe('computeStreak', () => {
    it('returns zeros for no stamps', () => {
      const info = computeStreak([]);
      expect(info.currentStreak).toBe(0);
      expect(info.longestStreak).toBe(0);
      expect(info.totalStamps).toBe(0);
      expect(info.stampedToday).toBe(false);
    });

    it('counts a current streak ending today', () => {
      const now = new Date(2026, 6, 2); // Jul 2
      const stamps = [stamp('2026-06-30', 0), stamp('2026-07-01', 1), stamp('2026-07-02', 2)];
      const info = computeStreak(stamps, now);
      expect(info.currentStreak).toBe(3);
      expect(info.stampedToday).toBe(true);
      expect(info.longestStreak).toBe(3);
    });

    it('keeps streak alive when today is missed but yesterday stamped', () => {
      const now = new Date(2026, 6, 2); // Jul 2
      const stamps = [stamp('2026-06-30'), stamp('2026-07-01')];
      const info = computeStreak(stamps, now);
      expect(info.stampedToday).toBe(false);
      expect(info.stampedYesterday).toBe(true);
      expect(info.currentStreak).toBe(2);
    });

    it('breaks the current streak when both today and yesterday are missed', () => {
      const now = new Date(2026, 6, 2);
      const stamps = [stamp('2026-06-28'), stamp('2026-06-29')];
      const info = computeStreak(stamps, now);
      expect(info.currentStreak).toBe(0);
      expect(info.longestStreak).toBe(2);
    });

    it('computes longest streak across a gap', () => {
      const now = new Date(2026, 6, 2);
      const stamps = [
        stamp('2026-06-01'),
        stamp('2026-06-02'),
        stamp('2026-06-03'),
        // gap
        stamp('2026-06-05'),
        stamp('2026-06-06'),
      ];
      const info = computeStreak(stamps, now);
      expect(info.longestStreak).toBe(3);
    });

    it('deduplicates stamps on the same day', () => {
      const now = new Date(2026, 6, 2);
      const stamps = [stamp('2026-07-02'), stamp('2026-07-02'), stamp('2026-07-01')];
      const info = computeStreak(stamps, now);
      expect(info.totalStamps).toBe(2);
      expect(info.currentStreak).toBe(2);
    });
  });

  describe('dayIndexFor', () => {
    it('is 0 on the start date and increments per day', () => {
      const start = new Date(2026, 6, 1);
      expect(dayIndexFor(start, '2026-07-01')).toBe(0);
      expect(dayIndexFor(start, '2026-07-02')).toBe(1);
      expect(dayIndexFor(start, '2026-07-31')).toBe(30);
    });

    it('clamps negative values to 0', () => {
      const start = new Date(2026, 6, 5);
      expect(dayIndexFor(start, '2026-07-01')).toBe(0);
    });
  });

  describe('isCommitmentComplete', () => {
    it('is true when unique stamp days meet the goal', () => {
      const stamps = [stamp('2026-07-01'), stamp('2026-07-02'), stamp('2026-07-02')];
      expect(isCommitmentComplete(stamps, 2)).toBe(true);
      expect(isCommitmentComplete(stamps, 3)).toBe(false);
    });
  });

  describe('evaluateStreakBadges', () => {
    it('returns badges at and below the threshold', () => {
      expect(evaluateStreakBadges(7)).toContain('showed-up');
      expect(evaluateStreakBadges(7)).not.toContain('month-of-marks');
      expect(evaluateStreakBadges(30)).toContain('month-of-marks');
      expect(evaluateStreakBadges(365)).toContain('year-of-stamps');
    });

    it('returns nothing for short streaks', () => {
      expect(evaluateStreakBadges(0)).toEqual([]);
      expect(evaluateStreakBadges(6)).toEqual([]);
    });
  });
});
