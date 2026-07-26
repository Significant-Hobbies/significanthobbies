'use client';

const COLUMNS = 52;

/**
 * Colour of a week already spent.
 *
 * Must be **opaque**: this layer sits above the lit one, so any transparency
 * lets gold bleed through and the two states merge into one.
 *
 * No token fits. `--muted` (L 0.23) and `--border` (L 0.27) both sit too close
 * to the L 0.15 page — at that contrast the weeks already lived read as empty
 * space rather than as decades of a life. L 0.34 gives them mass while staying
 * far below the L 0.82 gold, so the remainder still leads. The app has no
 * light theme, so a fixed value is safe here.
 */
const SPENT = 'oklch(0.34 0.005 285)';

type Props = {
  weeksLived: number;
  totalWeeks: number;
  /** Already accounts for prefers-reduced-motion; resolved by the parent. */
  animate: boolean;
};

/**
 * The life grid for the anonymous surface.
 *
 * Deliberately not `~/components/life-grid.tsx`: that one is fixed at 4,000
 * weeks, speaks in "stamped" weeks (a concept a first-time visitor has not met
 * yet), and renders 4,000 `title` attributes that a screen reader would read
 * one at a time. Here the grid is `aria-hidden` decoration and the page states
 * the same facts in prose beside it.
 *
 * The colour encoding is the argument the page is making, so it runs the
 * opposite way to a progress bar: weeks already spent recede into the
 * background, and the weeks still ahead are the ones lit in gold. Open space,
 * not empty space.
 *
 * Two stacked layers rather than thousands of individually-animated cells: the
 * spent layer sits above the remaining layer and is revealed by a single
 * clip-path wipe, so only one element animates and it stays smooth on a phone.
 */
export function WeeksGrid({ weeksLived, totalWeeks, animate }: Props) {
  const lived = Math.min(weeksLived, totalWeeks);
  const years = Math.round(totalWeeks / COLUMNS);
  // The wipe covers the lived region only, so its duration scales with how much
  // life it is drawing.
  const durationMs = Math.round(700 + (lived / Math.max(totalWeeks, 1)) * 1500);

  const cells = Array.from({ length: totalWeeks }, (_, i) => i);

  return (
    <div aria-hidden="true">
      <div className="relative max-w-[34rem]">
        {/* Layer 1 — every week of the life, lit as open space. */}
        <Grid>
          {cells.map((i) => (
            <span key={i} className="aspect-square rounded-[1px] bg-primary/55" />
          ))}
        </Grid>

        {/* Layer 2 — the weeks already spent, wiped in over the top. */}
        <div
          className="absolute inset-0"
          style={{
            animation: animate
              ? `weeks-wipe ${durationMs}ms cubic-bezier(0.22, 1, 0.36, 1) forwards`
              : undefined,
          }}
        >
          <Grid>
            {cells.map((i) => (
              <span
                key={i}
                className={i < lived ? 'aspect-square rounded-[1px]' : 'aspect-square'}
                style={i < lived ? { background: SPENT } : undefined}
              />
            ))}
          </Grid>
        </div>
      </div>

      <div className="mx-auto mt-4 flex max-w-[34rem] items-baseline justify-between font-mono text-[11px] text-muted-foreground">
        <span>Born</span>
        <span>~{years} years, one square per week</span>
      </div>

      <style>{`
        @keyframes weeks-wipe {
          from { clip-path: inset(0 0 100% 0); }
          to   { clip-path: inset(0 0 0 0); }
        }
      `}</style>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="grid gap-[2px]"
      style={{ gridTemplateColumns: `repeat(${COLUMNS}, minmax(0, 1fr))` }}
    >
      {children}
    </div>
  );
}
