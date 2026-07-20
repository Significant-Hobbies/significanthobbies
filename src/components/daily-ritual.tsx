'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Flame,
  Plus,
  Sparkles,
  Sunrise,
  Sunset,
  Trash2,
  X,
} from 'lucide-react';

import { GradientMesh, SpotlightCard } from '~/components/aceternity';
import { CircularProgress } from '~/components/dashboard/circular-progress';
import { Button } from '~/components/ui/button';
import { computeStreak, computeWeeklyProgress } from '~/lib/habit-utils';
import { buildJournalDateWindow, hasJournalContent } from '~/lib/journal';
import { BUCKET_LABELS, type TrajectoryBucket } from '~/lib/trajectory';
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
  dayDate: string;
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

interface TrajectoryNudge {
  active: boolean;
  targetMonth: string | null;
  bucketsPending: TrajectoryBucket[];
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
  journalEntries: JournalEntry[];
  checkin: Checkin | null;
  trajectoryNudge?: TrajectoryNudge;
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

function calendarDate(dayDate: string): Date {
  const [year, month, day] = dayDate.split('-').map(Number);
  return new Date(year!, month! - 1, day!, 12);
}

function formatJournalDate(dayDate: string, includeYear = true): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    ...(includeYear ? { year: 'numeric' as const } : {}),
  }).format(calendarDate(dayDate));
}

function formatDateMarker(dayDate: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(calendarDate(dayDate));
}

