'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import {
  ALL_HOBBY_FACETS,
  facetsForHobby,
  HOBBY_FACET_LABELS,
  hobbiesWithFacets,
  type HobbyFacet,
} from '~/lib/hobbies';

/**
 * Browse by fit rather than by department.
 *
 * The ten categories answer "what kind of thing is this". They cannot answer
 * "what could I actually do" — someone who wants something gentle, cheap and
 * doable alone had no way to ask, and the only route into the catalogue was
 * picking a category and reading all of it.
 *
 * Filters are conjunctive: every selected facet must hold. That makes an empty
 * result a real possibility, so the empty state names the filter to drop.
 */
export function HobbyFacetsClient() {
  const [selected, setSelected] = useState<HobbyFacet[]>([]);

  const matches = useMemo(() => hobbiesWithFacets(selected), [selected]);

  function toggle(facet: HobbyFacet) {
    setSelected((prev) =>
      prev.includes(facet) ? prev.filter((f) => f !== facet) : [...prev, facet]
    );
  }

  return (
    <section className="mb-16">
      <div className="mb-5 flex items-end justify-between">
        <h2 className="font-serif text-xl font-semibold text-foreground sm:text-2xl">
          Browse by what suits you
        </h2>
      </div>

      <div className="flex flex-wrap gap-2">
        {ALL_HOBBY_FACETS.map((facet) => {
          const active = selected.includes(facet);
          return (
            <button
              key={facet}
              type="button"
              onClick={() => toggle(facet)}
              aria-pressed={active}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground'
              }`}
            >
              {HOBBY_FACET_LABELS[facet]}
            </button>
          );
        })}
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => setSelected([])}
            className="rounded-full px-3 py-1.5 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>

      <p aria-live="polite" className="mt-5 text-sm text-muted-foreground">
        {selected.length === 0
          ? `${matches.length} hobbies. Pick a filter to narrow them.`
          : `${matches.length} match all ${selected.length} filter${selected.length > 1 ? 's' : ''}.`}
      </p>

      {matches.length === 0 ? (
        <p className="mt-4 text-base text-muted-foreground">
          Nothing matches all of those at once. Try dropping the most specific one.
        </p>
      ) : (
        <ul className="mt-4 flex flex-wrap gap-2">
          {matches.map((hobby) => (
            <li key={hobby}>
              <Link
                href={`/hobbies/${encodeURIComponent(hobby.toLowerCase())}`}
                prefetch={false}
                title={facetsForHobby(hobby)
                  .map((f) => HOBBY_FACET_LABELS[f])
                  .join(' · ')}
                className="inline-block rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:border-foreground/30"
              >
                {hobby}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
