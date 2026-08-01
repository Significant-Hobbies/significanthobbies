'use client';

import { useEffect, useMemo, useState } from 'react';

import { DailyRitual } from '~/components/daily-ritual';
import { StorageModeProvider, StorageModeStatus } from '~/components/storage-mode-provider';
import { browserRecordAdapter, readLocalRecord, writeLocalRecord } from '~/lib/local-record-store';

interface LocalHabit {
  id: string;
  name: string;
  status: string;
  targetFrequency: string;
  icon: string | null;
  sourceQuestId: string | null;
  commitmentId: string | null;
}
interface LocalHabitLog {
  id: string;
  habitId: string;
  dayDate: string;
  completed: boolean;
}
interface LocalJournal {
  id: string;
  dayDate: string;
  amEntry: string | null;
  pmEntry: string | null;
  timelineId: null;
  commitmentId: null;
}
interface LocalDailyState {
  habits: LocalHabit[];
  logs: LocalHabitLog[];
  journals: LocalJournal[];
}

const EMPTY: LocalDailyState = { habits: [], logs: [], journals: [] };

export function LocalDailyRitual({ today, isMorning }: { today: string; isMorning: boolean }) {
  const [state, setState] = useState<LocalDailyState>(EMPTY);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    readLocalRecord(
      browserRecordAdapter(),
      'daily:state',
      'daily',
      (value): value is LocalDailyState => !!value && typeof value === 'object' && 'habits' in value
    ).then((stored) => {
      setState(stored ?? EMPTY);
      setLoaded(true);
    });
  }, []);

  async function commit(update: (current: LocalDailyState) => LocalDailyState) {
    const next = update(state);
    setState(next);
    await writeLocalRecord(browserRecordAdapter(), 'daily:state', 'daily', next);
    return next;
  }

  const actions = useMemo(
    () => ({
      async createHabit(
        name: string,
        targetFrequency = 'daily',
        icon?: string,
        commitmentId?: string | null
      ) {
        const habit = {
          id: `local-habit-${crypto.randomUUID()}`,
          name: name.trim(),
          status: 'active',
          targetFrequency,
          icon: icon ?? null,
          sourceQuestId: null,
          commitmentId: commitmentId ?? null,
        };
        if (!habit.name) return null;
        await commit((current) => ({ ...current, habits: [...current.habits, habit] }));
        return { id: habit.id, name: habit.name };
      },
      async deleteHabit(id: string) {
        await commit((current) => ({
          ...current,
          habits: current.habits.filter((habit) => habit.id !== id),
        }));
      },
      async setHabitCommitment(habitId: string, commitmentId: string | null) {
        await commit((current) => ({
          ...current,
          habits: current.habits.map((habit) =>
            habit.id === habitId ? { ...habit, commitmentId } : habit
          ),
        }));
        return true;
      },
      async toggleHabitLog(habitId: string, dayDate: string, completed: boolean) {
        await commit((current) => {
          const existing = current.logs.find(
            (log) => log.habitId === habitId && log.dayDate === dayDate
          );
          return {
            ...current,
            logs: existing
              ? current.logs.map((log) => (log.id === existing.id ? { ...log, completed } : log))
              : [
                  ...current.logs,
                  { id: `local-log-${crypto.randomUUID()}`, habitId, dayDate, completed },
                ],
          };
        });
      },
      async saveJournalEntry(dayDate: string, amEntry: string | null, pmEntry: string | null) {
        await commit((current) => {
          const existing = current.journals.find((entry) => entry.dayDate === dayDate);
          const entry: LocalJournal = {
            id: existing?.id ?? `local-journal-${crypto.randomUUID()}`,
            dayDate,
            amEntry,
            pmEntry,
            timelineId: null,
            commitmentId: null,
          };
          return {
            ...current,
            journals: existing
              ? current.journals.map((item) => (item.id === existing.id ? entry : item))
              : [...current.journals, entry],
          };
        });
      },
      // commit deliberately follows the latest state through the component remount revision.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }),
    [state]
  );

  if (!loaded)
    return (
      <p className="p-8 text-center text-sm text-muted-foreground">
        Loading Daily from this device…
      </p>
    );
  const todayJournal = state.journals.find((entry) => entry.dayDate === today) ?? null;
  return (
    <StorageModeProvider mode="local">
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <StorageModeStatus />
      </div>
      <DailyRitual
        firstName="there"
        today={today}
        isMorning={isMorning}
        weeksRemaining={null}
        habits={state.habits}
        habitLogs={state.logs.filter((log) => log.dayDate === today)}
        allHabitLogs={state.logs}
        journalEntry={todayJournal}
        journalEntries={state.journals}
        actions={actions}
        localMode
      />
    </StorageModeProvider>
  );
}
