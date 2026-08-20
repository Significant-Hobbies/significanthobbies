'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useLocalOnboardingComplete } from './local-onboarding-gate';

interface NavLinksProps {
  links: { href: string; label: string }[];
  localLinks?: { href: string; label: string }[];
}

export function NavLinks({ links, localLinks }: NavLinksProps) {
  const pathname = usePathname();
  const localComplete = useLocalOnboardingComplete();
  const visibleLinks = localLinks && localComplete ? localLinks : links;

  return (
    <>
      {visibleLinks.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
        const activeClass =
          link.href === '/live-more'
            ? 'bg-[#f7e957] text-[#201f18] shadow-[0_2px_0_#c8b92e]'
            : link.href === '/journal'
              ? 'bg-[#c5abfa] text-[#241a31] shadow-[0_2px_0_#9d82d5]'
              : link.href === '/habits'
                ? 'bg-[#dceabf] text-[#24351f] shadow-[0_2px_0_#adc28c]'
                : 'bg-[#b9dcf5] text-[#192a36] shadow-[0_2px_0_#8db9d7]';
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? 'page' : undefined}
            className={`inline-flex min-h-11 items-center rounded-xl px-4 text-base font-semibold transition-[background-color,color,transform,box-shadow] hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              isActive ? activeClass : 'text-[#575344] hover:bg-[#f4efe0] hover:text-[#201f18]'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
