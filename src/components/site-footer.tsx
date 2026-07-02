import Link from 'next/link';

/** Shared footer for all SignificantHobbies routes. */
export function SiteFooter() {
  return (
    <footer className="border-t border-border px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-5">
          {/* Brand + manifesto */}
          <div className="col-span-2 sm:col-span-1">
            <p className="text-sm font-semibold text-foreground">SignificantHobbies</p>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed max-w-[200px]">
              A companion for living intentionally. Hobbies, bucket lists, and side quests — because
              life is finite.
            </p>
            <Link
              href="/manifesto"
              prefetch={false}
              className="mt-3 inline-block text-xs text-foreground underline underline-offset-2 hover:opacity-70"
            >
              Read the manifesto →
            </Link>
          </div>

          {/* Three pillars */}
          <div>
            <p className="text-xs font-medium text-foreground">Hobbies</p>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/hobbies" prefetch={false} className="hover:text-foreground">
                  Directory
                </Link>
              </li>
              <li>
                <Link href="/find-your-hobby" prefetch={false} className="hover:text-foreground">
                  Find your hobby
                </Link>
              </li>
              <li>
                <Link href="/timeline/new" prefetch={false} className="hover:text-foreground">
                  Build a timeline
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium text-foreground">Bucket Lists</p>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/bucket-lists" prefetch={false} className="hover:text-foreground">
                  Your lists
                </Link>
              </li>
              <li>
                <Link href="/bucket-list-ideas" prefetch={false} className="hover:text-foreground">
                  Ideas
                </Link>
              </li>
              <li>
                <Link
                  href="/how-to-make-a-bucket-list"
                  prefetch={false}
                  className="hover:text-foreground"
                >
                  How to make one
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium text-foreground">Side Quests</p>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/side-quests" prefetch={false} className="hover:text-foreground">
                  Quest board
                </Link>
              </li>
              <li>
                <Link href="/explore" prefetch={false} className="hover:text-foreground">
                  Community
                </Link>
              </li>
              <li>
                <Link href="/blog" prefetch={false} className="hover:text-foreground">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium text-foreground">Daily</p>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/daily" prefetch={false} className="hover:text-foreground">
                  Today&apos;s ritual
                </Link>
              </li>
              <li>
                <Link href="/dashboard" prefetch={false} className="hover:text-foreground">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/commitments" prefetch={false} className="hover:text-foreground">
                  Commitments
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-border pt-6 text-xs text-muted-foreground/60 sm:flex-row">
          <span>
            Made by{' '}
            <a href="https://sarthakagrawal.dev" className="hover:text-foreground">
              Sarthak
            </a>
          </span>
          <div className="flex gap-4">
            <Link href="/privacy" prefetch={false} className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" prefetch={false} className="hover:text-foreground">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
