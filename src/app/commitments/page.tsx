import { desc, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

import { CommitmentCard } from '~/components/commitments/commitment-card';
import { StartCommitmentForm } from '~/components/commitments/start-commitment-form';
import { timelines, users } from '~/db/schema';
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
  if (!session?.user) redirect('/login');

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
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14 space-y-12">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Commitments</h1>
        <p className="text-sm text-muted-foreground max-w-lg">
          Pick a hobby, show up daily, stamp each day with proof. A stamp is a record that you
          existed and practiced.
        </p>
      </header>

      <StartCommitmentForm suggestions={suggestions} weeksRemaining={weeksRemaining} />

      {active.length === 0 && completed.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No commitments yet. Start one above — even a 7-day streak counts.
        </p>
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
                <CommitmentCard
                  key={c.id}
                  id={c.id}
                  hobbyName={c.hobbyName}
                  goalDays={c.goalDays}
                  status={c.status}
                  startDate={c.startDate}
                  stamps={c.stamps}
                  canAbandon
                />
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
              <CommitmentCard
                key={c.id}
                id={c.id}
                hobbyName={c.hobbyName}
                goalDays={c.goalDays}
                status={c.status}
                startDate={c.startDate}
                stamps={c.stamps}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
