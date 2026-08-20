import Link from 'next/link';

import { TrajectoryMap } from '~/components/trajectory/trajectory-map';
import type { TrajectoryContractRecord } from '~/lib/trajectory-contract';
import { birthDateFromYear, buildLifeGrid } from '~/lib/mortality';
import { parseBirthDate } from '~/lib/life-in-weeks';

export function HistoryAtlas({
  birthYear,
  birthDate,
  trajectory,
}: {
  birthYear: number | null;
  birthDate?: string | null;
  trajectory: TrajectoryContractRecord | null;
}) {
  const exactBirthDate =
    birthDate && parseBirthDate(birthDate) ? new Date(`${birthDate}T12:00:00`) : null;
  const life = buildLifeGrid(exactBirthDate ?? birthDateFromYear(birthYear), new Set());
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
          <p className="text-base font-bold">History</p>
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
              {birthDate || birthYear ? 'weeks remain, roughly' : 'weeks, roughly'}
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
      <div className="grid border-t border-[#e4dccb] bg-[#fffdf8] sm:grid-cols-2">
        <Link
          href="/history#personal-timeline"
          className="p-6 transition-colors hover:bg-[#ffd0bd] sm:p-8"
        >
          <p className="text-sm font-bold">Personal timeline</p>
          <h3 className="mt-2 font-serif text-3xl">The chapters you have lived</h3>
          <span className="mt-4 inline-flex border-b-2 border-current font-bold">
            Open timeline →
          </span>
        </Link>
        <Link
          href="/journal#journal-history"
          className="border-t border-[#e4dccb] p-6 transition-colors hover:bg-[#dceabf] sm:border-l sm:border-t-0 sm:p-8"
        >
          <p className="text-sm font-bold">Journal history</p>
          <h3 className="mt-2 font-serif text-3xl">The days in your own words</h3>
          <span className="mt-4 inline-flex border-b-2 border-current font-bold">
            Read the record →
          </span>
        </Link>
      </div>
    </section>
  );
}

function LifeWeekField({ cells }: { cells: Array<{ weekIndex: number; lived: boolean }> }) {
  return (
    <div
      className="mt-6 grid grid-cols-[repeat(80,minmax(0,1fr))] gap-px sm:grid-cols-[repeat(64,minmax(0,1fr))] lg:grid-cols-[repeat(52,minmax(0,1fr))]"
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
