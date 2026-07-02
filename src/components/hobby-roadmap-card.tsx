'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import type { HobbyRoadmap, RoadmapStep } from '~/lib/hobby-roadmap';

type SavedProgress = {
  completed: Record<RoadmapStep['id'], boolean>;
  notes: string;
  updatedAt: string;
};

const EMPTY_PROGRESS: SavedProgress = {
  completed: { today: false, week: false, month: false, quarter: false },
  notes: '',
  updatedAt: '',
};

function storageKey(hobby: string) {
  return `sh-roadmap:${hobby.toLowerCase()}`;
}

function readProgress(hobby: string): SavedProgress {
  if (typeof window === 'undefined') return EMPTY_PROGRESS;
  try {
    const raw = localStorage.getItem(storageKey(hobby));
    if (!raw) return EMPTY_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<SavedProgress>;
    return {
      completed: { ...EMPTY_PROGRESS.completed, ...(parsed.completed ?? {}) },
      notes: parsed.notes ?? '',
      updatedAt: parsed.updatedAt ?? '',
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

function writeProgress(hobby: string, progress: SavedProgress) {
  try {
    localStorage.setItem(storageKey(hobby), JSON.stringify(progress));
  } catch {
    // localStorage can fail (quota, private mode); silently ignore — UI still works in-session.
  }
}

export function HobbyRoadmapCard({ roadmap }: { roadmap: HobbyRoadmap }) {
  const [progress, setProgress] = useState<SavedProgress>(EMPTY_PROGRESS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProgress(readProgress(roadmap.hobby));
    setHydrated(true);
  }, [roadmap.hobby]);

  function toggleStep(stepId: RoadmapStep['id']) {
    const next: SavedProgress = {
      ...progress,
      completed: { ...progress.completed, [stepId]: !progress.completed[stepId] },
      updatedAt: new Date().toISOString(),
    };
    setProgress(next);
    writeProgress(roadmap.hobby, next);
  }

  function updateNotes(notes: string) {
    const next: SavedProgress = {
      ...progress,
      notes,
      updatedAt: new Date().toISOString(),
    };
    setProgress(next);
    writeProgress(roadmap.hobby, next);
  }

  const doneCount = Object.values(progress.completed).filter(Boolean).length;
  const total = roadmap.steps.length;
  const allDone = doneCount === total;

  return (
    <div className="rounded-2xl border border-lumi-500/30 bg-lumi-500/10/40 p-5">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Your {roadmap.hobby.toLowerCase()} roadmap
          </h2>
          <p className="text-xs text-muted-foreground">
            A concrete path from today to three months in. Check off as you go — progress saves on
            this device.
          </p>
        </div>
        <span className="text-xs font-medium text-lumi-400">
          {hydrated ? `${doneCount}/${total} done` : `${total} steps`}
        </span>
      </div>

      <ol className="space-y-3">
        {roadmap.steps.map((step, i) => {
          const isDone = progress.completed[step.id];
          return (
            <li key={step.id}>
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border bg-card p-4 transition-colors ${
                  isDone
                    ? 'border-lumi-500/40 bg-lumi-500/10'
                    : 'border-border hover:border-lumi-500/40'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => toggleStep(step.id)}
                  className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-emerald-600"
                  aria-label={`Mark "${step.goal}" as done`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-lumi-400">
                      {step.horizon}
                    </span>
                    <span className="text-xs text-muted-foreground/60">Step {i + 1}</span>
                  </div>
                  <p
                    className={`mt-1 text-sm font-semibold ${
                      isDone ? 'text-muted-foreground line-through' : 'text-foreground'
                    }`}
                  >
                    {step.goal}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{step.action}</p>
                </div>
              </label>
            </li>
          );
        })}
      </ol>

      <div className="mt-4">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Progress notes
        </label>
        <textarea
          value={progress.notes}
          onChange={(e) => updateNotes(e.target.value)}
          rows={3}
          placeholder="What worked, what didn't, what to try next…"
          className="mt-1.5 w-full resize-none rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-lumi-500/50"
        />
        {hydrated && progress.updatedAt && (
          <p className="mt-1 text-[11px] text-muted-foreground/60">
            Last updated {new Date(progress.updatedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link
          href="/timeline/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-lumi-300"
        >
          {allDone ? 'Log it in a timeline →' : 'Track this in a timeline →'}
        </Link>
        <p className="text-xs text-muted-foreground">
          {allDone
            ? "You've worked through the whole roadmap. Time to make it part of your story."
            : 'Notes and check-offs stay on this device until you save a timeline.'}
        </p>
      </div>
    </div>
  );
}
