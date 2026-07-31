'use client';

import { Check, Globe2, Loader2, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';

import { SpotlightCard } from '~/components/aceternity';
import { Button } from '~/components/ui/button';
import { setTimelineVisibility } from '~/lib/actions/timeline';

interface Props {
  timelineId: string;
  username: string;
  canonicalPath: string;
  published?: boolean;
}

export function FirstTimelinePublishPrompt({
  timelineId,
  username,
  canonicalPath,
  published = false,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const successHeadingRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (published) successHeadingRef.current?.focus();
  }, [published]);

  function keepPrivate() {
    router.replace(canonicalPath, { scroll: false });
  }

  function publish() {
    setError(null);
    startTransition(async () => {
      try {
        await setTimelineVisibility(timelineId, 'PUBLIC');
        router.replace(`${canonicalPath}?published=1`, { scroll: false });
      } catch {
        setError("Couldn't publish this timeline. It is still private.");
      }
    });
  }

  return (
    <SpotlightCard
      className="relative mb-8 border-primary/30 shadow-soft"
      innerClassName="p-5 sm:p-6"
    >
      <div data-testid="first-timeline-publish-prompt">
        {published ? (
          <div
            role="status"
            aria-live="polite"
            className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-growth-soft text-growth">
                <Check className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p
                  ref={successHeadingRef}
                  tabIndex={-1}
                  className="font-serif text-lg font-semibold text-foreground focus:outline-none"
                >
                  Your first timeline is on your profile.
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  You can make it private again from the visibility menu at any time.
                </p>
              </div>
            </div>
            <Link
              href={`/u/${username}`}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
            >
              View my profile →
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background/50 text-primary">
                <Lock className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-subtle">
                  First timeline saved
                </p>
                <h2 className="mt-1 font-serif text-xl font-semibold text-foreground">
                  Private now. Yours to share when it feels ready.
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  Make this timeline public and add it to your profile. It may also appear in public
                  discovery and search. Nothing else on your account becomes public.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <Button
                onClick={publish}
                disabled={isPending}
                aria-busy={isPending}
                className="min-h-11 gap-2"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Globe2 className="h-4 w-4" aria-hidden="true" />
                )}
                {isPending ? 'Publishing timeline…' : 'Publish timeline'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={keepPrivate}
                disabled={isPending}
                className="min-h-11"
              >
                Keep it private
              </Button>
            </div>
            {error && (
              <p role="alert" className="mt-3 text-sm text-destructive">
                {error}
              </p>
            )}
          </>
        )}
      </div>
    </SpotlightCard>
  );
}
