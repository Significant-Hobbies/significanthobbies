import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { eq } from 'drizzle-orm';

import { account, session, user, users, verification } from '~/db/schema';
import { db } from '~/server/db';

const canUseLocalAuthSecret =
  process.env.NODE_ENV !== 'production' ||
  process.env.npm_lifecycle_event === 'build' ||
  process.env.NEXT_PHASE === 'phase-production-build';

const authSecret =
  process.env.BETTER_AUTH_SECRET?.trim() ||
  (canUseLocalAuthSecret ? 'significant-hobbies-local-development-secret-32-chars' : undefined);

const baseURL = process.env.BETTER_AUTH_URL?.trim() || 'https://significanthobbies.com';
const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

export const auth = betterAuth({
  secret: authSecret,
  baseURL,
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: { user, session, account, verification },
  }),
  socialProviders:
    googleClientId && googleClientSecret
      ? { google: { clientId: googleClientId, clientSecret: googleClientSecret } }
      : {},
  trustedOrigins: [baseURL],
  databaseHooks: {
    user: {
      create: {
        after: async (authUser) => {
          // Mirror the auth_user row into the app-level User table so that
          // foreign keys (Habit.userId, Timeline.userId, etc.) resolve.
          // Uses the same id as auth_user to keep them 1:1.
          const existing = await db.query.users.findFirst({
            where: eq(users.id, authUser.id),
            columns: { id: true },
          });
          if (!existing) {
            await db.insert(users).values({
              id: authUser.id,
              name: authUser.name,
              email: authUser.email,
              image: authUser.image ?? null,
            });
          }
        },
      },
    },
  },
});
