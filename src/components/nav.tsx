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
  { href: '/hobbies', label: 'Hobbies' },
  { href: '/bucket-lists', label: 'Bucket Lists' },
  { href: '/side-quests', label: 'Side Quests' },
  { href: '/daily', label: 'Daily' },
];

export async function Nav() {
  const session = await getServerAuthSession();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          prefetch={false}
          className="text-base font-semibold tracking-tight text-foreground hover:opacity-80 transition-opacity"
        >
          SignificantHobbies
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-2 md:flex">
          <NavLinks links={NAV_LINKS} />

          {session?.user ? (
            <>
              <Link href="/timeline/new" prefetch={false}>
                <Button size="sm">New Timeline</Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-foreground/30">
                    <Avatar className="h-8 w-8">
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
                    <Link href="/commitments" prefetch={false}>
                      Commitments
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <NavSignOut />
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/login" prefetch={false}>
              <Button size="sm" variant="outline">
                Sign in
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile nav */}
        <div className="flex items-center gap-2 md:hidden">
          {session?.user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-foreground/30">
                  <Avatar className="h-8 w-8">
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
                  <Link href="/commitments" prefetch={false}>
                    Commitments
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
