import { getTableConfig } from 'drizzle-orm/sqlite-core';
import { describe, expect, it } from 'vitest';

import { habits } from './schema';

describe('habit commitment schema', () => {
  it('keeps the relationship nullable and clears it when a commitment is deleted', () => {
    const config = getTableConfig(habits);
    const column = config.columns.find((candidate) => candidate.name === 'commitmentId');
    const foreignKey = config.foreignKeys.find((candidate) =>
      candidate.reference().columns.includes(column!)
    );

    expect(column?.notNull).toBe(false);
    expect(foreignKey?.onDelete).toBe('set null');
  });

  it('indexes the optional relationship without changing habit log identity', () => {
    const config = getTableConfig(habits);

    expect(config.indexes.some((index) => index.config.name === 'Habit_commitmentId_idx')).toBe(
      true
    );
  });
});
