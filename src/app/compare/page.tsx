import type { Metadata } from 'next';

import { FadeIn, GridBackground } from '~/components/aceternity';

import { CompareClient } from './compare-client';

export const metadata: Metadata = {
  title: 'Compare Hobbies Side by Side — SignificantHobbies',
  description:
    "Can't decide between two hobbies? Compare them on cost, time commitment, social level, difficulty, and more. Make an informed choice about your next hobby.",
};

export default function ComparePage() {
  return (
    <div className="relative mx-auto max-w-5xl px-4 py-12">
      <GridBackground variant="dots" size={22} />
      <FadeIn className="relative mb-10">
        <h1 className="font-serif text-3xl font-semibold text-foreground">Compare hobbies</h1>
        <p className="mt-2 text-muted-foreground">
          Pick two hobbies and see how they stack up on cost, time, difficulty, and more.
        </p>
      </FadeIn>
      <div className="relative">
        <CompareClient />
      </div>
    </div>
  );
}
