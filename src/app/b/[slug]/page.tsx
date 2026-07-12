import type { Metadata } from 'next';
import { and, eq, ne } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { PublicBingo } from '~/components/bucket-list/public-bingo';
import { bucketLists, users } from '~/db/schema';
import { draftFromStoredRecord, generateLifeBingo } from '~/lib/life-bingo';
import { db } from '~/server/db';

async function getPublicList(slug: string) {
  const [result] = await db
    .select({
      list: bucketLists,
      ownerName: users.name,
    })
    .from(bucketLists)
    .leftJoin(users, eq(bucketLists.userId, users.id))
    .where(and(eq(bucketLists.slug, slug), ne(bucketLists.visibility, 'PRIVATE')))
    .limit(1);
  return result ?? null;
}

function getDemoDraft() {
  const draft = generateLifeBingo({
    horizon: 'season',
    intentions: ['adventure', 'creativity', 'connection'],
    boldness: 'brave',
    seed: 'public-life-bingo-demo',
  });
  draft.title = 'A season of saying yes';
  draft.subtitle = 'Nine small reasons to leave the usual path.';
  draft.items = draft.items.map((item, index) =>
    [0, 4].includes(index)
      ? { ...item, completedAt: '2026-07-12T00:00:00.000Z', note: 'A day worth keeping.' }
      : item
  );
  return draft;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (slug === 'demo') {
    return {
      title: 'A Season of Saying Yes',
      description: 'A sample Life Bingo board. Remix it into a private bucket list of your own.',
      robots: { index: false, follow: true },
    };
  }
  const result = await getPublicList(slug);
  if (!result) return { title: 'Life Bingo Not Found' };
  return {
    title: result.list.title,
    description: result.list.subtitle || 'A bucket list in its most playable form.',
    robots:
      result.list.visibility === 'PUBLIC'
        ? { index: true, follow: true }
        : { index: false, follow: false },
    openGraph: {
      title: result.list.title,
      description: result.list.subtitle || 'A bucket list in its most playable form.',
      type: 'website',
    },
  };
}

export default async function SharedBingoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === 'demo') {
    return <PublicBingo draft={getDemoDraft()} ownerName="A curious person" />;
  }
  const result = await getPublicList(slug);
  if (!result) notFound();
  const draft = draftFromStoredRecord(result.list);
  if (!draft) notFound();
  return <PublicBingo draft={draft} ownerName={result.ownerName} />;
}
