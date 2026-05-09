import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "~/db/schema";

function createDrizzleClient() {
  const url = process.env.DATABASE_URL?.trim() || "file:./dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim() || undefined;

  const client = createClient({ url, authToken });

  return drizzle(client, { schema });
}

const globalForDrizzle = globalThis as unknown as {
  db: ReturnType<typeof createDrizzleClient> | undefined;
};

export const db = globalForDrizzle.db ?? createDrizzleClient();

if (process.env.NODE_ENV !== "production") globalForDrizzle.db = db;
