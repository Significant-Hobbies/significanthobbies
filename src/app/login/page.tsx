import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getServerAuthSession } from '~/server/auth';

import { LoginForm } from './login-form';

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const session = await getServerAuthSession();
  if (session?.user) redirect('/');

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-foreground">Sign in</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Save your hobbies, bucket lists, and side quests. Pick up where you left off.
          </p>
        </div>

        <LoginForm />

        <div className="mt-6 space-y-2.5">
          <p className="text-xs font-medium text-foreground">What you get</p>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li>· Track hobbies across every phase of your life</li>
            <li>· Build bucket lists you&apos;ll actually complete</li>
            <li>· Accept side quests — micro-adventures for the weekend</li>
          </ul>
        </div>

        <p className="mt-6 text-xs text-muted-foreground/60">
          Or{' '}
          <Link
            href="/timeline/new"
            className="text-foreground underline underline-offset-2 hover:opacity-70"
          >
            continue as guest
          </Link>{' '}
          — build and export without an account
        </p>
      </div>
    </div>
  );
}
