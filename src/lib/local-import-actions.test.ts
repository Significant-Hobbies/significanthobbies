import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync('src/lib/actions/local-import.ts', 'utf8');
const coordinator = readFileSync('src/components/local-import-coordinator.tsx', 'utf8');

describe('local account import', () => {
  it('validates ownership and uses stable ids for retries', () => {
    expect(source).toContain('existing.userId !== userId');
    expect(source).toContain('if (!existing)');
    expect(source).toContain("startsWith('local-habit-')");
    expect(source).toContain("startsWith('local-commitment-')");
  });

  it('preserves account journal entries and archives only after success', () => {
    expect(source).toContain('if (!existingDay)');
    expect(coordinator.indexOf('await importLocalAccountData')).toBeLessThan(
      coordinator.indexOf('await Promise.all(DIRECT_KEYS.map')
    );
    expect(coordinator).toContain('Your device copy is safe');
  });
});
