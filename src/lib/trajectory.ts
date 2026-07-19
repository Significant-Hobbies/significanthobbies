// Pure helpers for the Trajectory feature. No DB/auth deps — unit-testable
// in isolation. See docs/product/trajectory.md for the design and
// docs/product/trajectory-build-plan.md for the build plan.

export const TRAJECTORY_BUCKETS = ['health', 'finance', 'knowledge', 'relationships'] as const;

export type TrajectoryBucket = (typeof TRAJECTORY_BUCKETS)[number];

export const BUCKET_LABELS: Record<TrajectoryBucket, string> = {
  health: 'Health',
  finance: 'Finance',
  knowledge: 'Knowledge',
  relationships: 'Relationships',
};

export const BUCKET_EMOJI: Record<TrajectoryBucket, string> = {
  health: '❤️',
  finance: '💰',
  knowledge: '📚',
  relationships: '🤝',
};

export type EraStatus = 'active' | 'completed' | 'abandoned';

export interface TrajectoryEraRow {
  id: string;
  userId: string;
  bucket: TrajectoryBucket;
  idealText: string;
  status: EraStatus;
  openedAt: Date;
  closedAt: Date | null;
}

export interface TrajectoryNumberInput {
  label: string;
  value: number;
}

export interface TrajectoryEntryRow {
  id: string;
  eraId: string;
  userId: string;
  bucket: TrajectoryBucket;
  monthKey: string;
  reflection: string;
  numbers: TrajectoryNumberInput[];
}

export function isTrajectoryBucket(value: string): value is TrajectoryBucket {
  return (TRAJECTORY_BUCKETS as readonly string[]).includes(value);
}

// ── Month helpers ───────────────────────────────────────────────────────────

