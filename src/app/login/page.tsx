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
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-emerald-600">SignificantHobbies</h1>
          <p className="mt-2 text-stone-500">Sign in to save and share your hobby journey</p>
        </div>
        <LoginForm />
        <p className="mt-4 text-center text-xs text-stone-400">
          Or{' '}
          <Link href="/timeline/new" className="text-emerald-600 hover:underline">
            continue as guest
          </Link>{' '}
          — build and export without an account
        </p>
      </div>
    </div>
  );
}
