import { describe, expect, it } from 'vitest';

import { readLocalRecord, writeLocalRecord, type LocalRecordAdapter } from './local-record-store';

function memoryAdapter(options?: { failWrites?: boolean }) {
  const records = new Map<string, unknown>();
  const adapter: LocalRecordAdapter = {
    async get(key) {
      return records.get(key);
    },
    async put(key, value) {
      if (options?.failWrites) throw new Error('quota exceeded');
      records.set(key, value);
    },
    async remove(key) {
      records.delete(key);
    },
  };
  return { adapter, records };
}

describe('local record store', () => {
  it('persists and validates isolated domain records', async () => {
    const { adapter } = memoryAdapter();
    await writeLocalRecord(adapter, 'trajectory:state', 'trajectory', { name: 'one' });
    await writeLocalRecord(adapter, 'daily:state', 'daily', { name: 'two' });

    await expect(
      readLocalRecord(
        adapter,
        'trajectory:state',
        'trajectory',
        (value): value is { name: string } =>
          !!value && typeof value === 'object' && 'name' in value
      )
    ).resolves.toEqual({ name: 'one' });
  });

  it('quarantines invalid records instead of loading them', async () => {
    const { adapter, records } = memoryAdapter();
    records.set('trajectory:state', { schemaVersion: 99, value: 'future' });
    await expect(
      readLocalRecord(
        adapter,
        'trajectory:state',
        'trajectory',
        (value): value is string => typeof value === 'string'
      )
    ).resolves.toBeNull();
    expect(records.has('trajectory:state')).toBe(false);
    expect([...records.keys()].some((key) => key.startsWith('quarantine:trajectory:state:'))).toBe(
      true
    );
  });

  it('reports unavailable or exhausted storage', async () => {
    const { adapter } = memoryAdapter({ failWrites: true });
    await expect(writeLocalRecord(adapter, 'key', 'domain', {})).rejects.toThrow('quota exceeded');
  });
});
