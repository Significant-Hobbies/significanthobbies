-- Better-auth core tables. Named auth_user/auth_session/auth_account/auth_verification
-- to avoid case-insensitive collisions with the legacy NextAuth-era tables
-- (User, Account, Session, VerificationToken) which remain untouched.
--
-- The pre-existing empty `verification` table has wrong column types
-- (TEXT timestamps); recreated as `auth_verification` with INTEGER timestamps.

DROP TABLE IF EXISTS "verification";

CREATE TABLE IF NOT EXISTS "auth_user" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "emailVerified" INTEGER NOT NULL DEFAULT 0,
  "image" TEXT,
  "createdAt" INTEGER NOT NULL,
  "updatedAt" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "auth_session" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "expiresAt" INTEGER NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "createdAt" INTEGER NOT NULL,
  "updatedAt" INTEGER NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "userId" TEXT NOT NULL REFERENCES "auth_user"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "auth_session_userId_idx" ON "auth_session" ("userId");

CREATE TABLE IF NOT EXISTS "auth_account" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "auth_user"("id") ON DELETE CASCADE,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" INTEGER,
  "refreshTokenExpiresAt" INTEGER,
  "scope" TEXT,
  "password" TEXT,
  "createdAt" INTEGER NOT NULL,
  "updatedAt" INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS "auth_account_userId_idx" ON "auth_account" ("userId");

CREATE TABLE IF NOT EXISTS "auth_verification" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" INTEGER NOT NULL,
  "createdAt" INTEGER NOT NULL,
  "updatedAt" INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS "auth_verification_identifier_idx" ON "auth_verification" ("identifier");
