import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

import { LocalHabitsExperience } from '~/components/local-personal-practice-surfaces';
import { LocalOnboardingGate } from '~/components/local-onboarding-gate';
import { HabitsExperience } from '~/components/personal-practice-surfaces';
import { TimezoneSync } from '~/components/timezone-sync';
import { users } from '~/db/schema';
import {
  createHabit,
  deleteHabit,
  getHabitCommitmentChoices,
  getHabitLogsForDate,
  getHabits,
  getUserProfile,
  setHabitCommitment,
  toggleHabitLog,
} from '~/lib/actions/daily';
import { dayKeyIn } from '~/lib/day';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';

export const metadata = {
  title: 'Habits — Significant Hobbies',
  description: 'Small repeatable practices, checked in without scores or shame.',
  robots: { index: false, follow: false },
};

export default async function HabitsPage() {
  const session = await getServerAuthSession();

  if (!session?.user) {
    return (
      <LocalOnboardingGate>
        <LocalHabitsExperience today={dayKeyIn(null)} />
      </LocalOnboardingGate>
    );
  }

  const me = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { timezone: true, onboardingCompletedAt: true },
  });
  if (!me?.onboardingCompletedAt) redirect('/onboarding');

  const today = dayKeyIn(me.timezone);
  const [habits, habitLogs, habitCommitmentChoices, profile] = await Promise.all([
    getHabits(),
    getHabitLogsForDate(today),
    getHabitCommitmentChoices(),
    getUserProfile(),
  ]);

  return (
    <>
      <TimezoneSync storedTimezone={me.timezone} />
      <HabitsExperience
        firstName={profile?.name?.split(' ')[0] ?? session.user.name?.split(' ')[0] ?? 'there'}
        today={today}
        habits={habits}
        habitLogs={habitLogs}
        habitCommitmentChoices={habitCommitmentChoices}
        createHabit={createHabit}
        deleteHabit={deleteHabit}
        setHabitCommitment={setHabitCommitment}
        toggleHabitLog={toggleHabitLog}
      />
    </>
  );
}
