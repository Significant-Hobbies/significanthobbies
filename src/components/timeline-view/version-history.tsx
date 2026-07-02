'use client';

import { useState } from 'react';

import type { Phase } from '~/lib/types';

interface Version {
  date: string;
  phases: Phase[];
}

interface Props {
  versions: Version[];
  currentPhases: Phase[];
}

export function VersionHistory({ versions, currentPhases }: Props) {
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);

  if (versions.length === 0) return null;

  const selected = selectedVersion !== null ? versions[selectedVersion] : null;
  const selectedPhases = selected?.phases ?? currentPhases;

  // Compute diff: what hobbies were added/removed between selected version and current
  const currentHobbies = new Set(
    currentPhases.flatMap((p) => p.hobbies.map((h) => h.name.toLowerCase()))
  );
  const selectedHobbies = new Set(
    selectedPhases.flatMap((p) => p.hobbies.map((h) => h.name.toLowerCase()))
  );
  const added = [...currentHobbies].filter((h) => !selectedHobbies.has(h));
  const removed = [...selectedHobbies].filter((h) => !currentHobbies.has(h));

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Timeline History</h2>
      <p className="text-sm text-muted-foreground">See how your hobby journey has evolved.</p>

      {/* Version selector */}
      <div className="flex flex-wrap gap-2">
        {versions.map((v, i) => (
          <button
            key={i}
            onClick={() => setSelectedVersion(selectedVersion === i ? null : i)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              selectedVersion === i
                ? 'bg-primary text-primary-foreground'
                : 'border border-border bg-card text-muted-foreground hover:border-lumi-500/50'
            }`}
          >
            {new Date(v.date).toLocaleDateString()}
          </button>
        ))}
      </div>

      {/* Diff display */}
      {selected && (
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Comparing {new Date(selected.date).toLocaleDateString()} &rarr; Now
          </div>
          {added.length > 0 && (
            <div>
              <span className="text-xs font-medium text-lumi-400 uppercase">Added since then:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {added.map((h) => (
                  <span
                    key={h}
                    className="rounded-full bg-lumi-500/10 border border-lumi-500/30 px-2 py-0.5 text-xs text-lumi-400 capitalize"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}
          {removed.length > 0 && (
            <div>
              <span className="text-xs font-medium text-destructive uppercase">
                Dropped since then:
              </span>
              <div className="mt-1 flex flex-wrap gap-1">
                {removed.map((h) => (
                  <span
                    key={h}
                    className="rounded-full bg-destructive/10 border border-destructive/30 px-2 py-0.5 text-xs text-destructive capitalize"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}
          {added.length === 0 && removed.length === 0 && (
            <p className="text-sm text-muted-foreground/60">
              No hobby changes between these versions.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
