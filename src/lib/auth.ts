import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { bearer } from 'better-auth/plugins';
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

/**
 * Email+password sign-in, enabled ONLY for local development and e2e tests.
 *
 * Google OAuth is the sole production sign-in path. Playwright cannot complete
 * an OAuth round-trip, which is why this repo had zero authenticated e2e
 * coverage and why the logged-in surfaces could not be reviewed. Turning on
 * better-auth's own email provider behind a gate lets tests sign in through the
 * real auth path — no fabricated cookies, no hand-rolled signing, no reading of
 * BETTER_AUTH_SECRET.
 *
 * Two independent conditions must both hold, so a production build cannot enable
 * this even if the env var leaks into the environment:
 *   1. NODE_ENV is not 'production'
 *   2. ENABLE_TEST_AUTH is exactly '1'
 *
 * Set by `pnpm dev:test-auth` and the Playwright webServer only. See
 * docs/development/testing.md.
 */
const testAuthEnabled =
  process.env.NODE_ENV !== 'production' && process.env.ENABLE_TEST_AUTH === '1';

const baseURL =
  process.env.BETTER_AUTH_URL?.trim() ||
  (testAuthEnabled ? 'http://localhost:3000' : 'https://significanthobbies.com');
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
  // Off in production. See the comment on `testAuthEnabled` above.
  emailAndPassword: { enabled: testAuthEnabled },
  user: {
    deleteUser: { enabled: true },
  },
  plugins: [bearer()],
  trustedOrigins: [baseURL, 'significanthobbies://auth'],
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
      delete: {
        after: async (authUser) => {
          await db.delete(users).where(eq(users.id, authUser.id));
        },
      },
    },
  },
});
