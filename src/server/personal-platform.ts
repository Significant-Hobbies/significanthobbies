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
    const response = await fetch(personalPlatformTodayURL(), {
      cache: 'no-store',
      signal: AbortSignal.timeout(4_000),
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${session.session.token}`,
      },
    });
    if (!response.ok) return unavailablePersonalDataInventory();
    return buildPersonalDataInventory(await response.json());
  } catch {
    return unavailablePersonalDataInventory();
  }
}

function personalPlatformTodayURL(): string {
  const baseURL = process.env.PERSONAL_PLATFORM_URL?.trim() || DEFAULT_PERSONAL_PLATFORM_URL;
  return new URL('/v1/life/today', baseURL).toString();
}
