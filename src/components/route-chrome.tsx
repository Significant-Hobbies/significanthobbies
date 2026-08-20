'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * Focused flows own their own minimal navigation and footer. Feedback remains
 * globally reachable because a broken focused flow is exactly where someone
 * may need to report a problem.
 */
export function RouteChrome({
  children,
  navigation,
  footer,
  feedback,
}: {
  children: ReactNode;
  navigation: ReactNode;
  footer: ReactNode;
  feedback: ReactNode;
}) {
  const pathname = usePathname();
  const isOnboarding = pathname === '/onboarding';
  const isQuestionnaire = pathname === '/find-your-hobby';
  const isWorkspace =
    pathname === '/' ||
    [
      '/live-more',
      '/daily',
      '/journal',
      '/habits',
      '/history',
      '/trajectory',
      '/bucket-list',
      '/commitments',
      '/settings',
      '/timeline',
      '/side-quests',
    ].some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const hidesPeripheralChrome = isOnboarding || isQuestionnaire;

  return (
    <>
      {!isOnboarding && navigation}
      <main id="main">{children}</main>
      {!hidesPeripheralChrome && !isWorkspace && footer}
      {feedback}
    </>
  );
}
