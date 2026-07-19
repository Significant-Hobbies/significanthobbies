import { redirect } from 'next/navigation';

import { GradientMesh } from '~/components/aceternity/gradient-mesh';
import { TrajectoryPageClient } from '~/components/trajectory/trajectory-page-client';
import { birthDateFromYear, buildLifeGrid } from '~/lib/mortality';
import { getTrajectoryState, getUserBirthYear } from '~/lib/actions/trajectory';
import { getServerAuthSession } from '~/server/auth';

export const metadata = {
  title: 'Trajectory — SignificantHobbies',
  robots: { index: false, follow: false },
};

export default async function TrajectoryPage() {
  const session = await getServerAuthSession();
  if (!session?.user) redirect('/login');

  const [state, birthYear] = await Promise.all([getTrajectoryState(), getUserBirthYear()]);

  // Mortality frame — same zoom-out grounding as /daily and /commitments.
  const birth = birthDateFromYear(birthYear);
  const weeksRemaining = birth ? buildLifeGrid(birth, new Set()).weeksRemaining : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14 space-y-10">
      <header className="relative overflow-hidden rounded-2xl border border-border/50 p-6 sm:p-8">
        <GradientMesh variant="gold" />
        <div className="relative">
          <p className="text-xs font-medium text-muted-foreground/70">Monthly life-review</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Trajectory
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Reflect on where you are against where you said you wanted to be. No score — the gap is
            the whole point.
          </p>
          {weeksRemaining !== null && (
            <p className="mt-4 text-xs text-muted-foreground/70">
              <span className="font-serif font-medium tabular-nums text-foreground/90">
                {weeksRemaining.toLocaleString()}
              </span>{' '}
              weeks left in the life grid.
            </p>
          )}
        </div>
      </header>

      <TrajectoryPageClient state={state} />
    </div>
  );
}
