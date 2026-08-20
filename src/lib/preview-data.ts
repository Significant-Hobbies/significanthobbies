import { isWeekday, shiftDayKey } from '~/lib/day';
import { previousMonthKey, TRAJECTORY_BUCKETS, type TrajectoryBucket } from '~/lib/trajectory';
import type { TrajectoryEraWithEntries, TrajectoryState } from '~/lib/actions/trajectory';

/**
 * Sample content for the signed-out previews of /daily and /trajectory.
 *
 * Both surfaces are longitudinal — their value *is* accumulated history — so an
 * empty state teaches a visitor nothing about what the product does. These
 * builders fill them with one plausible month of a stranger's practice.
 *
 * Everything is derived from the caller's `today` / `monthKey` rather than
 * hardcoded, so the preview can never drift into showing stale dates. Pure
 * functions, no DB, no session: safe to render for anonymous visitors.
 */

const PREVIEW_USER_ID = 'preview-user';

/**
 * Name in the preview greeting.
 *
 * The banner says the visitor is looking at someone else's month, so greeting
 * them by a placeholder ("Good evening, there.") contradicts it — the page has
 * to read as the sample person's own ritual.
 */
export const PREVIEW_FIRST_NAME = 'Mara';

export interface PreviewHabit {
  id: string;
  name: string;
  status: string;
  targetFrequency: string;
  icon: string | null;
  sourceQuestId: string | null;
}

export interface PreviewHabitLog {
  id: string;
  habitId: string;
  dayDate: string;
  completed: boolean;
}

export interface PreviewJournalEntry {
  id: string;
  dayDate: string;
  amEntry: string | null;
  pmEntry: string | null;
}

/** Habits chosen to show all three cadences the streak maths supports. */
const PREVIEW_HABITS: PreviewHabit[] = [
  {
    id: 'preview-habit-read',
    name: 'Read 20 pages',
    status: 'active',
    targetFrequency: 'daily',
    icon: '📚',
    sourceQuestId: null,
  },
  {
    id: 'preview-habit-run',
    name: 'Long run',
    status: 'active',
    targetFrequency: '3x_week',
    icon: '🏃',
    sourceQuestId: null,
  },
  {
    id: 'preview-habit-piano',
    name: 'Piano practice',
    status: 'active',
    targetFrequency: 'weekdays',
    icon: '🎸',
    sourceQuestId: null,
  },
];

/**
 * Which of the past `days` a preview habit was completed on.
 *
 * Deliberately imperfect: the daily habit has a gap four days back and the
 * quota habit only lands three times a week. A preview showing an unbroken
 * wall of ticks would misrepresent a product whose whole thesis is that the
 * gap is the point.
 */
function completionOffsets(habitId: string, today: string, days: number): number[] {
  const offsets: number[] = [];
  for (let i = 0; i < days; i++) {
    const keep =
      habitId === 'preview-habit-read'
        ? i !== 4
        : habitId === 'preview-habit-run'
          ? i % 3 === 0
          : // The weekdays habit must only be ticked on actual weekdays, or the
            // card contradicts its own "WEEKDAYS" label on screen.
            isWeekday(shiftDayKey(today, -i));
    if (keep) offsets.push(i);
  }
  return offsets;
}

export function previewHabits(): PreviewHabit[] {
  return PREVIEW_HABITS.map((h) => ({ ...h }));
}

/** Completion history over the trailing `days`, today included. */
export function previewHabitLogs(today: string, days = 28): PreviewHabitLog[] {
  const logs: PreviewHabitLog[] = [];
  for (const habit of PREVIEW_HABITS) {
    for (const offset of completionOffsets(habit.id, today, days)) {
      logs.push({
        id: `preview-log-${habit.id}-${offset}`,
        habitId: habit.id,
        dayDate: shiftDayKey(today, -offset),
        completed: true,
      });
    }
  }
  return logs;
}

/** Just the logs for `today` — what the check-in row reads. */
export function previewHabitLogsForToday(today: string): PreviewHabitLog[] {
  return previewHabitLogs(today).filter((l) => l.dayDate === today);
}

const PREVIEW_AM = `Woke before the alarm for once. The thing I keep circling is the piano — I keep saying "when work calms down" and work has never once calmed down. Today I get 20 minutes at it before I open my laptop.`;

const PREVIEW_PM = `Got the 20 minutes. Badly, but I got them. The scales are still uneven and my left hand lags. Noting it here so that tomorrow I don't pretend today didn't happen.`;

/**
 * A sparse trailing month of journal entries.
 *
 * Sparse on purpose: the date rail communicates only whether writing exists,
 * and a fully-filled rail would imply the product expects perfection.
 */
