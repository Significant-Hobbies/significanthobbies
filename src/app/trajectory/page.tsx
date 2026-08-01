import Link from 'next/link';

import { TrajectoryPageClient } from '~/components/trajectory/trajectory-page-client';
import { birthDateFromYear, buildLifeGrid } from '~/lib/mortality';
import { getTrajectoryContractState } from '~/lib/actions/trajectory-contract';
import { getUserBirthYear } from '~/lib/actions/trajectory';
import type { TrajectoryContractState } from '~/lib/actions/trajectory-contract';
import { getServerAuthSession } from '~/server/auth';

export const metadata = {
  title: 'Trajectory — SignificantHobbies',
  robots: { index: false, follow: false },
};

export default async function TrajectoryPage() {
  const session = await getServerAuthSession();
  const isPreview = !session?.user;

  const [state, birthYear]: [TrajectoryContractState, number | null] = isPreview
    ? [{ active: null, contracts: [], reviews: [] }, null]
    : await Promise.all([getTrajectoryContractState(), getUserBirthYear()]);

  // Mortality frame — same zoom-out grounding as /daily and /commitments.
  const birth = birthDateFromYear(birthYear);
  const weeksRemaining = birth ? buildLifeGrid(birth, new Set()).weeksRemaining : null;

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:py-14">
      <header className="relative overflow-hidden rounded-[1.75rem] bg-[#a8dc91] px-6 py-10 text-[#192817] shadow-[0_16px_44px_rgba(53,80,40,0.10)] sm:px-10 sm:py-12">
        <div className="relative max-w-3xl">
          <p className="text-base font-bold">A living decision system</p>
          <h1 className="mt-4 font-serif text-5xl font-medium leading-none tracking-[-0.03em] sm:text-6xl">
            Trajectory
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#344b31]">
            Name the reality you are in, choose a direction, decide how you will make tradeoffs,
            then learn from what happens. One active trajectory, no score. For the specific things
            you want to have done, use your{' '}
            <Link
              href="/bucket-list"
              className="font-semibold text-[#192817] underline decoration-[#192817]/35 underline-offset-4 transition-colors hover:decoration-[#192817]"
            >
              bucket list
            </Link>
            .
          </p>
          {weeksRemaining !== null && (
            <p className="mt-5 text-base text-[#344b31]">
              <span className="font-serif font-medium tabular-nums text-[#192817]">
                {weeksRemaining.toLocaleString()}
              </span>{' '}
              weeks left in the life grid.
            </p>
          )}
        </div>
      </header>

      <TrajectoryPageClient
        key={state.active?.id ?? 'no-active-contract'}
        state={state}
        storageMode={isPreview ? 'local' : 'account'}
      />
    </div>
  );
}
