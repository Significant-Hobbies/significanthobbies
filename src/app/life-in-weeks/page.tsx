import type { Metadata } from 'next';

import { LifeInWeeksClient } from './life-in-weeks-client';
import { eq } from 'drizzle-orm';
import { users } from '~/db/schema';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';
import { BRAND_NAME, DEFAULT_SOCIAL_IMAGE } from '~/lib/site-metadata';

export const metadata: Metadata = {
  title: `Your Life in Weeks — ${BRAND_NAME}`,
  description:
    'See your whole life as one grid of weeks, using your exact birth date when available. Then decide what the remaining ones are for.',
  alternates: { canonical: '/life-in-weeks' },
  openGraph: {
    title: 'Your Life in Weeks',
    description:
      'One square for every week of an average life. It takes one number to draw, and nobody needs to know you were here.',
    url: '/life-in-weeks',
    type: 'website',
    images: [{ url: DEFAULT_SOCIAL_IMAGE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Your Life in Weeks',
    description:
      'One square for every week of an average life. It takes one number to draw, and nobody needs to know you were here.',
    images: [DEFAULT_SOCIAL_IMAGE],
  },
};

export default async function LifeInWeeksPage() {
  const session = await getServerAuthSession();
  const profile = session?.user?.id
    ? await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
        columns: { birthDate: true, onboardingCompletedAt: true },
      })
    : null;
  return (
    <LifeInWeeksClient
      storageMode={session?.user ? 'account' : 'local'}
      initialBirthDate={profile?.birthDate ?? null}
      initialOnboardingComplete={Boolean(profile?.onboardingCompletedAt)}
    />
  );
}
