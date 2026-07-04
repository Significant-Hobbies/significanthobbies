// ─── Look-back narrative generator ──────────────────────────────────────────
// Turns raw user data into a story of their life, told back to them.
// Not stats. Not insights. A narrative.

import { computeInsights } from '~/lib/insights';
import { computePersonality } from '~/lib/personality';
import { findRediscoveryOpportunities } from '~/lib/rediscovery';
import { computeStreak } from '~/lib/habit-utils';
import { birthDateFromYear, buildLifeGrid, weekIndexForDay } from '~/lib/mortality';
import type { Phase, TimelinePin } from '~/lib/types';

export interface LookBackData {
  name: string | null;
  creed: string | null;
  birthYear: number | null;
  phases: Phase[];
  pins: TimelinePin[];
  completedQuests: Array<{
    title: string;
    sourceHobby: string | null;
    type: string;
    startedAt: Date;
    completedAt: Date | null;
  }>;
  activeQuests: Array<{
    title: string;
    sourceHobby: string | null;
    startedAt: Date;
  }>;
  abandonedQuests: Array<{
    title: string;
    sourceHobby: string | null;
    startedAt: Date;
  }>;
  habits: Array<{
    id: string;
    name: string;
    icon: string | null;
    createdAt: Date;
  }>;
  habitLogs: Array<{
    habitId: string;
    dayDate: string;
    completed: boolean;
  }>;
  journalEntries: Array<{
    dayDate: string;
    amEntry: string | null;
    pmEntry: string | null;
  }>;
  commitments: Array<{
    hobbyName: string;
    goalDays: number;
    status: string;
    startDate: Date;
    stamps: string[]; // dayDate strings
  }>;
  arcs: Array<{
    title: string;
    emoji: string | null;
    type: string;
    status: string;
    startedAt: Date;
    completedAt: Date | null;
  }>;
}

export interface NarrativeSection {
  id: string;
  kind: 'opening' | 'timeline' | 'quests' | 'habits' | 'agency' | 'journal' | 'arcs' | 'closing';
  title: string;
  paragraphs: string[];
  emoji?: string;
}

// ─── Main generator ─────────────────────────────────────────────────────────

export function generateLookBack(data: LookBackData): NarrativeSection[] {
  const sections: NarrativeSection[] = [];
  const name = data.name?.split(' ')[0] ?? 'You';
  const hasPhases = data.phases.length > 0;
  const hasQuests = data.completedQuests.length > 0 || data.activeQuests.length > 0;
  const hasHabits = data.habits.length > 0;
  const hasJournal = data.journalEntries.length > 0;
  const hasArcs = data.arcs.length > 0;

  // ─── Opening ──────────────────────────────────────────────────────────────
  sections.push(generateOpening(data, name));

  // ─── Timeline / Life story ─────────────────────────────────────────────────
  if (hasPhases) {
    sections.push(generateTimelineStory(data, name));
  }

  // ─── Arcs ──────────────────────────────────────────────────────────────────
  if (hasArcs) {
    sections.push(generateArcStory(data, name));
  }

  // ─── Quests ────────────────────────────────────────────────────────────────
  if (hasQuests) {
    sections.push(generateQuestStory(data, name));
  }

  // ─── Habits ────────────────────────────────────────────────────────────────
  if (hasHabits) {
    sections.push(generateHabitStory(data, name));
  }

  // ─── Agency state ──────────────────────────────────────────────────────────
  const agency = detectAgencyState(data);
  if (agency) {
    sections.push(agency);
  }

  // ─── Journal ───────────────────────────────────────────────────────────────
  if (hasJournal) {
    sections.push(generateJournalStory(data, name));
  }

  // ─── Closing ───────────────────────────────────────────────────────────────
  sections.push(generateClosing(data, name, hasPhases));

  return sections.filter((s) => s.paragraphs.length > 0);
}

// ─── Opening ────────────────────────────────────────────────────────────────

