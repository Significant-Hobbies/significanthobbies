'use client';

import type { ContractInput } from '~/lib/actions/trajectory-contract';

export type TrajectoryField = Exclude<keyof ContractInput, 'cadence'>;

export const TRAJECTORY_NODES: ReadonlyArray<{
  field: TrajectoryField;
  label: string;
  region: string;
  prompt: string;
  placeholder: string;
  position: string;
}> = [
  {
    field: 'constraintsText',
    label: 'Constraints',
    region: 'Present · reality',
    prompt: 'What must this direction respect?',
    placeholder: 'Full-time work, limited weekday energy, and a small monthly budget.',
    position: 'md:col-start-1 md:row-start-1',
  },
  {
    field: 'intentText',
    label: 'Intent',
    region: 'Present · pull',
    prompt: 'What direction matters now?',
    placeholder: 'Make and share small films consistently.',
    position: 'md:col-start-1 md:row-start-2',
  },
  {
    field: 'decisionPolicyText',
    label: 'Decision policy',
    region: 'Future · choices',
    prompt: 'What rule will guide tradeoffs?',
    placeholder: 'Prefer publishing something small over polishing something ambitious.',
    position: 'md:col-start-2 md:row-start-1',
  },
  {
    field: 'feedbackLoopText',
    label: 'Feedback loop',
    region: 'Future · learning',
    prompt: 'What will you notice, and when?',
    placeholder:
      'Each Sunday, review what I made, whether I wanted to return, and what caused friction.',
    position: 'md:col-start-2 md:row-start-2',
  },
];

interface TrajectoryMapProps {
  value: ContractInput;
  selected?: TrajectoryField;
  onSelect?: (field: TrajectoryField) => void;
  mode?: 'edit' | 'view';
}

export function TrajectoryMap({ value, selected, onSelect, mode = 'edit' }: TrajectoryMapProps) {
  const completeCount = TRAJECTORY_NODES.filter(({ field }) => value[field].trim()).length;

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-hero px-4 pb-5 pt-4 sm:px-6 sm:pb-6"
      aria-label="Trajectory map"
    >
      <div className="mb-5 flex items-center justify-between gap-4 border-b border-border pb-3">
        <div className="flex items-center gap-3 text-xs text-muted-foreground sm:gap-5">
          <span className="whitespace-nowrap">
            <span className="mr-2 inline-block size-2 rounded-full bg-primary" />
            Where you are
          </span>
          <span className="whitespace-nowrap">
            <span className="mr-2 inline-block size-2 rounded-full bg-growth" />
            How you move
          </span>
        </div>
        {mode === 'edit' && (
          <span className="text-xs tabular-nums text-subtle">{completeCount} of 4 framed</span>
        )}
      </div>

      <div className="relative grid gap-3 md:grid-cols-2 md:grid-rows-2 md:gap-x-24 md:gap-y-8 md:py-4">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden size-full md:block"
          viewBox="0 0 1000 420"
          preserveAspectRatio="none"
        >
          <defs>
            <marker
              id="trajectory-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--primary)" />
            </marker>
            <marker
              id="feedback-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-growth)" />
            </marker>
          </defs>
          <path
            d="M 390 95 C 470 95, 485 95, 565 95"
            fill="none"
            stroke="var(--primary)"
            strokeOpacity="0.72"
            strokeWidth="3"
            markerEnd="url(#trajectory-arrow)"
          />
          <path
            d="M 205 166 C 205 188, 205 210, 205 238"
            fill="none"
            stroke="var(--primary)"
            strokeOpacity="0.48"
            strokeWidth="2"
            markerEnd="url(#trajectory-arrow)"
          />
          <path
            d="M 795 166 C 795 188, 795 210, 795 238"
            fill="none"
            stroke="var(--color-growth)"
            strokeOpacity="0.72"
            strokeWidth="3"
            markerEnd="url(#feedback-arrow)"
          />
          <path
            d="M 610 335 C 515 408, 308 408, 220 342"
            fill="none"
            stroke="var(--color-growth)"
            strokeOpacity="0.6"
            strokeWidth="2"
            strokeDasharray="7 8"
            markerEnd="url(#feedback-arrow)"
          />
        </svg>

        {TRAJECTORY_NODES.map((node, index) => {
          const content = value[node.field].trim();
          const isSelected = selected === node.field;
          const nodeClass = `${node.position} relative z-10 min-h-36 rounded-xl border p-4 text-left transition-[border-color,background-color,transform,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-hero ${index < TRAJECTORY_NODES.length - 1 ? "after:absolute after:-bottom-3 after:left-6 after:h-3 after:border-l after:border-primary/45 after:content-[''] md:after:hidden" : ''} ${
            isSelected
              ? 'border-primary bg-primary/10 shadow-[0_8px_28px_oklch(0_0_0/0.24)] md:-translate-y-1'
              : content
                ? 'border-border bg-card hover:border-primary/45 hover:bg-accent/60'
                : 'border-dashed border-border bg-background/60 hover:border-primary/50'
          }`;
          const inner = (
            <>
              <div className="flex items-start justify-between gap-3">
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-subtle">
                  {node.region}
                </span>
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    content
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border text-subtle'
                  }`}
                  aria-hidden="true"
                >
                  {content ? '✓' : index + 1}
                </span>
              </div>
              <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
                {node.label}
              </h3>
              <p
                className={`mt-1.5 line-clamp-3 text-sm leading-relaxed ${content ? 'text-muted-foreground' : 'text-subtle'}`}
              >
                {content || node.prompt}
              </p>
              {mode === 'edit' && (
                <span className="mt-3 inline-block text-xs font-medium text-primary">
                  {content ? 'Edit this part' : 'Frame this part'}
                </span>
              )}
            </>
          );
          return mode === 'edit' ? (
            <button
              key={node.field}
              type="button"
              className={nodeClass}
              aria-label={`${content ? 'Edit' : 'Frame'} ${node.label.toLowerCase()}`}
              aria-pressed={isSelected}
              onClick={() => onSelect?.(node.field)}
            >
              {inner}
            </button>
          ) : (
            <article key={node.field} className={nodeClass}>
              {inner}
            </article>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-center gap-2 text-xs font-medium text-[#28733d] md:mt-1">
        <span className="h-px w-8 border-t border-dashed border-growth/60" />
        What you learn changes where you go next
        <span className="h-px w-8 border-t border-dashed border-growth/60" />
      </div>
    </div>
  );
}
