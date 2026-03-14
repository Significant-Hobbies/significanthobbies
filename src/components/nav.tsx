import Link from "next/link";
import { getServerAuthSession } from "~/server/auth";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { NavSignOut } from "./nav-sign-out";
import { MobileMenu } from "./mobile-menu";
import { Search } from "lucide-react";

const NAV_LINKS = [
  { href: "/hobbies", label: "Discover" },
  { href: "/explore", label: "Explore" },
  { href: "/side-quests", label: "Side Quests" },
  { href: "/blog", label: "Blog" },
];

export async function Nav() {
  const session = await getServerAuthSession();

  return (
    <nav className="sticky top-0 z-50 border-b border-stone-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          SignificantHobbies
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-2 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant="ghost"
                size="sm"
                className="text-stone-500 hover:text-stone-700"
              >
                {link.label}
              </Button>
            </Link>
          ))}

          <Link href="/search">
            <Button
              variant="ghost"
              size="sm"
              className="text-stone-500 hover:text-stone-700"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Button>
          </Link>

          {session?.user ? (
            <>
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-stone-500 hover:text-stone-700"
                >
                  Dashboard
                </Button>
              </Link>
              <Link href="/timeline/new">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  New Timeline
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user.image ?? ""} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm">
                        {session.user.name?.[0] ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 border-stone-200 bg-white"
                >
                  {session.user.username ? (
                    <DropdownMenuItem asChild>
                      <Link href={`/u/${session.user.username}`}>
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link href="/setup" className="text-yellow-600">
                        Set username →
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-stone-200" />
                  <NavSignOut />
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/login">
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
                    <AvatarImage src={session.user.image ?? ""} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm">
                      {session.user.name?.[0] ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 border-stone-200 bg-white"
              >
                {session.user.username ? (
                  <DropdownMenuItem asChild>
                    <Link href={`/u/${session.user.username}`}>
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link href="/setup" className="text-yellow-600">
                      Set username →
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-stone-200" />
                <NavSignOut />
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <MobileMenu
            links={NAV_LINKS}
            isLoggedIn={!!session?.user}
          />
        </div>
      </div>
    </nav>
  );
}
