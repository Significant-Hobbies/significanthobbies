import { auth } from '@/lib/auth';
import {
  createNativeHandoffCode,
  isAllowedNativeCallback,
  NATIVE_AUTH_CALLBACK,
  saveNativeHandoff,
} from '@/lib/native-handoff';

export async function GET(request: Request): Promise<Response> {
  const requestURL = new URL(request.url);
  const callback = requestURL.searchParams.get('callback') ?? NATIVE_AUTH_CALLBACK;
  if (!isAllowedNativeCallback(callback)) {
    return Response.json(
      { code: 'INVALID_CALLBACK', message: 'The native callback is not allowed.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const redirect = new URL(callback);
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.session.token) {
    redirect.searchParams.set('error', 'google_auth_failed');
    return Response.redirect(redirect);
  }
  const code = createNativeHandoffCode();
  await saveNativeHandoff(code, session.session.token);
  redirect.searchParams.set('code', code);
  return Response.redirect(redirect);
}
