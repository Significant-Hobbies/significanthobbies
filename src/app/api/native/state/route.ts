import { and, eq } from 'drizzle-orm';

import { nativeAtlasStates } from '@/db/schema';
import { auth } from '@/lib/auth';
import { MAX_NATIVE_STATE_BYTES, parseNativeStateEnvelope } from '@/lib/native-state';
import { db } from '@/server/db';

type NativeStateRow = { payload: string; revision: number };

function json(payload: unknown, status = 200): Response {
  return Response.json(payload, { status, headers: { 'Cache-Control': 'no-store' } });
}

function parseRow(row: NativeStateRow | undefined): unknown {
  if (!row) return null;
  try {
    const document = JSON.parse(row.payload) as unknown;
    if (!document || typeof document !== 'object') return null;
    return { document, revision: row.revision };
  } catch {
    return null;
  }
}

async function currentUserId(request: Request): Promise<string | null> {
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user.id ?? null;
}

export async function GET(request: Request): Promise<Response> {
  const userId = await currentUserId(request);
  if (!userId) return json({ code: 'UNAUTHORIZED', message: 'Sign in to continue.' }, 401);
  const row = await db.query.nativeAtlasStates.findFirst({
    where: eq(nativeAtlasStates.userId, userId),
    columns: { payload: true, revision: true },
  });
  return json({ state: parseRow(row) });
}

export async function PUT(request: Request): Promise<Response> {
  const userId = await currentUserId(request);
  if (!userId) return json({ code: 'UNAUTHORIZED', message: 'Sign in to continue.' }, 401);

  const declaredLength = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(declaredLength) && declaredLength > MAX_NATIVE_STATE_BYTES) {
    return json({ code: 'STATE_TOO_LARGE', message: 'Life Atlas state is too large.' }, 413);
  }
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_NATIVE_STATE_BYTES) {
    return json({ code: 'STATE_TOO_LARGE', message: 'Life Atlas state is too large.' }, 413);
  }
  const envelope = parseNativeStateEnvelope(
    (() => {
      try {
        return JSON.parse(text) as unknown;
      } catch {
        return null;
      }
    })()
  );
  if (!envelope) {
    return json({ code: 'INVALID_STATE', message: 'Native Life Atlas state is invalid.' }, 400);
  }

  const payload = JSON.stringify(envelope.document);
  const now = Date.now();
  if (envelope.baseRevision === null) {
    const inserted = await db
      .insert(nativeAtlasStates)
      .values({ userId, payload, revision: 1, createdAt: now, updatedAt: now })
      .onConflictDoNothing()
      .returning({ payload: nativeAtlasStates.payload, revision: nativeAtlasStates.revision });
    if (inserted[0]) return json({ state: parseRow(inserted[0]) });
  } else {
    const nextRevision = envelope.baseRevision + 1;
    const updated = await db
      .update(nativeAtlasStates)
      .set({ payload, revision: nextRevision, updatedAt: now })
      .where(
        and(
          eq(nativeAtlasStates.userId, userId),
          eq(nativeAtlasStates.revision, envelope.baseRevision)
        )
      )
      .returning({ payload: nativeAtlasStates.payload, revision: nativeAtlasStates.revision });
    if (updated[0]) return json({ state: parseRow(updated[0]) });
  }

  const current = await db.query.nativeAtlasStates.findFirst({
    where: eq(nativeAtlasStates.userId, userId),
    columns: { payload: true, revision: true },
  });
  return json(
    {
      code: 'STALE_STATE',
      message: 'A newer native Life Atlas is already stored.',
      state: parseRow(current),
    },
    409
  );
}
