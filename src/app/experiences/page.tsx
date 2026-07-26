import type { Metadata } from 'next';
import Link from 'next/link';

import { EXPERIENCE_CATEGORIES, EXPERIENCE_ENTRIES, PAGED_EXPERIENCES } from '~/lib/experiences';
import { ExperiencesClient } from './experiences-client';

export const metadata: Metadata = {
  title: 'Things You Could Do — SignificantHobbies',
  description:
    'Every experience we know about, in one searchable list: places to go, milestones to reach, and ideas worth stealing. No account needed.',
  alternates: { canonical: '/experiences' },
  openGraph: {
    title: 'Things You Could Do',
    description:
      'Every experience we know about, in one searchable list — places, milestones and ideas.',
    url: '/experiences',
    type: 'website',
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
        and ideas worth stealing. {PAGED_EXPERIENCES.length} have a page of their own with a first
        step you could take this week.
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
