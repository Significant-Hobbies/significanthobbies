'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinksProps {
  links: { href: string; label: string }[];
}

export function NavLinks({ links }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
        const activeClass =
          link.href === '/life-plan'
            ? 'bg-[#f7e957] text-[#201f18] shadow-[0_2px_0_#c8b92e]'
            : link.href === '/daily'
              ? 'bg-[#c5abfa] text-[#241a31] shadow-[0_2px_0_#9d82d5]'
              : 'bg-[#b9dcf5] text-[#192a36] shadow-[0_2px_0_#8db9d7]';
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`inline-flex min-h-10 items-center rounded-xl px-4 text-base font-semibold transition-[background-color,color,transform,box-shadow] hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
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
