import { eq } from 'drizzle-orm';

import { DailyRitual } from '~/components/daily-ritual';
import { TimezoneSync } from '~/components/timezone-sync';
import { users } from '~/db/schema';
import {
  createHabit,
  deleteHabit,
  getAllHabitLogs,
  getHabits,
  getHabitLogsForDate,
  getJournalContextChoices,
  getJournalEntriesForRange,
  getUserProfile,
  saveJournalEntry,
  toggleHabitLog,
} from '~/lib/actions/daily';
import { dayKeyIn, isMorningIn } from '~/lib/day';
import { buildJournalDateWindow } from '~/lib/journal';
import {
  PREVIEW_FIRST_NAME,
  previewHabitLogs,
  previewHabitLogsForToday,
  previewHabits,
  previewJournalEntries,
  previewJournalEntryForToday,
} from '~/lib/preview-data';
import { getActiveMonthEndNudge } from '~/lib/actions/trajectory';
import { birthDateFromYear, buildLifeGrid } from '~/lib/mortality';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';

export const metadata = {
  title: 'Daily Ritual — SignificantHobbies',
  robots: { index: false, follow: false },
};

export default async function DailyPage() {
  const session = await getServerAuthSession();

  // Signed out, show one stranger's sample month instead of a sign-in wall. The
  // ritual is unreadable empty, and asking for a Google account before a visitor
  // has seen what the practice looks like was the funnel's steepest step. The
  // sample is not persisted anywhere and the banner says so; journal writing is
  // suppressed rather than merely discarded.
  if (!session?.user) {
    const today = dayKeyIn(null);
    return (
      <DailyRitual
        firstName={PREVIEW_FIRST_NAME}
        today={today}
        isMorning={isMorningIn(null)}
        weeksRemaining={null}
        habits={previewHabits()}
        habitLogs={previewHabitLogsForToday(today)}
        allHabitLogs={previewHabitLogs(today)}
        journalEntry={previewJournalEntryForToday(today)}
        journalEntries={previewJournalEntries(today)}
        actions={{ createHabit, deleteHabit, toggleHabitLog, saveJournalEntry }}
        preview
      />
    );
  }

  // The user's zone has to be resolved before "today" exists — every dayDate
  // key below is user-local, so this one read cannot be parallelised with them.
  const me = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { birthYear: true, timezone: true },
  });

  const today = dayKeyIn(me?.timezone);
  const isMorning = isMorningIn(me?.timezone);
  const journalDateWindow = buildJournalDateWindow(today);

  const [
    userHabits,
    habitLogs,
    allHabitLogs,
    journalEntries,
    journalContextChoices,
    profile,
    trajectoryNudge,
  ] = await Promise.all([
    getHabits(),
    getHabitLogsForDate(today),
    getAllHabitLogs(),
    getJournalEntriesForRange(journalDateWindow[0]!, today),
    getJournalContextChoices(),
    getUserProfile(),
    getActiveMonthEndNudge(),
  ]);

  const journalEntry = journalEntries.find((entry) => entry.dayDate === today) ?? null;

  const firstName = profile?.name?.split(' ')[0] ?? session.user.name?.split(' ')[0] ?? 'there';

  // Mortality frame — weeks remaining grounds the ritual in the finite life.
  const birth = birthDateFromYear(me?.birthYear);
  const weeksRemaining = birth ? buildLifeGrid(birth, new Set()).weeksRemaining : null;

  return (
    <>
      <TimezoneSync storedTimezone={me?.timezone ?? null} />
      <DailyRitual
        firstName={firstName}
        today={today}
        isMorning={isMorning}
        weeksRemaining={weeksRemaining}
        habits={userHabits}
        habitLogs={habitLogs}
        allHabitLogs={allHabitLogs}
        journalEntry={journalEntry}
        journalEntries={journalEntries}
        journalContextChoices={journalContextChoices}
        trajectoryNudge={trajectoryNudge}
        actions={{
          createHabit,
          deleteHabit,
          toggleHabitLog,
          saveJournalEntry,
        }}
      />
    </>
  );
}
