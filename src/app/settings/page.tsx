import { eq } from 'drizzle-orm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

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

  if (!session?.user?.id) {
    redirect('/login');
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: {
      id: true,
      name: true,
      username: true,
      bio: true,
      website: true,
    },
  });

  if (!user) redirect('/login');

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      {/* Back link */}
      {user.username && (
        <Link
          href={`/u/${user.username}`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to profile
        </Link>
      )}

      <h1 className="mb-8 text-2xl font-bold text-foreground">Settings</h1>

      <SpotlightCard className="shadow-soft" innerClassName="p-6">
        <h2 className="mb-5 text-base font-semibold text-foreground">Edit profile</h2>
        <ProfileForm
          initialName={user.name ?? ''}
          initialBio={user.bio ?? ''}
          initialWebsite={user.website ?? ''}
          username={user.username ?? ''}
        />
      </SpotlightCard>
    </div>
  );
}
