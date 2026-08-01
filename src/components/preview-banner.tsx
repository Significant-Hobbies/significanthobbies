import Link from 'next/link';

import { loginPath } from '~/lib/auth-routing';

interface Props {
  /** Route the visitor is previewing; sign-in returns them here. */
  route: string;
  /** What this surface is, in one line. */
  children: React.ReactNode;
  /** Lead sentence; Daily keeps the sample-month default. */
  title?: string;
}

/**
 * Honest header for a signed-out preview.
 *
 * /daily and /trajectory show one stranger's sample month so a visitor can see
 * what the practice looks like before committing a Google account. The banner
 * carries the whole ethical weight of that: it has to say plainly that the
 * content is not theirs and nothing is kept, because the alternative — a
 * surface that looks like a saved journal but silently discards writing — is
 * worse than the sign-in wall it replaced.
 *
 * Not a dismissible toast. It stays for the length of the preview.
 */
export function PreviewBanner({
  route,
  children,
  title = "You're looking at someone else's month.",
}: Props) {
  return (
    <aside
      aria-label="Preview notice"
      className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-3.5 sm:px-5"
    >
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{children}</p>
        </div>
        <Link
          href={loginPath(route)}
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
        >
          Start your own
        </Link>
      </div>
    </aside>
  );
}
