import type { Metadata } from 'next';
import Link from 'next/link';

import {
  BorderBeam,
  FadeIn,
  GridBackground,
  SpotlightCard,
  TextGenerateEffect,
} from '~/components/aceternity';

export const metadata: Metadata = {
  title: 'Manifesto — SignificantHobbies',
  description:
    'Life is finite. We build tools to help you spend your remaining weeks on what matters — hobbies, bucket lists, and side quests.',
};

export default function ManifestoPage() {
  return (
    <main className="relative mx-auto max-w-2xl px-4 py-16 sm:py-24">
      <GridBackground variant="dots" size={22} />
      <div className="relative">
        <FadeIn>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Home
          </Link>
        </FadeIn>

        <article className="mt-8 space-y-6">
          <FadeIn delay={0.08}>
            <TextGenerateEffect
              words="Manifesto"
              className="text-2xl font-semibold text-foreground"
            />
          </FadeIn>

          <FadeIn delay={0.16}>
            <p className="text-base text-foreground leading-relaxed">
              You have about 4,000 weeks. If you&apos;re 30, you&apos;ve spent roughly 1,560 of
              them. If you&apos;re 40, it&apos;s 2,080. The number is not large.
            </p>
          </FadeIn>

          <FadeIn delay={0.24}>
            <p className="text-base text-muted-foreground leading-relaxed">
              Most of those weeks disappeared without a trace. You slept, commuted, scrolled,
              attended meetings, and waited for the weekend. A few of them — a handful — you
              remember. The week you learned to play your first song. The week you hiked a mountain
              you&apos;d been staring at for years. The week you cooked something you didn&apos;t
              know you could make.
            </p>
          </FadeIn>

          <FadeIn delay={0.32}>
            <p className="text-base text-muted-foreground leading-relaxed">
              Those weeks are the ones that mattered. They&apos;re the ones where you were alive
              instead of just passing time.
            </p>
          </FadeIn>

          <FadeIn delay={0.4}>
            <h2 className="pt-4 text-lg font-semibold text-foreground">What we build</h2>
          </FadeIn>

          <FadeIn delay={0.48}>
            <p className="text-base text-muted-foreground leading-relaxed">
              Two dimensions of the same life:
            </p>
          </FadeIn>

          <FadeIn delay={0.56}>
            <p className="text-base text-muted-foreground leading-relaxed">
              <span className="text-foreground font-medium">Daily.</span> One ritual, twice a day.
              Morning prompts, habit check-ins, and a journal entry. The quiet capture of how
              you&apos;re spending your days. Private by default — no one sees this but you.
            </p>
          </FadeIn>

          <FadeIn delay={0.64}>
            <p className="text-base text-muted-foreground leading-relaxed">
              <span className="text-foreground font-medium">Living.</span> Three things, woven
              together:
            </p>
          </FadeIn>

          <FadeIn delay={0.72}>
            <ul className="space-y-3 text-base text-muted-foreground leading-relaxed">
              <li>
                <span className="text-foreground font-medium">Hobbies.</span> The things you do with
                your hands and mind that make the hours feel like minutes. We help you find them,
                track them across the phases of your life, and commit to practicing them.
              </li>
              <li>
                <span className="text-foreground font-medium">Bucket lists.</span> The experiences
                you&apos;re not sure you&apos;ll get to. We give them a home so they stop being
                vague anxieties and become a list you can work through.
              </li>
              <li>
                <span className="text-foreground font-medium">Side quests.</span> Small adventures
                that take an afternoon. The low-stakes experiments that occasionally open a door you
                didn&apos;t know was there.
              </li>
            </ul>
          </FadeIn>

          <FadeIn delay={0.8}>
            <p className="text-base text-muted-foreground leading-relaxed">
              The journal is the bridge. You write about practicing your hobby, and that entry
              connects your daily practice to your life aspirations. The days become weeks. The
              weeks become a life.
            </p>
          </FadeIn>

          <FadeIn delay={0.88}>
            <h2 className="pt-4 text-lg font-semibold text-foreground">What we don&apos;t do</h2>
          </FadeIn>

          <FadeIn delay={0.96}>
            <ul className="space-y-2 text-base text-muted-foreground leading-relaxed">
              <li>
                We don&apos;t score your days. Check off your habits, write your entry. No numbers,
                no streaks, no dashboards about your dashboards.
              </li>
              <li>We don&apos;t rank you against other people. Your weeks are your own.</li>
              <li>
                We don&apos;t shame you for missed days. The grid shows where you&apos;ve been, not
                where you&apos;ve failed.
              </li>
            </ul>
          </FadeIn>

          <FadeIn delay={1.04}>
            <h2 className="pt-4 text-lg font-semibold text-foreground">The grid</h2>
          </FadeIn>

          <FadeIn delay={1.12}>
            <SpotlightCard className="shadow-soft" innerClassName="rounded-xl p-6">
              <p className="text-base text-muted-foreground leading-relaxed">
                On your dashboard there&apos;s a grid of small squares — one per week of a human
                life. The weeks you&apos;ve lived are darker. The weeks you&apos;ve stamped with
                practice are darker still. The rest are ahead of you, for now.
              </p>
              <p className="mt-3 text-base text-muted-foreground leading-relaxed">
                We show it to you not to frighten you, but because the truth is useful. A finite
                life is the only kind worth planning.
              </p>
            </SpotlightCard>
          </FadeIn>

          <FadeIn delay={1.2}>
            <div className="relative overflow-hidden rounded-xl border border-border bg-card/40 p-6 shadow-soft">
              <BorderBeam size={200} duration={12} />
              <div className="flex gap-3">
                <Link
                  href="/hobbies"
                  className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  Find a hobby
                </Link>
                <Link
                  href="/bucket-lists"
                  className="inline-flex items-center rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-foreground/30"
                >
                  Start a bucket list
                </Link>
              </div>
            </div>
          </FadeIn>
        </article>
      </div>
    </main>
  );
}
