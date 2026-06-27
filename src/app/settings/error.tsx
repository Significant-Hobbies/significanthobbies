'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { captureError } from '~/lib/foundry-monitoring';

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    captureError(error, { scope: 'settings', digest: error.digest });
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h2 className="text-xl font-bold mb-3 text-stone-900">Couldn&apos;t load settings</h2>
      <p className="text-sm text-stone-600 mb-6">
        Something went wrong while loading your settings. Try again.
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={reset}
          className="px-4 py-2 rounded border border-stone-300 text-stone-700 hover:bg-stone-50"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="px-4 py-2 rounded border border-stone-300 text-stone-700 hover:bg-stone-50"
        >
          Dashboard
        </Link>
      </div>
      {error.digest ? (
        <p className="mt-6 text-xs text-stone-400">Reference: {error.digest}</p>
      ) : null}
    </div>
  );
}
