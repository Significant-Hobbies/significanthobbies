'use client';

import { Check, ChevronDown, ChevronUp, Circle, PenLine } from 'lucide-react';
import type { BucketListDraft, BucketListItem } from '~/lib/life-bingo';
import { cn } from '~/lib/utils';

export function BucketListView({
  draft,
  onToggle,
  onEdit,
  onMove,
  readonly = false,
}: {
  draft: BucketListDraft;
  onToggle?: (item: BucketListItem) => void;
  onEdit?: (item: BucketListItem) => void;
  onMove?: (itemId: string, direction: -1 | 1) => void;
  readonly?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-stone-200 bg-[#fffdf8] shadow-[0_18px_55px_rgba(73,60,43,0.08)]">
      <div className="border-b border-stone-200 bg-[#f6efe3] px-5 py-5 sm:px-7">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.24em] text-emerald-700">
          Bucket list
        </p>
        <h2 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          {draft.title}
        </h2>
        <p className="mt-1 text-sm text-stone-500">{draft.subtitle}</p>
      </div>

      <ol className="divide-y divide-stone-100">
        {draft.items.map((item, index) => (
          <li
            key={item.id}
            className={cn(
              'group flex items-center gap-3 px-4 py-3.5 sm:px-6',
              item.completedAt && 'bg-emerald-50/40'
            )}
          >
            <button
              type="button"
              onClick={() => onToggle?.(item)}
              disabled={readonly || !onToggle}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-default"
              aria-label={`${item.completedAt ? 'Reopen' : 'Complete'} ${item.text}`}
            >
              {item.completedAt ? (
                <Check className="h-5 w-5 stroke-[2.5]" />
              ) : (
                <Circle className="h-5 w-5 text-stone-300" />
              )}
            </button>

            <button
              type="button"
              onClick={() => onEdit?.(item)}
              disabled={readonly || !onEdit}
              className="min-w-0 flex-1 text-left disabled:cursor-default"
            >
              <span
                className={cn(
                  'block text-sm font-medium leading-snug text-stone-800 sm:text-[0.95rem]',
                  item.completedAt && 'text-stone-500 line-through decoration-emerald-600/40'
                )}
              >
                {item.text}
              </span>
              <span className="mt-1 flex flex-wrap items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-wider text-stone-400">
                <span>{item.intention === 'wildcard' ? 'unexpected' : item.intention}</span>
                <span aria-hidden="true">·</span>
                <span>{item.effort}</span>
                {item.note && (
                  <span className="normal-case tracking-normal text-stone-500">“{item.note}”</span>
                )}
              </span>
            </button>

            {!readonly && (
              <div className="flex shrink-0 items-center opacity-40 transition group-hover:opacity-100 group-focus-within:opacity-100">
                <button
                  type="button"
                  onClick={() => onMove?.(item.id, -1)}
                  disabled={index === 0}
                  className="flex h-11 w-11 items-center justify-center rounded-md text-stone-500 hover:bg-stone-100 disabled:opacity-20 sm:h-8 sm:w-8"
                  aria-label={`Move ${item.text} up`}
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onMove?.(item.id, 1)}
                  disabled={index === draft.items.length - 1}
                  className="flex h-11 w-11 items-center justify-center rounded-md text-stone-500 hover:bg-stone-100 disabled:opacity-20 sm:h-8 sm:w-8"
                  aria-label={`Move ${item.text} down`}
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onEdit?.(item)}
                  className="flex h-11 w-11 items-center justify-center rounded-md text-stone-500 hover:bg-stone-100 sm:h-8 sm:w-8"
                  aria-label={`Edit ${item.text}`}
                >
                  <PenLine className="h-4 w-4" />
                </button>
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
