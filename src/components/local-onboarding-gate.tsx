'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { browserRecordAdapter, readLocalRecord } from '~/lib/local-record-store';
import { syncLocalWorkspaceCookie } from '~/lib/local-workspace-cookie';

export function useLocalOnboardingComplete(initialComplete: boolean | null = null): boolean | null {
  const [complete, setComplete] = useState<boolean | null>(initialComplete);
  useEffect(() => {
    readLocalRecord(
      browserRecordAdapter(),
      'onboarding:profile',
      'onboarding',
      (value): value is Record<string, unknown> => Boolean(value && typeof value === 'object')
    )
      .then((profile) => {
        const nextComplete = Boolean(profile);
        syncLocalWorkspaceCookie(nextComplete);
        setComplete(nextComplete);
      })
      .catch(() => {
        syncLocalWorkspaceCookie(false);
        setComplete(false);
      });
  }, []);
  return complete;
}

export function LocalOnboardingGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const complete = useLocalOnboardingComplete();

  useEffect(() => {
    if (complete === false) router.replace('/onboarding');
  }, [complete, router]);

  if (!complete) {
    return (
      <main className="grid min-h-[60vh] place-items-center bg-[#fbf8ef] px-4">
        <p className="text-sm text-muted-foreground">
          {complete === null ? 'Opening your workspace…' : 'Starting with you…'}
        </p>
      </main>
    );
  }
  return children;
}
