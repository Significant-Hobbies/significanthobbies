import Link from 'next/link';
import { eq } from 'drizzle-orm';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { getServerAuthSession } from '~/server/auth';
import { users } from '~/db/schema';
import { db } from '~/server/db';

import { MobileMenu } from './mobile-menu';
import { NavLinks } from './nav-links';
import { NavSignOut } from './nav-sign-out';

const NAV_LINKS = [
  { href: '/live-more', label: 'Live' },
  { href: '/journal', label: 'Journal' },
  { href: '/habits', label: 'Habits' },
  { href: '/history', label: 'History' },
];
const PUBLIC_LINKS = [
  { href: '/find-your-hobby', label: 'Possibilities' },
  { href: '/blog', label: 'Stories' },
  { href: '/manifesto', label: 'Manifesto' },
];

export async function Nav() {
  const session = await getServerAuthSession();
  const account = session?.user
    ? await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
        columns: { onboardingCompletedAt: true },
      })
    : null;
  const accountReady = Boolean(account?.onboardingCompletedAt);
  const links = accountReady ? NAV_LINKS : PUBLIC_LINKS;

  return (
    <nav
      data-site-nav
      className="sticky top-0 z-50 border-b border-[#ddd4b7] bg-[#fffdf3]/95 shadow-[0_3px_18px_rgba(66,55,22,0.06)] backdrop-blur-md"
    >
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          prefetch={false}
          className="group inline-flex min-h-11 items-center gap-2.5 text-base font-bold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span
            aria-hidden="true"
            className="flex size-10 items-center justify-center rounded-xl bg-[#f7e957] font-serif text-lg font-bold tracking-[-0.04em] text-[#201f18] shadow-[0_3px_0_#c8b92e] transition-transform group-hover:-rotate-3 group-hover:-translate-y-0.5"
          >
            SH
          </span>
          <span className="hidden text-sm leading-none xl:block">
            Significant
            <br />
            Hobbies
          </span>
          <span className="sr-only">SignificantHobbies</span>
        </Link>

        {/* Desktop nav */}
        {/* lg, not md. The desktop nav needs ~734px of its own, so at exactly 768px
            (Tailwind's md) it rendered and overflowed the viewport by 120px —
            caught by the content-flywheel overflow check on /blog. Labels and
            order are unchanged; only the switch point moves. */}
        <div className="hidden items-center gap-3 lg:flex">
          <div className="flex items-center gap-1 rounded-2xl border border-[#e6dec5] bg-white p-1 shadow-[0_2px_8px_rgba(66,55,22,0.05)]">
            <NavLinks links={links} localLinks={!session?.user ? NAV_LINKS : undefined} />
          </div>

          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Open account menu"
                  className="flex size-11 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-foreground/30"
                >
                  <Avatar className="h-10 w-10 border-2 border-white shadow-[0_2px_8px_rgba(66,55,22,0.14)]">
                    <AvatarImage src={session.user.image ?? ''} />
                    <AvatarFallback className="bg-foreground/10 text-foreground text-sm">
                      {session.user.name?.[0] ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {session.user.username ? (
                  <DropdownMenuItem asChild>
                    <Link href={`/u/${session.user.username}`} prefetch={false}>
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link href="/onboarding" prefetch={false}>
                      Continue onboarding →
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/settings" prefetch={false}>
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <NavSignOut />
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              asChild
              className="h-11 rounded-xl bg-[#201f18] px-5 text-white hover:bg-[#36342a]"
            >
              <Link href="/login" prefetch={false}>
                Sign in
              </Link>
            </Button>
          )}
        </div>

        {/* Mobile nav */}
        <div className="flex items-center gap-2 lg:hidden">
          {session?.user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Open account menu"
                  className="flex size-11 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-foreground/30"
                >
                  <Avatar className="h-10 w-10 border-2 border-white shadow-[0_2px_8px_rgba(66,55,22,0.14)]">
                    <AvatarImage src={session.user.image ?? ''} />
                    <AvatarFallback className="bg-foreground/10 text-foreground text-sm">
                      {session.user.name?.[0] ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {session.user.username ? (
                  <DropdownMenuItem asChild>
                    <Link href={`/u/${session.user.username}`} prefetch={false}>
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link href="/onboarding" prefetch={false}>
                      Continue onboarding →
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/settings" prefetch={false}>
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <NavSignOut />
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <MobileMenu
            links={links}
            localLinks={!session?.user ? NAV_LINKS : undefined}
            isLoggedIn={!!session?.user}
          />
        </div>
      </div>
    </nav>
  );
}
