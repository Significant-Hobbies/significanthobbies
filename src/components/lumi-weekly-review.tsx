'use client';

import { RefreshCw } from 'lucide-react';
import { useState, useTransition } from 'react';

import { Lumi } from '~/components/lumi';
import type { CoachReflection } from '~/lib/lumi-coach';

type Props = {
  initialReflection: CoachReflection | null;
};

export function LumiWeeklyReview({ initialReflection }: Props) {
  const [reflection, setReflection] = useState<CoachReflection | null>(initialReflection);
  const [isPending, startTransition] = useTransition();

  function handleRefresh() {
    startTransition(async () => {
      const { getWeeklyReflection } = await import('~/lib/lumi-coach');
      const next = await getWeeklyReflection();
      if (next) setReflection(next);
    });
  }

  if (!reflection) return null;

  const isAI = reflection.source === 'ai';

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
              <h3 className="font-bold text-stone-900">Weekly check-in with Lumi</h3>
              <p className="text-xs text-stone-500">
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
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-600 hover:border-[#f0a090] hover:text-[#c94420] transition-colors disabled:opacity-50"
            aria-label="Refresh reflection"
          >
            <RefreshCw className={`h-3 w-3 ${isPending ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Greeting */}
        <p className="text-lg font-semibold text-stone-900 mb-2">{reflection.greeting}</p>

        {/* Reflection */}
        <p className="text-sm text-stone-700 leading-relaxed mb-4">{reflection.reflection}</p>

        {/* Questions */}
        <div className="space-y-2 mb-4">
          {reflection.questions.map((q, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-[#e05533] mt-0.5 shrink-0">→</span>
              <p className="text-sm text-stone-700 leading-relaxed">{q}</p>
            </div>
          ))}
        </div>

        {/* Suggestion */}
        <div className="rounded-xl bg-white/70 border border-[#f0a090]/50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#c94420] mb-1">
            This week
          </p>
          <p className="text-sm text-stone-700">{reflection.suggestion}</p>
        </div>
      </div>
    </div>
  );
}
