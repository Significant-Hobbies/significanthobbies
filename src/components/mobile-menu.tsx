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
        className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-foreground/5 transition-colors"
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute left-0 top-14 z-50 w-full border-b border-border bg-card/95 backdrop-blur-sm">
          <div className="flex flex-col px-4 py-3 gap-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              const isBucketList = link.href === '/bucket-lists';
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={false}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? isBucketList
                        ? 'bg-amber-400/10 text-foreground'
                        : 'bg-foreground/10 text-foreground'
                      : isBucketList
                        ? 'text-muted-foreground hover:bg-amber-400/10 hover:text-foreground'
                        : 'text-muted-foreground hover:bg-card/40 hover:text-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/search"
              prefetch={false}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
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
                className="rounded-lg bg-primary px-3 py-2.5 text-center text-sm font-semibold text-primary-foreground hover:opacity-90 transition-colors"
              >
                New Timeline
              </Link>
            ) : (
              <Link
                href="/login"
                prefetch={false}
                onClick={() => setOpen(false)}
                className="rounded-lg border border-border px-3 py-2.5 text-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
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
