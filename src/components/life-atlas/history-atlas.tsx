import Link from 'next/link';

import { TrajectoryMap } from '~/components/trajectory/trajectory-map';
import type { TrajectoryContractRecord } from '~/lib/trajectory-contract';
import { birthDateFromYear, buildLifeGrid } from '~/lib/mortality';

export function HistoryAtlas({
  birthYear,
  trajectory,
}: {
  birthYear: number | null;
  trajectory: TrajectoryContractRecord | null;
}) {
  const life = buildLifeGrid(birthDateFromYear(birthYear), new Set());
  const trajectoryValue = trajectory ?? {
    constraintsText: '',
    intentText: '',
    decisionPolicyText: '',
    feedbackLoopText: '',
    cadence: 'monthly' as const,
  };
  return (
    <section className="overflow-hidden rounded-[1.75rem] bg-white shadow-[0_18px_50px_rgba(66,55,22,0.10)]">
      <div className="grid lg:grid-cols-[23rem_1fr]">
        <div className="border-b border-[#cdbd36] bg-[#f7e957] p-7 text-[#201f18] sm:p-10 lg:border-b-0 lg:border-r">
          <p className="text-base font-bold">See History</p>
          <h1 className="mt-5 font-serif text-5xl font-medium leading-[1.02] tracking-[-0.03em]">
            Your life so far
          </h1>
          <p className="mt-5 text-base leading-relaxed text-[#4b493d]">
            The weeks are finite. The record is not a score—it is evidence that you were here.
          </p>
          <div className="mt-7 flex items-baseline gap-2">
            <span className="font-serif text-5xl tabular-nums">
              {life.weeksRemaining.toLocaleString()}
            </span>
            <span className="text-base text-[#4b493d]">
              {birthYear ? 'weeks remain' : 'weeks, roughly'}
            </span>
          </div>
          <LifeWeekField cells={life.cells} />
          <Link
            href="/life-in-weeks"
            className="mt-6 inline-flex min-h-11 items-center border-b-2 border-current text-base font-bold"
          >
            Open the full life grid →
          </Link>
        </div>
        <div className="bg-[#b9dcf5] p-6 text-[#192a36] sm:p-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-base font-bold">Direction</p>
              <h2 className="mt-3 font-serif text-3xl font-medium">
                {trajectory ? 'The path you are choosing' : 'No direction framed yet'}
              </h2>
            </div>
            <Link
              href="/trajectory"
              className="inline-flex min-h-11 shrink-0 items-center border-b-2 border-current text-base font-bold"
            >
              {trajectory ? 'Review' : 'Frame it'} →
            </Link>
          </div>
          {!trajectory && (
            <p className="mt-6 max-w-lg text-base leading-relaxed text-[#344b5a]">
              Trajectory connects the constraints and intent of the present to a decision policy and
              feedback loop for what comes next.
            </p>
          )}
          <div className="mt-6">
            <TrajectoryMap value={trajectoryValue} mode="view" />
          </div>
        </div>
      </div>
    </section>
  );
}

function LifeWeekField({ cells }: { cells: Array<{ weekIndex: number; lived: boolean }> }) {
  return (
    <div
      className="mt-6 grid grid-cols-[repeat(52,minmax(0,1fr))] gap-px"
      role="img"
      aria-label="Life in weeks overview"
    >
      {cells.map((cell) => (
        <span
          key={cell.weekIndex}
          className={`aspect-square min-w-px ${cell.lived ? 'bg-[#201f18]/70' : 'bg-[#201f18]/15'}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
