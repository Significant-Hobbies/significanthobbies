-- Bucket lists with a shareable Life Bingo view. Additive and safe for existing production databases.
CREATE TABLE IF NOT EXISTS "BucketList" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "subtitle" TEXT NOT NULL DEFAULT '',
  "horizon" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "boldness" TEXT NOT NULL,
  "defaultView" TEXT NOT NULL DEFAULT 'LIST',
  "intentions" TEXT NOT NULL DEFAULT '[]',
  "items" TEXT NOT NULL DEFAULT '[]',
  "visibility" TEXT NOT NULL DEFAULT 'PRIVATE',
  "slug" TEXT UNIQUE,
  "createdAt" INTEGER NOT NULL DEFAULT (unixepoch()),
  "updatedAt" INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS "BucketList_userId_idx" ON "BucketList" ("userId");
CREATE INDEX IF NOT EXISTS "BucketList_slug_idx" ON "BucketList" ("slug");
CREATE INDEX IF NOT EXISTS "BucketList_visibility_idx" ON "BucketList" ("visibility");
