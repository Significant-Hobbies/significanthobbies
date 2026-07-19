'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Pencil, Plus } from 'lucide-react';

import { Button } from '~/components/ui/button';
import {
  BUCKET_EMOJI,
  BUCKET_LABELS,
  bucketHasEnoughPointsForChart,
  extractChartSeries,
  formatEraOneLine,
  formatMonthLabel,
  summarizeEra,
  type TrajectoryBucket,
  type TrajectoryEntryRow,
} from '~/lib/trajectory';
import type { TrajectoryEraWithEntries } from '~/lib/actions/trajectory';

import { IdealEditor } from './ideal-editor';
import { MonthEntryForm } from './month-entry-form';
import { TrajectoryChart } from './trajectory-chart';

interface Props {
  bucket: TrajectoryBucket;
  eras: TrajectoryEraWithEntries[];
}

const EMPTY_STATE_PROMPTS: Record<TrajectoryBucket, string> = {
  health: 'What does a healthy month actually look like for you?',
  finance: 'What does financial enough look like — not someday, this year?',
  knowledge: 'What would you know deeply if this year went well?',
  relationships: 'Who do you want to feel closer to a year from now?',
};

/**
 * One bucket's section on /trajectory. Renders:
 *   1. Current ideal — the committed finish line, in serif italic
 *   2. Trajectory chart (only if the active era has ≥3 numeric data points)
 *   3. The active era's entry history — journal-like, most recent first
 *   4. The era list below — a timeline of chapters, active expanded,
 *      completed/abandoned as one-line summaries with equal visual weight
 *      (no red, no green — the design rejects gamification).
 */
export function BucketSection({ bucket, eras }: Props) {
  const [editingIdeal, setEditingIdeal] = useState(false);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [expandedEraIds, setExpandedEraIds] = useState<Set<string>>(new Set());

  const label = BUCKET_LABELS[bucket];
  const emoji = BUCKET_EMOJI[bucket];

  const activeEra = eras.find((e) => e.status === 'active') ?? null;
  const closedEras = eras.filter((e) => e.status !== 'active');

  const allEntries: TrajectoryEntryRow[] = eras.flatMap((e) => e.entries);

  const toggleEra = (id: string) => {
    setExpandedEraIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section className="scroll-reveal rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-7">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="text-base" aria-hidden>
              {emoji}
            </span>
            <h2 className="font-serif text-lg font-medium tracking-tight text-foreground">
              {label}
            </h2>
          </div>
          {activeEra ? (
            <p className="font-serif text-[15px] italic leading-relaxed text-foreground/85">
              {activeEra.idealText}
            </p>
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {EMPTY_STATE_PROMPTS[bucket]}{' '}
              <button
                type="button"
                onClick={() => setEditingIdeal(true)}
                className="text-foreground/90 underline decoration-primary/40 underline-offset-4 hover:decoration-primary transition-colors"
              >
                Set an ideal →
              </button>
            </p>
          )}
        </div>
        {activeEra && (
          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowEntryForm((v) => !v)}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
              {showEntryForm ? 'Close' : 'Reflect'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditingIdeal(true)}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
              aria-label={`Edit ${label} ideal`}
            >
              <Pencil className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only">Edit</span>
            </Button>
          </div>
        )}
      </header>

      {editingIdeal && (
        <div className="animate-fade-in-up mt-5">
          <IdealEditor
            bucket={bucket}
            currentIdeal={activeEra?.idealText ?? null}
            hasActiveEra={activeEra !== null}
            onClose={() => setEditingIdeal(false)}
          />
        </div>
      )}

      {activeEra && showEntryForm && (
        <div className="animate-fade-in-up mt-5">
          <MonthEntryForm
            eraId={activeEra.id}
            existingEntry={activeEra.entries.find((e) => e.eraId === activeEra.id && e) ?? null}
            onDone={() => setShowEntryForm(false)}
          />
        </div>
      )}

      {activeEra && <ActiveEraDetail era={activeEra} allEntries={allEntries} />}

      {closedEras.length > 0 && (
        <EraList
          closedEras={closedEras}
          allEntries={allEntries}
          expandedEraIds={expandedEraIds}
          onToggleEra={toggleEra}
        />
      )}
    </section>
  );
}

