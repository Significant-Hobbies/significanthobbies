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
});
