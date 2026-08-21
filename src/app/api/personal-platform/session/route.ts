import { and, eq } from 'drizzle-orm';

import { account } from '@/db/schema';
import { auth } from '@/lib/auth';
import { db } from '@/server/db';

function json(payload: unknown, status = 200): Response {
  return Response.json(payload, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function GET(request: Request): Promise<Response> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user.id) {
    return json({ code: 'UNAUTHORIZED', message: 'Sign in to continue.' }, 401);
  }

  const appleAccount = await db.query.account.findFirst({
    where: and(eq(account.userId, session.user.id), eq(account.providerId, 'apple')),
    columns: { accountId: true },
  });

  return json({
    userId: session.user.id,
    email: session.user.email,
    appleSubject: appleAccount?.accountId ?? null,
  });
}
