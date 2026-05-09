import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "~/server/db";
import { user, session, account, verification } from "~/db/schema";

const canUseLocalAuthSecret =
  process.env.NODE_ENV !== "production" ||
  process.env.npm_lifecycle_event === "build" ||
  process.env.NEXT_PHASE === "phase-production-build";

const authSecret =
  process.env.BETTER_AUTH_SECRET?.trim() ||
  (canUseLocalAuthSecret
    ? "significant-hobbies-local-development-secret-32-chars"
    : undefined);

const baseURL =
  process.env.BETTER_AUTH_URL?.trim() ||
  process.env.NEXTAUTH_URL?.trim() ||
  "https://significanthobbies.com";
const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
const isProductionRuntime = process.env.NODE_ENV === "production";

export const auth = betterAuth({
  secret: authSecret,
  baseURL,
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: { user, session, account, verification },
  }),
  socialProviders:
    googleClientId && googleClientSecret
      ? { google: { clientId: googleClientId, clientSecret: googleClientSecret } }
      : {},
  trustedOrigins: [baseURL],
  rateLimit: {
    enabled: isProductionRuntime,
    window: 60,
    max: 300,
    customRules: {
      "/api/auth/get-session": false,
      "/api/auth/callback/*": false,
      "/api/auth/sign-in/social": { window: 60, max: 30 },
    },
  },
});
