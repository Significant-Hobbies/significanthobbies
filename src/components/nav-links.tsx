"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "~/components/ui/button";

interface NavLinksProps {
  links: { href: string; label: string }[];
}

export function NavLinks({ links }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
        return (
          <Link key={link.href} href={link.href} prefetch={false}>
            <Button
              variant="ghost"
              size="sm"
              className={
                isActive
                  ? "text-emerald-700 font-semibold bg-emerald-50"
                  : "text-stone-500 hover:text-stone-700"
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
