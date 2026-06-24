import Link from 'next/link';

/** Shared legal + fleet footer for all SignificantHobbies routes. */
export function SiteFooter() {
  return (
    <footer className="border-t border-stone-200/60 px-4 py-8" style={{ background: '#FAFAFA' }}>
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-emerald-600">SH</span>
          <span className="text-sm font-semibold text-stone-700">SignificantHobbies</span>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-stone-400">
          <Link
            href="/timeline/new"
            prefetch={false}
            className="transition-colors hover:text-stone-700"
          >
            Start
          </Link>
          <Link href="/hobbies" prefetch={false} className="transition-colors hover:text-stone-700">
            Explore
          </Link>
          <Link href="/explore" prefetch={false} className="transition-colors hover:text-stone-700">
            Community
          </Link>
          <Link href="/blog" prefetch={false} className="transition-colors hover:text-stone-700">
            Blog
          </Link>
          <Link href="/privacy" prefetch={false} className="transition-colors hover:text-stone-700">
            Privacy
          </Link>
          <Link href="/terms" prefetch={false} className="transition-colors hover:text-stone-700">
            Terms
          </Link>
        </div>
        <div className="flex flex-col items-center gap-1 text-xs text-stone-400 sm:items-end">
          <span>Made with love for curious people</span>
          <span>
            <a href="https://sarthakagrawal.dev" className="hover:text-stone-600">
              Sarthak
            </a>
            {' · '}
            <a href="https://sassmaker.com" className="hover:text-stone-600">
              Foundry
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