function generateOpening(data: LookBackData, name: string): NarrativeSection {
  const paragraphs: string[] = [];

  if (data.creed) {
    paragraphs.push(`${name}, you said: "${data.creed}"`);
    paragraphs.push('Here is what that looks like when you actually live it.');
  } else {
    paragraphs.push(
      `${name}, this is your life so far. Not the version you tell people at parties — the real one. The one with gaps and comebacks and quiet mornings.`
    );
  }

  if (data.birthYear) {
    const birth = birthDateFromYear(data.birthYear);
    if (birth) {
      const grid = buildLifeGrid(birth, new Set());
      const years = Math.floor(grid.weeksLived / 52);
      paragraphs.push(
        `You've been alive for about ${years} years. That's ${grid.weeksLived.toLocaleString()} weeks. Of those, ${grid.weeksRemaining.toLocaleString()} are ahead of you — squares on the grid that haven't been filled yet.`
      );
    }
  }

  return {
    id: 'opening',
    kind: 'opening',
    title: 'Your life, told back to you',
    paragraphs,
    emoji: '✨',
  };
}

// ─── Timeline story ─────────────────────────────────────────────────────────

function generateTimelineStory(data: LookBackData, name: string): NarrativeSection {
  const paragraphs: string[] = [];
  const phases = data.phases;
  const insights = computeInsights(phases);
  const personality = computePersonality(phases);

  // The arc of the story
  if (phases.length === 1) {
    const phase = phases[0]!;
    const hobbyList = phase.hobbies.map((h) => h.name).join(', ');
    paragraphs.push(
      `So far, you've lived one chapter: ${phase.label}. In it, you picked up ${hobbyList}.`
    );
  } else {
    // Walk through the phases as a narrative
    const firstPhase = phases[0]!;
    const lastPhase = phases[phases.length - 1]!;
    const firstHobbies = firstPhase.hobbies.map((h) => h.name);
    const lastHobbies = lastPhase.hobbies.map((h) => h.name);

    paragraphs.push(
      `Your story has ${phases.length} chapters. It starts with ${firstPhase.label} — ${describeHobbies(firstHobbies)}.`
    );

    // Middle phases — what changed
    for (let i = 1; i < phases.length; i++) {
      const phase = phases[i]!;
      const prev = phases[i - 1]!;
      const added = insights.addedPerPhase[i] ?? [];
      const dropped = insights.droppedPerPhase[i] ?? [];

      if (added.length > 0 && dropped.length > 0) {
        paragraphs.push(
          `Then ${phase.label}: you picked up ${listHobbies(added)} and let go of ${listHobbies(dropped)}.`
        );
      } else if (added.length > 0) {
        paragraphs.push(`Then ${phase.label}: you added ${listHobbies(added)}.`);
      } else if (dropped.length > 0) {
        paragraphs.push(`Then ${phase.label}: you let go of ${listHobbies(dropped)}.`);
      } else {
        paragraphs.push(
          `Then ${phase.label}: ${describeHobbies(phase.hobbies.map((h) => h.name))}.`
        );
      }
    }

    // Where you are now
    paragraphs.push(`Now you're in ${lastPhase.label} — ${describeHobbies(lastHobbies)}.`);
  }

  // The through-line: most persistent hobbies
  const persistent = insights.mostPersistent.slice(0, 3);
  if (persistent.length > 0 && persistent[0]!.count > 1) {
    const persistentList = persistent.map((p) => `${p.hobby} (${p.count} chapters)`);
    paragraphs.push(
      `Through it all, ${listHobbies(persistent.map((p) => p.hobby))} stayed with you. These aren't hobbies you tried — they're hobbies that stuck.`
    );
  }

  // Comebacks
  if (insights.rekindled.length > 0) {
    const rekindled = insights.rekindled.slice(0, 2);
    paragraphs.push(
      `And then there's ${listHobbies(rekindled)} — hobbies you left and came back to. That's not inconsistency. That's a conversation that never ended.`
    );
  }

  // Personality
  if (personality) {
    paragraphs.push(
      `If this story has a character type, it's ${personality.archetype.name}. ${personality.archetype.description}`
    );
  }

  return {
    id: 'timeline',
    kind: 'timeline',
    title: 'The story so far',
    paragraphs,
    emoji: '📖',
  };
}

