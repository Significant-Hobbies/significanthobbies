import Link from 'next/link';

import {
  BorderBeam,
  FadeIn,
  GridBackground,
  SpotlightCard,
  TextGenerateEffect,
} from '~/components/aceternity';
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
      {/* Header with grid background + fade-in */}
      <div className="relative mb-8">
        <GridBackground />
        <FadeIn className="relative">
          <Link
            href="/"
            className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </Link>
          <TextGenerateEffect
            words="Build your hobby timeline"
            className="text-2xl font-bold text-foreground"
          />
          <p className="mt-1 text-muted-foreground">
            Add life phases and the hobbies that defined each one.
          </p>
        </FadeIn>
      </div>
      {/* Builder panel with spotlight glow + animated border beam */}
      <FadeIn delay={0.1}>
        <SpotlightCard className="shadow-soft" innerClassName="p-1">
          <div className="relative overflow-hidden rounded-xl">
            <BorderBeam />
            <TimelineBuilder />
          </div>
        </SpotlightCard>
      </FadeIn>
    </div>
  );
}
