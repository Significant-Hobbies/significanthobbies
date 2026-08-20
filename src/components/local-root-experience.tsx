'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useLocalOnboardingComplete } from '~/components/local-onboarding-gate';
import { PublicLanding, PublicLandingShell } from '~/components/public-landing';

export function LocalRootExperience({ initialComplete = false }: { initialComplete?: boolean }) {
  const complete = useLocalOnboardingComplete(initialComplete);
  const router = useRouter();

  useEffect(() => {
    if (complete) router.replace('/live-more');
  }, [complete, router]);

  if (complete === null) return <PublicLandingShell />;
  if (complete) return <PublicLandingShell />;

  return <PublicLanding />;
}
