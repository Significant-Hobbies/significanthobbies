import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About — Significant Hobbies',
  description:
    'Significant Hobbies turns your hobby history into a shareable timeline. Quiz-based recommendations, gamified discovery, and a public profile.',
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/" className="text-xs text-muted-foreground hover:underline">
        ← Significant Hobbies
      </Link>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">About</h1>
      <p className="mt-4 text-sm leading-6 text-foreground">
        Some hobbies make you. Some you make. Significant Hobbies is a place to map that history —
        phase by phase — and find the next thing worth being bad at.
      </p>

      <section className="mt-8 space-y-3 text-sm leading-6">
        <h2 className="text-sm font-semibold text-muted-foreground">What you can do</h2>
        <ul className="list-disc space-y-1 pl-5 marker:text-muted-foreground/60">
          <li>
            Build a timeline of your hobby phases — childhood experiments through current
            obsessions.
          </li>
          <li>
            Take the quiz to surface hobbies that match your personality instead of trending feeds.
          </li>
          <li>Earn badges and complete side-quests when you actually go do the thing.</li>
          <li>
            Share a public profile at{' '}
            <code className="rounded bg-foreground/5 px-1.5 py-0.5 text-xs">/u/username</code>.
          </li>
          <li>
            Browse famous people&apos;s hobby journeys to see how interests compound over a life.
          </li>
        </ul>
      </section>

      <section className="mt-8 space-y-3 text-sm leading-6">
        <h2 className="text-sm font-semibold text-muted-foreground">Why bother</h2>
        <p className="text-foreground">
          The reps on a thing you actually care about beat the dopamine loop of feeds. Most people
          can&apos;t even list their hobbies — the timeline is forcing function to remember, then
          choose.
        </p>
      </section>
    </main>
  );
}
