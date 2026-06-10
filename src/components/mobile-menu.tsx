"use client";

import { Menu, Search,X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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
        className="flex h-9 w-9 items-center justify-center rounded-md text-stone-600 hover:bg-stone-100 transition-colors"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute left-0 top-14 z-50 w-full border-b border-stone-200 bg-white/95 backdrop-blur-sm">
          <div className="flex flex-col px-4 py-3 gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={false}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/search"
              prefetch={false}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                pathname === "/search"
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
              }`}
            >
              <Search className="h-4 w-4" />
              Search
            </Link>
            <div className="my-1 border-t border-stone-100" />
            {isLoggedIn ? (
              <Link
                href="/timeline/new"
                prefetch={false}
                onClick={() => setOpen(false)}
                className="rounded-lg bg-emerald-600 px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
              >
                New Timeline
              </Link>
            ) : (
              <Link
                href="/login"
                prefetch={false}
                onClick={() => setOpen(false)}
                className="rounded-lg border border-stone-300 px-3 py-2.5 text-center text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
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
