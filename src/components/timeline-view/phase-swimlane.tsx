import { Badge } from '~/components/ui/badge';
import { getCategoryForHobby } from '~/lib/hobbies';
import type { Phase, TimelinePin } from '~/lib/types';

interface Props {
  phases: Phase[];
  pins?: TimelinePin[];
}

const INTENSITY_LABELS = ['', 'Trying', 'Casual', 'Regular', 'Passionate', 'Core'];

const PHASE_COLORS = [
  { border: 'oklch(0.72 0.13 150)', bg: 'oklch(0.72 0.13 150 / 0.06)' }, // sage
  { border: 'oklch(0.70 0.13 250)', bg: 'oklch(0.70 0.13 250 / 0.06)' }, // blue
  { border: 'oklch(0.65 0.15 290)', bg: 'oklch(0.65 0.15 290 / 0.06)' }, // violet
  { border: 'oklch(0.82 0.13 88)', bg: 'oklch(0.82 0.13 88 / 0.06)' }, // gold
  { border: 'oklch(0.70 0.15 350)', bg: 'oklch(0.70 0.15 350 / 0.06)' }, // pink
  { border: 'oklch(0.72 0.11 200)', bg: 'oklch(0.72 0.11 200 / 0.06)' }, // teal
  { border: 'oklch(0.72 0.16 55)', bg: 'oklch(0.72 0.16 55 / 0.06)' }, // orange
  { border: 'oklch(0.65 0.14 270)', bg: 'oklch(0.65 0.14 270 / 0.06)' }, // indigo
  { border: 'oklch(0.72 0.12 210)', bg: 'oklch(0.72 0.12 210 / 0.06)' }, // cyan
  { border: 'oklch(0.65 0.18 15)', bg: 'oklch(0.65 0.18 15 / 0.06)' }, // rose
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
              className="rounded-xl border border-border bg-card overflow-hidden shadow-soft"
              style={{
                borderLeft: `1px solid ${color.border}`,
                ['--phase-color' as string]: color.border,
              }}
            >
              <div className="px-4 py-3" style={{ background: color.bg }}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground text-sm">{phase.label}</h3>
                  <Badge variant="outline" className="border-border text-xs text-muted-foreground">
                    {phase.hobbies.length} hobbies
                  </Badge>
                </div>
                {(phase.ageStart ?? phase.yearStart) && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {phase.ageStart !== undefined
                      ? `Age ${phase.ageStart}${phase.ageEnd !== undefined ? `–${phase.ageEnd}` : '+'}`
                      : `${phase.yearStart}${phase.yearEnd ? `–${phase.yearEnd}` : '+'}`}
                  </p>
                )}
              </div>

              <div className="px-4 py-3 flex flex-wrap gap-1.5">
                {phase.hobbies.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">No hobbies added</p>
                )}
                {phase.hobbies.map((hobby) => {
                  const category = getCategoryForHobby(hobby.name);
                  return (
                    <span
                      key={hobby.name}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-card/40 px-2.5 py-1 text-xs text-foreground"
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
          className="grid gap-px bg-foreground/10 rounded-xl overflow-hidden border border-border shadow-soft"
          style={{ gridTemplateColumns: `repeat(${phases.length}, minmax(160px, 1fr))` }}
        >
          {phases.map((phase, index) => {
            const color = PHASE_COLORS[index % PHASE_COLORS.length]!;

            return (
              <div key={phase.id} className="bg-card flex flex-col">
                {/* Phase header with colored top border */}
                <div
                  className="border-b border-border px-3 py-3"
                  style={{ borderTop: `1px solid ${color.border}`, background: color.bg }}
                >
                  <h3 className="font-semibold text-foreground text-sm">{phase.label}</h3>
                  {(phase.ageStart ?? phase.yearStart) && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {phase.ageStart !== undefined
                        ? `Age ${phase.ageStart}${phase.ageEnd !== undefined ? `–${phase.ageEnd}` : '+'}`
                        : `${phase.yearStart}${phase.yearEnd ? `–${phase.yearEnd}` : '+'}`}
                    </p>
                  )}
                </div>

                {/* Hobbies */}
                <div className="px-3 py-3 flex-1 space-y-1.5">
                  {phase.hobbies.length === 0 && (
                    <div className="rounded-md border border-dashed border-border px-3 py-4 text-center">
                      <p className="text-xs text-muted-foreground italic">No hobbies added</p>
                    </div>
                  )}
                  {phase.hobbies.map((hobby) => {
                    const category = getCategoryForHobby(hobby.name);
                    return (
                      <div
                        key={hobby.name}
                        className="group hover:bg-foreground/5 rounded px-1 -mx-1 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          {category && <span className="text-xs">{category.emoji}</span>}
                          <span className="text-xs text-foreground">{hobby.name}</span>
                        </div>
                        {hobby.intensity && (
                          <div className="mt-0.5 flex gap-0.5 ml-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div
                                key={i}
                                className={`h-1 w-3 rounded-full ${
                                  i < (hobby.intensity ?? 0) ? 'bg-growth' : 'bg-foreground/10'
                                }`}
                              />
                            ))}
                            <span className="ml-1 text-xs text-muted-foreground">
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
                  <Badge variant="outline" className="border-border text-xs text-muted-foreground">
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
            <div className="h-px flex-1 bg-foreground/10" />
            <span className="text-sm font-semibold text-muted-foreground">Pins</span>
            <div className="h-px flex-1 bg-foreground/10" />
          </div>
          <div className="flex flex-wrap gap-2">
            {pins.map((pin) => (
              <div
                key={pin.id}
                className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs shadow-sm transition-all hover:border-foreground/30 hover:shadow-md"
                title={pin.relatedHobby ? `${pin.label} → ${pin.relatedHobby}` : pin.label}
              >
                <span className="text-sm">{pin.emoji}</span>
                <span className="font-medium text-foreground">{pin.label}</span>
                <span className="text-muted-foreground">{pin.date}</span>
                {pin.relatedHobby && (
                  <span className="rounded-full bg-growth/15 px-1.5 py-0.5 text-[10px] font-medium text-growth">
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
