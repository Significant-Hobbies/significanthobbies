'use client';

import { useState, useTransition } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';

import { Button } from '~/components/ui/button';

interface Habit {
  id: string;
  name: string;
  status: string;
}

interface HabitLog {
  id: string;
  habitId: string;
  dayDate: string;
  completed: boolean;
}

interface JournalEntry {
  id: string;
  amEntry: string | null;
  pmEntry: string | null;
}

interface Checkin {
  id: string;
  amCompleted: boolean;
  pmCompleted: boolean;
}

interface Actions {
  createHabit: (name: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitLog: (habitId: string, dayDate: string, completed: boolean) => Promise<void>;
  saveJournalEntry: (
    dayDate: string,
    amEntry: string | null,
    pmEntry: string | null
  ) => Promise<void>;
  saveDailyCheckin: (dayDate: string, amCompleted: boolean, pmCompleted: boolean) => Promise<void>;
}

interface Props {
  firstName: string;
  today: string;
  isMorning: boolean;
  habits: Habit[];
  habitLogs: HabitLog[];
  journalEntry: JournalEntry | null;
  checkin: Checkin | null;
  actions: Actions;
}

export function DailyRitual({
  firstName,
  today,
  isMorning,
  habits: initialHabits,
  habitLogs: initialLogs,
  journalEntry: initialJournal,
  checkin: initialCheckin,
  actions,
}: Props) {
  const [habits, setHabits] = useState(initialHabits);
  const [logs, setLogs] = useState(initialLogs);
  const [amEntry, setAmEntry] = useState(initialJournal?.amEntry ?? '');
  const [pmEntry, setPmEntry] = useState(initialJournal?.pmEntry ?? '');
  const [amCompleted, setAmCompleted] = useState(initialCheckin?.amCompleted ?? false);
  const [pmCompleted, setPmCompleted] = useState(initialCheckin?.pmCompleted ?? false);
  const [newHabit, setNewHabit] = useState('');
  const [showHabitManager, setShowHabitManager] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [, startTransition] = useTransition();

  const greeting = isMorning ? `Good morning, ${firstName}.` : `Good evening, ${firstName}.`;
  const prompt = isMorning ? 'What are you doing today?' : 'What happened today?';

  function isHabitDone(habitId: string): boolean {
    return logs.some((l) => l.habitId === habitId && l.completed);
  }

  function toggleHabit(habitId: string) {
    const completed = !isHabitDone(habitId);
    // Optimistic update
    setLogs((prev) => {
      const existing = prev.find((l) => l.habitId === habitId);
      if (existing) {
        return prev.map((l) => (l.habitId === habitId ? { ...l, completed } : l));
      }
      return [...prev, { id: 'temp', habitId, dayDate: today, completed }];
    });
    startTransition(() => actions.toggleHabitLog(habitId, today, completed));
  }

  function handleAddHabit() {
    const trimmed = newHabit.trim();
    if (!trimmed) return;
    setNewHabit('');
    startTransition(async () => {
      await actions.createHabit(trimmed);
      // Refetch habits by reloading — simplest correct path
      window.location.reload();
    });
  }

  function handleDeleteHabit(id: string) {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    startTransition(() => actions.deleteHabit(id));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await actions.saveJournalEntry(today, amEntry || null, pmEntry || null);
      if (isMorning) {
        setAmCompleted(true);
        await actions.saveDailyCheckin(today, true, pmCompleted);
      } else {
        setPmCompleted(true);
        await actions.saveDailyCheckin(today, amCompleted, true);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  const canSave = isMorning ? amEntry.trim().length > 0 : pmEntry.trim().length > 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-foreground">{greeting}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Ritual prompt */}
      <div className="mb-8">
        <p className="text-sm font-medium text-foreground mb-2">{prompt}</p>
        <textarea
          value={isMorning ? amEntry : pmEntry}
          onChange={(e) => (isMorning ? setAmEntry(e.target.value) : setPmEntry(e.target.value))}
          placeholder={isMorning ? 'Today I want to…' : 'Today I…'}
          className="w-full min-h-[120px] rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground leading-relaxed focus:border-foreground/40 focus:outline-none focus:ring-1 focus:ring-foreground/40 resize-none"
        />
      </div>

      {/* Habits */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-foreground">Habits</p>
          <button
            onClick={() => setShowHabitManager(!showHabitManager)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {showHabitManager ? 'Done' : 'Manage'}
          </button>
        </div>

        {habits.length === 0 && !showHabitManager ? (
          <p className="text-sm text-muted-foreground">
            No habits yet. Click "Manage" to add some.
          </p>
        ) : (
          <div className="space-y-1.5">
            {habits.map((habit) => (
              <div key={habit.id} className="flex items-center gap-3 group">
                <button
                  onClick={() => toggleHabit(habit.id)}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                    isHabitDone(habit.id)
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border hover:border-foreground/40'
                  }`}
                >
                  {isHabitDone(habit.id) && <Check className="h-3 w-3" />}
                </button>
                <span
                  className={`text-sm flex-1 ${
                    isHabitDone(habit.id) ? 'text-muted-foreground line-through' : 'text-foreground'
                  }`}
                >
                  {habit.name}
                </span>
                {showHabitManager && (
                  <button
                    onClick={() => handleDeleteHabit(habit.id)}
                    className="text-muted-foreground/40 hover:text-destructive transition-colors"
                    aria-label={`Delete ${habit.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {showHabitManager && (
          <div className="mt-3 flex gap-2">
            <input
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
              placeholder="New habit name"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-foreground/40 focus:outline-none focus:ring-1 focus:ring-foreground/40"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddHabit}
              disabled={!newHabit.trim()}
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>
        )}
      </div>

      {/* If it's evening, show the AM entry from the morning (read-only) */}
      {!isMorning && amEntry && (
        <div className="mb-8 rounded-lg border border-border bg-card/50 p-4">
          <p className="text-xs text-muted-foreground mb-1.5">This morning you wrote:</p>
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
            {amEntry}
          </p>
        </div>
      )}

      {/* Save */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving || !canSave}>
          {saving ? 'Saving…' : isMorning ? 'Save morning' : 'Save evening'}
        </Button>
        {saved && <span className="text-sm text-muted-foreground">Saved.</span>}
        {!canSave && (
          <span className="text-xs text-muted-foreground/60">
            {isMorning ? 'Write something first.' : 'Write about your day first.'}
          </span>
        )}
      </div>
    </div>
  );
}
