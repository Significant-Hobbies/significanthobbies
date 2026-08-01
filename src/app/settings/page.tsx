import { eq } from 'drizzle-orm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { SpotlightCard } from '~/components/aceternity';
import { users } from '~/db/schema';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';

import { ProfileForm } from './profile-form';

export const metadata = {
  title: 'Settings — SignificantHobbies',
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const session = await getServerAuthSession();

  const user = session?.user?.id
    ? await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
        columns: {
          id: true,
          name: true,
          username: true,
          bio: true,
          website: true,
          creed: true,
        },
      })
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      {/* Back link */}
      {user?.username && (
        <Link
          href={`/u/${user.username}`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to profile
        </Link>
      )}

      <header className="mb-8 rounded-[1.75rem] bg-[#c5abfa] px-6 py-10 text-[#241a31] shadow-[0_14px_40px_rgba(73,49,112,0.10)] sm:px-10">
        <p className="text-base font-bold">Your corner of the atlas</p>
        <h1 className="mt-4 font-serif text-5xl font-medium leading-none tracking-[-0.03em] sm:text-6xl">
          Settings
        </h1>
      </header>

      <SpotlightCard className="border-0" innerClassName="p-6 sm:p-9">
        <h2 className="mb-6 font-serif text-3xl font-medium text-foreground">Edit profile</h2>
        <ProfileForm
          initialName={user?.name ?? ''}
          initialBio={user?.bio ?? ''}
          initialWebsite={user?.website ?? ''}
          initialCreed={user?.creed ?? ''}
          username={user?.username ?? ''}
          storageMode={session?.user ? 'account' : 'local'}
        />
      </SpotlightCard>
    </div>
  );
}
