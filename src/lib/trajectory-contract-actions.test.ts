import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync('src/lib/actions/trajectory-contract.ts', 'utf8');

describe('trajectory contract actions', () => {
  it('owner-scopes contract reads and active transitions', () => {
    expect(source).toContain('eq(trajectoryContracts.userId, session.user.id)');
    expect(source).toContain("eq(trajectoryContracts.status, 'active')");
    expect(source).toContain('eq(trajectoryContracts.id, parsed.data.contractId)');
  });

  it('records every review before applying its decision', () => {
    const reviewInsert = source.indexOf('tx.insert(trajectoryReviews)');
    const statusUpdate = source.indexOf('.update(trajectoryContracts)');
    expect(reviewInsert).toBeGreaterThan(-1);
    expect(statusUpdate).toBeGreaterThan(reviewInsert);
    expect(source).toContain("parsed.data.decision !== 'continue'");
    expect(source).toContain("parsed.data.decision === 'adjust'");
    expect(source).toContain("parsed.data.decision === 'complete'");
    expect(source).toContain(": 'released'");
  });
});
