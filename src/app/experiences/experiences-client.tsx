'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import type { ExperienceCategory, ExperienceEntry, ExperienceKind } from '~/lib/experiences';

type Props = {
  entries: ExperienceEntry[];
  categories: ExperienceCategory[];
};

const KINDS: { id: ExperienceKind | 'all'; label: string }[] = [
  { id: 'all', label: 'Everything' },
  { id: 'destination', label: 'Places' },
  { id: 'milestone', label: 'Milestones' },
  { id: 'idea', label: 'Ideas' },
];

/**
 * Browse the whole corpus.
 *
 * Everything is here, including the bare ideas that have no page of their own —
 * the list is meant to be exhaustive, and an item you can find and read is
 * useful even when there is nothing more to say about it yet. Entries with a
 * page link to it; the rest render as plain rows.
 *
 * Filtering is client-side over a few hundred rows, which is far cheaper than a
 * round trip and keeps the whole thing usable with the keyboard.
 */
export function ExperiencesClient({ entries, categories }: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ExperienceCategory | 'all'>('all');
  const [kind, setKind] = useState<ExperienceKind | 'all'>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (category !== 'all' && e.category !== category) return false;
      if (kind !== 'all' && e.kind !== kind) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) || (e.description?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [entries, query, category, kind]);

  return (
    <div>
      <div className="mt-8 space-y-4">
        <div>
          <label htmlFor="experience-search" className="sr-only">
            Search everything
          </label>
          <input
            id="experience-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search — northern lights, marathon, learn…"
            className="w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:outline-none"
          />
        </div>

        <FilterRow label="Kind">
          {KINDS.map((k) => (
            <Chip key={k.id} active={kind === k.id} onClick={() => setKind(k.id)}>
              {k.label}
            </Chip>
          ))}
        </FilterRow>

        <FilterRow label="Category">
          <Chip active={category === 'all'} onClick={() => setCategory('all')}>
            All
          </Chip>
          {categories.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
              {c[0].toUpperCase() + c.slice(1)}
            </Chip>
          ))}
        </FilterRow>
      </div>

      <p aria-live="polite" className="mt-6 text-sm text-muted-foreground">
        {filtered.length} of {entries.length}
      </p>

      {filtered.length === 0 ? (
        <p className="mt-10 text-base text-muted-foreground">
          Nothing matches that. Try a shorter word, or clear the filters.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border border-border border-t">
          {filtered.map((e) => (
            <li key={e.slug} className="py-3.5">
              <div className="flex items-baseline gap-3">
                <span aria-hidden="true" className="shrink-0 text-base">
                  {e.emoji}
                </span>
                <div className="min-w-0">
                  {e.description ? (
                    <Link
                      href={`/experiences/${e.slug}`}
                      prefetch={false}
                      className="text-base font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {e.title}
                    </Link>
                  ) : (
                    <span className="text-base font-medium text-foreground">{e.title}</span>
                  )}
                  {e.description ? (
                    <p className="mt-1 max-w-[70ch] text-sm text-muted-foreground">
                      {e.description}
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}
