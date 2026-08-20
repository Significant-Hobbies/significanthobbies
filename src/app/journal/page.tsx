import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

import { LocalJournalExperience } from '~/components/local-personal-practice-surfaces';
import { LocalOnboardingGate } from '~/components/local-onboarding-gate';
import { JournalExperience } from '~/components/personal-practice-surfaces';
import { TimezoneSync } from '~/components/timezone-sync';
import { users } from '~/db/schema';
import {
  getAllJournalEntries,
  getJournalContextChoices,
  getUserProfile,
  saveJournalEntry,
} from '~/lib/actions/daily';
import { dayKeyIn, isMorningIn } from '~/lib/day';
import { parseBirthDate } from '~/lib/life-in-weeks';
import { birthDateFromYear, buildLifeGrid } from '~/lib/mortality';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';

export const metadata = {
  title: 'Journal — Significant Hobbies',
  description: 'A private place to notice what changed and remember what mattered.',
  robots: { index: false, follow: false },
};

export default async function JournalPage() {
  const session = await getServerAuthSession();

  if (!session?.user) {
    const today = dayKeyIn(null);
    return (
      <LocalOnboardingGate>
        <LocalJournalExperience today={today} isMorning={isMorningIn(null)} />
      </LocalOnboardingGate>
    );
  }

  const me = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: {
      birthYear: true,
      birthDate: true,
      timezone: true,
      onboardingCompletedAt: true,
    },
  });
  if (!me?.onboardingCompletedAt) redirect('/onboarding');

  const today = dayKeyIn(me.timezone);
  const [journalEntries, journalContextChoices, profile] = await Promise.all([
    getAllJournalEntries(),
    getJournalContextChoices(),
    getUserProfile(),
  ]);
  const journalEntry = journalEntries.find((entry) => entry.dayDate === today) ?? null;
  const birth =
    me.birthDate && parseBirthDate(me.birthDate)
      ? new Date(`${me.birthDate}T12:00:00`)
      : birthDateFromYear(me.birthYear);
  const weeksRemaining = birth ? buildLifeGrid(birth, new Set()).weeksRemaining : null;

  return (
    <>
      <TimezoneSync storedTimezone={me.timezone} />
      <JournalExperience
        firstName={profile?.name?.split(' ')[0] ?? session.user.name?.split(' ')[0] ?? 'there'}
        today={today}
        isMorning={isMorningIn(me.timezone)}
        weeksRemaining={weeksRemaining}
        journalEntry={journalEntry}
        journalEntries={journalEntries}
        journalContextChoices={journalContextChoices}
        saveJournalEntry={saveJournalEntry}
      />
    </>
  );
}
