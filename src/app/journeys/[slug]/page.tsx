import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FAMOUS_JOURNEYS } from "~/lib/famous-journeys";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return FAMOUS_JOURNEYS.map((person) => ({ slug: person.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const person = FAMOUS_JOURNEYS.find((p) => p.slug === slug);
  if (!person) return {};

  const firstPhaseLabel = person.phases[0]?.label ?? "early life";
  const lastPhaseLabel = person.phases[person.phases.length - 1]?.label ?? "peak career";

  return {
    title: `${person.name}'s Hobbies — SignificantHobbies`,
    description: `Explore ${person.name}'s hobby journey — from ${firstPhaseLabel} to ${lastPhaseLabel}. See how their hobbies shaped who they became.`,
  };
}

// Phase color palette — cycling through visually distinct hues
const PHASE_COLORS = [
  { bg: "bg-emerald-50", border: "border-emerald-300", label: "text-emerald-700", pill: "bg-emerald-100 text-emerald-800" },
  { bg: "bg-blue-50", border: "border-blue-300", label: "text-blue-700", pill: "bg-blue-100 text-blue-800" },
  { bg: "bg-violet-50", border: "border-violet-300", label: "text-violet-700", pill: "bg-violet-100 text-violet-800" },
  { bg: "bg-amber-50", border: "border-amber-300", label: "text-amber-700", pill: "bg-amber-100 text-amber-800" },
  { bg: "bg-rose-50", border: "border-rose-300", label: "text-rose-700", pill: "bg-rose-100 text-rose-800" },
  { bg: "bg-teal-50", border: "border-teal-300", label: "text-teal-700", pill: "bg-teal-100 text-teal-800" },
];

export default async function JourneyDetailPage({ params }: Props) {
  const { slug } = await params;
  const person = FAMOUS_JOURNEYS.find((p) => p.slug === slug);
  if (!person) notFound();

  const firstPhaseLabel = person.phases[0]?.label ?? "early life";
  const lastPhaseLabel = person.phases[person.phases.length - 1]?.label ?? "peak career";

  // JSON-LD Article schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${person.name}'s Hobby Journey`,
    description: `Explore ${person.name}'s hobby journey — from ${firstPhaseLabel} to ${lastPhaseLabel}. See how their hobbies shaped who they became.`,
    url: `https://significanthobbies.com/journeys/${person.slug}`,
    author: {
      "@type": "Organization",
      name: "SignificantHobbies",
    },
    publisher: {
      "@type": "Organization",
      name: "SignificantHobbies",
      url: "https://significanthobbies.com",
    },
    about: {
      "@type": "Person",
      name: person.name,
      description: person.knownFor,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-3xl px-4 py-12">
        {/* Back link */}
        <div className="mb-8">
          <Link
            href="/journeys"
            className="text-sm text-stone-400 transition-colors hover:text-stone-600"
          >
            ← Famous Hobby Journeys
          </Link>
        </div>

        {/* Hero */}
        <div className="scroll-reveal mb-10">
          <div className="flex items-start gap-4">
            <span className="text-5xl">{person.emoji}</span>
            <div>
              <h1 className="text-3xl font-bold text-stone-900">
                {person.name}'s Hobby Journey
              </h1>
              <p className="mt-1 text-stone-400 text-sm">{person.born}</p>
              <span className="mt-3 inline-block rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {person.knownFor}
              </span>
            </div>
          </div>
        </div>

        {/* Phase timeline */}
        <div className="scroll-reveal mb-10">
          <h2 className="mb-5 text-xs font-semibold uppercase tracking-wider text-stone-400">
            Hobby Timeline
          </h2>
          <div className="space-y-4">
            {person.phases.map((phase, idx) => {
              const colors = PHASE_COLORS[idx % PHASE_COLORS.length]!;
              return (
                <div
                  key={phase.label}
                  className={`rounded-xl border ${colors.border} ${colors.bg} p-5`}
                >
                  <h3 className={`mb-3 text-sm font-bold uppercase tracking-wide ${colors.label}`}>
                    {phase.label}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {phase.hobbies.map((hobby) => (
                      <span
                        key={hobby}
                        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${colors.pill}`}
                      >
                        {hobby}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Surprising hobbies */}
        <div className="scroll-reveal mb-10">
          <h2 className="mb-4 text-lg font-bold text-stone-900">Surprising hobbies</h2>
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-5">
            <ul className="space-y-3">
              {person.surprisingHobbies.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex-shrink-0 text-emerald-500">✦</span>
                  <span className="text-sm text-stone-600">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* How hobbies shaped their career */}
        <div className="scroll-reveal mb-10">
          <h2 className="mb-4 text-lg font-bold text-stone-900">How hobbies shaped their career</h2>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-sm leading-relaxed text-stone-700">{person.hobbyInfluence}</p>
          </div>
        </div>

        {/* Quote */}
        {person.quote && (
          <div className="scroll-reveal mb-10">
            <blockquote className="border-l-4 border-emerald-400 pl-5">
              <p className="text-base italic leading-relaxed text-stone-600">
                "{person.quote.text}"
              </p>
              {person.quote.attribution && (
                <footer className="mt-2 text-sm text-stone-400">
                  — {person.quote.attribution}
                </footer>
              )}
              {!person.quote.attribution && (
                <footer className="mt-2 text-sm text-stone-400">— {person.name}</footer>
              )}
            </blockquote>
          </div>
        )}

        {/* CTA */}
        <div className="scroll-reveal rounded-xl border border-stone-200 bg-emerald-50 p-6 text-center">
          <h2 className="mb-2 text-base font-bold text-stone-900">Map your own hobby journey</h2>
          <p className="mb-4 text-sm text-stone-600">
            What hobbies have shaped your life? Create your own timeline.
          </p>
          <Link
            href="/timeline/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md"
          >
            Start your timeline →
          </Link>
          <div className="mt-4">
            <Link
              href="/journeys"
              className="text-sm text-stone-400 transition-colors hover:text-stone-600"
            >
              ← See all famous journeys
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
