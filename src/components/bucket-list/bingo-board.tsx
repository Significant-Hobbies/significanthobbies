"use client";

import { Check, Sparkles } from "lucide-react";
import { getBingoProgress, type BucketListDraft, type BucketListItem } from "~/lib/life-bingo";
import { cn } from "~/lib/utils";

const TONE_CLASSES: Record<BucketListItem["tone"], string> = {
  moss: "border-[#a9b99b] bg-[#dfe8d7] text-[#263529]",
  clay: "border-[#caa38f] bg-[#ecd6c8] text-[#4a2f28]",
  marigold: "border-[#d5af55] bg-[#f4df9a] text-[#493815]",
  sky: "border-[#9eb8bd] bg-[#d9e7e7] text-[#20383d]",
  rose: "border-[#c4a0a0] bg-[#ead6d5] text-[#482d31]",
  ink: "border-[#1e3029] bg-[#1e3029] text-[#fffaf0]",
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
  const boardItems = Array.from({ length: draft.size * draft.size }, (_, position) =>
    draft.items.find((item) => item.boardPosition === position) ?? null,
  );

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-[#d9cfbb] bg-[#f8f1e4] p-4 text-[#1e3029] shadow-[0_24px_70px_rgba(67,54,36,0.14)] sm:p-7",
        className,
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

      <header className={cn("relative flex items-end justify-between gap-4", compact ? "mb-3" : "mb-5 sm:mb-7")}>
        <div className="min-w-0">
          <p className="mb-1 text-[0.6rem] font-bold uppercase tracking-[0.28em] text-[#597064] sm:text-[0.68rem]">
            A life less ordinary
          </p>
          <h2 className={cn("font-serif font-semibold leading-[0.95] tracking-[-0.035em]", compact ? "text-xl" : "text-3xl sm:text-5xl")}>
            {draft.title}
          </h2>
          {!compact && <p className="mt-2 max-w-xl text-xs leading-relaxed text-[#637169] sm:text-sm">{draft.subtitle}</p>}
        </div>
        <div className="shrink-0 text-right">
          <p className={cn("font-serif leading-none", compact ? "text-2xl" : "text-3xl sm:text-5xl")}>
            {progress.completed}<span className="text-[#9aa59e]">/{progress.total}</span>
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
              <span className="absolute left-1.5 top-1.5 text-[0.5rem] font-bold uppercase tracking-[0.14em] opacity-55 sm:left-2 sm:top-2 sm:text-[0.58rem]">
                {item.isWildcard ? "wild card" : item.effort}
              </span>
              <span
                className={cn(
                  "relative z-10 block max-w-full text-balance font-semibold leading-[1.08] tracking-[-0.02em]",
                  draft.size === 5
                    ? "text-[clamp(0.48rem,1.45vw,0.78rem)] sm:leading-[1.12]"
                    : "text-[clamp(0.7rem,2.1vw,1rem)]",
                )}
              >
                {item.text}
              </span>
              {item.completedAt && (
                <span className="absolute inset-1.5 z-20 flex rotate-[-7deg] items-center justify-center rounded-full border-2 border-[#176b4a]/80 text-[#176b4a] mix-blend-multiply sm:inset-3">
                  <span className="flex h-[54%] w-[54%] items-center justify-center rounded-full border border-current bg-[#f8f1e4]/45">
                    <Check className="h-1/2 w-1/2 stroke-[3]" aria-hidden="true" />
                  </span>
                </span>
              )}
              {item.isWildcard && !item.completedAt && (
                <Sparkles className="absolute bottom-2 right-2 h-3 w-3 opacity-65 sm:h-4 sm:w-4" aria-hidden="true" />
              )}
            </>
          );

          const itemClass = cn(
            "group relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border p-1.5 text-center transition duration-200 sm:rounded-xl sm:p-3",
            TONE_CLASSES[item.tone],
            onSelectItem && "hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176b4a] focus-visible:ring-offset-2",
            item.completedAt && "saturate-[0.72]",
          );

          return onSelectItem ? (
            <button
              type="button"
              key={item.id}
              onClick={() => onSelectItem(item)}
              className={itemClass}
              aria-label={`${item.text}${item.completedAt ? ", completed" : ""}`}
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
        <span>{progress.lines.length > 0 ? `${progress.lines.length} bingo ${progress.lines.length === 1 ? "line" : "lines"}` : "In progress"}</span>
        {showAttribution && <span>Significant Hobbies · Life Bingo</span>}
      </footer>
    </section>
  );
}