export function previewJournalEntries(today: string): PreviewJournalEntry[] {
  const writtenOffsets = [0, 1, 2, 4, 5, 8, 9, 11, 15, 18];
  return writtenOffsets.map((offset) => {
    const dayDate = shiftDayKey(today, -offset);
    return {
      id: `preview-journal-${offset}`,
      dayDate,
      amEntry: offset === 0 ? PREVIEW_AM : `Morning pages for ${dayDate}.`,
      pmEntry: offset === 0 ? PREVIEW_PM : offset % 3 === 0 ? null : `Evening note for ${dayDate}.`,
    };
  });
}

/**
 * Today's entry specifically.
 *
 * JournalExperience reads today from the `journalEntry` prop (it seeds the editor
 * state) and only falls back to the `journalEntries` list for past days, so
 * today has to be passed separately or the reader renders blank.
 */
export function previewJournalEntryForToday(today: string): PreviewJournalEntry | null {
  return previewJournalEntries(today).find((e) => e.dayDate === today) ?? null;
}

const PREVIEW_IDEALS: Record<TrajectoryBucket, string> = {
  health: 'Strong enough to carry my own bags up four flights, at sixty.',
  finance: 'Twelve months of runway, so a bad year is inconvenient and not a crisis.',
  knowledge: 'Able to read a paper in my field without reaching for a glossary.',
  relationships: 'The people I love hear from me before they need something.',
};

interface PreviewMonth {
  value: number;
  reflection: string;
}

/**
 * Three months per bucket, oldest first, each number paired with the reflection
 * that explains it.
 *
 * Deliberately non-monotonic. Two of the four end below their own peak and none
 * is a straight line, because a preview of four rising diagonals would read as a
 * growth dashboard — the exact framing this surface rejects. The header says
 * "no score — the gap is the whole point"; the sample data has to agree with it,
 * and finance sitting at 5 against an ideal of 12 is the point being made.
 */
const PREVIEW_MONTHS: Record<TrajectoryBucket, { label: string; months: PreviewMonth[] }> = {
  health: {
    label: 'Runs per month',
    months: [
      { value: 12, reflection: 'Started the long runs. Slow, and slow is fine.' },
      { value: 7, reflection: 'Missed two weeks to a cold. It cost less than I feared.' },
      { value: 10, reflection: 'Back to three a week. Sleep is the weak link, not effort.' },
    ],
  },
  finance: {
    label: 'Months of runway',
    months: [
      { value: 4, reflection: 'Set the standing transfer up so it stops needing willpower.' },
      { value: 6, reflection: 'Boring transfers are doing the work. Runway up two months.' },
      {
        value: 5,
        reflection: 'Spent more than I meant to. Wrote down why rather than pretending.',
      },
    ],
  },
  knowledge: {
    label: 'Hours studied',
    months: [
      { value: 14, reflection: 'Picked the field properly instead of sampling five.' },
      { value: 11, reflection: 'Read less this month. Reading about reading is not reading.' },
      { value: 20, reflection: 'Finished the second textbook. The glossary trips me less.' },
    ],
  },
  relationships: {
    label: 'People reached out to',
    months: [
      { value: 6, reflection: 'Wrote the list of people I actually want to keep.' },
      { value: 2, reflection: 'Let two weeks go quiet. Noticing it is the fix.' },
      { value: 5, reflection: 'Called my sister without a reason. That was the whole point.' },
    ],
  },
};

/**
 * Four active eras, each with three months of entries ending at `monthKey`.
 *
 * Three points is the chart's minimum, so every bucket renders its line — a
 * visitor sees the surface as designed rather than four empty prompts.
 */
export function previewTrajectoryState(monthKey: string): TrajectoryState {
  const months = [
    previousMonthKey(previousMonthKey(monthKey)),
    previousMonthKey(monthKey),
    monthKey,
  ];

  const erasByBucket = {} as Record<TrajectoryBucket, TrajectoryEraWithEntries[]>;

  for (const bucket of TRAJECTORY_BUCKETS) {
    const eraId = `preview-era-${bucket}`;
    const { label, months: sample } = PREVIEW_MONTHS[bucket];

    const era: TrajectoryEraWithEntries = {
      id: eraId,
      userId: PREVIEW_USER_ID,
      bucket,
      idealText: PREVIEW_IDEALS[bucket],
      status: 'active',
      // Opened just before the first entry so the era reads as ongoing.
      openedAt: new Date(`${months[0]}-01T00:00:00.000Z`),
      closedAt: null,
      entries: months.map((month, i) => ({
        id: `preview-entry-${bucket}-${month}`,
        eraId,
        userId: PREVIEW_USER_ID,
        bucket,
        monthKey: month,
        reflection: sample[i]!.reflection,
        numbers: [{ label, value: sample[i]!.value }],
      })),
    };

    erasByBucket[bucket] = [era];
  }

  return { erasByBucket };
}