// ─── Arcs story ─────────────────────────────────────────────────────────────

function generateArcStory(data: LookBackData, name: string): NarrativeSection {
  const paragraphs: string[] = [];
  const completed = data.arcs.filter((a) => a.status === 'completed');
  const active = data.arcs.filter((a) => a.status === 'active');

  if (completed.length > 0) {
    if (completed.length === 1) {
      const arc = completed[0]!;
      const days = arc.completedAt
        ? Math.floor((arc.completedAt.getTime() - arc.startedAt.getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      paragraphs.push(
        `You completed one arc: "${arc.title}"${arc.emoji ? ` ${arc.emoji}` : ''}. It took ${days} days. That's a chapter with a beginning, middle, and end — not a todo you checked off.`
      );
    } else {
      paragraphs.push(
        `You've completed ${completed.length} arcs. Each one is a chapter you finished — ${completed.map((a) => `"${a.title}"`).join(', ')}.`
      );
    }
  }

  if (active.length > 0) {
    if (active.length === 1) {
      const arc = active[0]!;
      const days = Math.floor((Date.now() - arc.startedAt.getTime()) / (1000 * 60 * 60 * 24));
      paragraphs.push(
        `Right now you're in "${arc.title}"${arc.emoji ? ` ${arc.emoji}` : ''}. It's been ${days} days. The arc isn't over — you're still writing it.`
      );
    } else {
      paragraphs.push(
        `You have ${active.length} arcs in progress: ${active.map((a) => `"${a.title}"`).join(', ')}.`
      );
    }
  }

  return {
    id: 'arcs',
    kind: 'arcs',
    title: 'Your arcs',
    paragraphs,
    emoji: '🎯',
  };
}

// ─── Quests story ───────────────────────────────────────────────────────────

function generateQuestStory(data: LookBackData, name: string): NarrativeSection {
  const paragraphs: string[] = [];
  const completed = data.completedQuests;
  const active = data.activeQuests;
  const abandoned = data.abandonedQuests;

  if (completed.length > 0) {
    // Group by type
    const rediscovery = completed.filter((q) => q.type === 'rediscovery');
    const staticQuests = completed.filter((q) => q.type === 'static');

    if (rediscovery.length > 0) {
      const hobbies = [...new Set(rediscovery.map((q) => q.sourceHobby).filter(Boolean))];
      paragraphs.push(
        `You completed ${rediscovery.length} rediscovery ${rediscovery.length === 1 ? 'quest' : 'quests'} — you went back to ${listHobbies(hobbies as string[])}. These weren't new things. These were old loves you returned to.`
      );
    }

    if (staticQuests.length > 0) {
      paragraphs.push(
        `You completed ${staticQuests.length} side ${staticQuests.length === 1 ? 'quest' : 'quests'} — small adventures you chose to go on.`
      );
    }

    // Milestone
    if (completed.length === 1) {
      paragraphs.push(
        'That first quest matters. It means you decided to do something instead of just thinking about it.'
      );
    } else if (completed.length >= 10) {
      paragraphs.push(
        `${completed.length} quests. That's not dabbling — that's a pattern of showing up.`
      );
    }
  }

  if (active.length > 0) {
    if (active.length === 1) {
      paragraphs.push(
        `You have one quest in progress: "${active[0]!.title}". It's waiting for you.`
      );
    } else {
      paragraphs.push(`You have ${active.length} quests in progress. They're all waiting for you.`);
    }
  }

  // Abandoned quests — honest, not judgmental
  if (abandoned.length > 0 && abandoned.length <= 5) {
    paragraphs.push(
      `You abandoned ${abandoned.length} ${abandoned.length === 1 ? 'quest' : 'quests'}. That's not failure — that's knowing when something isn't yours.`
    );
  } else if (abandoned.length > 5) {
    paragraphs.push(
      `You abandoned ${abandoned.length} quests. Some of those were probably never going to fit. But it might be worth asking: were you starting things, or just collecting intentions?`
    );
  }

  return {
    id: 'quests',
    kind: 'quests',
    title: 'What you did about it',
    paragraphs,
    emoji: '⚔️',
  };
}

// ─── Habits story ───────────────────────────────────────────────────────────

function generateHabitStory(data: LookBackData, name: string): NarrativeSection {
  const paragraphs: string[] = [];

  // Total habit check-ins
  const totalCheckins = data.habitLogs.filter((l) => l.completed).length;
  if (totalCheckins > 0) {
    paragraphs.push(
      `You've shown up ${totalCheckins} ${totalCheckins === 1 ? 'time' : 'times'} to practice your habits. That's ${totalCheckins} days you decided to do the thing instead of skipping it.`
    );
  }

  // Best streak
  let bestStreak = 0;
  let bestHabit = '';
  for (const habit of data.habits) {
    const streak = computeStreak(
      data.habitLogs.map((l) => ({
        habitId: l.habitId,
        dayDate: l.dayDate,
        completed: l.completed,
      })),
      habit.id
    );
    if (streak > bestStreak) {
      bestStreak = streak;
      bestHabit = habit.name;
    }
  }

  if (bestStreak >= 7) {
    paragraphs.push(
      `Your longest current streak is ${bestStreak} days on "${bestHabit}". That's not motivation — that's identity. You're someone who does this now.`
    );
  } else if (bestStreak >= 3) {
    paragraphs.push(
      `You're on a ${bestStreak}-day streak with "${bestHabit}". Keep going. The chain is forming.`
    );
  }

  // Habit count
  if (data.habits.length >= 3) {
    paragraphs.push(
      `You're tracking ${data.habits.length} habits. ${data.habits.map((h) => `${h.icon ?? '•'} ${h.name}`).join(', ')}.`
    );
  } else if (data.habits.length > 0) {
    paragraphs.push(
      `You're tracking ${data.habits.length} ${data.habits.length === 1 ? 'habit' : 'habits'}: ${data.habits.map((h) => h.name).join(', ')}.`
    );
  }

  return {
    id: 'habits',
    kind: 'habits',
    title: 'The practice',
    paragraphs,
    emoji: '🔁',
  };
}

// ─── Journal story ──────────────────────────────────────────────────────────

function generateJournalStory(data: LookBackData, name: string): NarrativeSection {
  const paragraphs: string[] = [];
  const entries = data.journalEntries;
  const totalEntries = entries.length;
  const entriesWithContent = entries.filter((e) => e.amEntry || e.pmEntry);

  if (totalEntries === 0) {
    return { id: 'journal', kind: 'journal', title: '', paragraphs: [], emoji: '📝' };
  }

  paragraphs.push(
    `You've written ${totalEntries} journal ${totalEntries === 1 ? 'entry' : 'entries'}. That's ${totalEntries} ${totalEntries === 1 ? 'day' : 'days'} you stopped to think about what you're doing.`
  );

  // Find a meaningful entry to quote
  const meaningfulEntries = entriesWithContent
    .filter((e) => {
      const text = (e.pmEntry ?? e.amEntry ?? '').trim();
      return text.length > 20 && text.length < 200;
    })
    .sort((a, b) => (b.pmEntry ?? b.amEntry ?? '').length - (a.pmEntry ?? a.amEntry ?? '').length);

  if (meaningfulEntries.length > 0) {
    const entry = meaningfulEntries[0]!;
    const text = (entry.pmEntry ?? entry.amEntry ?? '').trim();
    const date = new Date(entry.dayDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    paragraphs.push(`On ${date}, you wrote: "${text}"`);
  }

  // Consistency
  if (totalEntries >= 30) {
    paragraphs.push(
      `${totalEntries} entries. You're not someone who journals. You're someone who journals now.`
    );
  } else if (totalEntries >= 7) {
    paragraphs.push(`You're building a habit of reflection. ${totalEntries} entries is a start.`);
  }

  return {
    id: 'journal',
    kind: 'journal',
    title: 'What you wrote',
    paragraphs,
    emoji: '📝',
  };
}

// ─── Closing ────────────────────────────────────────────────────────────────

function generateClosing(data: LookBackData, name: string, hasPhases: boolean): NarrativeSection {
  const paragraphs: string[] = [];

  // Trajectory — how this month compares to last month
  const trajectory = computeTrajectory(data);
  if (trajectory.narrative) {
    paragraphs.push(trajectory.narrative);
  }

  // Rediscovery
  if (hasPhases) {
    const rediscovery = findRediscoveryOpportunities(data.phases);
    const dormant = rediscovery.dormant;
    if (dormant.length > 0) {
      const top = dormant[0]!;
      paragraphs.push(
        `There's something you left behind: ${top.name}. It was part of ${top.totalPhases} ${top.totalPhases === 1 ? 'chapter' : 'chapters'} of your life. It's still there. The conversation isn't over.`
      );
    }
  }

  // Life grid
  if (data.birthYear) {
    const birth = birthDateFromYear(data.birthYear);
    if (birth) {
      const grid = buildLifeGrid(birth, new Set());
      paragraphs.push(
        `You have ${grid.weeksRemaining.toLocaleString()} weeks ahead of you. That's the canvas. What you stamp into it is the story.`
      );
    }
  }

  paragraphs.push(
    `This is your life, ${name}. Not someone else's. Not the version you wish you were. This one. It's worth being proud of.`
  );

  return {
    id: 'closing',
    kind: 'closing',
    title: '',
    paragraphs,
    emoji: '🌅',
  };
}

// ─── Agency state detection ──────────────────────────────────────────────────

function detectAgencyState(data: LookBackData): NarrativeSection | null {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  // Habit logs in the last 7 days (completed)
  const recentHabitLogs = data.habitLogs.filter(
    (l) => l.completed && new Date(l.dayDate).getTime() >= sevenDaysAgo
  );
  // Habit logs in the last 30 days (completed)
  const monthHabitLogs = data.habitLogs.filter(
    (l) => l.completed && new Date(l.dayDate).getTime() >= thirtyDaysAgo
  );
  // Journal entries in the last 30 days
  const monthJournal = data.journalEntries.filter(
    (e) => new Date(e.dayDate).getTime() >= thirtyDaysAgo
  );
  // Active quests
  const activeQuests = data.activeQuests;
  // Abandoned quests (all-time — the data set is per-user)
  const abandonedCount = data.abandonedQuests.length;
  const completedCount = data.completedQuests.length;

  // Any activity at all in the last 30 days?
  const anyActivity =
    monthHabitLogs.length > 0 || monthJournal.length > 0 || activeQuests.length > 0;

  // ─── Numbness: no activity at all for 30+ days ───
  if (!anyActivity) {
    return {
      id: 'agency',
      kind: 'agency',
      title: 'Where you are right now',
      paragraphs: [
        "It's been quiet. That's okay. The grid is still there. The habits are still there. One check. That's all the system needs to restart.",
      ],
      emoji: '🌙',
    };
  }

  // ─── Avoidance: habit logs but abandoned more quests than completed ───
  if (monthHabitLogs.length > 0 && abandonedCount > completedCount && abandonedCount > 0) {
    return {
      id: 'agency',
      kind: 'agency',
      title: 'Where you are right now',
      paragraphs: [
        "You've been starting things and stopping. That's not failure — that's your brain protecting you from disappointment. But the pattern is: the trying hurts more than the not-trying. The fix isn't motivation. It's smaller targets.",
      ],
      emoji: '🪞',
    };
  }

  // ─── Passivity: no habit logs in 30 days + stale/no quests + no journal ───
  if (monthHabitLogs.length === 0 && monthJournal.length === 0 && activeQuests.length === 0) {
    return {
      id: 'agency',
      kind: 'agency',
      title: 'Where you are right now',
      paragraphs: [
        "You haven't shown up in a while. That's not laziness — that's your brain conserving itself because it learned that effort doesn't convert. The smallest thing that breaks it: one habit. Today.",
      ],
      emoji: '🌫️',
    };
  }

  // ─── Agency: habit logs in last 7 days + active quests + journal entries ───
  if (recentHabitLogs.length > 0 && activeQuests.length > 0 && monthJournal.length > 0) {
    return {
      id: 'agency',
      kind: 'agency',
      title: 'Where you are right now',
      paragraphs: [
        "Right now, you're showing up. That's not a feeling — it's a pattern. Your brain is learning that action creates consequence.",
      ],
      emoji: '🔥',
    };
  }

  // ─── Partial agency: some activity but not all signals ───
  // Show up when there's meaningful activity but not the full agency pattern.
  if (anyActivity) {
    return {
      id: 'agency',
      kind: 'agency',
      title: 'Where you are right now',
      paragraphs: [
        "Right now, you're showing up. That's not a feeling — it's a pattern. Your brain is learning that action creates consequence.",
      ],
      emoji: '🔥',
    };
  }

  return null;
}

// ─── Trajectory ──────────────────────────────────────────────────────────────

function computeTrajectory(data: LookBackData): {
  direction: 'up' | 'down' | 'flat' | 'unknown';
  narrative: string;
} {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const sixtyDaysAgo = now - 60 * 24 * 60 * 60 * 1000;

  // Count activity events in the last 30 days
  const recentHabitLogs = data.habitLogs.filter(
    (l) => l.completed && new Date(l.dayDate).getTime() >= thirtyDaysAgo
  ).length;
  const recentJournal = data.journalEntries.filter(
    (e) => new Date(e.dayDate).getTime() >= thirtyDaysAgo
  ).length;
  const recentActivity = recentHabitLogs + recentJournal;

  // Count activity events in the 30 days before that
  const priorHabitLogs = data.habitLogs.filter(
    (l) =>
      l.completed &&
      new Date(l.dayDate).getTime() >= sixtyDaysAgo &&
      new Date(l.dayDate).getTime() < thirtyDaysAgo
  ).length;
  const priorJournal = data.journalEntries.filter(
    (e) =>
      new Date(e.dayDate).getTime() >= sixtyDaysAgo && new Date(e.dayDate).getTime() < thirtyDaysAgo
  ).length;
  const priorActivity = priorHabitLogs + priorJournal;

  // No prior data to compare against
  if (priorActivity === 0 && recentActivity === 0) {
    return { direction: 'unknown', narrative: '' };
  }
  if (priorActivity === 0) {
    // Recent activity but no prior — can't meaningfully say "up", skip
    return { direction: 'unknown', narrative: '' };
  }

  // Determine direction with a 20% threshold to detect "flat"
  const ratio = recentActivity / priorActivity;
  if (ratio > 1.2) {
    return {
      direction: 'up',
      narrative:
        "You're showing up more than you used to. That's not motivation returning. That's your brain relearning that action creates consequence.",
    };
  } else if (ratio < 0.8) {
    return {
      direction: 'down',
      narrative:
        "You're showing up less than you used to. That's not decline — it's a dip. Dips happen. The line isn't broken, it's bending.",
    };
  } else {
    return {
      direction: 'flat',
      narrative: "You're consistent. That's its own kind of strength.",
    };
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function describeHobbies(hobbies: string[]): string {
  if (hobbies.length === 0) return 'nothing in particular';
  if (hobbies.length === 1) return hobbies[0]!;
  if (hobbies.length === 2) return `${hobbies[0]} and ${hobbies[1]}`;
  return `${hobbies.slice(0, -1).join(', ')}, and ${hobbies[hobbies.length - 1]}`;
}

function listHobbies(hobbies: string[]): string {
  if (hobbies.length === 0) return 'nothing';
  if (hobbies.length === 1) return hobbies[0]!;
  if (hobbies.length === 2) return `${hobbies[0]} and ${hobbies[1]}`;
  if (hobbies.length <= 5)
    return `${hobbies.slice(0, -1).join(', ')}, and ${hobbies[hobbies.length - 1]}`;
  return `${hobbies.slice(0, 3).join(', ')}, and ${hobbies.length - 3} more`;
}
