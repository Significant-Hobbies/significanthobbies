import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { users } from "~/db/schema";
import { db } from "~/server/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username || username.length < 3 || username.length > 20) {
    return NextResponse.json({ available: false, reason: "invalid" });
  }

  if (!/^[a-z0-9-]+$/.test(username)) {
    return NextResponse.json({ available: false, reason: "invalid" });
  }

  const existing = await db.query.users.findFirst({
    where: eq(users.username, username),
    columns: { username: true },
  });

  return NextResponse.json({
    available: !existing,
    reason: existing ? "taken" : null,
  });
}
