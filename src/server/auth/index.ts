import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { cache } from 'react';

import { users } from '~/db/schema';
import { auth } from '~/lib/auth';
import { db } from '~/server/db';

export type AppSession = {
  user: {
    id: string;
    email: string | null | undefined;
    name: string | null | undefined;
    image: string | null | undefined;
    username: string | null;
  };
} | null;

// Deduped per request: Nav (in root layout) and the leaf page both call this,
// without cache that's two sequential DB lookups per render.
export const getServerAuthSession = cache(
  async function getServerAuthSession(): Promise<AppSession> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return null;

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: { username: true },
    });

    // Safety net: if the user signed up before the databaseHook was added,
    // they may have an auth_user row but no app-level User row. Create it
    // lazily so foreign keys on Habit/Timeline/etc. resolve.
    if (!dbUser) {
      await db
        .insert(users)
        .values({
          id: session.user.id,
          name: session.user.name ?? null,
          email: session.user.email ?? null,
          image: session.user.image ?? null,
        })
        .onConflictDoNothing();
    }

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
        username: dbUser?.username ?? null,
      },
    };
  }
);
