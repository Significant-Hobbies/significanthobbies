'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { FadeIn, SpotlightCard, StaggerContainer, StaggerItem } from '~/components/aceternity';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { computePersonality } from '~/lib/personality';
import type { Phase } from '~/lib/types';

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

function StatRow({ label, a, b }: { label: string; a: string | number; b: string | number }) {
  return (
    <div className="grid grid-cols-3 items-center gap-2 py-2.5 border-b border-border last:border-0">
      <div className="text-sm font-semibold text-foreground text-center">{a}</div>
      <div className="text-xs text-muted-foreground text-center">{label}</div>
      <div className="text-sm font-semibold text-foreground text-center">{b}</div>
    </div>
  );
}

export function CompareJourneysClient({ userA, userB, paramA, paramB }: Props) {
  const router = useRouter();
  const [inputA, setInputA] = useState(paramA ?? '');
  const [inputB, setInputB] = useState(paramB ?? '');
  const [copied, setCopied] = useState(false);

  const handleCompare = (e: React.FormEvent) => {
    e.preventDefault();
    const a = inputA.trim().replace(/^@/, '');
    const b = inputB.trim().replace(/^@/, '');
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
          <h2 className="text-2xl font-bold text-foreground">Compare hobby journeys</h2>
          <p className="mt-2 text-muted-foreground max-w-md">
            Enter two usernames to see shared hobbies, unique paths, and combined personality
            archetype.
          </p>
        </div>
        <form onSubmit={handleCompare} className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
          <Input
            placeholder="Your username"
            value={inputA}
            onChange={(e) => setInputA(e.target.value)}
            className="border-border"
          />
          <Input
            placeholder="Friend's username"
            value={inputB}
            onChange={(e) => setInputB(e.target.value)}
            className="border-border"
          />
          <Button
            type="submit"
            className="bg-primary text-primary-foreground hover:opacity-90 shrink-0"
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
        <p className="text-muted-foreground">
          {notFoundA && (
            <span>
              User <strong>@{paramA}</strong> not found.{' '}
            </span>
          )}
          {notFoundB && (
            <span>
              User <strong>@{paramB}</strong> not found.{' '}
            </span>
          )}
        </p>
        <Button
          variant="outline"
          onClick={() => router.push('/compare-journeys')}
          className="border-border text-muted-foreground hover:text-foreground"
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
    if (!seenA.has(key)) {
      seenA.add(key);
      uniqueA.push(h);
    }
  }

  const uniqueB: string[] = [];
  const seenB = new Set<string>();
  for (const h of hobbiesBDisplay) {
    const key = h.toLowerCase();
    if (!seenB.has(key)) {
      seenB.add(key);
      uniqueB.push(h);
    }
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
        <h2 className="text-2xl font-bold text-foreground">
          <span className="text-foreground">@{userA?.username}</span>
          <span className="mx-3 text-muted-foreground/60">vs</span>
          <span className="text-foreground">@{userB?.username}</span>
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="border-border text-muted-foreground hover:text-foreground"
        >
          {copied ? 'Copied!' : 'Share this comparison'}
        </Button>
      </div>

      {/* Venn-style three-column layout */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground">Hobby overlap</h3>
        <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Only A */}
          <StaggerItem>
            <SpotlightCard className="rounded-xl shadow-soft" innerClassName="p-4">
              <p className="mb-3 text-sm font-semibold text-muted-foreground text-center">
                Only @{userA?.username}
              </p>
              {onlyA.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground/60 py-4">None unique</p>
              ) : (
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {onlyA.map((h) => (
                    <span
                      key={h}
                      className="inline-flex rounded-full border border-border bg-card px-2.5 py-0.5 text-xs text-foreground"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              )}
            </SpotlightCard>
          </StaggerItem>

          {/* Shared — highlighted */}
          <StaggerItem>
            <SpotlightCard
              className="rounded-xl border-foreground/30 bg-foreground/10 shadow-soft"
              innerClassName="p-4"
            >
              <p className="mb-3 text-sm font-semibold text-foreground text-center">
                Shared ({shared.length})
              </p>
              {shared.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground/60 py-4">
                  No shared hobbies yet
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {shared.map((h) => (
                    <span
                      key={h}
                      className="inline-flex rounded-full border border-foreground/30 bg-card px-2.5 py-1 text-xs font-medium text-foreground"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              )}
            </SpotlightCard>
          </StaggerItem>

          {/* Only B */}
          <StaggerItem>
            <SpotlightCard className="rounded-xl shadow-soft" innerClassName="p-4">
              <p className="mb-3 text-sm font-semibold text-muted-foreground text-center">
                Only @{userB?.username}
              </p>
              {onlyB.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground/60 py-4">None unique</p>
              ) : (
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {onlyB.map((h) => (
                    <span
                      key={h}
                      className="inline-flex rounded-full border border-border bg-card px-2.5 py-0.5 text-xs text-foreground"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              )}
            </SpotlightCard>
          </StaggerItem>
        </StaggerContainer>
      </div>

      {/* Stats comparison */}
      <SpotlightCard className="rounded-xl shadow-soft" innerClassName="p-6">
        <div className="grid grid-cols-3 mb-3">
          <div className="text-sm font-semibold text-foreground text-center">
            @{userA?.username}
          </div>
          <div className="text-sm text-muted-foreground/60 text-center">Stat</div>
          <div className="text-sm font-semibold text-foreground text-center">
            @{userB?.username}
          </div>
        </div>
        <StatRow label="Total hobbies" a={totalHobbiesA} b={totalHobbiesB} />
        <StatRow label="Total phases" a={totalPhasesA} b={totalPhasesB} />
        <StatRow label="Categories covered" a={categoriesA} b={categoriesB} />
        <StatRow
          label="Archetype"
          a={`${personalityA.archetype.emoji} ${personalityA.archetype.name}`}
          b={`${personalityB.archetype.emoji} ${personalityB.archetype.name}`}
        />
      </SpotlightCard>

      {/* Combined personality */}
      <FadeIn delay={0.1}>
        <SpotlightCard
          className="rounded-xl border-foreground/20 bg-gradient-to-br from-foreground/10 to-card/40 shadow-soft"
          innerClassName="p-6"
        >
          <h3 className="mb-1 text-sm font-semibold text-foreground">Combined personality</h3>
          <p className="text-xs text-muted-foreground mb-4">
            If you merged both journeys into one timeline, you would be…
          </p>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{combinedPersonality.archetype.emoji}</span>
            <div>
              <p className="text-lg font-bold text-foreground">
                {combinedPersonality.archetype.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {combinedPersonality.archetype.description}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground italic leading-relaxed">
            {combinedPersonality.narrative}
          </p>
        </SpotlightCard>
      </FadeIn>

      {/* Try again */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/compare-journeys')}
          className="border-border text-muted-foreground hover:text-foreground"
        >
          Compare different users
        </Button>
      </div>
    </div>
  );
}
