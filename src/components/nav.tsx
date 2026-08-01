import Link from 'next/link';

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

import { MobileMenu } from './mobile-menu';
import { NavLinks } from './nav-links';
import { NavSignOut } from './nav-sign-out';

const NAV_LINKS = [
  { href: '/life-plan', label: 'Live More' },
  { href: '/daily', label: 'Daily' },
  { href: '/look-back', label: 'See History' },
];

export async function Nav() {
  const session = await getServerAuthSession();

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
            <NavLinks links={NAV_LINKS} />
          </div>

          {session?.user ? (
            <>
              <Link href="/timeline/new" prefetch={false}>
                <Button className="h-11 rounded-xl bg-[#ff9d7d] px-4 text-[#261e18] hover:bg-[#f58c69]">
                  New Timeline
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-foreground/30">
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
                      <Link href="/setup" prefetch={false}>
                        Set username →
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" prefetch={false}>
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/life-plan" prefetch={false}>
                      Life Plan
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/bucket-list" prefetch={false}>
                      My Bucket Lists
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/commitments" prefetch={false}>
                      Commitments
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/trajectory" prefetch={false}>
                      Trajectory
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <NavSignOut />
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/login" prefetch={false}>
              <Button className="h-11 rounded-xl bg-[#201f18] px-5 text-white hover:bg-[#36342a]">
                Sign in
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile nav */}
        <div className="flex items-center gap-2 lg:hidden">
          {session?.user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-foreground/30">
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
                    <Link href="/setup" prefetch={false}>
                      Set username →
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" prefetch={false}>
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/life-plan" prefetch={false}>
                    Life Plan
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/bucket-list" prefetch={false}>
                    My Bucket Lists
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/commitments" prefetch={false}>
                    Commitments
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/trajectory" prefetch={false}>
                    Trajectory
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <NavSignOut />
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <MobileMenu links={NAV_LINKS} isLoggedIn={!!session?.user} />
        </div>
      </div>
    </nav>
  );
}
