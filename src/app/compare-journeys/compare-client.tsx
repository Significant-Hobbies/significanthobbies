"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { computePersonality } from "~/lib/personality";
import type { Phase } from "~/lib/types";

interface UserData {
  username: string;
  phases: Phase[];
}

interface Props {
  userA: UserData | null;
  userB: UserData | null;
  paramA: string | null;
  paramB: string | null;
}

function StatRow({
  label,
  a,
  b,
}: {
  label: string;
  a: string | number;
  b: string | number;
}) {
  return (
    <div className="grid grid-cols-3 items-center gap-2 py-2.5 border-b border-stone-100 last:border-0">
      <div className="text-sm font-semibold text-stone-800 text-center">{a}</div>
      <div className="text-xs text-stone-500 text-center">{label}</div>
      <div className="text-sm font-semibold text-stone-800 text-center">{b}</div>
    </div>
  );
}

export function CompareJourneysClient({ userA, userB, paramA, paramB }: Props) {
  const router = useRouter();
  const [inputA, setInputA] = useState(paramA ?? "");
  const [inputB, setInputB] = useState(paramB ?? "");
  const [copied, setCopied] = useState(false);

  const handleCompare = (e: React.FormEvent) => {
    e.preventDefault();
    const a = inputA.trim().replace(/^@/, "");
    const b = inputB.trim().replace(/^@/, "");
    if (a && b) {
      router.push(`/compare-journeys?a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}`);
    }
  };

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // No params — show the input form
  if (!paramA || !paramB) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-stone-900">Compare hobby journeys</h2>
          <p className="mt-2 text-stone-500 max-w-md">
            Enter two usernames to see shared hobbies, unique paths, and combined personality archetype.
          </p>
        </div>
        <form onSubmit={handleCompare} className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
          <Input
            placeholder="Your username"
            value={inputA}
            onChange={(e) => setInputA(e.target.value)}
            className="border-stone-300"
          />
          <Input
            placeholder="Friend's username"
            value={inputB}
            onChange={(e) => setInputB(e.target.value)}
            className="border-stone-300"
          />
          <Button
            type="submit"
            className="bg-emerald-600 text-white hover:bg-emerald-700 shrink-0"
            disabled={!inputA.trim() || !inputB.trim()}
          >
            Compare
          </Button>
        </form>
      </div>
    );
  }

  // Both params given — show comparison
  const notFoundA = paramA && !userA;
  const notFoundB = paramB && !userB;

  if (notFoundA || notFoundB) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center">
        <p className="text-stone-500">
          {notFoundA && <span>User <strong>@{paramA}</strong> not found. </span>}
          {notFoundB && <span>User <strong>@{paramB}</strong> not found. </span>}
        </p>
        <Button
          variant="outline"
          onClick={() => router.push("/compare-journeys")}
          className="border-stone-300 text-stone-600 hover:text-stone-900"
        >
          Try again
        </Button>
      </div>
    );
  }

  const phasesA = userA?.phases ?? [];
  const phasesB = userB?.phases ?? [];

  const hobbiesA = new Set(phasesA.flatMap((p) => p.hobbies.map((h) => h.name.toLowerCase())));
  const hobbiesB = new Set(phasesB.flatMap((p) => p.hobbies.map((h) => h.name.toLowerCase())));

  const hobbiesADisplay = phasesA.flatMap((p) => p.hobbies.map((h) => h.name));
  const hobbiesBDisplay = phasesB.flatMap((p) => p.hobbies.map((h) => h.name));

  // Deduplicate preserving original casing
  const uniqueA: string[] = [];
  const seenA = new Set<string>();
  for (const h of hobbiesADisplay) {
    const key = h.toLowerCase();
    if (!seenA.has(key)) { seenA.add(key); uniqueA.push(h); }
  }

  const uniqueB: string[] = [];
  const seenB = new Set<string>();
  for (const h of hobbiesBDisplay) {
    const key = h.toLowerCase();
    if (!seenB.has(key)) { seenB.add(key); uniqueB.push(h); }
  }

  const shared: string[] = [];
  const onlyA: string[] = [];
  const onlyB: string[] = [];

  for (const h of uniqueA) {
    if (hobbiesB.has(h.toLowerCase())) shared.push(h);
    else onlyA.push(h);
  }
  for (const h of uniqueB) {
    if (!hobbiesA.has(h.toLowerCase())) onlyB.push(h);
  }

  // Stats
  const totalPhasesA = phasesA.length;
  const totalPhasesB = phasesB.length;
  const totalHobbiesA = uniqueA.length;
  const totalHobbiesB = uniqueB.length;

  const categoriesA = new Set(phasesA.flatMap((p) => p.hobbies.map((h) => h.name))).size;
  const categoriesB = new Set(phasesB.flatMap((p) => p.hobbies.map((h) => h.name))).size;

  const personalityA = computePersonality(phasesA);
  const personalityB = computePersonality(phasesB);

  // Combined personality: merge all phases from both users
  const combinedPhases = [...phasesA, ...phasesB];
  const combinedPersonality = computePersonality(combinedPhases);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-stone-900">
          <span className="text-emerald-700">@{userA?.username}</span>
          <span className="mx-3 text-stone-400">vs</span>
          <span className="text-stone-700">@{userB?.username}</span>
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="border-stone-300 text-stone-600 hover:text-stone-900"
        >
          {copied ? "Copied!" : "Share this comparison"}
        </Button>
      </div>

      {/* Venn-style three-column layout */}
      <div>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-stone-500">
          Hobby overlap
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Only A */}
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-500 text-center">
              Only @{userA?.username}
            </p>
            {onlyA.length === 0 ? (
              <p className="text-center text-xs text-stone-400 py-4">None unique</p>
            ) : (
              <div className="flex flex-wrap gap-1.5 justify-center">
                {onlyA.map((h) => (
                  <span
                    key={h}
                    className="inline-flex rounded-full border border-stone-200 bg-white px-2.5 py-0.5 text-xs text-stone-700"
                  >
                    {h}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Shared — highlighted */}
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-emerald-700 text-center">
              Shared ({shared.length})
            </p>
            {shared.length === 0 ? (
              <p className="text-center text-xs text-emerald-600/60 py-4">No shared hobbies yet</p>
            ) : (
              <div className="flex flex-wrap gap-1.5 justify-center">
                {shared.map((h) => (
                  <span
                    key={h}
                    className="inline-flex rounded-full border border-emerald-300 bg-white px-2.5 py-1 text-xs font-medium text-emerald-800"
                  >
                    {h}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Only B */}
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-500 text-center">
              Only @{userB?.username}
            </p>
            {onlyB.length === 0 ? (
              <p className="text-center text-xs text-stone-400 py-4">None unique</p>
            ) : (
              <div className="flex flex-wrap gap-1.5 justify-center">
                {onlyB.map((h) => (
                  <span
                    key={h}
                    className="inline-flex rounded-full border border-stone-200 bg-white px-2.5 py-0.5 text-xs text-stone-700"
                  >
                    {h}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats comparison */}
      <div className="rounded-xl border border-stone-200 bg-white p-6">
        <div className="grid grid-cols-3 mb-3">
          <div className="text-sm font-semibold text-emerald-700 text-center">@{userA?.username}</div>
          <div className="text-xs text-stone-400 text-center uppercase tracking-wide">Stat</div>
          <div className="text-sm font-semibold text-stone-700 text-center">@{userB?.username}</div>
        </div>
        <StatRow label="Total hobbies" a={totalHobbiesA} b={totalHobbiesB} />
        <StatRow label="Total phases" a={totalPhasesA} b={totalPhasesB} />
        <StatRow label="Categories covered" a={categoriesA} b={categoriesB} />
        <StatRow
          label="Archetype"
          a={`${personalityA.archetype.emoji} ${personalityA.archetype.name}`}
          b={`${personalityB.archetype.emoji} ${personalityB.archetype.name}`}
        />
      </div>

      {/* Combined personality */}
      <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-stone-50 p-6">
        <h3 className="mb-1 text-sm font-medium uppercase tracking-wide text-emerald-700">
          Combined personality
        </h3>
        <p className="text-xs text-stone-500 mb-4">
          If you merged both journeys into one timeline, you would be…
        </p>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{combinedPersonality.archetype.emoji}</span>
          <div>
            <p className="text-lg font-bold text-stone-900">{combinedPersonality.archetype.name}</p>
            <p className="text-sm text-stone-600">{combinedPersonality.archetype.description}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-stone-600 italic leading-relaxed">
          {combinedPersonality.narrative}
        </p>
      </div>

      {/* Try again */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/compare-journeys")}
          className="border-stone-300 text-stone-500 hover:text-stone-800"
        >
          Compare different users
        </Button>
      </div>
    </div>
  );
}
