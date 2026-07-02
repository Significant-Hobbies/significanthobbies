'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '~/components/ui/button';

interface NavLinksProps {
  links: { href: string; label: string }[];
}

export function NavLinks({ links }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link key={link.href} href={link.href}>
            <Button
              variant="ghost"
              size="sm"
              className={
                isActive
                  ? 'text-foreground font-medium bg-foreground/10'
                  : 'text-muted-foreground hover:text-foreground'
              }
            >
              {link.label}
            </Button>
          </Link>
        );
      })}
    </>
  );
}
