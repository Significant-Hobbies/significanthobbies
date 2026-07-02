// Commitments & stamps — pure logic (no DB). Server actions live in
// src/lib/actions/commitments.ts and call into these helpers.

export type CommitmentStatus = 'active' | 'completed' | 'abandoned';

export type ProofType = 'youtube' | 'video' | 'image' | 'url' | 'text';

export type StampRow = {
  dayDate: string; // YYYY-MM-DD
  dayIndex: number;
  proofUrl: string;
  proofType: string;
  note: string | null;
};

export type CommitmentRow = {
  id: string;
  hobbyName: string;
  goalDays: number;
  status: string;
  startDate: Date;
  stamps: StampRow[];
};

export type StreakInfo = {
  currentStreak: number; // consecutive days ending today or yesterday
  longestStreak: number;
  totalStamps: number;
  // Whether the user has already stamped today (UI prompt uses this).
  stampedToday: boolean;
  // Whether the user stamped yesterday (decides if streak is "still alive").
  stampedYesterday: boolean;
};

/** Infer a proof type from a URL string. */
export function inferProofType(input: string): ProofType {
  const v = input.trim();
  if (!v) return 'text';
  if (/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(v)) return 'youtube';
  if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(v)) return 'video';
  if (/\.(png|jpe?g|gif|webp|avif)(\?|$)/i.test(v)) return 'image';
  if (/^https?:\/\//i.test(v)) return 'url';
  return 'text';
}

/** Normalize a proof input into a URL when it looks like one. */
export function normalizeProofUrl(input: string): string {
  const v = input.trim();
  if (!v) return '';
  if (/^https?:\/\//i.test(v)) return v;
  // Bare youtube.com / youtu.be / domain → prefix https://
  if (/^(www\.|youtu\.be|youtube\.com|[a-z0-9-]+\.[a-z]{2,})/i.test(v)) return `https://${v}`;
  return v; // treat as text note / non-url
}

function todayStr(now: Date = new Date()): string {
  return toDayStr(now);
}

function toDayStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function dayDiff(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const da = new Date(ay, am - 1, ad).getTime();
  const db = new Date(by, bm - 1, bd).getTime();
  return Math.round((db - da) / (24 * 60 * 60 * 1000));
}

/**
 * Compute streak info from a commitment's stamps. Stamps are sorted ascending
 * by dayDate. A streak is consecutive calendar days. The "current" streak
 * counts back from today: if today is stamped, count today + prior consecutive
 * days; if today isn't stamped but yesterday is, the streak is still alive and
 * counts up through yesterday; if neither, current streak is 0.
 */
export function computeStreak(stamps: StampRow[], now: Date = new Date()): StreakInfo {
  if (stamps.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalStamps: 0,
      stampedToday: false,
      stampedYesterday: false,
    };
  }
  const days = stamps.map((s) => s.dayDate).sort();
  const uniqueDays = Array.from(new Set(days));
  const daySet = new Set(uniqueDays);

  const today = todayStr(now);
  const yesterday = toDayStr(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  const stampedToday = daySet.has(today);
  const stampedYesterday = daySet.has(yesterday);

  // Current streak: walk back from the most recent relevant day.
  let currentStreak = 0;
  const cursorStr: string | null = stampedToday ? today : stampedYesterday ? yesterday : null;

  if (cursorStr) {
    // Walk backwards day by day while consecutive days exist in the set.
    let [cy, cm, cd] = cursorStr.split('-').map(Number);
    while (daySet.has(toDayStr(new Date(cy, cm - 1, cd)))) {
      currentStreak += 1;
      const prev = new Date(cy, cm - 1, cd - 1);
      cy = prev.getFullYear();
      cm = prev.getMonth() + 1;
      cd = prev.getDate();
    }
  }

  // Longest streak: scan sorted unique days for longest run of consecutive days.
  let longestStreak = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of uniqueDays) {
    if (prev !== null && dayDiff(prev, d) === 1) {
      run += 1;
    } else {
      run = 1;
    }
    if (run > longestStreak) longestStreak = run;
    prev = d;
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    totalStamps: uniqueDays.length,
    stampedToday,
    stampedYesterday,
  };
}

/**
 * Day index (0-based) for a given calendar day relative to a commitment's
 * start date. Day 0 is the start date's own day.
 */
export function dayIndexFor(startDate: Date, dayDate: string): number {
  const startStr = toDayStr(startDate);
  return Math.max(0, dayDiff(startStr, dayDate));
}

/**
 * Whether a commitment has reached its goal: total stamps >= goalDays.
 */
export function isCommitmentComplete(stamps: StampRow[], goalDays: number): boolean {
  const uniqueDays = new Set(stamps.map((s) => s.dayDate));
  return uniqueDays.size >= goalDays;
}

// ── Streak badges ──────────────────────────────────────────────────────────
// These are evaluated from streak stats rather than quest completion, so they
// live separately from evaluateBadges() and are merged into earnedBadges by
// the stamp server action.

export const STREAK_BADGES: { id: string; threshold: number }[] = [
  { id: 'showed-up', threshold: 7 },
  { id: 'month-of-marks', threshold: 30 },
  { id: 'iron-streak', threshold: 100 },
  { id: 'year-of-stamps', threshold: 365 },
];

/**
 * Given the user's longest streak across all commitments, return streak badge
 * ids that should be earned.
 */
export function evaluateStreakBadges(longestStreak: number): string[] {
  return STREAK_BADGES.filter((b) => longestStreak >= b.threshold).map((b) => b.id);
}
