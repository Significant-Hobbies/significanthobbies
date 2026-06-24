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
  { href: '/hobbies', label: 'Discover' },
  { href: '/find-your-hobby', label: 'Quiz' },
  { href: '/bucket-lists', label: '✨ Bucket Lists' },
  { href: '/side-quests', label: 'Side Quests' },
  { href: '/explore', label: 'Explore' },
  { href: '/blog', label: 'Blog' },
];

export async function Nav() {
  const session = await getServerAuthSession();

  return (
    <nav className="sticky top-0 z-50 border-b border-stone-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          prefetch={false}
          className="text-lg font-semibold tracking-tight text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          SignificantHobbies
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-2 md:flex">
          <NavLinks links={NAV_LINKS} />

          {session?.user ? (
            <>
              <Link href="/dashboard" prefetch={false}>
                <Button variant="ghost" size="sm" className="text-stone-500 hover:text-stone-700">
                  Dashboard
                </Button>
              </Link>
              <Link href="/timeline/new" prefetch={false}>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  New Timeline
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user.image ?? ''} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm">
                        {session.user.name?.[0] ?? 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 border-stone-200 bg-white">
                  {session.user.username ? (
                    <DropdownMenuItem asChild>
                      <Link href={`/u/${session.user.username}`} prefetch={false}>
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link href="/setup" prefetch={false} className="text-yellow-600">
                        Set username →
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" prefetch={false}>
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-stone-200" />
                  <NavSignOut />
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/login" prefetch={false}>
              <Button
                size="sm"
                variant="outline"
                className="border-stone-300 text-stone-600 hover:text-stone-900"
              >
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
                <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image ?? ''} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm">
                      {session.user.name?.[0] ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 border-stone-200 bg-white">
                {session.user.username ? (
                  <DropdownMenuItem asChild>
                    <Link href={`/u/${session.user.username}`} prefetch={false}>
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link href="/setup" prefetch={false} className="text-yellow-600">
                      Set username →
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" prefetch={false}>
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-stone-200" />
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
