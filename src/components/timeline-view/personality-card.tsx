import { HOBBY_CATEGORIES } from '~/lib/hobbies';
import { computePersonality } from '~/lib/personality';
import type { Phase } from '~/lib/types';

interface Props {
  phases: Phase[];
}

// Map category name → Tailwind bg color class for bars
const CATEGORY_COLORS: Record<string, string> = {
  Creative: 'bg-pink-400',
  Music: 'bg-violet-400',
  Physical: 'bg-growth',
  Intellectual: 'bg-blue-500',
  Gaming: 'bg-indigo-400',
  Outdoor: 'bg-green-400',
  Culinary: 'bg-amber-400',
  Collecting: 'bg-orange-400',
  Making: 'bg-stone-400',
  Social: 'bg-teal-400',
  Other: 'bg-foreground/15',
};

function TraitBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 text-xs text-muted-foreground">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-foreground/5 overflow-hidden">
        <div className="h-full rounded-full bg-growth" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-7 text-right text-xs text-muted-foreground">{pct}%</span>
    </div>
  );
}

export function PersonalityCard({ phases }: Props) {
  if (phases.length === 0) return null;

  const { archetype, categoryBreakdown, traits, narrative } = computePersonality(phases);

  // Only show categories with >0%
  const breakdownEntries = Object.entries(categoryBreakdown).filter(([, pct]) => pct > 0);

  // Get emoji for each category from HOBBY_CATEGORIES
  const categoryEmoji = Object.fromEntries(HOBBY_CATEGORIES.map((c) => [c.name, c.emoji]));

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <span className="text-4xl leading-none">{archetype.emoji}</span>
        <div>
          <h2 className="text-lg font-bold text-foreground">{archetype.name}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{archetype.description}</p>
        </div>
      </div>

      {/* Narrative */}
      <blockquote className="border-l-2 border-foreground/40 pl-3 text-sm italic text-muted-foreground">
        {narrative}
      </blockquote>

      {/* Category breakdown */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-2">Category breakdown</h3>
        {/* Stacked bar */}
        <div className="flex h-3 w-full overflow-hidden rounded-full gap-px">
          {breakdownEntries.map(([cat, pct]) => (
            <div
              key={cat}
              className={`h-full ${CATEGORY_COLORS[cat] ?? 'bg-foreground/15'}`}
              style={{ width: `${pct}%` }}
              title={`${cat}: ${pct}%`}
            />
          ))}
        </div>
        {/* Legend */}
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          {breakdownEntries.map(([cat, pct]) => (
            <div key={cat} className="flex items-center gap-1">
              <span className="text-xs">{categoryEmoji[cat] ?? '•'}</span>
              <span className="text-xs text-muted-foreground">
                {cat} <span className="text-muted-foreground">{pct}%</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Trait indicators */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-2">Traits</h3>
        <div className="space-y-1.5">
          <TraitBar label="Breadth" value={traits.breadth} />
          <TraitBar label="Depth" value={traits.depth} />
          <TraitBar label="Consistency" value={traits.consistency} />
        </div>
      </div>
    </div>
  );
}
