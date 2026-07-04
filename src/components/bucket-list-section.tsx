'use client';

import Link from 'next/link';
import { useId, useMemo, useRef, useState, useTransition } from 'react';

import { Whale } from '~/components/whale';
import {
  addBucketListItem,
  removeBucketListItem,
  updateBucketListItem,
  updateBucketListItemStatus,
  updateBucketListItemVisibility,
} from '~/lib/actions/bucket-list';
import {
  getBucketListArchetype,
  getBucketListSuggestions,
  getCelebrityMatch,
} from '~/lib/bucket-list-insights';
import { BUCKET_ITEM_CATEGORIES, type BucketItemCategory } from '~/lib/famous-bucket-lists';

type ItemStatus = 'planned' | 'in_progress' | 'done';

type Item = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  status: string;
  visibility: string;
  sourceSlug: string | null;
  sourceItemTitle: string | null;
  targetYear: number | null;
  completedAt: Date | null;
  createdAt: Date;
};

type Props = { initialItems: Item[] };

const STATUS_CYCLE: Record<ItemStatus, ItemStatus> = {
  planned: 'in_progress',
  in_progress: 'done',
  done: 'planned',
};

const STATUS_LABEL: Record<ItemStatus, string> = {
  planned: 'Planned',
  in_progress: 'In progress',
  done: 'Done',
};

const CATEGORY_OPTIONS = Object.entries(BUCKET_ITEM_CATEGORIES) as [
  BucketItemCategory,
  { label: string; emoji: string },
][];

