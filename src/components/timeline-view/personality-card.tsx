import { computePersonality } from "~/lib/personality";
import { HOBBY_CATEGORIES } from "~/lib/hobbies";
import type { Phase } from "~/lib/types";

interface Props {
  phases: Phase[];
}

// Map category name → Tailwind bg color class for bars
const CATEGORY_COLORS: Record<string, string> = {
  Creative: "bg-pink-400",
  Music: "bg-violet-400",
  Physical: "bg-emerald-500",
  Intellectual: "bg-blue-500",
  Gaming: "bg-indigo-400",
  Outdoor: "bg-green-400",
  Culinary: "bg-amber-400",
  Collecting: "bg-orange-400",
  Making: "bg-stone-500",
  Social: "bg-teal-400",
  Other: "bg-stone-300",
};

function TraitBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 text-xs text-stone-500">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-stone-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-400"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-7 text-right text-xs text-stone-400">{pct}%</span>
    </div>
  );
}

export function PersonalityCard({ phases }: Props) {
  if (phases.length === 0) return null;

  const { archetype, categoryBreakdown, traits, narrative } =
    computePersonality(phases);

  // Only show categories with >0%
  const breakdownEntries = Object.entries(categoryBreakdown).filter(
    ([, pct]) => pct > 0,
  );

  // Get emoji for each category from HOBBY_CATEGORIES
  const categoryEmoji = Object.fromEntries(
    HOBBY_CATEGORIES.map((c) => [c.name, c.emoji]),
  );

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <span className="text-4xl leading-none">{archetype.emoji}</span>
        <div>
          <h2 className="text-lg font-bold text-stone-900">{archetype.name}</h2>
          <p className="text-sm text-stone-500 mt-0.5">{archetype.description}</p>
        </div>
      </div>

      {/* Narrative */}
      <blockquote className="border-l-2 border-emerald-400 pl-3 text-sm italic text-stone-600">
        {narrative}
      </blockquote>

      {/* Category breakdown */}
      <div>
        <h3 className="text-xs font-medium uppercase tracking-wide text-stone-400 mb-2">
          Category breakdown
        </h3>
        {/* Stacked bar */}
        <div className="flex h-3 w-full overflow-hidden rounded-full gap-px">
          {breakdownEntries.map(([cat, pct]) => (
            <div
              key={cat}
              className={`h-full ${CATEGORY_COLORS[cat] ?? "bg-stone-300"}`}
              style={{ width: `${pct}%` }}
              title={`${cat}: ${pct}%`}
            />
          ))}
        </div>
        {/* Legend */}
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          {breakdownEntries.map(([cat, pct]) => (
            <div key={cat} className="flex items-center gap-1">
              <span className="text-xs">{categoryEmoji[cat] ?? "•"}</span>
              <span className="text-xs text-stone-500">
                {cat} <span className="text-stone-400">{pct}%</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Trait indicators */}
      <div>
        <h3 className="text-xs font-medium uppercase tracking-wide text-stone-400 mb-2">
          Traits
        </h3>
        <div className="space-y-1.5">
          <TraitBar label="Breadth" value={traits.breadth} />
          <TraitBar label="Depth" value={traits.depth} />
          <TraitBar label="Consistency" value={traits.consistency} />
        </div>
      </div>
    </div>
  );
}
