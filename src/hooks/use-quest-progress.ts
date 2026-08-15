'use client';

import { useCallback, useEffect, useState } from 'react';

import { getQuestProgress, syncQuestProgress } from '~/lib/actions/user';
import { SIDE_QUESTS } from '~/lib/side-quests';

const STORAGE_KEY = 'sh-side-quests';

type QuestProgress = {
  completed: string[];
  earnedBadges: string[];
  startedAt: string;
};

function readStorage(): QuestProgress {
  if (typeof window === 'undefined') return { completed: [], earnedBadges: [], startedAt: '' };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completed: [], earnedBadges: [], startedAt: '' };
    return JSON.parse(raw) as QuestProgress;
  } catch {
    return { completed: [], earnedBadges: [], startedAt: '' };
  }
}

function writeStorage(progress: QuestProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

/**
 * Mirror local progress to the database. No-ops when signed out.
 *
 * localStorage stays the source of truth for the signed-out board; this makes
 * the signed-in copy durable so clearing site data does not wipe it.
 */
function persist(progress: QuestProgress) {
  void syncQuestProgress(progress.completed, progress.earnedBadges).catch(() => {
    // Offline or signed out — localStorage still holds the progress.
  });
}

const COUNT_BADGES: ReadonlyArray<{ threshold: number; badge: string }> = [
  { threshold: 1, badge: 'first-steps' },
  { threshold: 5, badge: 'curious-cat' },
  { threshold: 10, badge: 'adventurer' },
  { threshold: 50, badge: 'quest-master' },
];

const CATEGORY_MASTERY_BADGES: ReadonlyArray<{ category: string; badge: string }> = [
  { category: 'sensory', badge: 'sensor' },
  { category: 'creative', badge: 'maker' },
  { category: 'culinary', badge: 'chefs-kiss' },
  { category: 'social', badge: 'people-person' },
  { category: 'exploration', badge: 'wanderer' },
  { category: 'mindful', badge: 'zen-master' },
];

const SPECIFIC_QUEST_BADGES: ReadonlyArray<{ questId: string; badge: string }> = [
  { questId: 'sq-03', badge: 'night-owl' }, // stargazing
  { questId: 'sq-44', badge: 'unplugged' }, // social media detox
];

const CATEGORY_MASTERY_THRESHOLD = 3;
const RENAISSANCE_CATEGORY_COUNT = 6;

function evaluateQuestBadges(completedQuestIds: string[]): string[] {
  const earned: string[] = [];
  const completedSet = new Set(completedQuestIds);

  const categoryCounts: Record<string, number> = {};
  for (const q of SIDE_QUESTS) {
    if (completedSet.has(q.id)) {
      categoryCounts[q.category] = (categoryCounts[q.category] ?? 0) + 1;
    }
  }

  // Quest progression badges
  for (const { threshold, badge } of COUNT_BADGES) {
    if (completedQuestIds.length >= threshold) earned.push(badge);
  }
  if (Object.keys(categoryCounts).length >= RENAISSANCE_CATEGORY_COUNT) {
    earned.push('renaissance-soul');
  }

  // Category mastery badges (3+ in a category)
  for (const { category, badge } of CATEGORY_MASTERY_BADGES) {
    if ((categoryCounts[category] ?? 0) >= CATEGORY_MASTERY_THRESHOLD) earned.push(badge);
  }

  // Specific quest badges
  for (const { questId, badge } of SPECIFIC_QUEST_BADGES) {
    if (completedSet.has(questId)) earned.push(badge);
  }

  return earned;
}

export function useQuestProgress() {
  const [progress, setProgress] = useState<QuestProgress>({
    completed: [],
    earnedBadges: [],
    startedAt: '',
  });
  const [newBadges, setNewBadges] = useState<string[]>([]);

  // Hydrate from localStorage first (instant, works signed out), then reconcile
  // with the server copy. Completions are unioned so a cleared cache recovers
  // from the database and a signed-out session's progress is not lost on login.
  useEffect(() => {
    const local = readStorage();
    setProgress(local);

    let cancelled = false;
    void getQuestProgress()
      .then((remote) => {
        if (cancelled) return;
        const merged = Array.from(new Set([...local.completed, ...remote.completedQuests]));
        if (
          merged.length === local.completed.length &&
          merged.length === remote.completedQuests.length
        ) {
          return;
        }
        const next: QuestProgress = {
          completed: merged,
          earnedBadges: evaluateQuestBadges(merged),
          startedAt: local.startedAt || new Date().toISOString(),
        };
        writeStorage(next);
        setProgress(next);
        persist(next);
      })
      .catch(() => {
        // Signed out or offline — local progress stands.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const completeQuest = useCallback((questId: string) => {
    setProgress((prev) => {
      if (prev.completed.includes(questId)) return prev;

      const completed = [...prev.completed, questId];
      const allEarned = evaluateQuestBadges(completed);
      const justEarned = allEarned.filter((b) => !prev.earnedBadges.includes(b));

      if (justEarned.length > 0) {
        setNewBadges(justEarned);
      }

      const next: QuestProgress = {
        completed,
        earnedBadges: allEarned,
        startedAt: prev.startedAt || new Date().toISOString(),
      };
      writeStorage(next);
      persist(next);
      return next;
    });
  }, []);

  const uncompleteQuest = useCallback((questId: string) => {
    setProgress((prev) => {
      const completed = prev.completed.filter((id) => id !== questId);
      const allEarned = evaluateQuestBadges(completed);
      const next: QuestProgress = { ...prev, completed, earnedBadges: allEarned };
      writeStorage(next);
      persist(next);
      return next;
    });
  }, []);

  const dismissNewBadges = useCallback(() => {
    setNewBadges([]);
  }, []);

  const isCompleted = useCallback(
    (questId: string) => progress.completed.includes(questId),
    [progress.completed]
  );

  return {
    completed: progress.completed,
    earnedBadges: progress.earnedBadges,
    newBadges,
    completeQuest,
    uncompleteQuest,
    isCompleted,
    dismissNewBadges,
    completedCount: progress.completed.length,
  };
}
