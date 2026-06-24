'use client';

import Link from 'next/link';
import { useId, useMemo, useRef, useState, useTransition } from 'react';

import { Lumi } from '~/components/lumi';
import {
  addBucketListItem,
  removeBucketListItem,
  updateBucketListItemStatus,
  updateBucketListItemVisibility,
} from '~/lib/actions/bucket-list';
import {
  getBucketListArchetype,
  getBucketListSuggestions,
  getCelebrityMatch,
} from '~/lib/bucket-list-insights';
import { BUCKET_ITEM_CATEGORIES } from '~/lib/famous-bucket-lists';

type Item = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  status: string;
  visibility: string;
  sourceSlug: string | null;
  sourceItemTitle: string | null;
  completedAt: Date | null;
  createdAt: Date;
};

type Props = { initialItems: Item[] };

export function BucketListSection({ initialItems }: Props) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [newTitle, setNewTitle] = useState('');
  const [isPending, startTransition] = useTransition();
  const optimisticIdBase = useId();
  const optimisticCounter = useRef(0);

  const archetype = useMemo(() => getBucketListArchetype(items), [items]);
  const celebrity = useMemo(() => getCelebrityMatch(items), [items]);
  const suggestions = useMemo(() => getBucketListSuggestions(items, 6), [items]);

  function handleToggle(id: string, currentStatus: string) {
    const nextStatus = currentStatus === 'done' ? 'planned' : 'done';
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: nextStatus, completedAt: nextStatus === 'done' ? new Date() : null }
          : item
      )
    );
    startTransition(async () => {
      await updateBucketListItemStatus(id, nextStatus as 'planned' | 'done');
    });
  }

  function handleToggleVisibility(id: string, currentVisibility: string) {
    const next = currentVisibility === 'public' ? 'private' : 'public';
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, visibility: next } : item)));
    startTransition(async () => {
      await updateBucketListItemVisibility(id, next);
    });
  }

  function handleRemove(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
    startTransition(async () => {
      await removeBucketListItem(id);
    });
  }

  function handleAddSuggestion(title: string, category: string) {
    addItemOptimistically(title, category);
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    setNewTitle('');
    addItemOptimistically(title, undefined);
  }

  function addItemOptimistically(title: string, category?: string) {
    optimisticCounter.current += 1;
    const optimistic: Item = {
      id: `optimistic-${optimisticIdBase}-${optimisticCounter.current}`,
      title,
      description: null,
      category: category ?? null,
      status: 'planned',
      visibility: 'private',
      sourceSlug: null,
      sourceItemTitle: null,
      completedAt: null,
      createdAt: new Date(),
    };
    setItems((prev) => [optimistic, ...prev]);
    startTransition(async () => {
      const result = await addBucketListItem({
        title,
        category: (category as Item['category']) ?? undefined,
      });
      if (result.id) {
        setItems((prev) =>
          prev.map((item) => (item.id === optimistic.id ? { ...item, id: result.id! } : item))
        );
      }
    });
  }

  const done = items.filter((i) => i.status === 'done').length;
  const publicCount = items.filter((i) => i.visibility === 'public').length;
  const total = items.length;

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Lumi size={40} glow />
          <div>
            <h2 className="text-xl font-bold text-stone-900">Your Bucket List</h2>
            {total > 0 && (
              <p className="text-sm text-stone-400">
                {done} of {total} done
                {publicCount > 0 && (
                  <span className="ml-2 text-amber-600 font-medium">
                    · {publicCount} public on your profile
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
        <Link
          href="/bucket-lists"
          className="shrink-0 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
        >
          Browse famous lists →
        </Link>
      </div>

      {/* ── Archetype + Celebrity row ────────────────────────────── */}
      {(archetype ?? celebrity) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {archetype && (
            <div
              className={`rounded-2xl p-5 text-white ${archetype.color} bg-opacity-90 shadow-sm`}
            >
              <p className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-1">
                Your archetype
              </p>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{archetype.emoji}</span>
                <div>
                  <p className="font-bold">{archetype.name}</p>
                  <p className="text-xs opacity-80 italic">&ldquo;{archetype.tagline}&rdquo;</p>
                </div>
              </div>
              <p className="mt-2 text-xs opacity-75 leading-relaxed">{archetype.description}</p>
            </div>
          )}
          {celebrity && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-1">
                You&apos;re most like
              </p>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{celebrity.emoji}</span>
                <div>
                  <a
                    href={`/bucket-lists/${celebrity.slug}`}
                    className="font-bold text-stone-900 hover:text-amber-700 transition-colors"
                  >
                    {celebrity.name}
                  </a>
                  <div className="flex items-center gap-1 mt-0.5">
                    {celebrity.sharedCategories.slice(0, 3).map((cat) => {
                      const info = BUCKET_ITEM_CATEGORIES[cat];
                      return info ? (
                        <span key={cat} className="text-xs text-stone-500" title={info.label}>
                          {info.emoji}
                        </span>
                      ) : null;
                    })}
                    <span className="text-xs text-stone-400">{celebrity.score}% match</span>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-xs text-stone-500 line-clamp-2">{celebrity.knownFor}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Suggestions strip ────────────────────────────────────── */}
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
            Lumi suggests
          </p>
          <div className="flex gap-2 flex-wrap">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleAddSuggestion(s.title, s.category)}
                disabled={isPending}
                className="group inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-700 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 transition-all disabled:opacity-50"
              >
                <span>{s.emoji}</span>
                <span className="line-clamp-1 max-w-[180px]">{s.title}</span>
                <span className="text-stone-300 group-hover:text-amber-400 transition-colors">
                  +
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Add item ─────────────────────────────────────────────── */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add your own bucket list item…"
          className="flex-1 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={isPending || !newTitle.trim()}
          className="rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-stone-950 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Add
        </button>
      </form>

      {/* ── Progress bar ─────────────────────────────────────────── */}
      {total > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-stone-400">
            <span>
              {done} done · {total - done} remaining
            </span>
            <span className="font-medium text-amber-600">
              {total > 0 ? Math.round((done / total) * 100) : 0}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700"
              style={{ width: total ? `${Math.round((done / total) * 100)}%` : '0%' }}
            />
          </div>
        </div>
      )}

      {/* ── Items list ───────────────────────────────────────────── */}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 py-12 text-center space-y-4">
          <Lumi size={56} glow className="mx-auto" />
          <div>
            <p className="font-semibold text-stone-800">Your bucket list is waiting.</p>
            <p className="text-sm text-stone-500 mt-1">
              Lumi will help you fill it — browse famous lists or add your own above.
            </p>
          </div>
          <Link
            href="/bucket-lists"
            className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-stone-950 hover:bg-amber-300 transition-colors"
          >
            ✨ Browse famous bucket lists
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => {
            const cat = item.category
              ? BUCKET_ITEM_CATEGORIES[item.category as keyof typeof BUCKET_ITEM_CATEGORIES]
              : null;
            const isDone = item.status === 'done';
            const isPublic = item.visibility === 'public';

            return (
              <li
                key={item.id}
                className={`group flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-200 ${
                  isDone
                    ? 'border-emerald-200 bg-emerald-50/60'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                {/* Done toggle */}
                <button
                  onClick={() => handleToggle(item.id, item.status)}
                  className={`h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
                    isDone
                      ? 'border-emerald-500 bg-emerald-500'
                      : 'border-stone-300 hover:border-amber-400 hover:scale-110'
                  }`}
                  aria-label={isDone ? 'Mark as planned' : 'Mark as done'}
                >
                  {isDone && <span className="text-white text-[9px] font-bold">✓</span>}
                </button>

                {/* Title */}
                <span
                  className={`flex-1 text-sm font-medium ${isDone ? 'line-through text-stone-400' : 'text-stone-800'}`}
                >
                  {item.title}
                  {item.sourceSlug && (
                    <a
                      href={`/bucket-lists/${item.sourceSlug}`}
                      className="ml-2 text-xs text-stone-400 hover:text-amber-500 transition-colors not-italic no-underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      ✨
                    </a>
                  )}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {cat && (
                    <span className="text-sm" title={cat.label}>
                      {cat.emoji}
                    </span>
                  )}
                  <button
                    onClick={() => handleToggleVisibility(item.id, item.visibility)}
                    className={`text-base transition-colors ${isPublic ? 'text-amber-500' : 'text-stone-300 hover:text-stone-400'}`}
                    title={
                      isPublic
                        ? 'Public on your profile — click to make private'
                        : 'Private — click to share on your profile'
                    }
                  >
                    {isPublic ? '🌐' : '🔒'}
                  </button>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-stone-300 hover:text-red-400 transition-colors text-lg leading-none"
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {total > 0 && publicCount === 0 && (
        <p className="text-center text-xs text-stone-400">
          Items are private by default. Hover an item and click 🔒 to share it on your public
          profile.
        </p>
      )}
    </div>
  );
}
