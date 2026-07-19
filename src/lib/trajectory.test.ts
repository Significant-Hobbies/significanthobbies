import { describe, expect, it } from 'vitest';

import {
  BUCKET_LABELS,
  TRAJECTORY_BUCKETS,
  bucketHasEnoughPointsForChart,
  extractChartSeries,
  formatEraOneLine,
  formatMonthLabel,
  isMonthEndWindow,
  isTrajectoryBucket,
  monthEndNudgeTargetMonth,
  monthKeyFor,
  parseEntryNumbers,
  previousMonthKey,
  serializeEntryNumbers,
  summarizeEra,
  type TrajectoryEntryRow,
  type TrajectoryEraRow,
} from './trajectory';

describe('trajectory', () => {
  describe('TRAJECTORY_BUCKETS + helpers', () => {
    it('exposes the 4 fixed buckets in canonical order', () => {
      expect(TRAJECTORY_BUCKETS).toEqual(['health', 'finance', 'knowledge', 'relationships']);
    });

    it('BUCKET_LABELS covers every bucket', () => {
      for (const b of TRAJECTORY_BUCKETS) {
        expect(BUCKET_LABELS[b]).toBeTruthy();
      }
    });

    it('isTrajectoryBucket narrows only valid buckets', () => {
      expect(isTrajectoryBucket('health')).toBe(true);
      expect(isTrajectoryBucket('Health')).toBe(false);
      expect(isTrajectoryBucket('spirituality')).toBe(false);
      expect(isTrajectoryBucket('')).toBe(false);
    });
  });

  describe('monthKeyFor', () => {
    it('formats YYYY-MM with zero-padded month', () => {
      expect(monthKeyFor(new Date(2026, 0, 1))).toBe('2026-01');
      expect(monthKeyFor(new Date(2026, 6, 19))).toBe('2026-07');
      expect(monthKeyFor(new Date(2026, 11, 31))).toBe('2026-12');
    });
  });

  describe('previousMonthKey', () => {
    it('decrements a normal month', () => {
      expect(previousMonthKey('2026-07')).toBe('2026-06');
      expect(previousMonthKey('2026-03')).toBe('2026-02');
    });

    it('wraps Jan → Dec of the previous year', () => {
      expect(previousMonthKey('2026-01')).toBe('2025-12');
      expect(previousMonthKey('2020-01')).toBe('2019-12');
    });

    it('throws on malformed input', () => {
      expect(() => previousMonthKey('2026')).toThrow();
      expect(() => previousMonthKey('garbage')).toThrow();
    });
  });

  describe('isMonthEndWindow', () => {
    it('returns true on the last day of the month', () => {
      expect(isMonthEndWindow(new Date(2026, 6, 31))).toBe(true); // Jul 31
      expect(isMonthEndWindow(new Date(2026, 0, 31))).toBe(true); // Jan 31
      expect(isMonthEndWindow(new Date(2026, 1, 28))).toBe(true); // Feb 28 (non-leap)
      expect(isMonthEndWindow(new Date(2024, 1, 29))).toBe(true); // Feb 29 (leap)
      expect(isMonthEndWindow(new Date(2026, 11, 31))).toBe(true); // Dec 31
    });

    it('returns true on the first day of the month', () => {
      expect(isMonthEndWindow(new Date(2026, 6, 1))).toBe(true); // Jul 1
      expect(isMonthEndWindow(new Date(2026, 0, 1))).toBe(true); // Jan 1
      expect(isMonthEndWindow(new Date(2027, 0, 1))).toBe(true); // Jan 1 (after Dec 31)
    });

    it('returns false on mid-month days', () => {
      expect(isMonthEndWindow(new Date(2026, 6, 15))).toBe(false);
      expect(isMonthEndWindow(new Date(2026, 6, 19))).toBe(false);
      expect(isMonthEndWindow(new Date(2026, 0, 2))).toBe(false);
      expect(isMonthEndWindow(new Date(2026, 0, 30))).toBe(false);
    });

    it('handles the Dec 31 → Jan 1 boundary correctly', () => {
      // Dec 31 is the last day of Dec → in window
      expect(isMonthEndWindow(new Date(2026, 11, 31))).toBe(true);
      // Jan 1 is the first day of Jan AND yesterday was Dec → in window
      expect(isMonthEndWindow(new Date(2027, 0, 1))).toBe(true);
      // Jan 2: yesterday was Jan 1 (same month), tomorrow is Jan 3 (same month) → not in window
      expect(isMonthEndWindow(new Date(2027, 0, 2))).toBe(false);
    });

    it('handles Feb 28 non-leap (last day of Feb) vs Feb 29 leap', () => {
      // 2026 is not a leap year — Feb 28 is the last day of Feb
      expect(isMonthEndWindow(new Date(2026, 1, 28))).toBe(true);
      // Feb 28 in a non-leap year: tomorrow is Mar 1 (different month) → in window
      expect(isMonthEndWindow(new Date(2026, 1, 28))).toBe(true);
      // Feb 28 in a leap year (2024): NOT the last day → not in window (unless first day, which it isn't)
      expect(isMonthEndWindow(new Date(2024, 1, 28))).toBe(false);
      // Feb 29 in a leap year: last day of Feb → in window
      expect(isMonthEndWindow(new Date(2024, 1, 29))).toBe(true);
      // Mar 1 in 2024: yesterday was Feb 29 (different month) → in window
      expect(isMonthEndWindow(new Date(2024, 2, 1))).toBe(true);
    });
  });

  describe('monthEndNudgeTargetMonth', () => {
    it('returns the current month on the last day of the month', () => {
      // Jul 31 2026 — last day of July → reflect on July
      expect(monthEndNudgeTargetMonth(new Date(2026, 6, 31))).toBe('2026-07');
    });

    it('returns the previous month on the first day of the month', () => {
      // Aug 1 2026 — yesterday was Jul 31 → reflect on July
      expect(monthEndNudgeTargetMonth(new Date(2026, 7, 1))).toBe('2026-07');
      // Jan 1 2027 — yesterday was Dec 31 2026 → reflect on Dec 2026
      expect(monthEndNudgeTargetMonth(new Date(2027, 0, 1))).toBe('2026-12');
    });

    it('returns null outside the window', () => {
      expect(monthEndNudgeTargetMonth(new Date(2026, 6, 15))).toBeNull();
      expect(monthEndNudgeTargetMonth(new Date(2026, 6, 19))).toBeNull();
    });
  });

  describe('bucketHasEnoughPointsForChart', () => {
    const eraId = 'era-1';

    function entry(
      eraId: string,
      monthKey: string,
      numbers: { label: string; value: number }[] = []
    ) {
      return {
        id: `e-${eraId}-${monthKey}`,
        eraId,
        userId: 'u1',
        bucket: 'finance' as const,
        monthKey,
        reflection: '',
        numbers,
      } satisfies TrajectoryEntryRow;
    }

    it('returns false for 0, 1, or 2 entries with numbers', () => {
      expect(bucketHasEnoughPointsForChart([], eraId)).toBe(false);
      expect(
        bucketHasEnoughPointsForChart(
          [entry(eraId, '2026-01', [{ label: 'runway', value: 3 }])],
          eraId
        )
      ).toBe(false);
      expect(
        bucketHasEnoughPointsForChart(
          [
            entry(eraId, '2026-01', [{ label: 'runway', value: 3 }]),
            entry(eraId, '2026-02', [{ label: 'runway', value: 4 }]),
          ],
          eraId
        )
      ).toBe(false);
    });

    it('returns true for 3 entries with numbers', () => {
      expect(
        bucketHasEnoughPointsForChart(
          [
            entry(eraId, '2026-01', [{ label: 'runway', value: 3 }]),
            entry(eraId, '2026-02', [{ label: 'runway', value: 4 }]),
            entry(eraId, '2026-03', [{ label: 'runway', value: 5 }]),
          ],
          eraId
        )
      ).toBe(true);
    });

    it('does not count entries with no numeric inputs', () => {
      expect(
        bucketHasEnoughPointsForChart(
          [
            entry(eraId, '2026-01', [{ label: 'runway', value: 3 }]),
            entry(eraId, '2026-02', [{ label: 'runway', value: 4 }]),
            entry(eraId, '2026-03'), // reflection only, no numbers
          ],
          eraId
        )
      ).toBe(false);
    });

    it('does not count entries from a different era', () => {
      expect(
        bucketHasEnoughPointsForChart(
          [
            entry(eraId, '2026-01', [{ label: 'runway', value: 3 }]),
            entry(eraId, '2026-02', [{ label: 'runway', value: 4 }]),
            entry('other-era', '2026-03', [{ label: 'runway', value: 5 }]),
          ],
          eraId
        )
      ).toBe(false);
    });
  });

  describe('extractChartSeries', () => {
    const eraId = 'era-1';

    function entry(eraId: string, monthKey: string, numbers: { label: string; value: number }[]) {
      return {
        id: `e-${eraId}-${monthKey}`,
        eraId,
        userId: 'u1',
        bucket: 'health' as const,
        monthKey,
        reflection: '',
        numbers,
      } satisfies TrajectoryEntryRow;
    }

    it('groups points by label and sorts by monthKey', () => {
      const series = extractChartSeries(
        [
          entry(eraId, '2026-03', [{ label: 'workouts', value: 12 }]),
          entry(eraId, '2026-01', [{ label: 'workouts', value: 8 }]),
          entry(eraId, '2026-02', [{ label: 'workouts', value: 10 }]),
        ],
        eraId
      );
      expect(series).toHaveLength(1);
      expect(series[0].label).toBe('workouts');
      expect(series[0].points.map((p) => p.monthKey)).toEqual(['2026-01', '2026-02', '2026-03']);
      expect(series[0].points.map((p) => p.value)).toEqual([8, 10, 12]);
    });

    it('separates multiple labels in the same era', () => {
      const series = extractChartSeries(
        [
          entry(eraId, '2026-01', [
            { label: 'workouts', value: 8 },
            { label: 'sleep avg', value: 7 },
          ]),
          entry(eraId, '2026-02', [
            { label: 'workouts', value: 10 },
            { label: 'sleep avg', value: 6.5 },
          ]),
        ],
        eraId
      );
      expect(series).toHaveLength(2);
      const labels = series.map((s) => s.label).sort();
      expect(labels).toEqual(['sleep avg', 'workouts']);
    });

    it('ignores entries from other eras', () => {
      const series = extractChartSeries(
        [
          entry(eraId, '2026-01', [{ label: 'workouts', value: 8 }]),
          entry('other-era', '2026-02', [{ label: 'workouts', value: 10 }]),
        ],
        eraId
      );
      expect(series).toHaveLength(1);
      expect(series[0].points).toHaveLength(1);
      expect(series[0].points[0].monthKey).toBe('2026-01');
    });

    it('ignores entries with no numbers', () => {
      const series = extractChartSeries(
        [entry(eraId, '2026-01', []), entry(eraId, '2026-02', [{ label: 'workouts', value: 10 }])],
        eraId
      );
      expect(series).toHaveLength(1);
      expect(series[0].points).toHaveLength(1);
    });
  });

  describe('summarizeEra', () => {
    const era: TrajectoryEraRow = {
      id: 'era-1',
      userId: 'u1',
      bucket: 'finance',
      idealText: '12 months runway',
      status: 'completed',
      openedAt: new Date(2026, 2, 1), // Mar 1 2026
      closedAt: new Date(2026, 7, 15), // Aug 15 2026
    };

    function entry(monthKey: string): TrajectoryEntryRow {
      return {
        id: `e-${monthKey}`,
        eraId: era.id,
        userId: 'u1',
        bucket: 'finance',
        monthKey,
        reflection: '',
        numbers: [],
      };
    }

    it('counts entries and finds the last month', () => {
      const summary = summarizeEra(era, [
        entry('2026-03'),
        entry('2026-04'),
        entry('2026-05'),
        entry('2026-06'),
        entry('2026-07'),
      ]);
      expect(summary.monthCount).toBe(5);
      expect(summary.lastEntryMonth).toBe('2026-07');
    });

    it('returns monthCount 0 and null lastEntryMonth for an era with no entries', () => {
      const summary = summarizeEra(era, []);
      expect(summary.monthCount).toBe(0);
      expect(summary.lastEntryMonth).toBeNull();
    });

    it('only counts entries for this era', () => {
      const summary = summarizeEra(era, [
        entry('2026-03'),
        { ...entry('2026-04'), eraId: 'other-era' },
      ]);
      expect(summary.monthCount).toBe(1);
    });
  });

  describe('formatEraOneLine', () => {
    it('formats an active era with "present" end', () => {
      const summary = {
        id: 'era-1',
        bucket: 'finance' as const,
        status: 'active' as const,
        idealText: '12 months runway',
        openedAt: new Date(2026, 2, 1), // Mar 2026
        closedAt: null,
        monthCount: 2,
        lastEntryMonth: '2026-04',
      };
      expect(formatEraOneLine(summary)).toBe('Finance · Mar 2026 – present · active');
    });

    it('formats a completed multi-month era', () => {
      const summary = {
        id: 'era-1',
        bucket: 'finance' as const,
        status: 'completed' as const,
        idealText: '12 months runway',
        openedAt: new Date(2026, 2, 1), // Mar 2026
        closedAt: new Date(2026, 7, 15), // Aug 2026
        monthCount: 5,
        lastEntryMonth: '2026-07',
      };
      expect(formatEraOneLine(summary)).toBe('Finance · Mar 2026–Aug 2026 · ✓ reached');
    });

    it('formats an abandoned era', () => {
      const summary = {
        id: 'era-1',
        bucket: 'health' as const,
        status: 'abandoned' as const,
        idealText: 'work out 3x/week',
        openedAt: new Date(2026, 0, 1), // Jan 2026
        closedAt: new Date(2026, 1, 20), // Feb 2026
        monthCount: 2,
        lastEntryMonth: '2026-02',
      };
      expect(formatEraOneLine(summary)).toBe('Health · Jan 2026–Feb 2026 · ✗ abandoned');
    });

    it('formats a single-month era without an end range', () => {
      const summary = {
        id: 'era-1',
        bucket: 'knowledge' as const,
        status: 'abandoned' as const,
        idealText: 'read 2 books/month',
        openedAt: new Date(2026, 0, 1), // Jan 2026
        closedAt: new Date(2026, 0, 20), // Jan 2026 — same month
        monthCount: 1,
        lastEntryMonth: '2026-01',
      };
      expect(formatEraOneLine(summary)).toBe('Knowledge · Jan 2026 · ✗ abandoned');
    });
  });

  describe('formatMonthLabel', () => {
    it('formats a YYYY-MM monthKey as "Jul 2026"', () => {
      expect(formatMonthLabel('2026-07')).toBe('Jul 2026');
      expect(formatMonthLabel('2026-01')).toBe('Jan 2026');
      expect(formatMonthLabel('2026-12')).toBe('Dec 2026');
    });

    it('returns the input unchanged for malformed keys', () => {
      expect(formatMonthLabel('garbage')).toBe('garbage');
      expect(formatMonthLabel('2026')).toBe('2026');
      expect(formatMonthLabel('2026-13')).toBe('2026-13');
    });
  });

  describe('parseEntryNumbers / serializeEntryNumbers', () => {
    it('round-trips a list of numeric inputs', () => {
      const numbers = [
        { label: 'runway months', value: 7 },
        { label: 'savings rate', value: 0.2 },
      ];
      const serialized = serializeEntryNumbers(numbers);
      expect(parseEntryNumbers(serialized)).toEqual(numbers);
    });

    it('returns empty array for null/undefined/empty', () => {
      expect(parseEntryNumbers(null)).toEqual([]);
      expect(parseEntryNumbers(undefined)).toEqual([]);
      expect(parseEntryNumbers('')).toEqual([]);
    });

    it('returns empty array for malformed JSON', () => {
      expect(parseEntryNumbers('not json')).toEqual([]);
      expect(parseEntryNumbers('{')).toEqual([]);
    });

    it('returns empty array for non-array JSON', () => {
      expect(parseEntryNumbers('{"label":"x","value":1}')).toEqual([]);
      expect(parseEntryNumbers('"hello"')).toEqual([]);
    });

    it('filters out items with wrong shape', () => {
      const input = JSON.stringify([
        { label: 'valid', value: 5 },
        { label: 'no value' },
        { value: 5 },
        { label: 'NaN value', value: NaN },
        { label: 'Infinity value', value: Infinity },
        'not an object',
        null,
        { label: 'another valid', value: 10 },
      ]);
      const parsed = parseEntryNumbers(input);
      expect(parsed).toEqual([
        { label: 'valid', value: 5 },
        { label: 'another valid', value: 10 },
      ]);
    });
  });
});
