import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, source } = await request.json() as { email: string; source?: string };

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // Try SaaS Maker SDK
  try {
    const { saasmaker } = await import("~/lib/saasmaker");
    if (saasmaker?.waitlist) {
      await saasmaker.waitlist.join({ email });
    } else if (saasmaker?.analytics) {
      // Fallback: track as an event
      await saasmaker.analytics.track({ name: "email_subscribe", url: source ?? "/" });
    }
  } catch {
    // SaaS Maker not available, that's ok
  }

  return NextResponse.json({ ok: true });
}
