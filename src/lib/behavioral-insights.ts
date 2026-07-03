import { getCategoryForHobby } from '~/lib/hobbies';

// ─── Types ─────────────────────────────────────────────────────────────────

export type BehavioralInsight = {
  id: string;
  type: 'pattern' | 'progress' | 'contrast' | 'nudge';
  title: string;
  description: string;
  emoji: string;
  // 0-100, how strong/confident this insight is
  confidence: number;
};

export type UserData = {
  completedQuests: Array<{
    id: string;
    questId: string;
    type: string;
    sourceHobby: string | null;
    title: string;
    startedAt: Date;
    completedAt: Date | null;
  }>;
  activeQuests: Array<{
    id: string;
    questId: string;
    type: string;
    sourceHobby: string | null;
    title: string;
    startedAt: Date;
  }>;
  abandonedQuests: Array<{
    id: string;
    questId: string;
    type: string;
    sourceHobby: string | null;
    title: string;
    startedAt: Date;
  }>;
  habitLogs: Array<{
    habitId: string;
    dayDate: string;
    completed: boolean;
  }>;
  habits: Array<{
    id: string;
    name: string;
    sourceQuestId: string | null;
    status: string;
  }>;
  timelinePhases: Array<{
    label: string;
    hobbies: Array<{ name: string }>;
  }>;
};

// ─── Helpers ───────────────────────────────────────────────────────────────

const DAY_MS = 1000 * 60 * 60 * 24;

function daysBetween(a: Date, b: Date): number {
  return Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / DAY_MS));
}

function daysSince(date: Date): number {
  return Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / DAY_MS));
}

/** Derive a hobby category from a quest's sourceHobby (falls back to quest type). */
function categoryForQuest(quest: { sourceHobby: string | null; type: string }): string | null {
  if (quest.sourceHobby) {
    const cat = getCategoryForHobby(quest.sourceHobby);
    if (cat) return cat.name;
  }
  // Fall back to the quest type as a coarse category signal.
  return quest.type === 'rediscovery' ? 'Rediscovery' : quest.type || null;
}

