'use client';

import { useEffect, useState } from 'react';

import { FadeIn, GradientMesh, SpotlightCard } from '~/components/aceternity';
import { HOBBY_CATEGORIES } from '~/lib/hobbies';

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function RandomHobby() {
  const [msg, setMsg] = useState('Picking a random hobby…');

  useEffect(() => {
    const all = HOBBY_CATEGORIES.flatMap((c) => c.hobbies);
    if (all.length === 0) {
      setMsg('No hobbies catalogued yet.');
      return;
    }
    const pick = all[Math.floor(Math.random() * all.length)]!;
    window.location.replace(`/hobbies/${slugify(pick)}`);
  }, []);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-8">
      <GradientMesh />
      <FadeIn className="relative" delay={0.1}>
        <SpotlightCard className="rounded-2xl shadow-soft" innerClassName="p-12 text-center">
          <p className="font-mono text-sm text-muted-foreground">{msg}</p>
        </SpotlightCard>
      </FadeIn>
    </main>
  );
}
