import { desc, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

import { SpotlightCard } from '~/components/aceternity';
import { CommitmentCard } from '~/components/commitments/commitment-card';
import { StartCommitmentForm } from '~/components/commitments/start-commitment-form';
import { LocalCommitments } from '~/components/commitments/local-commitments';
import { timelines, users } from '~/db/schema';
import { loginPath } from '~/lib/auth-routing';
import { birthDateFromYear, buildLifeGrid } from '~/lib/mortality';
import type { Phase } from '~/lib/types';
import { parseJSONColumn } from '~/lib/utils';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';
import { getMyCommitments } from '~/lib/actions/commitments';

export const metadata = {
  title: 'Commitments — SignificantHobbies',
  robots: { index: false, follow: false },
};

export default async function CommitmentsPage() {
  const session = await getServerAuthSession();
  if (!session?.user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <LocalCommitments />
      </div>
    );
  }

  const [commitments, rawTimelines, me] = await Promise.all([
    getMyCommitments(),
    db
      .select()
      .from(timelines)
      .where(eq(timelines.userId, session.user.id))
      .orderBy(desc(timelines.updatedAt)),
    db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: { birthYear: true },
    }),
  ]);

  // Hobby suggestions from the user's timelines.
  const hobbySet = new Set<string>();
  for (const t of rawTimelines) {
    const phases = parseJSONColumn<Phase[]>(t.phases, [], `commitments:timeline:${t.id}`);
    for (const p of phases) for (const h of p.hobbies) hobbySet.add(h.name);
  }
  const suggestions = Array.from(hobbySet).slice(0, 20);

  // Mortality frame for the creation form.
  const birth = birthDateFromYear(me?.birthYear);
  const grid = buildLifeGrid(birth, new Set());
  const weeksRemaining = me?.birthYear ? grid.weeksRemaining : undefined;

  const active = commitments.filter((c) => c.status === 'active');
  const completed = commitments.filter((c) => c.status === 'completed');

  return (
    <div className="mx-auto max-w-4xl space-y-12 px-4 py-10 sm:py-14">
      <header className="relative overflow-hidden rounded-[1.75rem] bg-[#a8dc91] px-6 py-10 text-[#192817] shadow-[0_14px_40px_rgba(53,80,40,0.10)] sm:px-10 sm:py-12">
        <div className="relative max-w-2xl">
          <p className="text-base font-bold">Living promises</p>
          <h1 className="mt-4 font-serif text-5xl font-medium leading-none tracking-[-0.03em] sm:text-6xl">
            Commitments
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[#344b31]">
            Proof. A commitment is a promise you can show your work for — one stamp a day, each with
            evidence attached. Habits are the quiet version of this with nothing to prove.
          </p>
        </div>
      </header>

      <StartCommitmentForm suggestions={suggestions} weeksRemaining={weeksRemaining} />

      {active.length === 0 && completed.length === 0 ? (
        <p className="text-sm text-muted-foreground">No commitments yet. Start one above.</p>
      ) : (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-foreground">
            Active{active.length > 0 ? ` (${active.length})` : ''}
          </h2>
          {active.length === 0 ? (
            <p className="text-sm text-muted-foreground">None right now.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {active.map((c) => (
                <div key={c.id}>
                  <SpotlightCard className="shadow-soft" innerClassName="p-0">
                    <CommitmentCard
                      id={c.id}
                      hobbyName={c.hobbyName}
                      goalDays={c.goalDays}
                      status={c.status}
                      startDate={c.startDate}
                      stamps={c.stamps}
                      canAbandon
                      featured
                      className="border-0 bg-transparent shadow-none"
                    />
                  </SpotlightCard>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {completed.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-foreground">Completed ({completed.length})</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {completed.map((c) => (
              <div key={c.id}>
                <SpotlightCard className="shadow-soft" innerClassName="p-0">
                  <CommitmentCard
                    id={c.id}
                    hobbyName={c.hobbyName}
                    goalDays={c.goalDays}
                    status={c.status}
                    startDate={c.startDate}
                    stamps={c.stamps}
                    className="border-0 bg-transparent shadow-none"
                  />
                </SpotlightCard>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
