import { cn } from '~/lib/utils';

interface HabitLogLite {
  habitId: string;
  dayDate: string;
  completed: boolean;
}

interface Props {
  /** All habit logs for the user. */
  allHabitLogs: HabitLogLite[];
  /** Number of weeks to display (columns). Default 12. */
  weeks?: number;
  className?: string;
}

/**
 * Habit Heatmap — a GitHub-style contribution graph showing daily habit
 * completion. 7 rows (days of the week) × N columns (weeks). Gold cells for
 * days with at least one completed habit; intensity scales with the fraction
 * of habits completed that day.
 */
export function HabitHeatmap({ allHabitLogs, weeks = 12, className }: Props) {
  const today = new Date();
  // Normalize to local midnight
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // Build a map of dayDate -> completedCount for quick lookup
  const completedByDate = new Map<string, number>();
  for (const log of allHabitLogs) {
    if (log.completed) {
      completedByDate.set(log.dayDate, (completedByDate.get(log.dayDate) ?? 0) + 1);
    }
  }

  // Total active habits (unique habitIds in logs, but better to count all
  // habits — we approximate from logs since that's all we have here)
  const uniqueHabits = new Set(allHabitLogs.map((l) => l.habitId));
  const totalHabits = Math.max(1, uniqueHabits.size);

  // Generate the grid: weeks columns × 7 rows (Sun–Sat)
  // We want the last column to end today. Find the Saturday of the current week.
  const dayOfWeek = todayMidnight.getDay(); // 0=Sun, 6=Sat
  const lastSaturday = new Date(todayMidnight);
  lastSaturday.setDate(todayMidnight.getDate() + (6 - dayOfWeek));

  const columns: { date: Date; count: number; intensity: number }[][] = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const column: { date: Date; count: number; intensity: number }[] = [];
    for (let d = 0; d < 7; d++) {
      // Walk back from lastSaturday
      const date = new Date(lastSaturday);
      date.setDate(lastSaturday.getDate() - (w * 7 + (6 - d)));
      const dateStr = date.toISOString().slice(0, 10);
      const count = completedByDate.get(dateStr) ?? 0;
      const intensity = count / totalHabits; // 0..1
      column.push({ date, count, intensity });
    }
    columns.push(column);
  }

  const monthLabels = getMonthLabels(columns);

  return (
    <div className={cn('w-full', className)}>
      {/* Month labels */}
      <div className="mb-1.5 flex gap-[3px] pl-0 text-[10px] text-muted-foreground/50">
        {monthLabels.map((label, i) => (
          <span key={i} className="w-[14px] shrink-0 text-center">
            {label}
          </span>
        ))}
      </div>

      <div className="flex gap-[3px]">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] pr-1.5 text-[10px] text-muted-foreground/40">
          <span className="h-[14px] leading-[14px]">Mon</span>
          <span className="h-[14px] leading-[14px]" />
          <span className="h-[14px] leading-[14px]">Wed</span>
          <span className="h-[14px] leading-[14px]" />
          <span className="h-[14px] leading-[14px]">Fri</span>
          <span className="h-[14px] leading-[14px]" />
        </div>

        {/* Grid */}
        <div className="flex gap-[3px]">
          {columns.map((column, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-[3px]">
              {column.map((cell) => {
                const isFuture = cell.date > todayMidnight;
                const cellClass = isFuture
                  ? 'bg-transparent'
                  : cell.count === 0
                    ? 'bg-foreground/8'
                    : cell.intensity <= 0.34
                      ? 'bg-primary/30'
                      : cell.intensity <= 0.67
                        ? 'bg-primary/55'
                        : cell.intensity < 1
                          ? 'bg-primary/80'
                          : 'bg-primary';

                return (
                  <div
                    key={cell.date.toISOString()}
                    className={cn('h-[14px] w-[14px] rounded-[2px] transition-colors', cellClass)}
                    title={
                      isFuture
                        ? ''
                        : cell.count === 0
                          ? `No habits on ${cell.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                          : `${cell.count} habit${cell.count > 1 ? 's' : ''} on ${cell.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                    }
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground/50">
        <span>Less</span>
        <div className="h-[10px] w-[10px] rounded-[2px] bg-foreground/8" />
        <div className="h-[10px] w-[10px] rounded-[2px] bg-primary/30" />
        <div className="h-[10px] w-[10px] rounded-[2px] bg-primary/55" />
        <div className="h-[10px] w-[10px] rounded-[2px] bg-primary/80" />
        <div className="h-[10px] w-[10px] rounded-[2px] bg-primary" />
        <span>More</span>
      </div>
    </div>
  );
}

function getMonthLabels(columns: { date: Date; count: number; intensity: number }[][]): string[] {
  const labels: string[] = [];
  let lastMonth = -1;
  for (const col of columns) {
    // Use the middle day (Wed) of the column for the month label
    const midDay = col[3]?.date ?? col[0].date;
    const month = midDay.getMonth();
    if (month !== lastMonth) {
      labels.push(midDay.toLocaleDateString('en-US', { month: 'short' }).slice(0, 3));
      lastMonth = month;
    } else {
      labels.push('');
    }
  }
  return labels;
}
