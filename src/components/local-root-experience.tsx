'use client';

import { LocalWorkspaceHome } from '~/components/local-workspace-home';
import { useLocalOnboardingComplete } from '~/components/local-onboarding-gate';
import { PublicLanding, PublicLandingShell } from '~/components/public-landing';

export function LocalRootExperience({ initialComplete = false }: { initialComplete?: boolean }) {
  const complete = useLocalOnboardingComplete(initialComplete);
  if (complete === null) return <PublicLandingShell />;
  if (complete) return <LocalWorkspaceHome title="Your dashboard" />;

  return <PublicLanding />;
}
