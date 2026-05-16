import { cache } from "react";
import { auth } from "~/lib/auth";
import { headers } from "next/headers";
import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import { users } from "~/db/schema";

export { auth };

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

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
        username: dbUser?.username ?? null,
      },
    };
  },
);
