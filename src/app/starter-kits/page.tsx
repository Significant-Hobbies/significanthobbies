import type { Metadata } from 'next';
import Link from 'next/link';

import { JsonLd } from '~/components/json-ld';
import { STARTER_KIT_CATEGORIES, STARTER_KITS } from '~/lib/starter-kits';

export const metadata: Metadata = {
  title: 'Local Hobby Starter Kits - SignificantHobbies',
  description:
    'Beginner-friendly hobby starter kits you can run with local materials, small budgets, and one clear first experiment.',
};

const CATEGORY_STYLES: Record<string, string> = {
  Creative: 'border-emerald-300 bg-emerald-50 text-emerald-800',
  Outdoor: 'border-teal-300 bg-teal-50 text-teal-800',
  Physical: 'border-blue-300 bg-blue-50 text-blue-800',
  Intellectual: 'border-purple-300 bg-purple-50 text-purple-800',
  Culinary: 'border-amber-300 bg-amber-50 text-amber-800',
};

function hobbySlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export default function StarterKitsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Local Hobby Starter Kits',
          description:
            'Beginner-friendly hobby starter kits you can run with local materials, small budgets, and one clear first experiment.',
          publisher: { '@type': 'Organization', name: 'SignificantHobbies' },
        }}
      />

      <div className="mb-6">
        <Link href="/tools" className="text-sm text-stone-500 hover:text-stone-700">
          Back to tools
        </Link>
      </div>

      <section className="mb-10 max-w-3xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Starter kits
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          Local starter kits for hobby experiments
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-stone-500">
          Each kit is designed for one small experiment using materials you can find nearby. Pick a
          kit, run the first experiment, then decide whether the hobby deserves a second session.
        </p>
      </section>

      <section className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {STARTER_KIT_CATEGORIES.map((category) => {
          const count = STARTER_KITS.filter((kit) => kit.category === category).length;
          return (
            <a
              key={category}
              href={`#${category.toLowerCase()}`}
              className={`rounded-xl border p-4 text-sm font-semibold transition-opacity hover:opacity-80 ${
                CATEGORY_STYLES[category] ?? 'border-stone-200 bg-white text-stone-700'
              }`}
            >
              <span>{category}</span>
              <span className="mt-1 block text-xs font-medium opacity-70">
                {count} {count === 1 ? 'kit' : 'kits'}
              </span>
            </a>
          );
        })}
      </section>

      <div className="space-y-10">
        {STARTER_KIT_CATEGORIES.map((category) => (
          <section key={category} id={category.toLowerCase()}>
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-xl font-bold text-stone-900">{category}</h2>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  CATEGORY_STYLES[category] ?? 'border-stone-200 bg-stone-50 text-stone-600'
                }`}
              >
                First-session experiments
              </span>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {STARTER_KITS.filter((kit) => kit.category === category).map((kit) => (
                <article
                  key={kit.slug}
                  className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition-colors hover:border-emerald-200"
                >
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-stone-900">{kit.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-stone-500">{kit.fit}</p>
                    </div>
                    <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-right">
                      <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
                        Budget
                      </p>
                      <p className="text-sm font-semibold text-stone-800">{kit.budget}</p>
                    </div>
                  </div>

                  <dl className="grid gap-3 border-y border-stone-100 py-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">
                        First win
                      </dt>
                      <dd className="mt-1 text-sm font-medium text-stone-700">
                        {kit.timeToFirstWin}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">
                        Local sources
                      </dt>
                      <dd className="mt-1 text-sm text-stone-600">{kit.localSources.join(', ')}</dd>
                    </div>
                  </dl>

                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-semibold text-stone-900">Minimal supplies</h4>
                      <ul className="mt-2 space-y-1 text-sm text-stone-500">
                        {kit.supplies.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-stone-900">First experiment</h4>
                      <p className="mt-2 text-sm leading-relaxed text-stone-500">
                        {kit.firstExperiment}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg border border-stone-100 bg-stone-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
                      Keep going if
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-stone-600">
                      {kit.successSignal}
                    </p>
                    <p className="mt-3 text-xs font-medium uppercase tracking-wide text-stone-400">
                      Next upgrade
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-stone-600">{kit.upgradePath}</p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {kit.relatedHobbies.map((hobby) => (
                      <Link
                        key={hobby}
                        href={`/hobbies/${hobbySlug(hobby)}`}
                        className="rounded-full border border-stone-200 px-3 py-1 text-xs font-medium text-stone-500 transition-colors hover:border-emerald-300 hover:text-emerald-700"
                      >
                        {hobby}
                      </Link>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-12 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <h2 className="text-xl font-bold text-stone-900">Want a more personal shortlist?</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
          Take the hobby quiz first, then use the starter kit closest to your recommended hobby as a
          low-risk experiment.
        </p>
        <Link
          href="/find-your-hobby"
          className="mt-4 inline-flex rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          Take the quiz
        </Link>
      </section>
    </div>
  );
}
