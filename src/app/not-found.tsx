import Link from 'next/link';

export const metadata = { title: 'Not found — Significant Hobbies' };

export default function NotFound() {
  return (
    <main className="mx-auto max-w-md px-4 py-24 text-center text-foreground">
      <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">404</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">Not found</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        That timeline or hobby page doesn&apos;t exist or is private.
      </p>
      <div className="mt-6 flex justify-center gap-4 text-sm">
        <Link href="/" className="underline">
          Home
        </Link>
        <Link href="/find-your-hobby" className="underline">
          Find a hobby
        </Link>
        <Link href="/about" className="underline">
          About
        </Link>
      </div>
    </main>
  );
}
