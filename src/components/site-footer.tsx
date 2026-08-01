import Link from 'next/link';

/** Shared footer for all SignificantHobbies routes. */
export function SiteFooter() {
  return (
    <footer data-site-footer className="border-t border-border bg-[#fff4c7] px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-2 gap-8 rounded-3xl bg-white/65 p-6 shadow-[0_12px_32px_rgba(58,45,20,0.06)] sm:grid-cols-5 sm:p-8">
          {/* Brand + manifesto */}
          <div className="col-span-2 sm:col-span-1">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#ffeb3b] font-serif text-lg font-bold text-foreground">
              SH
            </div>
            <p className="font-serif text-lg font-semibold text-foreground">Significant Hobbies</p>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed max-w-[200px]">
              A companion for living intentionally. Hobbies, bucket lists, and side quests — because
              life is finite.
            </p>
            <Link
              href="/life-in-weeks"
              prefetch={false}
              className="mt-3 block w-fit text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              See your life in weeks →
            </Link>
            <Link
              href="/manifesto"
              prefetch={false}
              className="mt-2 inline-block text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              Read the manifesto →
            </Link>
          </div>

          {/* Three pillars */}
          <div>
            <p className="text-xs font-medium text-foreground">Hobbies</p>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
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

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-foreground/10 pt-6 text-xs text-muted-foreground sm:flex-row">
          <span>
            Made by{' '}
            <a href="https://sarthakagrawal.dev" className="hover:text-foreground">
              Sarthak
            </a>
          </span>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 sm:justify-end">
            <Link href="/changelog" prefetch={false} className="hover:text-foreground">
              Changelog
            </Link>
            <a
              href="https://github.com/Significant-Hobbies/significanthobbies/issues"
              className="hover:text-foreground"
            >
              Roadmap
            </a>
            <a
              href="https://github.com/Significant-Hobbies/significanthobbies"
              className="hover:text-foreground"
            >
              Source
            </a>
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
