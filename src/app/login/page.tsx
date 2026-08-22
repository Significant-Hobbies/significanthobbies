import Link from 'next/link';
import { redirect } from 'next/navigation';

import { FadeIn, SpotlightCard, TextGenerateEffect } from '~/components/aceternity';
import { guestRouteFor, safeCallbackUrl } from '~/lib/auth-routing';
import { getServerAuthSession } from '~/server/auth';

import { LoginForm } from './login-form';

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl: requestedCallback } = await searchParams;
  const callbackUrl = safeCallbackUrl(requestedCallback);
  const session = await getServerAuthSession();
  if (session?.user) redirect(callbackUrl);
  // The guest link has to follow the same intent as the callback, or it strands
  // people: arriving from /daily used to offer the timeline builder.
  const guestRoute = guestRouteFor(callbackUrl);

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-[#f7e957] px-4 py-12">
      <FadeIn className="relative w-full max-w-md">
        <SpotlightCard
          className="border-0 shadow-[0_18px_50px_rgba(66,55,22,0.14)]"
          innerClassName="p-7 sm:p-9"
        >
          <div className="mb-8">
            {/* `as="h1"` rather than an h1 wrapper — the effect rendered a div,
                so wrapping it nested a div inside a heading. */}
            <TextGenerateEffect
              as="h1"
              words="Sign in"
              className="font-serif text-5xl font-medium tracking-[-0.03em] text-foreground"
            />
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Save your hobbies, bucket lists, and side quests. Pick up where you left off.
            </p>
          </div>

          <LoginForm callbackURL={callbackUrl} />

          <div className="mt-6 space-y-2.5">
            <p className="text-base font-bold text-foreground">What you get</p>
            <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              <li>· Track hobbies across every phase of your life</li>
              <li>· Build bucket lists you&apos;ll actually complete</li>
              <li>· Accept side quests — micro-adventures for the weekend</li>
            </ul>
          </div>

          <p className="mt-6 text-sm leading-relaxed text-subtle">
            Or{' '}
            <Link
              href={guestRoute.href}
              className="text-foreground underline underline-offset-2 hover:opacity-70"
            >
              continue as guest
            </Link>{' '}
            — {guestRoute.label}
          </p>
        </SpotlightCard>
      </FadeIn>
    </div>
  );
}