export function BucketListSection({ initialItems }: Props) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<string>('');
  const [newYear, setNewYear] = useState<string>('');
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [suggestionSeed, setSuggestionSeed] = useState(0);
  const [justDoneId, setJustDoneId] = useState<string | null>(null);
  const optimisticIdBase = useId();
  const optimisticCounter = useRef(0);
  const justDoneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const archetype = useMemo(() => getBucketListArchetype(items), [items]);
  const celebrity = useMemo(() => getCelebrityMatch(items), [items]);
  // Stable across re-renders unless the item set meaningfully changes or the
  // user explicitly refreshes. No more reshuffle on every status toggle.
  const suggestions = useMemo(
    () => getBucketListSuggestions(items, 6, suggestionSeed),
    [items, suggestionSeed]
  );

  function cycleStatus(id: string, current: string) {
    const cur = current as ItemStatus;
    const next = STATUS_CYCLE[cur];
    const becameDone = next === 'done';
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: next,
              completedAt: becameDone ? new Date() : null,
            }
          : item
      )
    );
    startTransition(async () => {
      await updateBucketListItemStatus(id, next);
    });
    if (becameDone) {
      setJustDoneId(id);
      if (justDoneTimer.current) clearTimeout(justDoneTimer.current);
      justDoneTimer.current = setTimeout(() => setJustDoneId(null), 750);
    }
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

  function handleSetYear(id: string, year: number | null) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, targetYear: year } : item)));
    startTransition(async () => {
      await updateBucketListItem(id, { targetYear: year });
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
    setNewCategory('');
    setNewYear('');
    setShowAddOptions(false);
    addItemOptimistically(title, newCategory || undefined, newYear || undefined);
  }

  function addItemOptimistically(title: string, category?: string, year?: string) {
    optimisticCounter.current += 1;
    const targetYear = year ? Number.parseInt(year, 10) : null;
    const optimistic: Item = {
      id: `optimistic-${optimisticIdBase}-${optimisticCounter.current}`,
      title,
      description: null,
      category: category ?? null,
      status: 'planned',
      visibility: 'private',
      sourceSlug: null,
      sourceItemTitle: null,
      targetYear: Number.isNaN(targetYear) ? null : targetYear,
      completedAt: null,
      createdAt: new Date(),
    };
    setItems((prev) => [optimistic, ...prev]);
    startTransition(async () => {
      const result = await addBucketListItem({
        title,
        category: (category as Item['category']) ?? undefined,
        targetYear: Number.isNaN(targetYear) ? undefined : (targetYear ?? undefined),
      });
      if (result.id) {
        setItems((prev) =>
          prev.map((item) => (item.id === optimistic.id ? { ...item, id: result.id! } : item))
        );
      }
    });
  }

  const done = items.filter((i) => i.status === 'done').length;
  const inProgress = items.filter((i) => i.status === 'in_progress').length;
  const publicCount = items.filter((i) => i.visibility === 'public').length;
  const total = items.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  // Circular progress geometry
  const R = 26;
  const CIRC = 2 * Math.PI * R;
  const offset = CIRC * (1 - pct / 100);

  return (
    <div className="space-y-7">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Whale size={44} glow />
          <div>
            <h2 className="text-lg font-semibold text-foreground">Your bucket list</h2>
            {total > 0 ? (
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-lumi">{done}</span> done
                {inProgress > 0 && (
                  <>
                    {' · '}
                    <span className="font-semibold text-foreground">{inProgress}</span> in progress
                  </>
                )}
                {publicCount > 0 && (
                  <span className="ml-1 text-muted-foreground/60">· {publicCount} public</span>
                )}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">A life list, one check at a time.</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {total > 0 && (
            <div className="relative hidden sm:block shrink-0">
              <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r={R}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  className="text-border"
                />
                <circle
                  cx="32"
                  cy="32"
                  r={R}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={CIRC}
                  strokeDashoffset={offset}
                  className="text-lumi"
                  style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.22,1,0.36,1)' }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
                {pct}%
              </span>
            </div>
          )}
          <Link
            href="/bucket-lists"
            className="shrink-0 text-sm font-medium text-lumi hover:text-lumi-600 transition-colors"
          >
            Famous lists →
          </Link>
        </div>
      </div>

      {/* ── Archetype + Celebrity ────────────────────────────────── */}
      {(archetype ?? celebrity) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {archetype && (
            <div
              className={`relative overflow-hidden rounded-2xl p-5 text-foreground shadow-sm ${archetype.color}`}
            >
              <div className="absolute -right-6 -top-6 text-7xl opacity-20 select-none">
                {archetype.emoji}
              </div>
              <div className="relative">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl leading-none">{archetype.emoji}</span>
                  <div>
                    <p className="font-bold leading-tight">{archetype.name}</p>
                    <p className="text-xs opacity-85 italic">&ldquo;{archetype.tagline}&rdquo;</p>
                  </div>
                </div>
                <p className="mt-2.5 text-xs opacity-90 leading-relaxed">{archetype.description}</p>
              </div>
            </div>
          )}
          {celebrity && (
            <div className="rounded-2xl border border-lumi-200 bg-lumi-50 p-5">
              <p className="text-sm text-muted-foreground mb-1.5">You&apos;re most like</p>
              <div className="flex items-center gap-2.5">
                <span className="text-3xl leading-none">{celebrity.emoji}</span>
                <div>
                  <a
                    href={`/bucket-lists/${celebrity.slug}`}
                    className="font-bold text-foreground hover:text-lumi-600 transition-colors"
                  >
                    {celebrity.name}
                  </a>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {celebrity.sharedCategories.slice(0, 3).map((cat) => {
                      const info = BUCKET_ITEM_CATEGORIES[cat];
                      return info ? (
                        <span key={cat} className="text-sm" title={info.label}>
                          {info.emoji}
                        </span>
                      ) : null;
                    })}
                    <span className="text-xs font-semibold text-lumi">
                      {celebrity.score}% match
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                {celebrity.knownFor}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Suggestions ─────────────────────────────────────────── */}
      {suggestions.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Whale suggests</p>
            <button
              type="button"
              onClick={() => setSuggestionSeed((s) => s + 1)}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-lumi transition-colors"
              aria-label="Refresh suggestions"
            >
              <span className="text-base leading-none">↻</span> shuffle
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {suggestions.map((s, i) => (
              <button
                key={`${s.title}-${i}`}
                onClick={() => handleAddSuggestion(s.title, s.category)}
                disabled={isPending}
                className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground hover:border-lumi-200 hover:bg-lumi-50 hover:text-lumi-600 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
              >
                <span>{s.emoji}</span>
                <span className="line-clamp-1 max-w-[180px]">{s.title}</span>
                <span className="text-muted-foreground/40 group-hover:text-lumi transition-colors">
                  +
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Add item ─────────────────────────────────────────────── */}
      <form onSubmit={handleAdd} className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onFocus={() => setShowAddOptions(true)}
            placeholder="Add your own bucket list item…"
            className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-lumi-200 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={isPending || !newTitle.trim()}
            className="rounded-xl bg-lumi px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-lumi-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
        </div>
        {showAddOptions && (
          <div className="flex flex-wrap items-center gap-2 pl-1 text-xs text-muted-foreground">
            <span className="text-muted-foreground/60">Optional:</span>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-lumi-200"
              aria-label="Category"
            >
              <option value="">No category</option>
              {CATEGORY_OPTIONS.map(([key, { label, emoji }]) => (
                <option key={key} value={key}>
                  {emoji} {label}
                </option>
              ))}
            </select>
            <input
              type="number"
              inputMode="numeric"
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
              placeholder="by year"
              min={1900}
              max={2200}
              className="w-24 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-lumi-200"
              aria-label="Target year"
            />
          </div>
        )}
      </form>

      {/* ── Items list ───────────────────────────────────────────── */}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-lumi-200 bg-lumi-50/60 py-14 text-center space-y-4">
          <Whale size={64} glow className="mx-auto" />
          <div>
            <p className="font-semibold text-foreground">Your bucket list is waiting.</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              Whale will help you fill it. Browse famous lists for inspiration, or add your own
              above.
            </p>
          </div>
          <Link
            href="/bucket-lists"
            className="inline-flex items-center gap-2 rounded-full bg-lumi px-5 py-2 text-sm font-semibold text-foreground hover:bg-lumi-600 transition-colors"
          >
            Browse famous bucket lists →
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item, i) => {
            const cat = item.category
              ? BUCKET_ITEM_CATEGORIES[item.category as keyof typeof BUCKET_ITEM_CATEGORIES]
              : null;
            const status = item.status as ItemStatus;
            const isDone = status === 'done';
            const isInProgress = status === 'in_progress';
            const isPublic = item.visibility === 'public';
            const celebrating = justDoneId === item.id;

            return (
              <li
                key={item.id}
                style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
                className={`group animate-bucket-item-in relative flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-200 ${
                  isDone
                    ? 'border-lumi-200 bg-lumi-50/70'
                    : isInProgress
                      ? 'border-primary/30 bg-primary/10/60'
                      : 'border-border bg-card hover:border-border hover:shadow-sm'
                }`}
              >
                {/* Celebration sparkle */}
                {celebrating && (
                  <span
                    className="animate-bucket-sparkle pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xl text-lumi select-none"
                    aria-hidden
                  >
                    ✨
                  </span>
                )}

                {/* Status toggle — 3-state cycle */}
                <button
                  onClick={() => cycleStatus(item.id, item.status)}
                  className={`relative h-6 w-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
                    isDone
                      ? 'border-lumi bg-lumi hover:bg-lumi-600 hover:border-lumi-600'
                      : isInProgress
                        ? 'border-primary bg-primary/40 hover:bg-primary/60'
                        : 'border-border hover:border-lumi hover:scale-110'
                  }`}
                  aria-label={`Status: ${STATUS_LABEL[status]}. Click to advance.`}
                  title={STATUS_LABEL[status]}
                >
                  {isDone && (
                    <span className="animate-bucket-check-pop text-foreground text-[10px] font-bold leading-none">
                      ✓
                    </span>
                  )}
                  {isInProgress && (
                    <span className="text-foreground text-[10px] font-bold leading-none">●</span>
                  )}
                </button>

                {/* Title + meta */}
                <div className="flex-1 min-w-0">
                  <span
                    className={`block text-sm font-medium truncate ${
                      isDone ? 'line-through text-muted-foreground/60' : 'text-foreground'
                    }`}
                  >
                    {item.title}
                    {item.sourceSlug && (
                      <a
                        href={`/bucket-lists/${item.sourceSlug}`}
                        className="ml-1.5 text-xs text-muted-foreground/40 hover:text-lumi transition-colors no-underline"
                        onClick={(e) => e.stopPropagation()}
                        title="From this famous list"
                      >
                        ✨
                      </a>
                    )}
                  </span>
                  {(cat || item.targetYear) && (
                    <div className="flex items-center gap-2 mt-0.5">
                      {cat && (
                        <span className="text-xs text-muted-foreground/60">
                          {cat.emoji} {cat.label}
                        </span>
                      )}
                      {item.targetYear && (
                        <span className="text-xs text-muted-foreground/60">
                          · by {item.targetYear}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <YearEditor id={item.id} year={item.targetYear} onSet={handleSetYear} />
                  <button
                    onClick={() => handleToggleVisibility(item.id, item.visibility)}
                    className={`text-base transition-colors ${
                      isPublic
                        ? 'text-lumi'
                        : 'text-muted-foreground/40 hover:text-muted-foreground/60'
                    }`}
                    title={
                      isPublic
                        ? 'Public on your profile — click to make private'
                        : 'Private — click to share on your profile'
                    }
                    aria-label={isPublic ? 'Make private' : 'Make public'}
                  >
                    {isPublic ? '🌐' : '🔒'}
                  </button>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-muted-foreground/40 hover:text-destructive transition-colors text-lg leading-none"
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
        <p className="text-center text-xs text-muted-foreground/60">
          Items are private by default. Hover an item and click 🔒 to share it on your public
          profile.
        </p>
      )}
    </div>
  );
}

// ─── Inline target-year editor ───────────────────────────────────────────────

function YearEditor({
  id,
  year,
  onSet,
}: {
  id: string;
  year: number | null;
  onSet: (id: string, year: number | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(year ? String(year) : '');

  if (editing) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const parsed = value ? Number.parseInt(value, 10) : null;
          onSet(id, parsed && !Number.isNaN(parsed) ? parsed : null);
          setEditing(false);
        }}
        className="flex items-center gap-1"
      >
        <input
          autoFocus
          type="number"
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          min={1900}
          max={2200}
          placeholder="year"
          className="w-16 rounded-md border border-border px-1.5 py-0.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-lumi-200"
          aria-label="Target year"
        />
        <button
          type="submit"
          className="text-xs text-lumi hover:text-lumi-600 font-medium"
          aria-label="Save year"
        >
          ✓
        </button>
      </form>
    );
  }

  return (
    <button
      onClick={() => {
        setValue(year ? String(year) : '');
        setEditing(true);
      }}
      className="text-base text-muted-foreground/40 hover:text-lumi transition-colors"
      title={year ? `Target: ${year} — click to edit` : 'Set a target year'}
      aria-label="Set target year"
    >
      🗓️
    </button>
  );
}
