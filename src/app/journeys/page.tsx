import type { Metadata } from 'next';
import Link from 'next/link';

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
      <div className="scroll-reveal mb-10">
        <h1 className="text-3xl font-bold text-foreground">Famous Hobby Journeys</h1>
        <p className="mt-2 text-muted-foreground">
          How the world&apos;s most interesting people spent their free time
        </p>
        <p className="mt-3 text-sm text-muted-foreground/60">
          <span className="font-medium text-muted-foreground">{FAMOUS_JOURNEYS.length}</span>{' '}
          remarkable people
        </p>
      </div>

      {/* Person cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {FAMOUS_JOURNEYS.map((person) => {
          const totalHobbies = person.phases.reduce((sum, phase) => sum + phase.hobbies.length, 0);
          return (
            <Link key={person.slug} href={`/journeys/${person.slug}`} className="group block">
              <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-md">
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
              </div>
            </Link>
          );
        })}
      </div>

      {/* CTA section */}
      <div className="mt-16 rounded-xl border border-border bg-foreground/10 p-8 text-center">
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
      </div>
    </div>
  );
}
