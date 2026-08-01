'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Flame,
  Link2,
  Plus,
  Sparkles,
  Sunrise,
  Sunset,
  Trash2,
} from 'lucide-react';

import { SpotlightCard } from '~/components/aceternity';
import { CircularProgress } from '~/components/dashboard/circular-progress';
import { PreviewBanner } from '~/components/preview-banner';
import { Button } from '~/components/ui/button';
import {
  computeStreak,
  computeWeeklyProgress,
  FREQUENCY_OPTIONS,
  frequencyMeta,
} from '~/lib/habit-utils';
import { parseHabitCommitmentValue, type HabitCommitmentChoice } from '~/lib/habit-commitment';
import {
  journalContextFromColumns,
  journalContextValue,
  parseJournalContextValue,
  type JournalContextChoice,
  type JournalContextRef,
} from '~/lib/journal-context';
import { buildJournalDateWindow, hasJournalContent } from '~/lib/journal';
import { cn } from '~/lib/utils';

interface Habit {
  id: string;
  name: string;
  status: string;
  targetFrequency: string;
  icon: string | null;
  sourceQuestId: string | null;
  commitmentId?: string | null;
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
  timelineId?: string | null;
  commitmentId?: string | null;
}

interface Actions {
  createHabit: (
    name: string,
    targetFrequency?: string,
    icon?: string,
    commitmentId?: string | null
  ) => Promise<{ id: string; name: string } | null>;
  deleteHabit: (id: string) => Promise<void>;
  setHabitCommitment: (habitId: string, commitmentId: string | null) => Promise<boolean>;
  toggleHabitLog: (habitId: string, dayDate: string, completed: boolean) => Promise<void>;
  saveJournalEntry: (
    dayDate: string,
    amEntry: string | null,
    pmEntry: string | null,
    context?: JournalContextRef | null
  ) => Promise<void>;
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
  journalContextChoices?: JournalContextChoice[];
  habitCommitmentChoices?: HabitCommitmentChoice[];
  actions: Actions;
  /**
   * Signed-out preview of someone else's month.
   *
   * Habit ticks stay interactive — the daily write actions return early without
   * a session, so a tick is a harmless in-session gesture. Journal *writing* is
   * suppressed instead of merely unsaved: inviting a stranger to type a private
   * entry that silently evaporates is exactly the failure this preview exists
   * to avoid. Habit add/delete is hidden too, since router.refresh() would
   * reset it to the sample set and read as a bug.
   */
  preview?: boolean;
  localMode?: boolean;
}

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
  journalContextChoices = [],
  habitCommitmentChoices = [],
  actions,
  preview = false,
  localMode = false,
}: Props) {
  const [habits, setHabits] = useState(initialHabits);
  const [logs, setLogs] = useState(initialLogs);
  const [amEntry, setAmEntry] = useState(initialJournal?.amEntry ?? '');
  const [pmEntry, setPmEntry] = useState(initialJournal?.pmEntry ?? '');
  const initialJournalContext = journalContextFromColumns(
    initialJournal?.timelineId,
    initialJournal?.commitmentId
  );
  const [journalContext, setJournalContext] = useState<JournalContextRef | null>(
    initialJournalContext
  );
  const [lastSavedJournal, setLastSavedJournal] = useState({
    amEntry: initialJournal?.amEntry ?? '',
    pmEntry: initialJournal?.pmEntry ?? '',
    contextValue: journalContextValue(initialJournalContext),
  });
  const [newHabit, setNewHabit] = useState('');
  const [newHabitFreq, setNewHabitFreq] = useState('daily');
  const [newHabitIcon, setNewHabitIcon] = useState('');
  const [newHabitCommitmentId, setNewHabitCommitmentId] = useState('');
  const [showHabitManager, setShowHabitManager] = useState(false);
  const [habitLinkStatus, setHabitLinkStatus] = useState<{
    habitId: string;
    status: 'saving' | 'saved' | 'error';
  } | null>(null);
  const [habitCreateError, setHabitCreateError] = useState<string | null>(null);
  const [habitCreating, setHabitCreating] = useState(false);
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
    setHabitCreateError(null);
    setHabitCreating(true);
    startTransition(async () => {
      try {
        const created = await actions.createHabit(
          trimmed,
          newHabitFreq,
          newHabitIcon || undefined,
          parseHabitCommitmentValue(newHabitCommitmentId)
        );
        if (!created) throw new Error('Habit was not created');
        if (localMode) {
          setHabits((current) => [
            ...current,
            {
              id: created.id,
              name: created.name,
              status: 'active',
              targetFrequency: newHabitFreq,
              icon: newHabitIcon || null,
              sourceQuestId: null,
              commitmentId: parseHabitCommitmentValue(newHabitCommitmentId),
            },
          ]);
        }
        setNewHabit('');
        setNewHabitFreq('daily');
        setNewHabitIcon('');
        setNewHabitCommitmentId('');
        if (!localMode) router.refresh();
      } catch {
        setHabitCreateError(
          'Could not add this habit. Check the related commitment and try again.'
        );
      } finally {
        setHabitCreating(false);
      }
    });
  }

  function handleHabitCommitmentChange(habitId: string, value: string) {
    const commitmentId = parseHabitCommitmentValue(value);
    const previousCommitmentId = habits.find((habit) => habit.id === habitId)?.commitmentId ?? null;
    setHabitLinkStatus({ habitId, status: 'saving' });
    setHabits((current) =>
      current.map((habit) => (habit.id === habitId ? { ...habit, commitmentId } : habit))
    );
    startTransition(async () => {
      try {
        const updated = await actions.setHabitCommitment(habitId, commitmentId);
        if (!updated) throw new Error('Habit was not updated');
        setHabitLinkStatus({ habitId, status: 'saved' });
        if (!localMode) router.refresh();
      } catch {
        setHabits((current) =>
          current.map((habit) =>
            habit.id === habitId ? { ...habit, commitmentId: previousCommitmentId } : habit
          )
        );
        setHabitLinkStatus({ habitId, status: 'error' });
      }
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
      await actions.saveJournalEntry(today, amEntry || null, pmEntry || null, journalContext);
      setLastSavedJournal({
        amEntry,
        pmEntry,
        contextValue: journalContextValue(journalContext),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  const canSave = isMorning ? amEntry.trim().length > 0 : pmEntry.trim().length > 0;
  const journalIsDirty =
    amEntry !== lastSavedJournal.amEntry ||
    pmEntry !== lastSavedJournal.pmEntry ||
    journalContextValue(journalContext) !== lastSavedJournal.contextValue;
  const journalContextIsDirty =
    journalContextValue(journalContext) !== lastSavedJournal.contextValue;
  const journalDateWindow = buildJournalDateWindow(today);
  const selectedDateIndex = journalDateWindow.indexOf(selectedDate);
  const isTodaySelected = selectedDate === today;
  const selectedJournal = isTodaySelected
    ? {
        amEntry,
        pmEntry,
        timelineId: journalContext?.kind === 'timeline' ? journalContext.id : null,
        commitmentId: journalContext?.kind === 'commitment' ? journalContext.id : null,
      }
    : (journalEntries.find((entry) => entry.dayDate === selectedDate) ?? null);
  const selectedJournalContext = journalContextFromColumns(
    selectedJournal?.timelineId,
    selectedJournal?.commitmentId
  );
  const selectedJournalContextChoice = selectedJournalContext
    ? journalContextChoices.find(
        (choice) =>
          choice.kind === selectedJournalContext.kind && choice.id === selectedJournalContext.id
      )
    : null;
  const timelineContextChoices = journalContextChoices.filter(
    (choice) => choice.kind === 'timeline'
  );
  const commitmentContextChoices = journalContextChoices.filter(
    (choice) => choice.kind === 'commitment'
  );

  function hasWritingOn(dayDate: string): boolean {
    if (dayDate === today) return hasJournalContent({ amEntry, pmEntry });
    return hasJournalContent(journalEntries.find((entry) => entry.dayDate === dayDate));
  }

  function moveSelectedDate(offset: number) {
    const nextDate = journalDateWindow[selectedDateIndex + offset];
    if (nextDate) setSelectedDate(nextDate);
  }

  // AM/PM completion for the rings, derived from the writing itself rather than
  // a separate DailyCheckin row. The old flag was set only when you pressed save
  // during that half of the day, so writing a morning entry in the evening left
  // the AM ring dark even though the entry existed. The ring now means exactly
  // what it looks like it means: there is writing for this half of today.
  const amProgress = amEntry.trim().length > 0 ? 1 : 0;
  const pmProgress = pmEntry.trim().length > 0 ? 1 : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:py-14">
      {preview && (
        <PreviewBanner route="/daily">
          One stranger&apos;s week of the ritual — the AM and PM writing, the habit check-ins, the
          date rail. Nothing here is yours and nothing is saved.
        </PreviewBanner>
      )}
      {/* ─── Ritual header ─── */}
      <section
        className={`relative overflow-hidden rounded-[1.75rem] px-6 py-10 shadow-[0_14px_40px_rgba(66,55,22,0.10)] sm:px-10 sm:py-12 ${
          isMorning ? 'bg-[#f7e957] text-[#201f18]' : 'bg-[#c5abfa] text-[#241a31]'
        }`}
      >
        <div className="relative max-w-2xl">
          <div className="flex items-center gap-2 text-base font-semibold">
            {isMorning ? <Sunrise className="h-5 w-5" /> : <Sunset className="h-5 w-5" />}
            {dateString}
          </div>
          <h1 className="mt-5 font-serif text-5xl font-medium leading-[1.02] tracking-[-0.03em] sm:text-6xl">
            {greeting}
          </h1>
          {weeksRemaining !== null && (
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-white/65 px-3 py-2">
                <div className="h-2 w-2 rounded-full bg-[#201f18]" />
                <span className="text-base text-[#4b493d]">
                  <span className="font-serif font-medium tabular-nums text-[#201f18]">
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
      <div className="flex items-center justify-center gap-12 rounded-2xl bg-[#b9dcf5] p-7 text-[#192a36] shadow-[0_10px_30px_rgba(55,88,110,0.10)]">
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
        className="overflow-hidden rounded-[1.5rem] bg-white shadow-[0_12px_36px_rgba(66,55,22,0.10)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border/60 px-5 py-5 sm:px-7">
          <div>
            <p className="text-sm font-semibold text-subtle">Private journal</p>
            <h2
              id="daily-journal-title"
              className="mt-2 font-serif text-3xl font-medium tracking-tight text-foreground"
            >
              {isTodaySelected ? 'Today' : formatJournalDate(selectedDate, false)}
            </h2>
          </div>
          <p className="pt-1 text-right text-sm leading-relaxed text-subtle">
            {isTodaySelected ? journalTitle : formatJournalDate(selectedDate)}
          </p>
        </div>

        <div className="min-h-[280px] px-5 py-6 sm:px-7 sm:py-8">
          {isTodaySelected && !preview ? (
            <div className="space-y-6">
              {!isMorning && amEntry.trim() && (
                <div className="flex gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary/35 text-primary">
                    <Sunrise className="h-3 w-3" />
                  </span>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-subtle">
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
                  onChange={(event) => {
                    setSaved(false);
                    if (isMorning) setAmEntry(event.target.value);
                    else setPmEntry(event.target.value);
                  }}
                  placeholder={journalPlaceholder}
                  className="mt-3 min-h-[150px] w-full resize-none border-0 bg-transparent p-0 text-base leading-7 text-foreground placeholder:text-subtle focus-visible:outline-none"
                />
              </div>

              {journalContextChoices.length > 0 && (
                <div className="rounded-xl border border-border/60 bg-background/35 px-4 py-3.5">
                  <label
                    htmlFor="daily-journal-context"
                    className="flex items-center gap-2 text-xs font-medium text-foreground"
                  >
                    <Link2 className="h-3.5 w-3.5 text-primary" />
                    Part of
                    <span className="font-normal text-subtle">(optional)</span>
                  </label>
                  <select
                    id="daily-journal-context"
                    aria-describedby="daily-journal-context-help"
                    value={journalContextValue(journalContext)}
                    onChange={(event) => {
                      setSaved(false);
                      setJournalContext(parseJournalContextValue(event.target.value));
                    }}
                    className="mt-2.5 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/25"
                  >
                    <option value="">No related plan</option>
                    {timelineContextChoices.length > 0 && (
                      <optgroup label="Timelines">
                        {timelineContextChoices.map((choice) => (
                          <option
                            key={`${choice.kind}:${choice.id}`}
                            value={journalContextValue(choice)}
                          >
                            {choice.label}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {commitmentContextChoices.length > 0 && (
                      <optgroup label="Commitments">
                        {commitmentContextChoices.map((choice) => (
                          <option
                            key={`${choice.kind}:${choice.id}`}
                            value={journalContextValue(choice)}
                          >
                            {choice.label}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  <p
                    id="daily-journal-context-help"
                    className="mt-2 text-xs leading-relaxed text-subtle"
                  >
                    A private thread back to what this day was part of. It does not create proof or
                    progress.
                  </p>
                  {journalContextIsDirty && (
                    <p className="mt-2 text-xs font-medium text-primary">
                      Save the entry to keep this plan link.
                    </p>
                  )}
                  {selectedJournalContextChoice && !journalIsDirty && (
                    <Link
                      href={selectedJournalContextChoice.href}
                      prefetch={false}
                      className="-ml-2 mt-1 inline-flex min-h-11 items-center rounded-md px-2 text-xs font-medium text-primary underline decoration-primary/35 underline-offset-4 hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
                    >
                      Open plan →
                    </Link>
                  )}
                </div>
              )}

              <div className="flex min-h-9 flex-wrap items-center gap-3 border-t border-border/50 pt-4">
                <Button onClick={handleSave} disabled={saving || !canSave} className="gap-2">
                  {saving ? 'Saving…' : isMorning ? 'Save morning' : 'Save evening'}
                </Button>
                {saved && (
                  <span className="flex animate-fade-in-up items-center gap-1.5 text-sm font-medium text-primary">
                    <Check className="h-4 w-4" />
                    {journalContext ? 'Entry and plan saved' : 'Entry saved'}
                  </span>
                )}
                {!canSave && !saved && (
                  <span className="text-xs text-subtle">One honest sentence is enough.</span>
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
                    <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-subtle">
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
                    <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-subtle">
                      Evening reflection
                    </p>
                    <p className="mt-1.5 whitespace-pre-wrap text-base leading-7 text-foreground/80">
                      {selectedJournal.pmEntry}
                    </p>
                  </div>
                </div>
              )}
              {selectedJournalContextChoice && (
                <Link
                  href={selectedJournalContextChoice.href}
                  prefetch={false}
                  className="-ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-primary underline decoration-primary/35 underline-offset-4 hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
                >
                  <Link2 className="h-3.5 w-3.5" />
                  Related to {selectedJournalContextChoice.label} →
                </Link>
              )}
            </div>
          ) : (
            <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
              <p className="font-serif text-lg text-foreground/75">Nothing recorded here.</p>
              <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-subtle">
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
          <p className="mt-2 text-center text-[10px] text-subtle">
            Solid marks hold writing. Quiet marks are simply days.
          </p>
        </div>
      </section>

      {/* ─── Habits — SpotlightCards with streak + weekly progress ─── */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <h3 className="font-serif text-3xl font-medium text-foreground">Habits</h3>
            <p className="mt-2 text-base text-muted-foreground">
              The small repeated thing. Checked in, never scored.
            </p>
          </div>
          {!preview && (
            <button
              onClick={() => setShowHabitManager(!showHabitManager)}
              className="min-h-11 rounded px-2 text-base font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
            >
              {showHabitManager ? 'Done' : 'Manage'}
            </button>
          )}
        </div>

        {showHabitManager && habitCommitmentChoices.length > 0 && (
          <div className="rounded-lg border border-border/60 bg-card px-3 py-2.5">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Related commitments are private planning context. Habit check-ins never create proof
              or commitment progress.
            </p>
          </div>
        )}

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
              const linkedCommitment = habit.commitmentId
                ? habitCommitmentChoices.find((choice) => choice.id === habit.commitmentId)
                : null;
              const done = isHabitDone(habit.id);
              const streak = computeStreak(allHabitLogs, habit.id, today, habit.targetFrequency);
              const weekly = computeWeeklyProgress(
                allHabitLogs,
                habit.id,
                today,
                habit.targetFrequency
              );
              const freqLabel = frequencyMeta(habit.targetFrequency).label;
              const weeklyPct = Math.min(100, (weekly.completed / weekly.target) * 100);

              return (
                <SpotlightCard
                  key={habit.id}
                  className={cn(
                    'shadow-soft transition-colors',
                    done && 'border-primary/30 bg-primary/5'
                  )}
                  innerClassName="flex items-start gap-4 p-4"
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
                  <div className="flex min-w-0 flex-1 items-start gap-2.5">
                    {habit.icon && <span className="text-lg leading-none">{habit.icon}</span>}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p
                          className={cn(
                            'line-clamp-2 text-sm font-medium leading-snug',
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
                      <p className="text-[10px] uppercase tracking-wide text-subtle">{freqLabel}</p>
                      {linkedCommitment && !showHabitManager && (
                        <Link
                          href={linkedCommitment.href}
                          prefetch={false}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Open ${linkedCommitment.label} in a new tab`}
                          className="-ml-2 mt-0.5 inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-[11px] text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground hover:decoration-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
                        >
                          <Link2 className="h-3 w-3 text-primary" />
                          For {linkedCommitment.label}
                          <span className="sr-only"> (opens in a new tab)</span>
                        </Link>
                      )}
                      {showHabitManager && habitCommitmentChoices.length > 0 && (
                        <div className="mt-2">
                          <label htmlFor={`habit-commitment-${habit.id}`} className="sr-only">
                            Related commitment for {habit.name}
                          </label>
                          <select
                            id={`habit-commitment-${habit.id}`}
                            value={habit.commitmentId ?? ''}
                            disabled={
                              habitLinkStatus?.habitId === habit.id &&
                              habitLinkStatus.status === 'saving'
                            }
                            onChange={(event) =>
                              handleHabitCommitmentChange(habit.id, event.target.value)
                            }
                            className="min-h-11 w-full max-w-full rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none disabled:cursor-wait disabled:opacity-60 focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/25"
                          >
                            <option value="">No related commitment</option>
                            {habitCommitmentChoices.map((choice) => (
                              <option key={choice.id} value={choice.id}>
                                {choice.label}
                              </option>
                            ))}
                          </select>
                          {habitLinkStatus?.habitId === habit.id && (
                            <p
                              role={habitLinkStatus.status === 'error' ? 'alert' : 'status'}
                              aria-live={
                                habitLinkStatus.status === 'error' ? 'assertive' : 'polite'
                              }
                              className={cn(
                                'mt-1.5 text-xs',
                                habitLinkStatus.status === 'error'
                                  ? 'text-destructive'
                                  : 'text-subtle'
                              )}
                            >
                              {habitLinkStatus.status === 'saving' && 'Saving link…'}
                              {habitLinkStatus.status === 'saved' && 'Related commitment saved.'}
                              {habitLinkStatus.status === 'error' &&
                                `Could not update ${habit.name}. Try again.`}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Weekly progress dots */}
                  {!showHabitManager && (
                    <div className="hidden flex-col items-end gap-1.5 sm:flex">
                      <div
                        className="flex gap-1"
                        aria-label={`${weekly.completed} of ${weekly.target} this week`}
                      >
                        {Array.from({ length: weekly.target }).map((_, i) => (
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
                  )}

                  {/* Streak counter — days for scheduled habits, weeks for quota habits */}
                  {!showHabitManager && streak.count > 0 && (
                    <div
                      className="flex shrink-0 items-center gap-1 rounded-lg bg-primary/10 px-2 py-1"
                      aria-label={`${streak.count} ${streak.unit}${streak.count === 1 ? '' : 's'} in a row`}
                    >
                      <Flame className="h-3.5 w-3.5 text-primary" />
                      <span className="font-serif text-sm font-semibold tabular-nums text-primary">
                        {streak.count}
                        <span className="ml-0.5 text-[10px] font-medium">
                          {streak.unit === 'week' ? 'w' : 'd'}
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Delete (manage mode) */}
                  {showHabitManager && (
                    <button
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-subtle transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50"
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

            {habitCommitmentChoices.length > 0 && (
              <div>
                <label
                  htmlFor="new-habit-commitment"
                  className="mb-1.5 block text-xs text-muted-foreground"
                >
                  Related commitment <span className="text-subtle">(optional)</span>
                </label>
                <select
                  id="new-habit-commitment"
                  value={newHabitCommitmentId}
                  onChange={(event) => setNewHabitCommitmentId(event.target.value)}
                  className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/25"
                >
                  <option value="">No related commitment</option>
                  {habitCommitmentChoices.map((choice) => (
                    <option key={choice.id} value={choice.id}>
                      {choice.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {habitCreateError && (
              <p
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive"
              >
                {habitCreateError}
              </p>
            )}

            {/* Add button */}
            <Button
              size="sm"
              onClick={handleAddHabit}
              disabled={!newHabit.trim() || habitCreating}
              className="w-full"
            >
              <Plus className="h-3.5 w-3.5" />
              {habitCreating ? 'Adding habit…' : 'Add habit'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
