'use client';

import { ArrowRight, Check, Compass, RefreshCw, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { addBucketListItem } from '~/lib/actions/bucket-list';
import { browserRecordAdapter, readLocalRecord, writeLocalRecord } from '~/lib/local-record-store';

type Suggestion = {
  title: string;
  category: 'travel' | 'adventure' | 'creative' | 'achievement' | 'social' | 'humanitarian';
  emoji: string;
  reason: string;
};

const categoryCopy: Record<Suggestion['category'], string> = {
  travel: 'A change of place can interrupt an over-familiar life.',
  adventure: 'This adds a little courage and a story you can keep.',
  creative: 'Making something gives your attention somewhere real to go.',
  achievement: 'A meaningful stretch can become a chapter, not just a task.',
  social: 'Some of the best possibilities are really reasons to gather.',
  humanitarian: 'This leaves more behind than a checked box.',
};

export function LiveMoreDiscovery({
  suggestions,
  mode = 'account',
}: {
  suggestions: Suggestion[];
  mode?: 'account' | 'local';
}) {
  const [page, setPage] = useState(0);
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set());
  const [saved, setSaved] = useState<Set<string>>(() => new Set());
  const [lastDismissed, setLastDismissed] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [pendingTitle, setPendingTitle] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const visible = useMemo(() => {
    const available = suggestions.filter((suggestion) => !dismissed.has(suggestion.title));
    const start = (page * 3) % Math.max(available.length, 1);
    return [...available.slice(start, start + 3), ...available.slice(0, start)].slice(0, 3);
  }, [dismissed, page, suggestions]);

  function save(suggestion: Suggestion) {
    setPendingTitle(suggestion.title);
    setStatus(`Saving ${suggestion.title}.`);
    startTransition(async () => {
      try {
        if (mode === 'account') {
          await addBucketListItem({
            title: suggestion.title,
            category: suggestion.category,
            description: suggestion.reason || categoryCopy[suggestion.category],
          });
        } else {
          const adapter = browserRecordAdapter();
          const current = await readLocalRecord(
            adapter,
            'onboarding:bucket-items',
            'bucket-list',
            isObject
          );
          const items = Array.isArray(current?.items) ? current.items : [];
          if (!items.some((item) => isObject(item) && item.title === suggestion.title)) {
            items.push(suggestion);
          }
          await writeLocalRecord(adapter, 'onboarding:bucket-items', 'bucket-list', {
            ...current,
            items,
          });
        }
        setSaved((current) => new Set(current).add(suggestion.title));
        window.dispatchEvent(
          new CustomEvent('bucket-list:item-added', { detail: { title: suggestion.title } })
        );
        setStatus(`${suggestion.title} is now on your bucket list.`);
      } catch {
        setStatus(`Could not save ${suggestion.title}. Please try again.`);
      } finally {
        setPendingTitle(null);
      }
    });
  }

  function dismiss(title: string) {
    setDismissed((current) => new Set(current).add(title));
    setLastDismissed(title);
    setStatus(`${title} dismissed. You can undo this.`);
  }

  function undoDismiss() {
    if (!lastDismissed) return;
    setDismissed((current) => {
      const next = new Set(current);
      next.delete(lastDismissed);
      return next;
    });
    setStatus(`${lastDismissed} is back in your possibilities.`);
    setLastDismissed(null);
  }

  return (
    <section
      id="discover"
      className="scroll-mt-24 overflow-hidden rounded-[2rem] bg-[#211e18] text-white"
    >
      <div className="grid gap-8 p-6 sm:p-9 lg:grid-cols-[0.72fr_1.28fr] lg:p-12">
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex size-12 items-center justify-center rounded-full bg-[#f7e957] text-[#211e18]">
              <Compass className="size-6" />
            </div>
            <p className="mt-7 text-sm font-bold uppercase tracking-[0.2em] text-[#a8dc91]">
              More than 5,000 possibilities
            </p>
            <h2 className="mt-3 max-w-xl font-serif text-4xl leading-[1.02] sm:text-5xl">
              Discover a life you have not thought of yet.
            </h2>
            <p className="mt-5 max-w-lg leading-relaxed text-white/68">
              Three directions, drawn from more than 5,000 real paths. Save what calls you, set
              aside what does not, or turn one into a small first step.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setPage((current) => current + 1)}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 font-bold text-[#211e18]"
            >
              <RefreshCw className="size-4" /> Show me another three
            </button>
            <Link
              href="/experiences"
              className="inline-flex min-h-11 items-center gap-2 border-b-2 border-[#f7e957] font-bold"
            >
              Browse curated experiences <ArrowRight className="size-4" />
            </Link>
          </div>
          <div aria-live="polite" className="mt-4 min-h-6 text-sm text-white/80">
            {status}
            {lastDismissed ? (
              <button
                type="button"
                onClick={undoDismiss}
                className="ml-2 min-h-11 font-bold text-[#f7e957] underline underline-offset-4"
              >
                Undo
              </button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {visible.map((suggestion, index) => {
            const isSaved = saved.has(suggestion.title);
            return (
              <article
                key={suggestion.title}
                className={`flex min-h-60 flex-col justify-between rounded-2xl p-5 text-[#211e18] ${index === 0 ? 'sm:col-span-2' : ''} ${
                  [
                    'bg-[#f7e957]',
                    'bg-[#ffd0bd]',
                    'bg-[#b9dcf5]',
                    'bg-[#dceabf]',
                    'bg-[#c5abfa]',
                    'bg-[#fffdf8]',
                  ][index % 6]
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-3xl" aria-hidden="true">
                      {suggestion.emoji}
                    </span>
                    <button
                      type="button"
                      onClick={() => dismiss(suggestion.title)}
                      className="flex size-11 items-center justify-center rounded-full bg-white/55"
                      aria-label={`Dismiss ${suggestion.title}`}
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                  <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em]">
                    {suggestion.category}
                  </p>
                  <h3 className="mt-2 font-serif text-2xl leading-tight">{suggestion.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed opacity-75">
                    {suggestion.reason || categoryCopy[suggestion.category]}
                  </p>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={isSaved || (pending && pendingTitle === suggestion.title)}
                    onClick={() => save(suggestion)}
                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#211e18] px-3 text-sm font-bold text-white disabled:opacity-65"
                  >
                    {isSaved ? <Check className="size-4" /> : <Sparkles className="size-4" />}
                    {isSaved
                      ? 'On your list'
                      : pendingTitle === suggestion.title
                        ? 'Saving…'
                        : 'Save possibility'}
                  </button>
                  <Link
                    href={`/side-quests?tab=pick&possibility=${encodeURIComponent(suggestion.title)}`}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#211e18]/25 px-3 text-sm font-bold"
                  >
                    Small first step
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}
