import { and, eq } from 'drizzle-orm';
import type { Metadata } from 'next';

import { FadeIn, GridBackground } from '~/components/aceternity';
import { timelines, users } from '~/db/schema';
import type { Phase } from '~/lib/types';
import { parseJSONColumn } from '~/lib/utils';
import { db } from '~/server/db';

import { CompareJourneysClient } from './compare-client';

export const metadata: Metadata = {
  title: 'Compare Hobby Journeys — SignificantHobbies',
  description:
    "Compare your hobby timeline with a friend. See what hobbies you share, what's unique to each of you, and discover your combined personality.",
};

interface Props {
  searchParams: Promise<{ a?: string; b?: string }>;
}

/**
 * Resolves a username to the phases they have chosen to publish.
 *
 * PUBLIC only. UNLISTED means "reachable by whoever holds the link", not
 * "queryable by name" — this page takes a free-text username, so including
 * UNLISTED here would let anyone enumerate unlisted timelines by guessing
 * usernames.
 */
async function loadPublicJourney(
  username: string,
  logLabel: string
): Promise<{ username: string; phases: Phase[] } | null> {
  const owner = await db.query.users.findFirst({
    where: eq(users.username, username),
    columns: { id: true, username: true },
  });
  if (!owner) return null;

  const publicTimelines = await db
    .select({ phases: timelines.phases })
    .from(timelines)
    .where(and(eq(timelines.userId, owner.id), eq(timelines.visibility, 'PUBLIC')));

  return {
    username: owner.username ?? username,
    phases: publicTimelines.flatMap((t) => parseJSONColumn<Phase[]>(t.phases, [], logLabel)),
  };
}

export default async function CompareJourneysPage({ searchParams }: Props) {
  const { a, b } = await searchParams;

  const usernameA = a?.trim() ?? null;
  const usernameB = b?.trim() ?? null;

  const [userA, userB] = await Promise.all([
    usernameA ? loadPublicJourney(usernameA, 'compare-journeys:userA:phases') : null,
    usernameB ? loadPublicJourney(usernameB, 'compare-journeys:userB:phases') : null,
  ]);

  return (
    <div className="relative mx-auto max-w-5xl px-4 py-12">
      <GridBackground variant="dots" size={22} />
      <FadeIn className="relative mb-10">
        <h1 className="font-serif text-3xl font-semibold text-foreground">
          Compare hobby journeys
        </h1>
        <p className="mt-2 text-muted-foreground">
          See shared hobbies, diverging paths, and your combined personality archetype.
        </p>
      </FadeIn>
      <div className="relative">
        <CompareJourneysClient userA={userA} userB={userB} paramA={usernameA} paramB={usernameB} />
      </div>
    </div>
  );
}
