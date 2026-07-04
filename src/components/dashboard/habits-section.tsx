'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Flame, Plus, Sparkles, Trash2 } from 'lucide-react';

import { SpotlightCard } from '~/components/aceternity';
import { Button } from '~/components/ui/button';
import { computeStreak, computeWeeklyProgress } from '~/lib/habit-utils';
import { cn } from '~/lib/utils';

interface Habit {
  id: string;
  name: string;
  status: string;
  targetFrequency: string;
  icon: string | null;
  sourceQuestId: string | null;
}

interface HabitLog {
  id: string;
  habitId: string;
  dayDate: string;
  completed: boolean;
}

interface HabitsActions {
  createHabit: (
    name: string,
    targetFrequency?: string,
    icon?: string
  ) => Promise<{ id: string; name: string } | null>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitLog: (habitId: string, dayDate: string, completed: boolean) => Promise<void>;
}

interface Props {
  today: string;
  habits: Habit[];
  habitLogs: HabitLog[];
  allHabitLogs: HabitLog[];
  actions: HabitsActions;
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

export function HabitsSection({
  today,
  habits: initialHabits,
  habitLogs: initialLogs,
  allHabitLogs,
  actions,
}: Props) {
  const [habits, setHabits] = useState(initialHabits);
  const [logs, setLogs] = useState(initialLogs);
  const [newHabit, setNewHabit] = useState('');
  const [newHabitFreq, setNewHabitFreq] = useState('daily');
  const [newHabitIcon, setNewHabitIcon] = useState('');
  const [showHabitManager, setShowHabitManager] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

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

  const habitsDone = logs.filter((l) => l.completed).length;
  const habitsTotal = habits.length;

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <h2 className="font-serif text-xl font-semibold text-foreground">Habits</h2>
          {habitsTotal > 0 && (
            <span className="text-sm text-muted-foreground">
              {habitsDone} of {habitsTotal} done today
            </span>
          )}
        </div>
        <button
          onClick={() => setShowHabitManager(!showHabitManager)}
          className="text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 rounded px-1"
        >
          {showHabitManager ? 'Done' : 'Manage'}
        </button>
      </div>

      {/* Progress bar */}
      {habitsTotal > 0 && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
          <div
            className="h-full rounded-full bg-primary transition-all duration-200"
            style={{ width: `${(habitsDone / habitsTotal) * 100}%` }}
          />
        </div>
      )}

      {habits.length === 0 && !showHabitManager ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/5">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            No habits yet. Click <span className="text-foreground font-medium">Manage</span> to add
            some.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {habits.map((habit) => {
            const done = isHabitDone(habit.id);
            const streak = computeStreak(allHabitLogs, habit.id);
            const weekly = computeWeeklyProgress(allHabitLogs, habit.id);
            const freqLabel = FREQUENCY_LABELS[habit.targetFrequency] ?? 'Every day';
            const weeklyPct = (weekly.completed / weekly.target) * 100;

            return (
              <SpotlightCard
                key={habit.id}
                className={cn(
                  'shadow-soft transition-colors',
                  done && 'border-primary/30 bg-primary/5'
                )}
                innerClassName="flex items-center gap-4 p-4"
                spotlightColor={done ? 'oklch(0.82 0.13 88 / 0.10)' : 'oklch(0.82 0.13 88 / 0.06)'}
              >
                {/* Toggle checkbox */}
                <button
                  onClick={() => toggleHabit(habit.id)}
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition-all focus-visible:ring-2 focus-visible:ring-foreground/50 focus-visible:outline-none',
                    done
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:border-primary/50'
                  )}
                  aria-label={
                    done ? `Mark ${habit.name} as not done` : `Mark ${habit.name} as done`
                  }
                >
                  {done && <Check className="h-4 w-4" />}
                </button>

                {/* Icon + name */}
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  {habit.icon && <span className="text-lg leading-none">{habit.icon}</span>}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p
                        className={cn(
                          'text-sm font-medium truncate',
                          done ? 'text-muted-foreground' : 'text-foreground'
                        )}
                      >
                        {habit.name}
                      </p>
                      {habit.sourceQuestId && (
                        <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-primary">
                          Quest
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground/60">
                      {freqLabel}
                    </p>
                  </div>
                </div>

                {/* Weekly progress dots */}
                <div className="hidden flex-col items-end gap-1.5 sm:flex">
                  <div
                    className="flex gap-1"
                    aria-label={`${weekly.completed} of 7 days this week`}
                  >
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'h-2 w-2 rounded-full transition-colors',
                          i < weekly.completed ? 'bg-primary' : 'bg-foreground/15'
                        )}
                      />
                    ))}
                  </div>
                  {/* Weekly progress bar */}
                  <div className="h-1 w-24 overflow-hidden rounded-full bg-foreground/10">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-200"
                      style={{ width: `${weeklyPct}%` }}
                    />
                  </div>
                </div>

                {/* Streak counter */}
                {streak > 0 && (
                  <div className="flex shrink-0 items-center gap-1 rounded-lg bg-primary/10 px-2 py-1">
                    <Flame className="h-3.5 w-3.5 text-primary" />
                    <span className="font-serif text-sm font-semibold tabular-nums text-primary">
                      {streak}
                    </span>
                  </div>
                )}

                {/* Delete (manage mode) */}
                {showHabitManager && (
                  <button
                    onClick={() => handleDeleteHabit(habit.id)}
                    className="text-muted-foreground/40 hover:text-destructive transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50 rounded"
                    aria-label={`Delete ${habit.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </SpotlightCard>
            );
          })}
        </div>
      )}

      {showHabitManager && (
        <div className="mt-4 space-y-3 rounded-xl border border-border bg-card p-4 shadow-soft">
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
          <Button size="sm" onClick={handleAddHabit} disabled={!newHabit.trim()} className="w-full">
            <Plus className="h-3.5 w-3.5" />
            Add habit
          </Button>
        </div>
      )}
    </div>
  );
}
