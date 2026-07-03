import type { Metadata } from 'next';
import Link from 'next/link';

import {
  CardHoverEffect,
  FadeIn,
  GridBackground,
  SpotlightCard,
  StaggerContainer,
  StaggerItem,
  TextGenerateEffect,
} from '~/components/aceternity';
import { FAMOUS_JOURNEYS } from '~/lib/famous-journeys';

export const metadata: Metadata = {
  title: 'Famous Hobby Journeys — SignificantHobbies',
  description:
    "Explore how famous people's hobbies shaped who they became. From Steve Jobs' calligraphy to Einstein's violin — discover the hobby timelines of remarkable people.",
};

export default function JourneysPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Header */}
      <div className="relative mb-10 overflow-hidden rounded-3xl border border-border/60">
        <GridBackground variant="dots" size={22} />
        <FadeIn className="relative px-6 pt-14 pb-10 text-center sm:px-10">
          <TextGenerateEffect
            words="Famous Hobby Journeys"
            className="text-3xl font-bold text-foreground sm:text-4xl"
          />
          <p className="mt-3 text-muted-foreground">
            How the world&apos;s most interesting people spent their free time
          </p>
          <p className="mt-3 text-sm text-muted-foreground/60">
            <span className="font-medium text-muted-foreground">{FAMOUS_JOURNEYS.length}</span>{' '}
            remarkable people
          </p>
        </FadeIn>
      </div>

      {/* Person cards grid */}
      <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {FAMOUS_JOURNEYS.map((person) => {
          const totalHobbies = person.phases.reduce((sum, phase) => sum + phase.hobbies.length, 0);
          return (
            <StaggerItem key={person.slug} className="h-full">
              <Link
                href={`/journeys/${person.slug}`}
                className="group block h-full"
                prefetch={false}
              >
                <CardHoverEffect className="relative flex h-full flex-col overflow-hidden rounded-xl p-5 shadow-soft transition-transform duration-200 hover:-translate-y-0.5">
                  {/* Hover accent bar */}
                  <div className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-foreground/60 to-foreground/20 transition-transform duration-300 group-hover:scale-x-100 rounded-t-xl" />

                  {/* Emoji + name */}
                  <div className="mb-3 flex items-center gap-3">
                    <span className="text-3xl transition-transform duration-200 group-hover:scale-110">
                      {person.emoji}
                    </span>
                    <div>
                      <h2 className="font-bold text-foreground transition-colors group-hover:text-foreground leading-tight">
                        {person.name}
                      </h2>
                      <p className="text-xs text-muted-foreground/60">{person.born}</p>
                    </div>
                  </div>

                  {/* Known for */}
                  <p className="mb-4 flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                    {person.knownFor}
                  </p>

                  {/* Stats row */}
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="text-xs text-muted-foreground/60">
                      <span className="font-semibold text-muted-foreground">{totalHobbies}</span>{' '}
                      hobbies across{' '}
                      <span className="font-semibold text-muted-foreground">
                        {person.phases.length}
                      </span>{' '}
                      phases
                    </span>
                    <span className="text-xs font-semibold text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                      Explore →
                    </span>
                  </div>
                </CardHoverEffect>
              </Link>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      {/* CTA section */}
      <FadeIn className="mt-16">
        <SpotlightCard
          className="border-foreground/20 bg-foreground/10 shadow-soft"
          innerClassName="p-8 text-center"
        >
          <h2 className="mb-2 text-lg font-bold text-foreground">What&apos;s your hobby story?</h2>
          <p className="mb-5 text-sm text-muted-foreground">
            Map your own journey — from childhood pastimes to current obsessions.
          </p>
          <Link
            href="/timeline/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-md"
          >
            Start your timeline →
          </Link>
        </SpotlightCard>
      </FadeIn>
    </div>
  );
}
