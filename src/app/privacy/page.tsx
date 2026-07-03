import type { Metadata } from 'next';
import Link from 'next/link';

import { FadeIn, GridBackground, SpotlightCard } from '~/components/aceternity';

export const metadata: Metadata = {
  title: 'Privacy — Significant Hobbies',
  description: "Short and clear: what we store, what we don't, and how to delete.",
};

export default function PrivacyPage() {
  return (
    <main className="relative mx-auto max-w-3xl px-4 py-12 text-sm leading-7 text-foreground">
      <GridBackground variant="dots" size={22} />
      <FadeIn className="relative">
        <Link href="/" className="text-xs text-muted-foreground hover:underline">
          ← Significant Hobbies
        </Link>
        <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-foreground">
          Privacy
        </h1>
        <p className="mt-4 text-xs text-muted-foreground">Last updated: 2026-05-15.</p>
      </FadeIn>

      <FadeIn className="relative mt-8" delay={0.05}>
        <h2 className="text-base font-semibold text-foreground">What we store</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Your Google OAuth identity when you sign in.</li>
          <li>Timelines, phases, and any hobbies you enter.</li>
          <li>Quest progress and badge state.</li>
          <li>Follow relationships if you follow other users.</li>
        </ul>
      </FadeIn>

      <FadeIn className="relative mt-8" delay={0.1}>
        <h2 className="text-base font-semibold text-foreground">What we don&apos;t do</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>No third-party tracking pixels or marketing tags.</li>
          <li>No selling of timeline or hobby data.</li>
        </ul>
      </FadeIn>

      <FadeIn className="relative mt-8" delay={0.15}>
        <SpotlightCard className="rounded-xl shadow-soft" innerClassName="p-5">
          <h2 className="text-base font-semibold text-foreground">Public profiles</h2>
          <p className="mt-2">
            Each timeline has its own visibility setting (public / unlisted / private). Public
            timelines and your <code>/u/username</code>
            profile are indexable.
          </p>
        </SpotlightCard>
      </FadeIn>

      <FadeIn className="relative mt-8" delay={0.2}>
        <SpotlightCard className="rounded-xl shadow-soft" innerClassName="p-5">
          <h2 className="text-base font-semibold text-foreground">Deletion</h2>
          <p className="mt-2">
            Delete individual timelines from the dashboard, or contact the maintainer to remove your
            account entirely.
          </p>
        </SpotlightCard>
      </FadeIn>
    </main>
  );
}
