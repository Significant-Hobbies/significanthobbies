'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useLocalOnboardingComplete } from './local-onboarding-gate';

interface MobileMenuProps {
  links: { href: string; label: string }[];
  localLinks?: { href: string; label: string }[];
  isLoggedIn: boolean;
}

export function MobileMenu({ links, localLinks, isLoggedIn }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const localComplete = useLocalOnboardingComplete();
  const visibleLinks = localLinks && localComplete ? localLinks : links;

  useEffect(() => {
    if (!open) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f7e957] text-[#201f18] shadow-[0_3px_0_#c8b92e] transition-transform hover:-translate-y-0.5"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="mobile-site-menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" strokeWidth={2.5} />}
      </button>

      {open && (
        <div
          id="mobile-site-menu"
          className="absolute left-0 top-[4.5rem] z-50 w-full border-b border-[#ddd4b7] bg-[#fffdf3] shadow-[0_16px_32px_rgba(66,55,22,0.14)]"
        >
          <div className="flex flex-col gap-2 px-4 py-4">
            {visibleLinks.map((link) => {
              const isActive = pathname === link.href;
              const colorClass =
                link.href === '/'
                  ? 'bg-[#fffdf8] text-[#201f18] border border-[#ddd4b7]'
                  : link.href === '/live-more'
                    ? 'bg-[#f7e957] text-[#201f18]'
                    : link.href === '/journal'
                      ? 'bg-[#c5abfa] text-[#241a31]'
                      : link.href === '/habits'
                        ? 'bg-[#dceabf] text-[#24351f]'
                        : 'bg-[#b9dcf5] text-[#192a36]';
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  prefetch={false}
                  onClick={() => setOpen(false)}
                  className={`flex min-h-14 items-center justify-between rounded-xl px-4 text-lg font-bold transition-transform hover:translate-x-1 ${colorClass}`}
                >
                  <span>{link.label}</span>
                  <span aria-hidden="true">{isActive ? '●' : '→'}</span>
                </Link>
              );
            })}
            <div className="my-1 border-t border-border" />
            {isLoggedIn ? (
              <Link
                href="/settings"
                prefetch={false}
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center justify-center rounded-xl bg-[#201f18] px-4 text-center text-base font-bold text-white transition-colors hover:bg-[#36342a]"
              >
                Account settings
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
