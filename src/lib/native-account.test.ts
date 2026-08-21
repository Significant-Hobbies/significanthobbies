import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  createNativeHandoffCode,
  hashNativeHandoffCode,
  isAllowedNativeCallback,
} from './native-handoff';
import { nativeAppleAudiences } from './native-apple';
import { parseNativeStateEnvelope } from './native-state';

describe('native account boundary', () => {
  it('accepts only exact callbacks owned by the personal app family', () => {
    expect(isAllowedNativeCallback('significanthobbies://auth')).toBe(true);
    expect(isAllowedNativeCallback('calorie://auth')).toBe(true);
    expect(isAllowedNativeCallback('kith://auth')).toBe(true);
    expect(isAllowedNativeCallback('setline://auth')).toBe(true);
    expect(isAllowedNativeCallback('habits://auth')).toBe(true);
    expect(isAllowedNativeCallback('anchor://auth')).toBe(true);
    expect(isAllowedNativeCallback('significanthobbies://auth.evil.example')).toBe(false);
    expect(isAllowedNativeCallback('anchor://auth.evil.example')).toBe(false);
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
    const auth = await readFile(resolve(process.cwd(), 'src/lib/auth.ts'), 'utf8');
    expect(auth).toMatch(/appBundleIdentifier:\s*appleBundleIdentifier/);
    expect(auth).toMatch(/audience:\s*appleNativeAudiences/);
    expect(auth).toMatch(/disableImplicitLinking:\s*true/);
    expect(auth).toMatch(/allowDifferentEmails:\s*true/);
  });

  it('accepts only the explicit personal-app Apple audiences', () => {
    expect(
      nativeAppleAudiences(
        'com.significanthobbies.app',
        ' com.significanthobbies.future,com.significanthobbies.kith '
      )
    ).toEqual([
      'com.significanthobbies.app',
      'com.significanthobbies.calorie',
      'com.significanthobbies.setline',
      'com.significanthobbies.kith',
      'com.significanthobbies.indulge',
      'com.significanthobbies.anchor',
      'com.significanthobbies.future',
    ]);
  });
});
