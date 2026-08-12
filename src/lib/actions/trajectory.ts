'use server';

import { eq } from 'drizzle-orm';

import { users } from '~/db/schema';
import type { TrajectoryBucket, TrajectoryEntryRow, TrajectoryEraRow } from '~/lib/trajectory';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';

export interface TrajectoryEraWithEntries extends TrajectoryEraRow {
  entries: TrajectoryEntryRow[];
}

export interface TrajectoryState {
  erasByBucket: Record<TrajectoryBucket, TrajectoryEraWithEntries[]>;
}

export async function getUserBirthYear(): Promise<number | null> {
  const session = await getServerAuthSession();
  if (!session?.user?.id) return null;
  const me = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { birthYear: true },
  });
  return me?.birthYear ?? null;
}
