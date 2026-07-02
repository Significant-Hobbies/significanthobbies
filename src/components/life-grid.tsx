import { LIFE_EXPECTANCY_WEEKS, type LifeGrid as LifeGridData } from '~/lib/mortality';

type Props = {
  grid: LifeGridData;
};

export function LifeGrid({ grid }: Props) {
  const years = Math.ceil(grid.cells.length / 52);

  return (
    <div>
      <div
        className="grid gap-[2px]"
        style={{
          gridTemplateColumns: `repeat(52, minmax(0, 1fr))`,
        }}
        aria-label={`Life grid: ${grid.weeksLived} of ${grid.totalWeeks} weeks lived`}
      >
        {grid.cells.map((cell) => {
          let bg = 'bg-foreground/8';
          if (cell.lived) bg = 'bg-foreground/20';
          if (cell.stamped) bg = 'bg-foreground/60';
          return (
            <div
              key={cell.weekIndex}
              className={`aspect-square rounded-[1px] ${bg}`}
              title={
                cell.stamped
                  ? `Week ${cell.weekIndex + 1} — practiced`
                  : cell.lived
                    ? `Week ${cell.weekIndex + 1}`
                    : `Week ${cell.weekIndex + 1} — ahead`
              }
            />
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground/50">
        <span>Age 0</span>
        <span>~{years} years</span>
      </div>
    </div>
  );
}
