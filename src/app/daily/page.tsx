import { redirect } from 'next/navigation';

import { DailyRitual } from '~/components/daily-ritual';
import {
  createHabit,
  deleteHabit,
  getDailyCheckin,
  getHabits,
  getHabitLogsForDate,
  getJournalEntry,
  getUserProfile,
  saveDailyCheckin,
  saveJournalEntry,
  toggleHabitLog,
} from '~/lib/actions/daily';
import { getServerAuthSession } from '~/server/auth';

export const metadata = {
  title: 'Daily Ritual — SignificantHobbies',
  robots: { index: false, follow: false },
};

export default async function DailyPage() {
  const session = await getServerAuthSession();
  if (!session?.user) redirect('/login');

  const today = new Date().toISOString().slice(0, 10);
  const isMorning = new Date().getHours() < 12;

  const [userHabits, habitLogs, journalEntry, checkin, profile] = await Promise.all([
    getHabits(),
    getHabitLogsForDate(today),
    getJournalEntry(today),
    getDailyCheckin(today),
    getUserProfile(),
  ]);

  const firstName = profile?.name?.split(' ')[0] ?? session.user.name?.split(' ')[0] ?? 'there';

  return (
    <DailyRitual
      firstName={firstName}
      today={today}
      isMorning={isMorning}
      habits={userHabits}
      habitLogs={habitLogs}
      journalEntry={journalEntry}
      checkin={checkin}
      actions={{
        createHabit,
        deleteHabit,
        toggleHabitLog,
        saveJournalEntry,
        saveDailyCheckin,
      }}
    />
  );
}
