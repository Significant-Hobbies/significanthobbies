import type { Metadata } from 'next';
import { and, eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { BucketListWorkspace } from '~/components/bucket-list/bucket-list-workspace';
import { bucketLists } from '~/db/schema';
import { draftFromStoredRecord, type BingoVisibility } from '~/lib/life-bingo';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';

export const metadata: Metadata = {
  title: 'Edit Bucket List',
  robots: { index: false, follow: false },
};

export default async function BucketListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) redirect('/login');
  const { id } = await params;
  const row = await db.query.bucketLists.findFirst({
    where: and(eq(bucketLists.id, id), eq(bucketLists.userId, session.user.id)),
  });
  if (!row) notFound();
  const draft = draftFromStoredRecord(row);
  if (!draft) notFound();

  return (
    <BucketListWorkspace
      initialDraft={draft}
      isAuthenticated
      listId={row.id}
      initialVisibility={row.visibility as BingoVisibility}
      initialSlug={row.slug}
    />
  );
}
