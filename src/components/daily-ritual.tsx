'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Flame, Plus, Trash2 } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { computeStreak, computeWeeklyProgress } from '~/lib/habit-utils';

interface Habit {
  id: string;
  name: string;
  status: string;
  targetFrequency: string;
  icon: string | null;
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
  createHabit: (name: string, targetFrequency?: string, icon?: string) => Promise<void>;
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
  weeksRemaining: number | null;
  habits: Habit[];
  habitLogs: HabitLog[];
  allHabitLogs: HabitLog[];
  journalEntry: JournalEntry | null;
  checkin: Checkin | null;
  actions: Actions;
}

const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'Every day',
  weekdays: 'Weekdays',
  '3x_week': '3× / week',
  '5x_week': '5× / week',
};

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Every day' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: '3x_week', label: '3× / week' },
  { value: '5x_week', label: '5× / week' },
];

const EMOJI_CHOICES = ['📚', '🏃', '🧘', '✍️', '🎸', '🎨', '💪', '🧠', '🌅', '💧', '🥗', '😴'];

export function DailyRitual({
  firstName,
  today,
  isMorning,
  weeksRemaining,
  habits: initialHabits,
  habitLogs: initialLogs,
  allHabitLogs,
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
  const [newHabitFreq, setNewHabitFreq] = useState('daily');
  const [newHabitIcon, setNewHabitIcon] = useState('');
  const [showHabitManager, setShowHabitManager] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const greeting = isMorning ? `Good morning, ${firstName}.` : `Good evening, ${firstName}.`;
  const prompt = isMorning ? "What's your focus today?" : 'How did your day go?';

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
    setNewHabitFreq('daily');
    setNewHabitIcon('');
    startTransition(async () => {
      await actions.createHabit(trimmed, newHabitFreq, newHabitIcon || undefined);
      router.refresh();
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
        {weeksRemaining !== null && (
          <p className="mt-2 text-sm text-muted-foreground/70">
            {weeksRemaining.toLocaleString()} weeks left.
          </p>
        )}
      </div>

      {/* Ritual prompt */}
      <div className="mb-8">
        <p className="text-sm font-medium text-foreground mb-2">{prompt}</p>
        <textarea
          value={isMorning ? amEntry : pmEntry}
          onChange={(e) => (isMorning ? setAmEntry(e.target.value) : setPmEntry(e.target.value))}
          placeholder={
            isMorning
              ? 'The one thing that would make today worth living…'
              : 'Be honest. What happened, and what did it mean?'
          }
          className="w-full min-h-[120px] rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground leading-relaxed focus:border-foreground/40 focus-visible:ring-2 focus-visible:ring-foreground/60 focus-visible:outline-none resize-none"
        />
      </div>

      {/* Habits */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-foreground">Habits</p>
          <button
            onClick={() => setShowHabitManager(!showHabitManager)}
            className="text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 rounded px-1"
          >
            {showHabitManager ? 'Done' : 'Manage'}
          </button>
        </div>

        {habits.length === 0 && !showHabitManager ? (
          <p className="text-sm text-muted-foreground">
            No habits yet. Click "Manage" to add some.
          </p>
        ) : (
          <div className="space-y-2">
            {habits.map((habit) => {
              const done = isHabitDone(habit.id);
              const streak = computeStreak(allHabitLogs, habit.id);
              const weekly = computeWeeklyProgress(allHabitLogs, habit.id);
              const freqLabel = FREQUENCY_LABELS[habit.targetFrequency] ?? 'Every day';

              return (
                <div
                  key={habit.id}
                  className="flex items-center gap-3 group rounded-lg px-2 py-1.5 hover:bg-muted/40 transition-colors"
                >
                  <button
                    onClick={() => toggleHabit(habit.id)}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors focus-visible:ring-2 focus-visible:ring-foreground/50 focus-visible:outline-none ${
                      done
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border hover:border-foreground/40'
                    }`}
                    aria-label={
                      done ? `Mark ${habit.name} as not done` : `Mark ${habit.name} as done`
                    }
                  >
                    {done && <Check className="h-3 w-3" />}
                  </button>

                  {habit.icon && <span className="text-base leading-none">{habit.icon}</span>}

                  <span
                    className={`text-sm flex-1 ${
                      done ? 'text-muted-foreground line-through' : 'text-foreground'
                    }`}
                  >
                    {habit.name}
                  </span>

                  {/* Frequency badge */}
                  <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wide hidden sm:inline">
                    {freqLabel}
                  </span>

                  {/* Weekly progress dots */}
                  <div
                    className="flex gap-0.5"
                    aria-label={`${weekly.completed} of 7 days this week`}
                  >
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 w-1.5 rounded-full ${
                          i < weekly.completed ? 'bg-primary' : 'bg-border'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Streak */}
                  {streak > 0 && (
                    <span className="flex items-center gap-0.5 text-xs text-primary tabular-nums">
                      <Flame className="h-3 w-3" />
                      {streak}
                    </span>
                  )}

                  {showHabitManager && (
                    <button
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="text-muted-foreground/40 hover:text-destructive transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50 rounded"
                      aria-label={`Delete ${habit.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {showHabitManager && (
          <div className="mt-4 space-y-3 rounded-lg border border-border bg-card p-4">
            {/* Name input */}
            <div className="flex gap-2">
              <input
                value={newHabit}
                onChange={(e) => setNewHabit(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
                placeholder="Habit name (e.g. Read 20 pages)"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-foreground/40 focus-visible:ring-2 focus-visible:ring-foreground/50 focus-visible:outline-none"
              />
            </div>

            {/* Icon picker */}
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Icon (optional)</p>
              <div className="flex flex-wrap gap-1.5">
                {EMOJI_CHOICES.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setNewHabitIcon(newHabitIcon === emoji ? '' : emoji)}
                    className={`flex h-8 w-8 items-center justify-center rounded-md border text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 ${
                      newHabitIcon === emoji
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-foreground/30'
                    }`}
                    aria-label={`Select ${emoji} icon`}
                    aria-pressed={newHabitIcon === emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Frequency selector */}
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Target frequency</p>
              <div className="flex flex-wrap gap-1.5">
                {FREQUENCY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setNewHabitFreq(opt.value)}
                    className={`rounded-md border px-3 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 ${
                      newHabitFreq === opt.value
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                    }`}
                    aria-pressed={newHabitFreq === opt.value}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Add button */}
            <Button
              size="sm"
              onClick={handleAddHabit}
              disabled={!newHabit.trim()}
              className="w-full"
            >
              <Plus className="h-3.5 w-3.5" />
              Add habit
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
            {isMorning ? 'Add your focus to save.' : 'Add your entry to save.'}
          </span>
        )}
      </div>
    </div>
  );
}
