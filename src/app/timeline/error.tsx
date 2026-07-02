'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { captureError } from '~/lib/foundry-monitoring';

export default function TimelineError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    captureError(error, { scope: 'timeline-builder', digest: error.digest });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h2 className="text-xl font-bold mb-3 text-foreground">Couldn&apos;t load the timeline</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Something went wrong while loading this timeline. Any saved work is safe — try again.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 rounded border border-border text-foreground hover:bg-card/40"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded border border-border text-foreground hover:bg-card/40"
          >
            Dashboard
          </Link>
        </div>
        {error.digest ? (
          <p className="mt-6 text-xs text-muted-foreground/60">Reference: {error.digest}</p>
        ) : null}
      </div>
    </div>
  );
}
