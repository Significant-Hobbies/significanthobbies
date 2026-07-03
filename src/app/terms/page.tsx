import Link from 'next/link';

import { FadeIn, GridBackground, SpotlightCard } from '~/components/aceternity';

export const metadata = {
  title: 'Terms — Significant Hobbies',
  description: 'Use of Significant Hobbies is provided as-is.',
};

export default function TermsPage() {
  return (
    <main className="relative mx-auto max-w-3xl px-4 py-12 text-sm leading-7 text-foreground">
      <GridBackground variant="dots" size={22} />
      <FadeIn className="relative">
        <Link href="/" className="text-xs text-muted-foreground hover:underline">
          ← Significant Hobbies
        </Link>
        <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-foreground">
          Terms
        </h1>
        <p className="mt-4 text-xs text-muted-foreground">Last updated: 2026-05-15.</p>
      </FadeIn>

      <FadeIn className="relative mt-8" delay={0.05}>
        <SpotlightCard className="rounded-xl shadow-soft" innerClassName="p-5">
          <h2 className="text-base font-semibold text-foreground">Your content</h2>
          <p className="mt-2">
            You own your timelines, notes, and any hobby content you create. Public timelines are
            visible to anyone with the URL. Unlisted timelines are reachable only via direct link.
          </p>
        </SpotlightCard>
      </FadeIn>

      <FadeIn className="relative mt-8" delay={0.1}>
        <SpotlightCard className="rounded-xl shadow-soft" innerClassName="p-5">
          <h2 className="text-base font-semibold text-foreground">Be reasonable</h2>
          <p className="mt-2">
            Don&apos;t impersonate other people. Don&apos;t use the platform to harass. Profiles
            that violate this may be removed.
          </p>
        </SpotlightCard>
      </FadeIn>

      <FadeIn className="relative mt-8" delay={0.15}>
        <SpotlightCard className="rounded-xl shadow-soft" innerClassName="p-5">
          <h2 className="text-base font-semibold text-foreground">No warranty</h2>
          <p className="mt-2">
            Provided as-is. Quest suggestions and hobby recommendations are heuristic — they&apos;re
            prompts, not prescriptions.
          </p>
        </SpotlightCard>
      </FadeIn>
    </main>
  );
}