export function DailyRitual({
  firstName,
  today,
  isMorning,
  weeksRemaining,
  habits: initialHabits,
  habitLogs: initialLogs,
  allHabitLogs,
  journalEntry: initialJournal,
  journalEntries,
  checkin: initialCheckin,
  trajectoryNudge,
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
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedDate, setSelectedDate] = useState(today);
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
  const journalDateWindow = buildJournalDateWindow(today);
  const selectedDateIndex = journalDateWindow.indexOf(selectedDate);
  const isTodaySelected = selectedDate === today;
  const selectedJournal = isTodaySelected
    ? { amEntry, pmEntry }
    : (journalEntries.find((entry) => entry.dayDate === selectedDate) ?? null);

  function hasWritingOn(dayDate: string): boolean {
    if (dayDate === today) return hasJournalContent({ amEntry, pmEntry });
    return hasJournalContent(journalEntries.find((entry) => entry.dayDate === dayDate));
  }

  function moveSelectedDate(offset: number) {
    const nextDate = journalDateWindow[selectedDateIndex + offset];
    if (nextDate) setSelectedDate(nextDate);
  }

  // AM/PM completion for the rings
  const amProgress = amCompleted ? 1 : 0;
  const pmProgress = pmCompleted ? 1 : 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-16 space-y-8">
      {/* ─── Ritual header — gradient mesh + editorial greeting ─── */}
      <section className="relative overflow-hidden rounded-2xl border border-border/50 p-6 sm:p-8">
        <GradientMesh variant={isMorning ? 'gold' : 'sage'} />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground/60">
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
                <div className="h-2 w-2 rounded-full bg-primary" />
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

      {/* ─── Trajectory month-end nudge ─── */}
      {trajectoryNudge?.active && !nudgeDismissed && (
        <section
          className="relative overflow-hidden rounded-xl border border-primary/25 bg-primary/[0.06] px-5 py-4"
          data-testid="trajectory-nudge"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <p className="font-serif text-sm font-medium text-foreground">
                Month-end — a quiet moment to look back
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {trajectoryNudge.targetMonth} still open for{' '}
                {trajectoryNudge.bucketsPending.map((b) => BUCKET_LABELS[b]).join(', ')}. The gap is
                the whole point.
              </p>
              <Link
                href="/trajectory"
                prefetch={false}
                className="inline-block pt-1 text-xs font-medium text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
              >
                Open Trajectory →
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setNudgeDismissed(true)}
              aria-label="Dismiss nudge"
              className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-background/60 hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

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

      {/* ─── Journal — focused reader + quiet recent-date rail ─── */}
      <section
        aria-labelledby="daily-journal-title"
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border/60 px-5 py-5 sm:px-7">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/55">
              Private journal
            </p>
            <h2
              id="daily-journal-title"
              className="mt-1.5 font-serif text-2xl font-medium tracking-tight text-foreground"
            >
              {isTodaySelected ? 'Today' : formatJournalDate(selectedDate, false)}
            </h2>
          </div>
          <p className="pt-1 text-right text-xs leading-relaxed text-muted-foreground/60">
            {isTodaySelected ? journalTitle : formatJournalDate(selectedDate)}
          </p>
        </div>

        <div className="min-h-[280px] px-5 py-6 sm:px-7 sm:py-8">
          {isTodaySelected ? (
            <div className="space-y-6">
              {!isMorning && amEntry.trim() && (
                <div className="flex gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary/35 text-primary">
                    <Sunrise className="h-3 w-3" />
                  </span>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/55">
                      This morning
                    </p>
                    <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-foreground/75">
                      {amEntry}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="daily-journal-entry"
                  className="flex items-center gap-2 font-serif text-base font-medium text-foreground"
                >
                  {isMorning ? (
                    <Sunrise className="h-4 w-4 text-primary" />
                  ) : (
                    <Sunset className="h-4 w-4 text-primary" />
                  )}
                  {prompt}
                </label>
                <textarea
                  id="daily-journal-entry"
                  value={isMorning ? amEntry : pmEntry}
                  onChange={(event) =>
                    isMorning ? setAmEntry(event.target.value) : setPmEntry(event.target.value)
                  }
                  placeholder={journalPlaceholder}
                  className="mt-3 min-h-[150px] w-full resize-none border-0 bg-transparent p-0 text-base leading-7 text-foreground placeholder:text-muted-foreground/35 focus-visible:outline-none"
                />
              </div>

              <div className="flex min-h-9 flex-wrap items-center gap-3 border-t border-border/50 pt-4">
                <Button onClick={handleSave} disabled={saving || !canSave} className="gap-2">
                  {saving ? 'Saving…' : isMorning ? 'Save morning' : 'Save evening'}
                </Button>
                {saved && (
                  <span className="flex animate-fade-in-up items-center gap-1.5 text-sm font-medium text-primary">
                    <Check className="h-4 w-4" />
                    Saved
                  </span>
                )}
                {!canSave && !saved && (
                  <span className="text-xs text-muted-foreground/55">
                    One honest sentence is enough.
                  </span>
                )}
              </div>
            </div>
          ) : hasJournalContent(selectedJournal) ? (
            <div className="space-y-7">
              {selectedJournal?.amEntry?.trim() && (
                <div className="flex gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary/35 text-primary">
                    <Sunrise className="h-3 w-3" />
                  </span>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/55">
                      Morning focus
                    </p>
                    <p className="mt-1.5 whitespace-pre-wrap text-base leading-7 text-foreground/80">
                      {selectedJournal.amEntry}
                    </p>
                  </div>
                </div>
              )}
              {selectedJournal?.pmEntry?.trim() && (
                <div className="flex gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary/35 text-primary">
                    <Sunset className="h-3 w-3" />
                  </span>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/55">
                      Evening reflection
                    </p>
                    <p className="mt-1.5 whitespace-pre-wrap text-base leading-7 text-foreground/80">
                      {selectedJournal.pmEntry}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
              <p className="font-serif text-lg text-foreground/75">Nothing recorded here.</p>
              <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted-foreground/55">
                Some days stay unwritten. They still belong to you.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-border/60 bg-background/25 px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => moveSelectedDate(-1)}
              disabled={selectedDateIndex <= 0}
              aria-label="Previous journal day"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <button
              type="button"
              onClick={() => setSelectedDate(today)}
              disabled={isTodaySelected}
              aria-label={isTodaySelected ? undefined : 'Return to today'}
              className="flex flex-col items-center rounded-md px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground disabled:cursor-default disabled:text-foreground/70"
            >
              <span>{formatJournalDate(selectedDate)}</span>
              {!isTodaySelected && (
                <span className="mt-1 text-[9px] tracking-[0.12em] text-primary/65">
                  Return to today
                </span>
              )}
            </button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => moveSelectedDate(1)}
              disabled={selectedDateIndex >= journalDateWindow.length - 1}
              aria-label="Next journal day"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-4 grid h-8 grid-cols-[repeat(21,minmax(0,1fr))] items-end gap-1">
            {journalDateWindow.map((dayDate) => {
              const isSelected = dayDate === selectedDate;
              const hasWriting = hasWritingOn(dayDate);

              return (
                <button
                  key={dayDate}
                  type="button"
                  onClick={() => setSelectedDate(dayDate)}
                  aria-label={`${formatDateMarker(dayDate)} — ${hasWriting ? 'journal entry' : 'no journal entry'}`}
                  aria-pressed={isSelected}
                  className="group flex h-8 items-end justify-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
                >
                  <span
                    className={`h-6 w-px transition-colors ${
                      isSelected
                        ? 'bg-primary shadow-[0_0_8px_oklch(0.82_0.13_88_/_0.45)]'
                        : hasWriting
                          ? 'bg-foreground/45 group-hover:bg-foreground/70'
                          : 'border-l border-dashed border-foreground/15 group-hover:border-foreground/30'
                    }`}
                  />
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-center text-[10px] text-muted-foreground/40">
            Solid marks hold writing. Quiet marks are simply days.
          </p>
        </div>
      </section>

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
    </div>
  );
}
