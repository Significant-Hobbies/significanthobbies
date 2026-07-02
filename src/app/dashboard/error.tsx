'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { captureError } from '~/lib/foundry-monitoring';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    captureError(error, { scope: 'dashboard', digest: error.digest });
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h2 className="text-xl font-bold mb-3 text-foreground">Couldn&apos;t load your dashboard</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Something went wrong while loading your dashboard. Your timelines and bucket list are safe —
        try again.
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={reset}
          className="px-4 py-2 rounded border border-border text-foreground hover:bg-card/40"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-4 py-2 rounded border border-border text-foreground hover:bg-card/40"
        >
          Home
        </Link>
      </div>
      {error.digest ? (
        <p className="mt-6 text-xs text-muted-foreground/60">Reference: {error.digest}</p>
      ) : null}
    </div>
  );
}
