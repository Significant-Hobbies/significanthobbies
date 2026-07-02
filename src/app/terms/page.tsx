import Link from 'next/link';

export const metadata = {
  title: 'Terms — Significant Hobbies',
  description: 'Use of Significant Hobbies is provided as-is.',
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-sm leading-7 text-foreground">
      <Link href="/" className="text-xs text-muted-foreground hover:underline">
        ← Significant Hobbies
      </Link>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">Terms</h1>
      <p className="mt-4 text-xs text-muted-foreground">Last updated: 2026-05-15.</p>

      <h2 className="mt-8 text-base font-semibold text-foreground">Your content</h2>
      <p className="mt-2">
        You own your timelines, notes, and any hobby content you create. Public timelines are
        visible to anyone with the URL. Unlisted timelines are reachable only via direct link.
      </p>

      <h2 className="mt-8 text-base font-semibold text-foreground">Be reasonable</h2>
      <p className="mt-2">
        Don&apos;t impersonate other people. Don&apos;t use the platform to harass. Profiles that
        violate this may be removed.
      </p>

      <h2 className="mt-8 text-base font-semibold text-foreground">No warranty</h2>
      <p className="mt-2">
        Provided as-is. Quest suggestions and hobby recommendations are heuristic — they&apos;re
        prompts, not prescriptions.
      </p>
    </main>
  );
}