function ActiveEraDetail({
  era,
  allEntries,
}: {
  era: TrajectoryEraWithEntries;
  allEntries: TrajectoryEntryRow[];
}) {
  const hasChart = bucketHasEnoughPointsForChart(allEntries, era.id);
  const series = hasChart ? extractChartSeries(allEntries, era.id) : [];
  const entriesDesc = [...era.entries].sort((a, b) => b.monthKey.localeCompare(a.monthKey));

  return (
    <div className="mt-6 space-y-5 border-t border-border/60 pt-5">
      {hasChart && series.length > 0 && (
        <div>
          <p className="mb-3 font-serif text-xs italic text-muted-foreground">
            The gap to your ideal is the score.
          </p>
          <TrajectoryChart series={series} />
        </div>
      )}

      {entriesDesc.length === 0 ? (
        <p className="text-sm italic text-muted-foreground/80">
          No reflections yet. Come back at month-end to write your first.
        </p>
      ) : (
        <ul className="space-y-4">
          {entriesDesc.map((entry) => (
            <li key={entry.id} className="space-y-1.5">
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-sm font-medium text-foreground/90">
                  {formatMonthLabel(entry.monthKey)}
                </span>
                {entry.numbers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {entry.numbers.map((n, i) => (
                      <span
                        key={`${entry.id}-${i}`}
                        className="rounded-full border border-border/60 bg-background/40 px-2 py-0.5 text-[11px] tabular-nums text-muted-foreground"
                      >
                        {n.label} <span className="font-medium text-foreground/80">{n.value}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {entry.reflection && (
                <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                  {entry.reflection}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EraList({
  closedEras,
  allEntries,
  expandedEraIds,
  onToggleEra,
}: {
  closedEras: TrajectoryEraWithEntries[];
  allEntries: TrajectoryEntryRow[];
  expandedEraIds: Set<string>;
  onToggleEra: (id: string) => void;
}) {
  return (
    <div className="mt-6 border-t border-border/60 pt-5">
      <h3 className="font-serif text-sm font-medium text-foreground/80">Past ideals</h3>
      <ul className="mt-3 space-y-0.5">
        {closedEras.map((era) => {
          const summary = summarizeEra(era, allEntries);
          const oneLine = formatEraOneLine(summary);
          const isExpanded = expandedEraIds.has(era.id);
          return (
            <li key={era.id}>
              <button
                type="button"
                onClick={() => onToggleEra(era.id)}
                className="flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-sm text-foreground/85 hover:bg-background/50 transition-colors"
              >
                <span className="mt-0.5 shrink-0 text-muted-foreground/70">
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </span>
                <span className="flex-1 leading-relaxed">{oneLine}</span>
              </button>
              {isExpanded && <ExpandedEraDetail era={era} />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ExpandedEraDetail({ era }: { era: TrajectoryEraWithEntries }) {
  const entriesDesc = [...era.entries].sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  return (
    <div className="ml-5 mt-1 mb-3 space-y-3 rounded-lg bg-background/30 p-3.5">
      <p className="font-serif text-[13px] italic leading-relaxed text-muted-foreground">
        {era.idealText}
      </p>
      {entriesDesc.length === 0 ? (
        <p className="text-xs text-muted-foreground/70">No reflections recorded.</p>
      ) : (
        <ul className="space-y-2.5">
          {entriesDesc.map((entry) => (
            <li key={entry.id} className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-xs font-medium text-foreground/80">
                  {formatMonthLabel(entry.monthKey)}
                </span>
                {entry.numbers.length > 0 && (
                  <span className="text-[11px] tabular-nums text-muted-foreground/80">
                    {entry.numbers.map((n) => `${n.label} ${n.value}`).join(' · ')}
                  </span>
                )}
              </div>
              {entry.reflection && (
                <p className="text-xs leading-relaxed text-foreground/75 whitespace-pre-wrap">
                  {entry.reflection}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
