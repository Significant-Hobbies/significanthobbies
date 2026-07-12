'use client';

import { Check, Sparkles } from 'lucide-react';
import { getBingoProgress, type BucketListDraft, type BucketListItem } from '~/lib/life-bingo';
import { cn } from '~/lib/utils';

const TONE_CLASSES: Record<BucketListItem['tone'], string> = {
  moss: 'border-[#8fa67e] bg-[#d8e6ce] text-[#263529]',
  clay: 'border-[#c28e72] bg-[#efd0bc] text-[#4a2f28]',
  marigold: 'border-[#c99f36] bg-[#f4d77a] text-[#493815]',
  sky: 'border-[#83aeb8] bg-[#cfe3e8] text-[#20383d]',
  rose: 'border-[#b98991] bg-[#ead0d3] text-[#482d31]',
  ink: 'border-[#1e3029] bg-[#1e3029] text-[#fffaf0]',
};

export function BingoBoard({
  draft,
  onSelectItem,
  onSelectEmpty,
  className,
  showAttribution = true,
  compact = false,
}: {
  draft: BucketListDraft;
  onSelectItem?: (item: BucketListItem) => void;
  onSelectEmpty?: (position: number) => void;
  className?: string;
  showAttribution?: boolean;
  compact?: boolean;
}) {
  const progress = getBingoProgress(draft);
  const boardItems = Array.from(
    { length: draft.size * draft.size },
    (_, position) => draft.items.find((item) => item.boardPosition === position) ?? null
  );

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-[1.5rem] border border-[#cfc2aa] bg-[#fbf5e8] p-4 text-[#1e3029] shadow-[0_20px_60px_rgba(67,54,36,0.13)] sm:p-6',
        className
      )}
      aria-label={`${draft.title} Bingo board`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.22'/%3E%3C/svg%3E\")",
        }}
      />

      <header
        className={cn(
          'relative flex items-end justify-between gap-4',
          compact ? 'mb-3' : 'mb-5 sm:mb-7'
        )}
      >
        <div className="min-w-0">
          <p className="mb-1 text-[0.6rem] font-bold uppercase tracking-[0.28em] text-[#597064] sm:text-[0.68rem]">
            A life less ordinary
          </p>
          <h2
            className={cn(
              'font-serif font-semibold leading-[0.95] tracking-[-0.035em]',
              compact ? 'text-2xl sm:text-4xl' : 'text-3xl sm:text-5xl'
            )}
          >
            {draft.title}
          </h2>
          {!compact && (
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-[#637169] sm:text-sm">
              {draft.subtitle}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p
            className={cn(
              'font-serif leading-none',
              compact ? 'text-3xl sm:text-4xl' : 'text-3xl sm:text-5xl'
            )}
          >
            {progress.completed}
            <span className="text-[#9aa59e]">/{progress.total}</span>
          </p>
          <p className="mt-1 text-[0.55rem] font-bold uppercase tracking-[0.2em] text-[#6a7a71]">
            moments lived
          </p>
        </div>
      </header>

      <div
        className="relative grid gap-1.5 sm:gap-2.5"
        style={{ gridTemplateColumns: `repeat(${draft.size}, minmax(0, 1fr))` }}
      >
        {boardItems.map((item, position) => {
          if (!item) {
            return (
              <button
                type="button"
                key={`empty-${position}`}
                onClick={() => onSelectEmpty?.(position)}
                disabled={!onSelectEmpty}
                className="aspect-square rounded-lg border border-dashed border-[#c9beaa] bg-white/30 p-1 text-[0.55rem] font-semibold uppercase tracking-wider text-[#998f7e] transition hover:bg-white/60 disabled:cursor-default sm:rounded-xl sm:text-[0.65rem]"
                aria-label={`Empty Bingo position ${position + 1}`}
              >
                Add a wish
              </button>
            );
          }

          const content = (
            <>
              <span
                className={cn(
                  'absolute left-1.5 top-1.5 text-[0.5rem] font-bold uppercase tracking-[0.14em] sm:left-2 sm:top-2 sm:text-[0.58rem]',
                  item.isWildcard ? 'text-[#dce8e1]' : 'text-[#4a463b]'
                )}
              >
                {item.isWildcard ? 'wild card' : item.effort}
              </span>
              <span
                className={cn(
                  'absolute right-1.5 top-1.5 font-serif text-[0.62rem] sm:right-2 sm:top-2 sm:text-xs',
                  item.isWildcard ? 'text-[#dce8e1]' : 'text-[#514c41]'
                )}
                aria-hidden="true"
              >
                {String(position + 1).padStart(2, '0')}
              </span>
              <span
                className={cn(
                  'relative z-10 block max-w-full text-balance font-semibold leading-[1.08] tracking-[-0.02em]',
                  draft.size === 5
                    ? 'text-[clamp(0.48rem,1.45vw,0.78rem)] sm:leading-[1.12]'
                    : 'text-[clamp(0.7rem,2.1vw,1rem)]'
                )}
              >
                {item.text}
              </span>
              {item.completedAt && (
                <span className="life-bingo-stamp absolute bottom-1.5 right-1.5 z-20 flex h-[43%] w-[43%] rotate-[-8deg] items-center justify-center rounded-full border-2 border-[#0f5a3c] bg-[#f9f2e3] text-[#0f5a3c] mix-blend-multiply sm:bottom-2.5 sm:right-2.5">
                  <span className="flex h-[76%] w-[76%] flex-col items-center justify-center rounded-full border border-current">
                    <Check className="h-1/3 w-1/3 stroke-[3]" aria-hidden="true" />
                    <span className="text-[0.5rem] font-black uppercase tracking-[0.1em] sm:text-[0.58rem]">
                      Lived
                    </span>
                  </span>
                </span>
              )}
              {item.isWildcard && !item.completedAt && (
                <Sparkles
                  className="absolute bottom-2 right-2 h-3 w-3 opacity-65 sm:h-4 sm:w-4"
                  aria-hidden="true"
                />
              )}
            </>
          );

          const itemClass = cn(
            'group relative flex aspect-square items-center justify-center overflow-hidden border p-1.5 text-center transition duration-200 sm:p-3',
            TONE_CLASSES[item.tone],
            position % 4 === 0 && 'rounded-[0.65rem_1.05rem_0.8rem_0.95rem]',
            position % 4 === 1 && 'rounded-[1rem_0.7rem_1.05rem_0.75rem]',
            position % 4 === 2 && 'rounded-[0.8rem_1rem_0.65rem_1.05rem]',
            position % 4 === 3 && 'rounded-[1.05rem_0.8rem_0.95rem_0.65rem]',
            onSelectItem &&
              'hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176b4a] focus-visible:ring-offset-2'
          );

          return onSelectItem ? (
            <button
              type="button"
              key={item.id}
              onClick={() => onSelectItem(item)}
              className={itemClass}
              aria-label={`${item.text}${item.completedAt ? ', completed' : ''}`}
            >
              {content}
            </button>
          ) : (
            <div key={item.id} className={itemClass}>
              {content}
            </div>
          );
        })}
      </div>

      <footer className="relative mt-4 flex items-center justify-between gap-3 border-t border-[#d8cdb9] pt-3 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[#6f7c74] sm:mt-6 sm:pt-4 sm:text-[0.65rem]">
        <span>
          {progress.lines.length > 0
            ? `${progress.lines.length} bingo ${progress.lines.length === 1 ? 'line' : 'lines'}`
            : 'In progress'}
        </span>
        {showAttribution && <span>Significant Hobbies · Life Bingo</span>}
      </footer>
    </section>
  );
}
