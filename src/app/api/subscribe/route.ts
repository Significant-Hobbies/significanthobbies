import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email } = (await request.json()) as { email: string; source?: string };

  if (!email?.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
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
