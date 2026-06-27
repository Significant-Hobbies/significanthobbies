'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'lumi-review-streak';
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

type ReviewState = {
  lastReviewAt: string | null; // ISO timestamp
  streak: number;
};

const EMPTY_STATE: ReviewState = {
  lastReviewAt: null,
  streak: 0,
};

function loadState(): ReviewState {
  if (typeof window === 'undefined') return EMPTY_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as ReviewState;
    return {
      lastReviewAt: parsed.lastReviewAt ?? null,
      streak: parsed.streak ?? 0,
    };
  } catch {
    return EMPTY_STATE;
  }
}

function saveState(state: ReviewState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable — streak just won't persist
  }
}

/**
 * Determines whether a weekly review is "due" based on the last review time.
 * A review is due if:
 * - No review has been done yet, OR
 * - It's been 7+ days since the last review
 */
export function isReviewDue(lastReviewAt: string | null): boolean {
  if (!lastReviewAt) return true;
  const elapsed = Date.now() - new Date(lastReviewAt).getTime();
  return elapsed >= WEEK_MS;
}

/**
 * Days since the last review (rounded). Returns null if no review yet.
 */
export function daysSinceReview(lastReviewAt: string | null): number | null {
  if (!lastReviewAt) return null;
  const elapsed = Date.now() - new Date(lastReviewAt).getTime();
  return Math.floor(elapsed / (24 * 60 * 60 * 1000));
}

/**
 * Tracks the user's weekly review streak in localStorage.
 * A streak counts consecutive weeks where the user completed at least one review.
 * If more than 2 weeks pass without a review, the streak resets.
 */
export function useReviewStreak() {
  const [state, setState] = useState<ReviewState>(EMPTY_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  const markReviewDone = useCallback(() => {
    setState((prev) => {
      const now = new Date();
      let newStreak = 1;

      if (prev.lastReviewAt) {
        const lastDate = new Date(prev.lastReviewAt);
        const elapsed = now.getTime() - lastDate.getTime();

        if (elapsed < WEEK_MS) {
          // Already reviewed this week — don't increment, just update timestamp
          newStreak = prev.streak;
        } else if (elapsed < 2 * WEEK_MS) {
          // Reviewed last week — streak continues
          newStreak = prev.streak + 1;
        } else {
          // Streak broken — reset to 1
          newStreak = 1;
        }
      }

      const next = { lastReviewAt: now.toISOString(), streak: newStreak };
      saveState(next);
      return next;
    });
  }, []);

  const due = isReviewDue(state.lastReviewAt);
  const daysSince = daysSinceReview(state.lastReviewAt);

  return {
    streak: state.streak,
    lastReviewAt: state.lastReviewAt,
    due,
    daysSince,
    hydrated,
    markReviewDone,
  };
}
