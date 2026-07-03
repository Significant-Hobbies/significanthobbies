import { LIFE_EXPECTANCY_WEEKS, type LifeGrid as LifeGridData } from '~/lib/mortality';

type Props = {
  grid: LifeGridData;
};

/**
 * Life in Weeks — the stamp frame. A 52×~77 grid where each cell is one
 * week of a ~4,000-week life. Stamped weeks (weeks with practice) glow in
 * gold — that's your mark on the canvas so far. The weeks ahead carry a
 * subtle gold tint: open space, not empty space.
 */
export function LifeGrid({ grid }: Props) {
  const years = Math.ceil(grid.cells.length / 52);
  const lived = grid.weeksLived;
  // The "now" row — where lived meets remaining. Used for the divider line.
  const currentYear = Math.floor(lived / 52);

  return (
    <div className="relative">
      {/* Ambient gold glow behind the remaining-weeks region */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 70% 40%, oklch(0.82 0.13 88 / 0.06), transparent 70%)',
        }}
      />

      <div
        className="relative grid gap-[2px]"
        style={{
          gridTemplateColumns: `repeat(52, minmax(0, 1fr))`,
        }}
        aria-label={`Life grid: ${grid.weeksLived} of ${grid.totalWeeks} weeks stamped`}
      >
        {grid.cells.map((cell) => {
          // Past, unpracticed: muted charcoal
          // Past, practiced (stamped): gold
          // Future (remaining): slightly brighter with a faint gold tint
          let bg = 'bg-foreground/8';
          if (cell.lived) bg = 'bg-foreground/20';
          if (cell.stamped) bg = 'bg-primary';
          if (!cell.lived) bg = 'bg-primary/12';

          return (
            <div
              key={cell.weekIndex}
              className={`aspect-square rounded-[1px] transition-colors ${bg}`}
              title={
                cell.stamped
                  ? `Week ${cell.weekIndex + 1} — stamped`
                  : cell.lived
                    ? `Week ${cell.weekIndex + 1}`
                    : `Week ${cell.weekIndex + 1} — to stamp`
              }
            />
          );
        })}
      </div>

      {/* Editorial axis labels */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground/50">
        <span className="font-mono">Age 0</span>
        <span className="font-mono tabular-nums">{currentYear} yrs stamped</span>
        <span className="font-mono">~{years} years</span>
      </div>
    </div>
  );
}
