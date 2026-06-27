import { NextResponse } from 'next/server';

import { checkRateLimit, RATE_LIMITS } from '~/lib/rate-limit';

export async function POST(request: Request) {
  const { email } = (await request.json()) as { email: string; source?: string };

  if (!email?.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  // Rate limit by email to prevent subscribe spam (5 per 5 minutes).
  const rl = await checkRateLimit(`subscribe:${email}`, RATE_LIMITS.subscribe);
  if (!rl.allowed) {
    const seconds = Math.ceil((rl.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: `Too many requests. Try again in ${seconds}s.` },
      { status: 429 }
    );
  }

  // Forward to SaaS Maker waitlist (direct API call, no SDK)
  try {
    const { joinWaitlist } = await import('~/lib/saasmaker');
    await joinWaitlist(email);
  } catch {
    // SaaS Maker not available, that's ok
  }

  return NextResponse.json({ ok: true });
}
