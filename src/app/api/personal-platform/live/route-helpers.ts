import { auth } from '@/lib/auth';
import { LiveReadError } from '@/server/personal-platform-live';

export async function personalPlatformUser(request: Request): Promise<string | Response> {
  const forwardedUserId = request.headers.get('X-Personal-User-Id');
  if (new URL(request.url).hostname === 'personal-auth.internal' && forwardedUserId) {
    return forwardedUserId;
  }
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user.id || !forwardedUserId || forwardedUserId !== session.user.id) {
    return json({ code: 'UNAUTHORIZED', message: 'Sign in to continue.' }, 401);
  }
  return session.user.id;
}

export function liveReadError(error: unknown): Response {
  if (error instanceof LiveReadError) {
    return json({ code: error.code, message: error.message }, 400);
  }
  throw error;
}

export function json(payload: unknown, status = 200): Response {
  return Response.json(payload, { status, headers: { 'Cache-Control': 'no-store' } });
}
