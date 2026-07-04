'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Flame, Plus, Sparkles, Sunrise, Sunset, Trash2 } from 'lucide-react';

import { GradientMesh, SpotlightCard } from '~/components/aceternity';
import { CircularProgress } from '~/components/dashboard/circular-progress';
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
  createHabit: (
    name: string,
    targetFrequency?: string,
    icon?: string
  ) => Promise<{ id: string; name: string } | null>;
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
  const prompt = isMorning ? 'What will you change today?' : 'What did you change today?';
  const journalTitle = isMorning ? 'Morning Focus' : 'Evening Reflection';
  const journalPlaceholder = isMorning
    ? 'What will you change today? One sentence is enough.'
    : 'What did you change today? One sentence is enough.';

  const dateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

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
  const currentEntry = isMorning ? amEntry : pmEntry;
  const charCount = currentEntry.length;

  // AM/PM completion for the rings
  const amProgress = amCompleted ? 1 : 0;
  const pmProgress = pmCompleted ? 1 : 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-16 space-y-8">
      {/* ─── Ritual header — gradient mesh + editorial greeting ─── */}
      <section className="relative overflow-hidden rounded-2xl border border-border/50 p-6 sm:p-8">
        <GradientMesh variant={isMorning ? 'gold' : 'sage'} />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground/60">
            {isMorning ? (
              <Sunrise className="h-3.5 w-3.5 text-primary" />
            ) : (
              <Sunset className="h-3.5 w-3.5 text-primary" />
            )}
            {dateString}
          </div>
          <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {greeting}
          </h1>
          {weeksRemaining !== null && (
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/50 px-3 py-1.5">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse-soft" />
                <span className="text-sm text-muted-foreground">
                  <span className="font-serif font-medium tabular-nums text-foreground">
                    {weeksRemaining.toLocaleString()}
                  </span>{' '}
                  weeks left
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── AM/PM check-in rings ─── */}
      <div className="flex items-center justify-center gap-12 rounded-xl border border-border bg-card p-6 shadow-soft">
        <CircularProgress
          progress={amProgress}
          label="AM"
          sublabel="Focus"
          icon={Sunrise}
          size={72}
        />
        <div className="h-12 w-px bg-border" />
        <CircularProgress
          progress={pmProgress}
          label="PM"
          sublabel="Reflect"
          icon={Sunset}
          size={72}
        />
      </div>

      {/* ─── Journal — card with header + gradient focus border ─── */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-colors focus-within:border-primary/40">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
          <div className="flex items-center gap-2">
            {isMorning ? (
              <Sunrise className="h-4 w-4 text-primary" />
            ) : (
              <Sunset className="h-4 w-4 text-primary" />
            )}
            <h3 className="font-serif text-sm font-medium text-foreground">{journalTitle}</h3>
          </div>
          <span className="text-[10px] tabular-nums text-muted-foreground/50">
            {charCount} chars
          </span>
        </div>
        <textarea
          value={isMorning ? amEntry : pmEntry}
          onChange={(e) => (isMorning ? setAmEntry(e.target.value) : setPmEntry(e.target.value))}
          placeholder={journalPlaceholder}
          className="w-full min-h-[140px] resize-none bg-transparent px-5 py-4 text-base leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none"
        />
      </div>

      {/* ─── Habits — SpotlightCards with streak + weekly progress ─── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-sm font-medium text-foreground">Habits</h3>
          <button
            onClick={() => setShowHabitManager(!showHabitManager)}
            className="text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 rounded px-1"
          >
            {showHabitManager ? 'Done' : 'Manage'}
          </button>
        </div>

        {habits.length === 0 && !showHabitManager ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/5">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              No habits yet. Click <span className="text-foreground font-medium">Manage</span> to
              add some.
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
                  spotlightColor={
                    done ? 'oklch(0.82 0.13 88 / 0.10)' : 'oklch(0.82 0.13 88 / 0.06)'
                  }
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
                        className="h-full rounded-full bg-primary transition-all duration-500"
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

      {/* ─── Morning entry (read-only, evening view) ─── */}
      {!isMorning && amEntry && (
        <div className="rounded-xl border border-border bg-card/50 p-5 shadow-soft">
          <div className="flex items-center gap-2 mb-2">
            <Sunrise className="h-3.5 w-3.5 text-primary" />
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              This morning you wrote
            </p>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
            {amEntry}
          </p>
        </div>
      )}

      {/* ─── Save — with circular checkmark animation ─── */}
      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={saving || !canSave} className="gap-2">
          {saving ? 'Saving…' : isMorning ? 'Save morning' : 'Save evening'}
        </Button>

        {/* Circular checkmark animation when saved */}
        {saved && (
          <div className="flex items-center gap-2 animate-fade-in-up">
            <div className="relative flex h-7 w-7 items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 28 28" className="-rotate-90">
                <circle
                  cx="14"
                  cy="14"
                  r="11"
                  fill="none"
                  strokeWidth="2.5"
                  stroke="oklch(0.82 0.13 88)"
                  strokeDasharray="69.12"
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  className="animate-[drawLine_0.5s_ease-out]"
                  style={{ filter: 'drop-shadow(0 0 4px oklch(0.82 0.13 88 / 0.5))' }}
                />
              </svg>
              <Check className="absolute h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm font-medium text-primary">Saved</span>
          </div>
        )}

        {!canSave && !saved && (
          <span className="text-xs text-muted-foreground/60">
            {isMorning
              ? 'What will you change today? One sentence is enough.'
              : 'What did you change today? One sentence is enough.'}
          </span>
        )}
      </div>
    </div>
  );
}
