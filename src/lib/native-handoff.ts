import { and, eq, gt, lte } from 'drizzle-orm';

import { nativeAuthHandoffs } from '~/db/schema';
import { db } from '~/server/db';

export const NATIVE_AUTH_CALLBACK = 'significanthobbies://auth';
const NATIVE_HANDOFF_TTL_MS = 5 * 60 * 1000;

export function isAllowedNativeCallback(value: string): boolean {
  return value === NATIVE_AUTH_CALLBACK;
}

export function createNativeHandoffCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

export async function hashNativeHandoffCode(code: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function saveNativeHandoff(
  code: string,
  sessionToken: string,
  now = Date.now()
): Promise<void> {
  await db.insert(nativeAuthHandoffs).values({
    codeHash: await hashNativeHandoffCode(code),
    sessionToken,
    expiresAt: now + NATIVE_HANDOFF_TTL_MS,
    createdAt: now,
  });
}

export async function consumeNativeHandoff(code: string, now = Date.now()): Promise<string | null> {
  const codeHash = await hashNativeHandoffCode(code);
  const rows = await db
    .delete(nativeAuthHandoffs)
    .where(and(eq(nativeAuthHandoffs.codeHash, codeHash), gt(nativeAuthHandoffs.expiresAt, now)))
    .returning({ sessionToken: nativeAuthHandoffs.sessionToken });
  await db.delete(nativeAuthHandoffs).where(lte(nativeAuthHandoffs.expiresAt, now));
  return rows[0]?.sessionToken ?? null;
}
