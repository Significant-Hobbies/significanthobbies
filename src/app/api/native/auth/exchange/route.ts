import { consumeNativeHandoff } from '@/lib/native-handoff';

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json().catch(() => null)) as { code?: unknown } | null;
  const code = typeof body?.code === 'string' ? body.code.trim() : '';
  if (code.length < 32 || code.length > 128) {
    return Response.json(
      { code: 'INVALID_HANDOFF', message: 'The sign-in handoff is invalid.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }
  const token = await consumeNativeHandoff(code);
  if (!token) {
    return Response.json(
      { code: 'EXPIRED_HANDOFF', message: 'The sign-in handoff expired or was already used.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }
  return Response.json({ token }, { headers: { 'Cache-Control': 'no-store' } });
}
