import { NextResponse } from "next/server";
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

  const existing = await db.user.findUnique({
    where: { username },
    select: { username: true },
  });

  return NextResponse.json({
    available: !existing,
    reason: existing ? "taken" : null,
  });
}
