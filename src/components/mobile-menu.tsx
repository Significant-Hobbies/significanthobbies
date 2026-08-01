'use client';

import { Menu, Search, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface MobileMenuProps {
  links: { href: string; label: string }[];
  isLoggedIn: boolean;
}

export function MobileMenu({ links, isLoggedIn }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f7e957] text-[#201f18] shadow-[0_3px_0_#c8b92e] transition-transform hover:-translate-y-0.5"
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" strokeWidth={2.5} />}
      </button>

      {open && (
        <div className="absolute left-0 top-[4.5rem] z-50 w-full border-b border-[#ddd4b7] bg-[#fffdf3] shadow-[0_16px_32px_rgba(66,55,22,0.14)]">
          <div className="flex flex-col gap-2 px-4 py-4">
            {links.map((link) => {
              const isActive = pathname === link.href;
              const colorClass =
                link.href === '/life-plan'
                  ? 'bg-[#f7e957] text-[#201f18]'
                  : link.href === '/daily'
                    ? 'bg-[#c5abfa] text-[#241a31]'
                    : 'bg-[#b9dcf5] text-[#192a36]';
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={false}
                  onClick={() => setOpen(false)}
                  className={`flex min-h-14 items-center justify-between rounded-xl px-4 text-lg font-bold transition-transform hover:translate-x-1 ${colorClass}`}
                >
                  <span>{link.label}</span>
                  <span aria-hidden="true">{isActive ? '●' : '→'}</span>
                </Link>
              );
            })}
            <Link
              href="/search"
              prefetch={false}
              onClick={() => setOpen(false)}
              className={`flex min-h-12 items-center gap-2 rounded-xl px-4 text-base font-medium transition-colors ${
                pathname === '/search'
                  ? 'bg-foreground/10 text-foreground'
                  : 'text-muted-foreground hover:bg-card/40 hover:text-foreground'
              }`}
            >
              <Search className="h-4 w-4" />
              Search
            </Link>
            <div className="my-1 border-t border-border" />
            {isLoggedIn ? (
              <Link
                href="/timeline/new"
                prefetch={false}
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center justify-center rounded-xl bg-[#ff9d7d] px-4 text-center text-base font-bold text-[#261e18] transition-colors hover:bg-[#f58c69]"
              >
                New Timeline
              </Link>
            ) : (
              <Link
                href="/login"
                prefetch={false}
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center justify-center rounded-xl bg-[#201f18] px-4 text-center text-base font-bold text-white transition-colors hover:bg-[#36342a]"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
