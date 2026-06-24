import type { Metadata } from 'next';

import { CompareClient } from './compare-client';

export const metadata: Metadata = {
  title: 'Compare Hobbies Side by Side — SignificantHobbies',
  description:
    "Can't decide between two hobbies? Compare them on cost, time commitment, social level, difficulty, and more. Make an informed choice about your next hobby.",
};

export default function ComparePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-stone-900">Compare hobbies</h1>
        <p className="mt-2 text-stone-500">
          Pick two hobbies and see how they stack up on cost, time, difficulty, and more.
        </p>
      </div>
      <CompareClient />
    </div>
  );
}
