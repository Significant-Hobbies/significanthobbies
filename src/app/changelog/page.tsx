import type { Metadata } from 'next';
import Link from 'next/link';

const repository = 'https://github.com/Significant-Hobbies/significanthobbies';

const releases = [
  {
    date: '2026-07-26',
    title: 'Your life in weeks became a public starting point',
    outcomes: [
      'Anyone can enter a birth year and see a private life grid without creating an account.',
      'Weeks remaining now use age-conditional life expectancy everywhere instead of a fixed 4,000-week frame.',
    ],
  },
  {
    date: '2026-07-26',
    title: 'More possibilities became searchable',
    outcomes: [
      'The public experience library expanded to 322 ideas, each with its own readable page.',
      'Hobby discovery gained twelve practical facets, making combinations such as gentle, cheap, and screen-free answerable.',
    ],
  },
  {
    date: '2026-07-25',
    title: 'Guest journeys became more useful and private',
    outcomes: [
      'Daily and trajectory pages now offer a read-only sample instead of stopping at a sign-in wall.',
      'Sign-in returns people to the page they intended to use, while two privacy leaks and misleading progress surfaces were removed.',
    ],
  },
] as const;

export const metadata: Metadata = {
  title: 'Changelog',
  description:
    'Meaningful improvements to SignificantHobbies, from daily reflection to hobby discovery and life planning.',
  alternates: {
    canonical: '/changelog',
  },
};

export default function ChangelogPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-14 sm:py-20">
      <header className="max-w-2xl">
        <Link
          href="/"
          prefetch={false}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← SignificantHobbies
        </Link>
        <p className="mt-10 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Product history
        </p>
        <h1 className="mt-3 text-4xl text-foreground sm:text-5xl">Changelog</h1>
        <p className="mt-5 max-w-[62ch] text-base leading-7 text-muted-foreground sm:text-lg">
          Meaningful improvements to daily reflection, hobby discovery, and planning a finite life.
        </p>
        <nav className="mt-7 flex flex-wrap gap-5 text-sm" aria-label="Project links">
          <a
            href={`${repository}/issues`}
            className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Roadmap
          </a>
          <a
            href={repository}
            className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Source
          </a>
        </nav>
      </header>

      <ol className="mt-12 space-y-5">
        {releases.map((release) => (
          <li key={`${release.date}-${release.title}`}>
            <article className="rounded-2xl border border-border bg-card/60 p-6 shadow-soft sm:p-8">
              <time
                dateTime={release.date}
                className="text-xs font-medium uppercase tracking-[0.12em] text-subtle"
              >
                {new Date(`${release.date}T00:00:00`).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              <h2 className="mt-3 text-2xl text-foreground">{release.title}</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-muted-foreground sm:text-base">
                {release.outcomes.map((outcome) => (
                  <li key={outcome}>{outcome}</li>
                ))}
              </ul>
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}