/** Most common category across a list of quests. */
function topCategory(quests: Array<{ sourceHobby: string | null; type: string }>): string | null {
  const counts = new Map<string, number>();
  for (const q of quests) {
    const cat = categoryForQuest(q);
    if (!cat) continue;
    counts.set(cat, (counts.get(cat) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestN = 0;
  for (const [cat, n] of counts) {
    if (n > bestN) {
      best = cat;
      bestN = n;
    }
  }
  return best;
}

/** Compute the current habit streak + longest streak from habit logs. */
function computeStreaks(logs: Array<{ dayDate: string; completed: boolean }>): {
  current: number;
  longest: number;
} {
  const completedDays = Array.from(
    new Set(logs.filter((l) => l.completed).map((l) => l.dayDate))
  ).sort(); // ascending YYYY-MM-DD

  if (completedDays.length === 0) return { current: 0, longest: 0 };

  const oneDay = (d: string): string => {
    const dt = new Date(d + 'T00:00:00');
    dt.setDate(dt.getDate() + 1);
    return dt.toISOString().slice(0, 10);
  };

  let longest = 1;
  let run = 1;
  for (let i = 1; i < completedDays.length; i++) {
    if (oneDay(completedDays[i - 1]) === completedDays[i]) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }

  // Current streak: walk back from today.
  const today = new Date().toISOString().slice(0, 10);
  const set = new Set(completedDays);
  let current = 0;
  let cursor = today;
  while (set.has(cursor)) {
    current += 1;
    const dt = new Date(cursor + 'T00:00:00');
    dt.setDate(dt.getDate() - 1);
    cursor = dt.toISOString().slice(0, 10);
  }

  return { current, longest };
}

function mostRecentLogDate(logs: Array<{ dayDate: string; completed: boolean }>): Date | null {
  if (logs.length === 0) return null;
  const sorted = [...logs].sort((a, b) => (a.dayDate < b.dayDate ? 1 : -1));
  return new Date(sorted[0].dayDate + 'T00:00:00');
}

function countThisMonth(logs: Array<{ dayDate: string; completed: boolean }>): number {
  const ym = new Date().toISOString().slice(0, 7);
  return logs.filter((l) => l.completed && l.dayDate.startsWith(ym)).length;
}

// ─── Insight builders ──────────────────────────────────────────────────────

function nostalgicPhaseInsight(completed: UserData['completedQuests']): BehavioralInsight | null {
  if (completed.length <= 3) return null;
  const rediscoveries = completed.filter((q) => q.type === 'rediscovery').length;
  const fresh = completed.length - rediscoveries;
  if (rediscoveries <= fresh) return null; // only call it "nostalgic" if rediscoveries dominate
  const confidence = Math.min(95, 55 + rediscoveries * 8);
  return {
    id: 'pattern-nostalgic-phase',
    type: 'pattern',
    title: `You've completed ${completed.length} quests — ${rediscoveries} were rediscoveries, ${fresh} were new`,
    description:
      "You're in a nostalgic phase. Most of what you finish lately is something you used to love, not something brand new.",
    emoji: '🔄',
    confidence,
  };
}

function completionRateInsight(data: UserData): BehavioralInsight | null {
  const started =
    data.completedQuests.length + data.activeQuests.length + data.abandonedQuests.length;
  if (started <= 5) return null;
  const finished = data.completedQuests.length;
  const rate = Math.round((finished / started) * 100);
  const ratio = started > 0 && finished > 0 ? (started / finished).toFixed(1) : `${started}`;
  const confidence = Math.min(90, 50 + started * 3);
  return {
    id: 'pattern-completion-rate',
    type: 'pattern',
    title: `Your quest completion rate is ${rate}%`,
    description: `You start ${ratio} quests for every one you finish. That's the shape of how you engage — knowing it lets you choose what to commit to.`,
    emoji: '📊',
    confidence,
  };
}

function categorySpeedInsight(completed: UserData['completedQuests']): BehavioralInsight | null {
  const withDuration = completed
    .filter((q) => q.completedAt)
    .map((q) => ({
      category: categoryForQuest(q),
      days: daysBetween(q.startedAt, q.completedAt as Date),
    }))
    .filter((d) => d.category && d.days >= 0);

  const byCategory = new Map<string, number[]>();
  for (const d of withDuration) {
    const arr = byCategory.get(d.category!) ?? [];
    arr.push(d.days);
    byCategory.set(d.category!, arr);
  }

  // Need at least 2 completed quests in each of two categories to compare.
  const candidates: Array<{ category: string; avg: number; n: number }> = [];
  for (const [cat, days] of byCategory) {
    if (days.length >= 2) {
      const avg = Math.round(days.reduce((a, b) => a + b, 0) / days.length);
      candidates.push({ category: cat, avg, n: days.length });
    }
  }
  if (candidates.length < 2) return null;

  candidates.sort((a, b) => a.avg - b.avg);
  const fastest = candidates[0];
  const slowest = candidates[candidates.length - 1];
  if (fastest.category === slowest.category) return null;
  const ratio = slowest.avg > 0 ? (slowest.avg / Math.max(1, fastest.avg)).toFixed(1) : '1';
  const confidence = Math.min(92, 45 + Math.min(fastest.n, slowest.n) * 10);
  return {
    id: 'pattern-category-speed',
    type: 'pattern',
    title: `You complete ${fastest.category} quests in ${fastest.avg} days on average, but ${slowest.category} quests take ${slowest.avg} days`,
    description: `${fastest.category} moves ${ratio}× faster for you. That's where your momentum lives — lean into it when you need a win.`,
    emoji: '⚡',
    confidence,
  };
}

function habitStreakInsight(logs: UserData['habitLogs']): BehavioralInsight | null {
  const { current, longest } = computeStreaks(logs);
  if (current <= 0 && longest <= 0) return null;
  const headline =
    current > 0
      ? `You're on a ${current}-day habit streak`
      : `Your longest habit streak was ${longest} days`;
  const description =
    current > 0 && longest > 0 && current < longest
      ? `Your longest was ${longest} days. You're ${longest - current} days from matching it.`
      : current > 0 && longest > 0
        ? `That ties your longest — every day from here is a new personal record.`
        : current > 0
          ? `Every day from here is a new personal record.`
          : `Streaks restart the moment you show up again. Pick one habit today.`;
  const confidence = Math.min(95, 40 + Math.max(current, longest) * 4);
  return {
    id: 'progress-habit-streak',
    type: 'progress',
    title: headline,
    description,
    emoji: '🔥',
    confidence,
  };
}

function questHabitPracticeInsight(data: UserData): BehavioralInsight | null {
  const questHabitIds = new Set(data.habits.filter((h) => h.sourceQuestId).map((h) => h.id));
  if (questHabitIds.size === 0) return null;
  const questLogs = data.habitLogs.filter((l) => questHabitIds.has(l.habitId) && l.completed);
  const monthCount = countThisMonth(questLogs);
  if (monthCount === 0) return null;
  const confidence = Math.min(90, 45 + monthCount * 3);
  return {
    id: 'progress-quest-habit-practice',
    type: 'progress',
    title: `You've practiced your quest habits ${monthCount} time${monthCount === 1 ? '' : 's'} this month`,
    description:
      'These are the daily reps behind the quests you started. Completion is the headline; practice is the substance.',
    emoji: '🎯',
    confidence,
  };
}

function milestoneInsight(completed: UserData['completedQuests']): BehavioralInsight | null {
  const n = completed.length;
  const milestones = [1, 5, 10, 25, 50];
  const hit = milestones.filter((m) => n >= m);
  if (hit.length === 0) return null;
  const m = hit[hit.length - 1];
  const next = milestones.find((ms) => ms > n);
  const description = next
    ? `${n} completed. ${next - n} more to reach ${next}.`
    : `${n} completed — past every milestone we track. That's a serious body of work.`;
  const confidence = Math.min(98, 60 + n);
  return {
    id: 'progress-milestone',
    type: 'progress',
    title: `You've completed ${n} quests total`,
    description,
    emoji: '🏅',
    confidence,
  };
}

function abandonedVsCompletedInsight(data: UserData): BehavioralInsight | null {
  if (data.abandonedQuests.length <= 3 || data.completedQuests.length <= 3) return null;
  const abandonedCat = topCategory(data.abandonedQuests);
  const completedCat = topCategory(data.completedQuests);
  if (!abandonedCat || !completedCat || abandonedCat === completedCat) return null;
  const confidence = Math.min(
    88,
    45 + Math.min(data.abandonedQuests.length, data.completedQuests.length) * 4
  );
  return {
    id: 'contrast-abandoned-vs-completed',
    type: 'contrast',
    title: `You started ${data.abandonedQuests.length + data.completedQuests.length} quests but only finished ${data.completedQuests.length}`,
    description: `The ones you abandoned were mostly about ${abandonedCat}. The ones you finished were about ${completedCat}. Maybe stop forcing ${abandonedCat.toLowerCase()} — it's not where you follow through.`,
    emoji: '⚖️',
    confidence,
  };
}

function timelineCoverageInsight(data: UserData): BehavioralInsight | null {
  const allHobbies = data.timelinePhases.flatMap((p) => p.hobbies.map((h) => h.name));
  const uniqueHobbies = Array.from(new Set(allHobbies.map((h) => h.toLowerCase())));
  if (uniqueHobbies.length <= 5) return null;
  const questedHobbies = new Set(
    [...data.completedQuests, ...data.activeQuests]
      .map((q) => q.sourceHobby?.toLowerCase())
      .filter(Boolean) as string[]
  );
  const covered = uniqueHobbies.filter((h) => questedHobbies.has(h)).length;
  const pct = Math.round((covered / uniqueHobbies.length) * 100);
  if (pct >= 50) return null;
  const confidence = Math.min(85, 50 + (uniqueHobbies.length - covered) * 2);
  return {
    id: 'contrast-timeline-coverage',
    type: 'contrast',
    title: `Your timeline has ${uniqueHobbies.length} hobbies but you've only quested for ${covered}`,
    description:
      "Your past self knows things your present self hasn't explored yet. The unquested hobbies are dormant leads — pick one and see what comes back.",
    emoji: '🗺️',
    confidence,
  };
}

function staleHabitsNudgeInsight(data: UserData): BehavioralInsight | null {
  if (data.activeQuests.length === 0) return null;
  const last = mostRecentLogDate(data.habitLogs);
  const gap = last ? daysSince(last) : Infinity;
  if (gap < 3) return null;
  const gapLabel = Number.isFinite(gap) ? `${gap} days` : 'a while';
  const confidence = Math.min(90, 55 + Math.min(gap, 30));
  return {
    id: 'nudge-stale-habits',
    type: 'nudge',
    title: `You have ${data.activeQuests.length} active quest${data.activeQuests.length === 1 ? '' : 's'} but haven't logged a habit in ${gapLabel}`,
    description:
      'Pick one quest and practice it today. Quests without reps are wishes — habits turn them into motion.',
    emoji: '👋',
    confidence,
  };
}

function staleQuestNudgeInsight(data: UserData): BehavioralInsight | null {
  const stale = data.activeQuests
    .map((q) => ({ quest: q, days: daysSince(q.startedAt) }))
    .filter((x) => x.days > 14)
    .sort((a, b) => b.days - a.days);
  if (stale.length === 0) return null;
  const { quest, days } = stale[0];
  const confidence = Math.min(92, 60 + Math.min(days, 30));
  return {
    id: 'nudge-stale-quest',
    type: 'nudge',
    title: `Your quest "${quest.title}" has been active for ${days} days`,
    description:
      "Complete it or let it go — stale quests drain momentum. A quest open for two weeks is a decision you haven't made.",
    emoji: '⏳',
    confidence,
  };
}

// ─── Main entry ────────────────────────────────────────────────────────────

export function computeBehavioralInsights(data: UserData): BehavioralInsight[] {
  const insights: (BehavioralInsight | null)[] = [
    nostalgicPhaseInsight(data.completedQuests),
    completionRateInsight(data),
    categorySpeedInsight(data.completedQuests),
    habitStreakInsight(data.habitLogs),
    questHabitPracticeInsight(data),
    milestoneInsight(data.completedQuests),
    abandonedVsCompletedInsight(data),
    timelineCoverageInsight(data),
    staleHabitsNudgeInsight(data),
    staleQuestNudgeInsight(data),
  ];

  return insights.filter((i): i is BehavioralInsight => i !== null);
}
