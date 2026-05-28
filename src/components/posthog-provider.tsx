'use client';

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect, useRef } from 'react';

import { trackReturned, trackSignup } from '~/lib/analytics';
import { authClient } from '~/lib/auth-client';
import { installBrowserMonitoring } from '~/lib/foundry-monitoring';

// localStorage key recording every userId this browser has seen signed in.
// A user already in this list has prior activity, so a fresh session counts
// as a `returned` visit; a user we have never seen is a fresh `signup`.
const SEEN_USERS_KEY = 'sh:seen-users';
// Per-tab guard so `returned` fires at most once per session start.
const RETURNED_FIRED_KEY = 'sh:returned-fired';

function readSeenUsers(): string[] {
  try {
    const raw = localStorage.getItem(SEEN_USERS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id ?? null;
  const firedRef = useRef(false);

  useEffect(() => {
    return installBrowserMonitoring();
  }, []);

  // Fixed taxonomy: `signup` on the first session we ever see for an account;
  // `returned` on later sessions for a user with prior activity.
  useEffect(() => {
    if (!userId || firedRef.current || typeof window === 'undefined') return;
    const seen = readSeenUsers();

    if (!seen.includes(userId)) {
      // First-ever session for this account.
      firedRef.current = true;
      trackSignup();
      try {
        localStorage.setItem(SEEN_USERS_KEY, JSON.stringify([...seen, userId]));
      } catch {
        // Non-fatal — worst case the event de-dupes on the next visit.
      }
      return;
    }

    // Returning user — fire `returned` at most once per session.
    try {
      if (sessionStorage.getItem(RETURNED_FIRED_KEY) === userId) return;
      sessionStorage.setItem(RETURNED_FIRED_KEY, userId);
    } catch {
      // sessionStorage unavailable — fall back to the in-memory ref guard.
    }
    firedRef.current = true;
    trackReturned();
  }, [userId]);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
