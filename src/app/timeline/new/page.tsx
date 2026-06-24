import Link from 'next/link';

import { JsonLd } from '~/components/json-ld';
import { TimelineBuilder } from '~/components/timeline-builder/builder';

export const metadata = { title: 'New Timeline — SignificantHobbies' };

export default function NewTimelinePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'SignificantHobbies Timeline Builder',
          description:
            'Build a visual timeline of your hobbies across life phases. Discover your hobby personality and share your journey.',
          url: 'https://significanthobbies.com/timeline/new',
          applicationCategory: 'LifestyleApplication',
          offers: { '@type': 'Offer', price: '0' },
        }}
      />
      <div className="mb-8">
        <Link
          href="/"
          className="mb-4 inline-flex items-center text-sm text-stone-500 hover:text-stone-700 transition-colors"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-stone-900">Build your hobby timeline</h1>
        <p className="mt-1 text-stone-500">
          Add life phases and the hobbies that defined each one.
        </p>
      </div>
      <TimelineBuilder />
    </div>
  );
}
