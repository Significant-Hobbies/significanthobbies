'use client';

import { Check, Flame, RefreshCw } from 'lucide-react';
import { useState, useTransition } from 'react';

import { Lumi } from '~/components/lumi';
import type { CoachReflection } from '~/lib/lumi-coach';
import { useReviewStreak } from '~/hooks/use-review-streak';

type Props = {
  initialReflection: CoachReflection | null;
};

export function LumiWeeklyReview({ initialReflection }: Props) {
  const [reflection, setReflection] = useState<CoachReflection | null>(initialReflection);
  const [isPending, startTransition] = useTransition();
  const [justMarked, setJustMarked] = useState(false);
  const { streak, due, daysSince, hydrated, markReviewDone } = useReviewStreak();

  function handleRefresh() {
    startTransition(async () => {
      const { getWeeklyReflection } = await import('~/lib/lumi-coach');
      const next = await getWeeklyReflection();
      if (next) setReflection(next);
    });
  }

  function handleMarkDone() {
    markReviewDone();
    setJustMarked(true);
  }

  if (!reflection) return null;

  const isAI = reflection.source === 'ai';
  const showStreak = hydrated && streak > 0;
  const showDueBadge = hydrated && due && !justMarked;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#f0a090] bg-gradient-to-br from-[#fff6f2] to-white p-6 shadow-sm">
      {/* Decorative Lumi */}
      <div className="absolute -right-4 -top-2 opacity-10 select-none">
        <Lumi size={120} />
      </div>

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Lumi size={40} glow float />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-foreground">Weekly check-in with Lumi</h3>
                {showStreak && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-600">
                    <Flame className="h-3 w-3" />
                    {streak} week{streak !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {isAI ? 'AI-powered reflection' : 'Reflection'}
                {' · '}
                {new Date(reflection.generatedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:border-[#f0a090] hover:text-[#c94420] transition-colors disabled:opacity-50"
            aria-label="Refresh reflection"
          >
            <RefreshCw className={`h-3 w-3 ${isPending ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Due badge */}
        {showDueBadge && (
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#e05533] px-3 py-1 text-xs font-semibold text-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-card opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-card" />
            </span>
            {daysSince === null
              ? "Your first check-in — let's start"
              : `Review due · last checked in ${daysSince}d ago`}
          </div>
        )}

        {/* Greeting */}
        <p className="text-lg font-semibold text-foreground mb-2">{reflection.greeting}</p>

        {/* Reflection */}
        <p className="text-sm text-foreground leading-relaxed mb-4">{reflection.reflection}</p>

        {/* Questions */}
        <div className="space-y-2 mb-4">
          {reflection.questions.map((q, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-[#e05533] mt-0.5 shrink-0">→</span>
              <p className="text-sm text-foreground leading-relaxed">{q}</p>
            </div>
          ))}
        </div>

        {/* Suggestion */}
        <div className="rounded-xl bg-card/70 border border-[#f0a090]/50 px-4 py-3 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#c94420] mb-1">
            This week
          </p>
          <p className="text-sm text-foreground">{reflection.suggestion}</p>
        </div>

        {/* Mark as done — the ritual action */}
        {hydrated && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleMarkDone}
              disabled={justMarked}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                justMarked
                  ? 'bg-foreground/10 text-foreground cursor-default'
                  : 'bg-[#e05533] text-foreground hover:bg-[#c94420]'
              }`}
            >
              <Check className="h-4 w-4" />
              {justMarked
                ? streak > 1
                  ? `Done — ${streak} week streak!`
                  : 'Done — see you next week!'
                : "I've reviewed this week"}
            </button>
            {justMarked && streak > 1 && (
              <span className="text-xs text-muted-foreground">
                Come back in 7 days to keep your streak alive.
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
