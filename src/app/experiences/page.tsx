import type { Metadata } from 'next';
import Link from 'next/link';

import { EXPERIENCE_CATEGORIES, EXPERIENCE_ENTRIES } from '~/lib/experiences';
import { DEFAULT_SOCIAL_IMAGE, SITE_URL } from '~/lib/site-metadata';
import { ExperiencesClient } from './experiences-client';

const description =
  'Every experience we know about, in one searchable list: places to go, milestones to reach, and ideas worth stealing. No account needed.';
export const metadata: Metadata = {
  title: { absolute: 'Experiences worth making room for' },
  description,
  alternates: { canonical: '/experiences' },
  openGraph: {
    title: 'Experiences worth making room for',
    description,
    url: `${SITE_URL}/experiences`,
    type: 'website',
    images: [{ url: DEFAULT_SOCIAL_IMAGE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Experiences worth making room for',
    description,
    images: [DEFAULT_SOCIAL_IMAGE],
  },
};

export default function ExperiencesPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
      <h1
        className="font-serif text-4xl font-medium tracking-tight text-foreground sm:text-5xl"
        style={{ textWrap: 'balance', lineHeight: 1.12 }}
      >
        Things you could do.
      </h1>
      <p className="mt-5 max-w-[62ch] text-lg text-foreground/80" style={{ lineHeight: 1.6 }}>
        {EXPERIENCE_ENTRIES.length} of them, in one place — places to go, milestones worth reaching,
        and ideas worth stealing. Each has a page of its own with a first step you could take this
        week.
      </p>

      <ExperiencesClient entries={EXPERIENCE_ENTRIES} categories={EXPERIENCE_CATEGORIES} />

      <p className="mt-12 text-base text-muted-foreground">
        Not sure where to start?{' '}
        <Link href="/life-in-weeks" className="text-foreground underline underline-offset-4">
          See how many weeks you have left
        </Link>{' '}
        first — it makes the choosing easier.
      </p>
    </div>
  );
}
