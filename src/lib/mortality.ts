// Mortality framing — the "4000 weeks" lens.
// Pure, timezone-independent math over calendar weeks. All functions are
// deterministic given a birth date and "now", so they're trivially testable.

// ≈ 76.9 years. The canonical "4,000 weeks" figure from Oliver Burkeman.
export const LIFE_EXPECTANCY_WEEKS = 4000;
export const WEEKS_PER_YEAR = 52;

export type LifeGridCell = {
  weekIndex: number; // 0-indexed from birth
  lived: boolean;
  // Whether this week falls within a commitment the user was actively
  // practicing (lit up on the grid). Derived from stamped week dates.
  stamped: boolean;
};

export type LifeGrid = {
  weeksLived: number;
  weeksRemaining: number;
  totalWeeks: number;
  yearsLived: number;
  cells: LifeGridCell[];
};

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Whole weeks lived since `birth`. A week counts as lived once it has fully
 * elapsed; the current in-progress week is not counted.
 */
export function weeksLived(birth: Date | null | undefined, now: Date = new Date()): number {
  if (!birth) return 0;
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const elapsed = startOfDay(now).getTime() - startOfDay(birth).getTime();
  if (elapsed <= 0) return 0;
  return Math.floor(elapsed / msPerWeek);
}

export function yearsLived(birth: Date | null | undefined, now: Date = new Date()): number {
  if (!birth) return 0;
  return Math.floor(weeksLived(birth, now) / WEEKS_PER_YEAR);
}

/**
 * Convert a birthYear (as stored on the user row) into an approximate birth
 * date. We assume a Jan 1 birthday — the grid is a rough existential mirror,
 * not a medical record.
 */
export function birthDateFromYear(birthYear: number | null | undefined): Date | null {
  if (!birthYear || birthYear < 1900 || birthYear > new Date().getFullYear()) return null;
  return new Date(birthYear, 0, 1);
}

/**
 * Build the full life grid: one cell per week up to LIFE_EXPECTANCY_WEEKS.
 * `stampedWeekIndices` is a Set of 0-indexed week numbers that contained at
 * least one stamp (practice session).
 */
export function buildLifeGrid(
  birth: Date | null | undefined,
  stampedWeekIndices: Set<number>,
  now: Date = new Date()
): LifeGrid {
  const lived = weeksLived(birth, now);
  const cells: LifeGridCell[] = [];
  for (let i = 0; i < LIFE_EXPECTANCY_WEEKS; i++) {
    cells.push({
      weekIndex: i,
      lived: i < lived,
      stamped: stampedWeekIndices.has(i),
    });
  }
  return {
    weeksLived: lived,
    weeksRemaining: Math.max(0, LIFE_EXPECTANCY_WEEKS - lived),
    totalWeeks: LIFE_EXPECTANCY_WEEKS,
    yearsLived: yearsLived(birth, now),
    cells,
  };
}

/**
 * Given a birth date and a calendar day string 'YYYY-MM-DD', return the
 * 0-indexed week-of-life that day falls in. Used to light up grid cells from
 * stamp dates.
 */
export function weekIndexForDay(birth: Date | null | undefined, dayDate: string): number | null {
  if (!birth) return null;
  // Parse YYYY-MM-DD as local time, not UTC, to avoid off-by-one.
  const [y, m, d] = dayDate.split('-').map(Number);
  if (!y || !m || !d) return null;
  const day = new Date(y, m - 1, d);
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const elapsed = startOfDay(day).getTime() - startOfDay(birth).getTime();
  if (elapsed < 0) return null;
  return Math.floor(elapsed / msPerWeek);
}
