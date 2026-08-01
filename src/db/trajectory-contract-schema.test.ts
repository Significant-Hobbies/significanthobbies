import { getTableConfig } from 'drizzle-orm/sqlite-core';
import { describe, expect, it } from 'vitest';

import { trajectoryContracts, trajectoryReviews } from './schema';

describe('trajectory contract schema', () => {
  it('keeps one partial unique active-contract index per user', () => {
    const config = getTableConfig(trajectoryContracts);
    const activeIndex = config.indexes.find(
      (index) => index.config.name === 'TrajectoryContract_one_active_per_user_idx'
    );
    expect(activeIndex?.config.unique).toBe(true);
    expect(activeIndex?.config.where).toBeDefined();
  });

  it('keeps reviews private through an owner column and contract cascade', () => {
    const config = getTableConfig(trajectoryReviews);
    expect(config.columns.some((column) => column.name === 'userId')).toBe(true);
    const contractReference = config.foreignKeys.find((key) =>
      key.reference().columns.some((column) => column.name === 'contractId')
    );
    expect(contractReference?.onDelete).toBe('cascade');
  });
});
