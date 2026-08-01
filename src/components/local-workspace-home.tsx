'use client';

import Link from 'next/link';

import { StorageModeProvider, StorageModeStatus } from '~/components/storage-mode-provider';

const SURFACES = [
  ['/daily', 'Daily', 'Habits, check-ins, and private journal entries'],
  ['/trajectory', 'Trajectory', 'Your current direction and review loop'],
  ['/bucket-list/new', 'Bucket list', 'Experiences you want to live'],
  ['/timeline/new', 'Timeline', 'The chapters and hobbies that shaped you'],
  ['/commitments', 'Commitments', 'Promises backed by daily proof'],
  ['/look-back', 'Look Back', 'A narrative assembled from this device'],
  ['/settings', 'Profile draft', 'Private identity and creed draft'],
] as const;

export function LocalWorkspaceHome({ title = 'Your local life workspace' }: { title?: string }) {
  return (
    <StorageModeProvider mode="local">
      <main className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <header className="rounded-[1.75rem] bg-[#f7e957] px-6 py-10 text-[#201f18] shadow-[0_14px_40px_rgba(66,55,22,0.10)] sm:px-10 sm:py-12">
          <p className="text-base font-bold">This device</p>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl font-medium leading-[1.02] tracking-[-0.03em] sm:text-6xl">
            {title}
          </h1>
          <div className="mt-5">
            <StorageModeStatus />
          </div>
        </header>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {SURFACES.map(([href, label, description], index) => (
            <Link
              key={href}
              href={href}
              className={`min-h-40 rounded-2xl p-6 text-[#201f18] transition-transform hover:-translate-y-1 ${
                ['bg-[#b9dcf5]', 'bg-[#a8dc91]', 'bg-[#ff9d7d]', 'bg-[#c5abfa]'][index % 4]
              }`}
            >
              <h2 className="font-serif text-2xl font-medium">{label}</h2>
              <p className="mt-3 text-base leading-relaxed text-[#4b493d]">{description}</p>
            </Link>
          ))}
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          Sign in only when you want database backup, cross-device access, or publishing.
        </p>
      </main>
    </StorageModeProvider>
  );
}
