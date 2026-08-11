import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  createNativeHandoffCode,
  hashNativeHandoffCode,
  isAllowedNativeCallback,
} from './native-handoff';
import { parseNativeStateEnvelope } from './native-state';

describe('native account boundary', () => {
  it('accepts only the exact Significant Hobbies callback', () => {
    expect(isAllowedNativeCallback('significanthobbies://auth')).toBe(true);
    expect(isAllowedNativeCallback('significanthobbies://auth.evil.example')).toBe(false);
    expect(isAllowedNativeCallback('https://significanthobbies.com/auth')).toBe(false);
  });

  it('creates opaque, one-way handoff material', async () => {
    const first = createNativeHandoffCode();
    const second = createNativeHandoffCode();
    expect(first).toHaveLength(43);
    expect(first).not.toBe(second);
    expect(await hashNativeHandoffCode(first)).toBe(await hashNativeHandoffCode(first));
    expect(await hashNativeHandoffCode(first)).not.toBe(await hashNativeHandoffCode(second));
  });

  it('requires schema one and an explicit optimistic revision', () => {
    expect(
      parseNativeStateEnvelope({ document: { schemaVersion: 1 }, baseRevision: null })
    ).toEqual({ document: { schemaVersion: 1 }, baseRevision: null });
    expect(
      parseNativeStateEnvelope({ document: { schemaVersion: 2 }, baseRevision: null })
    ).toBeNull();
    expect(parseNativeStateEnvelope({ document: { schemaVersion: 1 } })).toBeNull();
    expect(
      parseNativeStateEnvelope({ document: { schemaVersion: 1 }, baseRevision: -1 })
    ).toBeNull();
  });

  it('validates native Apple identity and never links by email implicitly', async () => {
    const [auth, client] = await Promise.all([
      readFile(resolve(process.cwd(), 'src/lib/auth.ts'), 'utf8'),
      readFile(
        resolve(process.cwd(), 'ios/Sources/SignificantHobbies/NativeAccountClient.swift'),
        'utf8'
      ),
    ]);

    expect(auth).toMatch(/appBundleIdentifier:\s*appleBundleIdentifier/);
    expect(auth).toMatch(/disableImplicitLinking:\s*true/);
    expect(auth).toMatch(/allowDifferentEmails:\s*true/);
    expect(client).toMatch(/\/api\/auth\/sign-in\/social/);
    expect(client).toMatch(/\/api\/auth\/link-social/);
    expect(client).toMatch(/set-auth-token/);
  });
});
