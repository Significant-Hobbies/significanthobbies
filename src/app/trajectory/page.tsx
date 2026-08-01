import Link from 'next/link';

import { GradientMesh } from '~/components/aceternity/gradient-mesh';
import { PreviewBanner } from '~/components/preview-banner';
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

  const [state, birthYear] = isPreview
    ? [previewContractState(), null]
    : await Promise.all([getTrajectoryContractState(), getUserBirthYear()]);

  // Mortality frame — same zoom-out grounding as /daily and /commitments.
  const birth = birthDateFromYear(birthYear);
  const weeksRemaining = birth ? buildLifeGrid(birth, new Set()).weeksRemaining : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14 space-y-10">
      {isPreview && (
        <PreviewBanner route="/trajectory" title="You're looking at a sample trajectory.">
          A sample focus contract, so you can see how Trajectory works before you sign up. Nothing
          here is yours and nothing is saved.
        </PreviewBanner>
      )}
      <header className="relative overflow-hidden rounded-2xl border border-border/50 p-6 sm:p-8">
        <GradientMesh variant="gold" />
        <div className="relative">
          <p className="text-xs font-medium text-subtle">A living decision system</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Trajectory
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Name the reality you are in, choose a direction, decide how you will make tradeoffs,
            then learn from what happens. One active trajectory, no score. For the specific things
            you want to have done, use your{' '}
            <Link
              href="/bucket-list"
              className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-primary"
            >
              bucket list
            </Link>
            .
          </p>
          {weeksRemaining !== null && (
            <p className="mt-4 text-xs text-subtle">
              <span className="font-serif font-medium tabular-nums text-foreground/90">
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
        readOnly={isPreview}
      />
    </div>
  );
}

function previewContractState(): TrajectoryContractState {
  const active = {
    id: 'preview-contract',
    previousContractId: null,
    constraintsText:
      'Full-time work leaves little energy on weekdays, and gear has to fit a small monthly budget.',
    intentText: 'Make and share small films consistently.',
    decisionPolicyText: 'Prefer publishing something small over polishing something ambitious.',
    feedbackLoopText:
      'Every Sunday, notice what I made, whether I wanted to return, and what caused friction.',
    cadence: 'weekly' as const,
    status: 'active' as const,
    openedAt: new Date(),
    closedAt: null,
  };
  return { active, contracts: [active], reviews: [] };
}
