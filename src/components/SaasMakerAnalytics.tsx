'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { saasmaker } from '~/lib/saasmaker';

const TRACKED_HOSTS = new Set(['significanthobbies.com', 'www.significanthobbies.com']);
const INTERNAL_PATH_PREFIXES = ['/dashboard', '/settings', '/setup', '/timeline'];
const PAGE_VIEW_TTL_MS = 30 * 60 * 1000;

function shouldTrackPageView(pathname: string) {
  if (typeof window === 'undefined') return false;
  if (!TRACKED_HOSTS.has(window.location.hostname)) return false;
  if (INTERNAL_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return false;
  }

  const storageKey = `saasmaker:page-view:${pathname}`;
  const lastTrackedAt = Number(window.sessionStorage.getItem(storageKey) ?? 0);
  const now = Date.now();
  if (now - lastTrackedAt < PAGE_VIEW_TTL_MS) return false;

  window.sessionStorage.setItem(storageKey, String(now));
  return true;
}

export function SaasMakerAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!shouldTrackPageView(pathname)) return;
    saasmaker?.analytics.track({ name: 'page_view', url: pathname }).catch(() => {});
  }, [pathname]);

  return null;
}
