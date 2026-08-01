import { describe, expect, it } from 'vitest';

import type { LocalRecordAdapter } from './local-record-store';
import {
  archiveLocalTrajectory,
  createLocalTrajectory,
  readLocalTrajectory,
  reviewLocalTrajectory,
} from './local-trajectory';

function memoryAdapter(): LocalRecordAdapter {
  const records = new Map<string, unknown>();
  return {
    async get(key) {
      return records.get(key);
    },
    async put(key, value) {
      records.set(key, value);
    },
    async remove(key) {
      records.delete(key);
    },
  };
}

const contract = {
  constraintsText: 'Limited weekday energy.',
  intentText: 'Make small films.',
  decisionPolicyText: 'Prefer publishing over polishing.',
  feedbackLoopText: 'Review what happened each Sunday.',
  cadence: 'weekly' as const,
};

describe('local trajectory repository', () => {
  it('creates and restores one active trajectory', async () => {
    const adapter = memoryAdapter();
    const created = await createLocalTrajectory(contract, adapter);
    const restored = await readLocalTrajectory(adapter);
    expect(restored.active?.id).toBe(created.active?.id);
    await expect(createLocalTrajectory(contract, adapter)).rejects.toThrow('already have');
  });

  it('continues, adjusts, and preserves history', async () => {
    const adapter = memoryAdapter();
    const created = await createLocalTrajectory(contract, adapter);
    await reviewLocalTrajectory(
      {
        contractId: created.active!.id,
        signalText: 'Short edits were easy to return to.',
        decision: 'continue',
      },
      adapter
    );
    const adjusted = await reviewLocalTrajectory(
      {
        contractId: created.active!.id,
        signalText: 'Publishing weekly was too rigid.',
        decision: 'adjust',
        revision: { ...contract, cadence: 'monthly' },
      },
      adapter
    );
    expect(adjusted.active?.previousContractId).toBe(created.active!.id);
    expect(adjusted.contracts).toHaveLength(2);
    expect(adjusted.reviews).toHaveLength(2);
  });

  it('completes an active trajectory without inventing another', async () => {
    const adapter = memoryAdapter();
    const created = await createLocalTrajectory(contract, adapter);
    const completed = await reviewLocalTrajectory(
      {
        contractId: created.active!.id,
        signalText: 'The film series is finished.',
        decision: 'complete',
      },
      adapter
    );
    expect(completed.active).toBeNull();
    expect(completed.contracts[0]?.status).toBe('completed');
  });

  it('archives imported work only when explicitly requested', async () => {
    const adapter = memoryAdapter();
    await createLocalTrajectory(contract, adapter);
    await archiveLocalTrajectory(adapter);
    await expect(readLocalTrajectory(adapter)).resolves.toEqual({
      active: null,
      contracts: [],
      reviews: [],
    });
    await expect(archiveLocalTrajectory(adapter)).resolves.toBeUndefined();
  });
});
