"use client";

import { useState } from "react";

import type { Phase } from "~/lib/types";

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
    currentPhases.flatMap((p) => p.hobbies.map((h) => h.name.toLowerCase())),
  );
  const selectedHobbies = new Set(
    selectedPhases.flatMap((p) => p.hobbies.map((h) => h.name.toLowerCase())),
  );
  const added = [...currentHobbies].filter((h) => !selectedHobbies.has(h));
  const removed = [...selectedHobbies].filter((h) => !currentHobbies.has(h));

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
      <h2 className="text-lg font-semibold text-stone-800">Timeline History</h2>
      <p className="text-sm text-stone-500">See how your hobby journey has evolved.</p>

      {/* Version selector */}
      <div className="flex flex-wrap gap-2">
        {versions.map((v, i) => (
          <button
            key={i}
            onClick={() => setSelectedVersion(selectedVersion === i ? null : i)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              selectedVersion === i
                ? "bg-emerald-600 text-white"
                : "border border-stone-200 bg-white text-stone-600 hover:border-emerald-400"
            }`}
          >
            {new Date(v.date).toLocaleDateString()}
          </button>
        ))}
      </div>

      {/* Diff display */}
      {selected && (
        <div className="space-y-3">
          <div className="text-sm text-stone-500">
            Comparing {new Date(selected.date).toLocaleDateString()} &rarr; Now
          </div>
          {added.length > 0 && (
            <div>
              <span className="text-xs font-medium text-emerald-600 uppercase">
                Added since then:
              </span>
              <div className="mt-1 flex flex-wrap gap-1">
                {added.map((h) => (
                  <span
                    key={h}
                    className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs text-emerald-700 capitalize"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}
          {removed.length > 0 && (
            <div>
              <span className="text-xs font-medium text-red-500 uppercase">
                Dropped since then:
              </span>
              <div className="mt-1 flex flex-wrap gap-1">
                {removed.map((h) => (
                  <span
                    key={h}
                    className="rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-xs text-red-600 capitalize"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}
          {added.length === 0 && removed.length === 0 && (
            <p className="text-sm text-stone-400">
              No hobby changes between these versions.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
