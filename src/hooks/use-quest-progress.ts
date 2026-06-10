"use client";

import { useCallback,useEffect, useState } from "react";

import { SIDE_QUESTS } from "~/lib/side-quests";

const STORAGE_KEY = "sh-side-quests";

type QuestProgress = {
  completed: string[];
  earnedBadges: string[];
  startedAt: string;
};

function readStorage(): QuestProgress {
  if (typeof window === "undefined") return { completed: [], earnedBadges: [], startedAt: "" };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completed: [], earnedBadges: [], startedAt: "" };
    return JSON.parse(raw) as QuestProgress;
  } catch {
    return { completed: [], earnedBadges: [], startedAt: "" };
  }
}

function writeStorage(progress: QuestProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function evaluateQuestBadges(completedQuestIds: string[]): string[] {
  const earned: string[] = [];
  const count = completedQuestIds.length;

  const completedQuests = SIDE_QUESTS.filter((q) => completedQuestIds.includes(q.id));
  const categoryCounts: Record<string, number> = {};
  for (const q of completedQuests) {
    categoryCounts[q.category] = (categoryCounts[q.category] ?? 0) + 1;
  }
  const categoriesWithCompletions = Object.keys(categoryCounts);

  // Quest progression badges
  if (count >= 1) earned.push("first-steps");
  if (count >= 5) earned.push("curious-cat");
  if (count >= 10) earned.push("adventurer");
  if (count >= 50) earned.push("quest-master");
  if (categoriesWithCompletions.length >= 6) earned.push("renaissance-soul");

  // Category mastery badges (3+ in a category)
  if ((categoryCounts.sensory ?? 0) >= 3) earned.push("sensor");
  if ((categoryCounts.creative ?? 0) >= 3) earned.push("maker");
  if ((categoryCounts.culinary ?? 0) >= 3) earned.push("chefs-kiss");
  if ((categoryCounts.social ?? 0) >= 3) earned.push("people-person");
  if ((categoryCounts.exploration ?? 0) >= 3) earned.push("wanderer");
  if ((categoryCounts.mindful ?? 0) >= 3) earned.push("zen-master");

  // Specific quest badges
  if (completedQuestIds.includes("sq-03")) earned.push("night-owl");   // stargazing
  if (completedQuestIds.includes("sq-44")) earned.push("unplugged");   // social media detox

  return earned;
}

export function useQuestProgress() {
  const [progress, setProgress] = useState<QuestProgress>({ completed: [], earnedBadges: [], startedAt: "" });
  const [newBadges, setNewBadges] = useState<string[]>([]);

  useEffect(() => {
    setProgress(readStorage());
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
      return next;
    });
  }, []);

  const uncompleteQuest = useCallback((questId: string) => {
    setProgress((prev) => {
      const completed = prev.completed.filter((id) => id !== questId);
      const allEarned = evaluateQuestBadges(completed);
      const next: QuestProgress = { ...prev, completed, earnedBadges: allEarned };
      writeStorage(next);
      return next;
    });
  }, []);

  const dismissNewBadges = useCallback(() => {
    setNewBadges([]);
  }, []);

  const isCompleted = useCallback(
    (questId: string) => progress.completed.includes(questId),
    [progress.completed],
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
