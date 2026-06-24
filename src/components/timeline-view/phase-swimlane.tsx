import { Badge } from '~/components/ui/badge';
import { getCategoryForHobby } from '~/lib/hobbies';
import type { Phase, TimelinePin } from '~/lib/types';

interface Props {
  phases: Phase[];
  pins?: TimelinePin[];
}

const INTENSITY_LABELS = ['', 'Trying', 'Casual', 'Regular', 'Passionate', 'Core'];

const PHASE_COLORS = [
  { border: '#10b981', bg: 'rgba(16,185,129,0.06)' }, // emerald
  { border: '#3b82f6', bg: 'rgba(59,130,246,0.06)' }, // blue
  { border: '#8b5cf6', bg: 'rgba(139,92,246,0.06)' }, // violet
  { border: '#f59e0b', bg: 'rgba(245,158,11,0.06)' }, // amber
  { border: '#ec4899', bg: 'rgba(236,72,153,0.06)' }, // pink
  { border: '#14b8a6', bg: 'rgba(20,184,166,0.06)' }, // teal
  { border: '#f97316', bg: 'rgba(249,115,22,0.06)' }, // orange
  { border: '#6366f1', bg: 'rgba(99,102,241,0.06)' }, // indigo
  { border: '#06b6d4', bg: 'rgba(6,182,212,0.06)' }, // cyan
  { border: '#e11d48', bg: 'rgba(225,29,72,0.06)' }, // rose
];

export function PhaseSwimlane({ phases, pins = [] }: Props) {
  if (!phases.length) return null;

  return (
    <div>
      {/* Mobile: vertical stack */}
      <div className="space-y-3 md:hidden">
        {phases.map((phase, index) => {
          const color = PHASE_COLORS[index % PHASE_COLORS.length]!;
          return (
            <div
              key={phase.id}
              className="rounded-xl border border-stone-200 bg-white overflow-hidden"
              style={{ borderLeft: `3px solid ${color.border}` }}
            >
              <div className="px-4 py-3" style={{ background: color.bg }}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-stone-800 text-sm">{phase.label}</h3>
                  <Badge variant="outline" className="border-stone-200 text-xs text-stone-400">
                    {phase.hobbies.length} hobbies
                  </Badge>
                </div>
                {(phase.ageStart ?? phase.yearStart) && (
                  <p className="text-xs text-stone-500 mt-0.5">
                    {phase.ageStart !== undefined
                      ? `Age ${phase.ageStart}${phase.ageEnd !== undefined ? `–${phase.ageEnd}` : '+'}`
                      : `${phase.yearStart}${phase.yearEnd ? `–${phase.yearEnd}` : '+'}`}
                  </p>
                )}
              </div>

              <div className="px-4 py-3 flex flex-wrap gap-1.5">
                {phase.hobbies.length === 0 && (
                  <p className="text-xs text-stone-400 italic">No hobbies added</p>
                )}
                {phase.hobbies.map((hobby) => {
                  const category = getCategoryForHobby(hobby.name);
                  return (
                    <span
                      key={hobby.name}
                      className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs text-stone-700"
                    >
                      {category && <span>{category.emoji}</span>}
                      {hobby.name}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: horizontal grid */}
      <div className="hidden md:block overflow-x-auto">
        <div
          className="grid gap-px bg-stone-200 rounded-xl overflow-hidden border border-stone-200"
          style={{ gridTemplateColumns: `repeat(${phases.length}, minmax(160px, 1fr))` }}
        >
          {phases.map((phase, index) => {
            const color = PHASE_COLORS[index % PHASE_COLORS.length]!;

            return (
              <div key={phase.id} className="bg-white flex flex-col">
                {/* Phase header with colored top border */}
                <div
                  className="border-b border-stone-100 px-3 py-3"
                  style={{ borderTop: `3px solid ${color.border}`, background: color.bg }}
                >
                  <h3 className="font-semibold text-stone-800 text-sm">{phase.label}</h3>
                  {(phase.ageStart ?? phase.yearStart) && (
                    <p className="text-xs text-stone-500 mt-0.5">
                      {phase.ageStart !== undefined
                        ? `Age ${phase.ageStart}${phase.ageEnd !== undefined ? `–${phase.ageEnd}` : '+'}`
                        : `${phase.yearStart}${phase.yearEnd ? `–${phase.yearEnd}` : '+'}`}
                    </p>
                  )}
                </div>

                {/* Hobbies */}
                <div className="px-3 py-3 flex-1 space-y-1.5">
                  {phase.hobbies.length === 0 && (
                    <div className="rounded-md border border-dashed border-stone-300 px-3 py-4 text-center">
                      <p className="text-xs text-stone-400 italic">No hobbies added</p>
                    </div>
                  )}
                  {phase.hobbies.map((hobby) => {
                    const category = getCategoryForHobby(hobby.name);
                    return (
                      <div
                        key={hobby.name}
                        className="group hover:bg-stone-100 rounded px-1 -mx-1 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          {category && <span className="text-xs">{category.emoji}</span>}
                          <span className="text-xs text-stone-700">{hobby.name}</span>
                        </div>
                        {hobby.intensity && (
                          <div className="mt-0.5 flex gap-0.5 ml-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div
                                key={i}
                                className={`h-1 w-3 rounded-full ${
                                  i < (hobby.intensity ?? 0) ? 'bg-emerald-500' : 'bg-stone-200'
                                }`}
                              />
                            ))}
                            <span className="ml-1 text-xs text-stone-400">
                              {INTENSITY_LABELS[hobby.intensity]}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Count badge */}
                <div className="px-3 pb-3">
                  <Badge variant="outline" className="border-stone-200 text-xs text-stone-400">
                    {phase.hobbies.length} hobbies
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {pins.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-px flex-1 bg-stone-200" />
            <span className="text-xs font-medium uppercase tracking-wide text-stone-400">Pins</span>
            <div className="h-px flex-1 bg-stone-200" />
          </div>
          <div className="flex flex-wrap gap-2">
            {pins.map((pin) => (
              <div
                key={pin.id}
                className="group inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs shadow-sm transition-all hover:border-emerald-300 hover:shadow-md"
                title={pin.relatedHobby ? `${pin.label} → ${pin.relatedHobby}` : pin.label}
              >
                <span className="text-sm">{pin.emoji}</span>
                <span className="font-medium text-stone-700">{pin.label}</span>
                <span className="text-stone-400">{pin.date}</span>
                {pin.relatedHobby && (
                  <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600">
                    {pin.relatedHobby}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
