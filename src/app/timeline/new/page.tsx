import Link from 'next/link';

import { GridBackground, SpotlightCard } from '~/components/aceternity';
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
      {/* Header with grid background */}
      <div className="relative mb-8">
        <GridBackground />
        <div className="relative">
          <Link
            href="/"
            className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Build your hobby timeline</h1>
          <p className="mt-1 text-muted-foreground">
            Add life phases and the hobbies that defined each one.
          </p>
        </div>
      </div>
      {/* Builder panel with spotlight glow */}
      <SpotlightCard className="shadow-soft" innerClassName="p-1">
        <div className="relative overflow-hidden rounded-xl">
          <TimelineBuilder />
        </div>
      </SpotlightCard>
    </div>
  );
}