/** Returns YYYY-MM for the given date (in the user's local timezone). */
export function monthKeyFor(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/**
 * Returns the monthKey for the month *before* the given monthKey.
 * Handles Jan → Dec of the previous year.
 */
export function previousMonthKey(monthKey: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(monthKey);
  if (!match) throw new Error(`Invalid monthKey: ${monthKey}`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month === 1) return `${year - 1}-12`;
  return `${year}-${String(month - 1).padStart(2, '0')}`;
}

/**
 * The 2-day month-end window: today is the last day of its month OR the
 * first day of its month. (Design choice #4 — active on the last day and
 * the first day so users who miss the last day still get a clean nudge.)
 *
 * - Last day: tomorrow's month differs from today's month.
 * - First day: yesterday's month differs from today's month.
 */
export function isMonthEndWindow(now: Date = new Date()): boolean {
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  return monthKeyFor(now) !== monthKeyFor(tomorrow) || monthKeyFor(now) !== monthKeyFor(yesterday);
}

/**
 * Which monthKey the month-end nudge is asking the user to reflect on.
 * - On the last day of the month: the current month (closing it out).
 * - On the first day of the month: the previous month (just ended).
 * Returns null if `now` is not in the window.
 */
export function monthEndNudgeTargetMonth(now: Date = new Date()): string | null {
  if (!isMonthEndWindow(now)) return null;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  // If yesterday is in a different month, today is the first day → reflect
  // on the previous (just-ended) month.
  if (monthKeyFor(now) !== monthKeyFor(yesterday)) {
    return monthKeyFor(yesterday);
  }
  // Otherwise today is the last day → reflect on the current month.
  return monthKeyFor(now);
}

// ── Chart helpers ───────────────────────────────────────────────────────────

/**
 * The "don't draw a line until 3 data points" rule (graph framing in the
 * design). Counts entries within the given era that have at least one
 * numeric input. Entries from other eras don't count toward this era's
 * chart.
 */
export function bucketHasEnoughPointsForChart(
  entries: TrajectoryEntryRow[],
  eraId: string
): boolean {
  const count = entries.filter((e) => e.eraId === eraId && e.numbers.length > 0).length;
  return count >= 3;
}

/**
 * Extracts a plottable series per numeric label for a given era.
 * Returns `{ label, points: { monthKey, value }[] }[]` sorted by monthKey.
 * Only includes entries with at least one numeric input.
 */
export function extractChartSeries(
  entries: TrajectoryEntryRow[],
  eraId: string
): { label: string; points: { monthKey: string; value: number }[] }[] {
  const eraEntries = entries
    .filter((e) => e.eraId === eraId && e.numbers.length > 0)
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey));

  const byLabel = new Map<string, { monthKey: string; value: number }[]>();
  for (const entry of eraEntries) {
    for (const num of entry.numbers) {
      const series = byLabel.get(num.label) ?? [];
      series.push({ monthKey: entry.monthKey, value: num.value });
      byLabel.set(num.label, series);
    }
  }

  return Array.from(byLabel.entries())
    .map(([label, points]) => ({ label, points }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

// ── Era summaries ───────────────────────────────────────────────────────────

export interface EraSummary {
  id: string;
  bucket: TrajectoryBucket;
  status: EraStatus;
  idealText: string;
  openedAt: Date;
  closedAt: Date | null;
  monthCount: number;
  lastEntryMonth: string | null;
}

/**
 * Summarizes an era for the one-line era list display. `entries` should be
 * all entries for the user (the function filters to this era internally).
 */
export function summarizeEra(era: TrajectoryEraRow, entries: TrajectoryEntryRow[]): EraSummary {
  const eraEntries = entries
    .filter((e) => e.eraId === era.id)
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  return {
    id: era.id,
    bucket: era.bucket,
    status: era.status,
    idealText: era.idealText,
    openedAt: era.openedAt,
    closedAt: era.closedAt,
    monthCount: eraEntries.length,
    lastEntryMonth: eraEntries.length > 0 ? eraEntries[eraEntries.length - 1].monthKey : null,
  };
}

/**
 * Formats a one-line era summary for display, e.g.:
 *   "Finance · Mar–Aug 2026 · ✓ reached"
 *   "Finance · Jan–Feb 2026 · ✗ abandoned"
 *   "Finance · Mar 2026 – present · active"
 */
export function formatEraOneLine(summary: EraSummary): string {
  const bucketLabel = BUCKET_LABELS[summary.bucket];
  const startMonth = formatMonthRangeStart(summary.openedAt);
  const endPart = formatMonthRangeEnd(summary);
  const statusPart =
    summary.status === 'completed'
      ? '✓ reached'
      : summary.status === 'abandoned'
        ? '✗ abandoned'
        : 'active';
  return `${bucketLabel} · ${startMonth}${endPart} · ${statusPart}`;
}

function formatMonthRangeStart(openedAt: Date): string {
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${monthNames[openedAt.getMonth()]} ${openedAt.getFullYear()}`;
}

function formatMonthRangeEnd(summary: EraSummary): string {
  if (summary.status === 'active') {
    return ' – present';
  }
  if (!summary.closedAt) {
    return '';
  }
  const start = summary.openedAt;
  const end = summary.closedAt;
  const sameMonth =
    start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth();
  if (sameMonth) {
    return ''; // single-month era: just show the start month
  }
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `–${monthNames[end.getMonth()]} ${end.getFullYear()}`;
}

/** Formats a YYYY-MM monthKey for display as "Jul 2026". */
export function formatMonthLabel(monthKey: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(monthKey);
  if (!match) return monthKey;
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  if (month < 0 || month > 11) return monthKey;
  return `${monthNames[month]} ${year}`;
}

// ── JSON parsing for the numbers column ─────────────────────────────────────

/**
 * Parses the `numbers` JSON column from a TrajectoryEntry row. Returns an
 * empty array if the value is missing, null, or malformed (defensive —
 * matches the parseJSONColumn pattern used elsewhere in the codebase).
 */
export function parseEntryNumbers(raw: string | null | undefined): TrajectoryNumberInput[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is TrajectoryNumberInput =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as TrajectoryNumberInput).label === 'string' &&
        typeof (item as TrajectoryNumberInput).value === 'number' &&
        Number.isFinite((item as TrajectoryNumberInput).value)
    );
  } catch {
    return [];
  }
}

/** Serializes a list of numeric inputs for storage in the `numbers` column. */
export function serializeEntryNumbers(numbers: TrajectoryNumberInput[]): string {
  return JSON.stringify(numbers);
}
