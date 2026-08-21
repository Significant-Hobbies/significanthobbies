import { headers } from 'next/headers';

import { auth } from '~/lib/auth';
import {
  buildPersonalDataInventory,
  type PersonalDataInventory,
  unavailablePersonalDataInventory,
} from '~/lib/personal-data-inventory';

const DEFAULT_PERSONAL_PLATFORM_URL = 'https://personal-platform.sarthakagrawal927.workers.dev';

export async function getPersonalDataInventory(): Promise<PersonalDataInventory | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.session.token) return null;

  try {
    const request = {
      cache: 'no-store' as const,
      signal: AbortSignal.timeout(4_000),
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${session.session.token}`,
      },
    };
    const [todayResponse, activityResponse] = await Promise.all([
      fetch(personalPlatformURL('/v1/life/today'), request),
      fetch(personalPlatformURL('/v1/life/events?limit=8'), request),
    ]);
    if (!todayResponse.ok) return unavailablePersonalDataInventory();
    return buildPersonalDataInventory(
      await todayResponse.json(),
      activityResponse.ok ? await activityResponse.json() : undefined
    );
  } catch {
    return unavailablePersonalDataInventory();
  }
}

function personalPlatformURL(path: string): string {
  const baseURL = process.env.PERSONAL_PLATFORM_URL?.trim() || DEFAULT_PERSONAL_PLATFORM_URL;
  return new URL(path, baseURL).toString();
}
