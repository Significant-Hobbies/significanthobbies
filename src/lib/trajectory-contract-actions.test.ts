import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync('src/lib/actions/trajectory-contract.ts', 'utf8');
const clientSource = readFileSync('src/components/trajectory/trajectory-page-client.tsx', 'utf8');

describe('trajectory contract actions', () => {
  it('owner-scopes contract reads and active transitions', () => {
    expect(source).toContain('eq(trajectoryContracts.userId, session.user.id)');
    expect(source).toContain("eq(trajectoryContracts.status, 'active')");
    expect(source).toContain('eq(trajectoryContracts.id, parsed.data.contractId)');
  });

  it('records every review before applying its decision', () => {
    const reviewAction = source.slice(
      source.indexOf('export async function reviewTrajectoryContract')
    );
    const reviewInsert = reviewAction.indexOf('db.insert(trajectoryReviews)');
    const statusUpdate = reviewAction.indexOf('.update(trajectoryContracts)');
    expect(reviewInsert).toBeGreaterThan(-1);
    expect(statusUpdate).toBeGreaterThan(reviewInsert);
    expect(reviewAction).toContain('await db.batch([');
    expect(reviewAction).not.toContain('db.transaction(');
    expect(reviewAction).toContain("parsed.data.decision === 'continue'");
    expect(reviewAction).toContain("parsed.data.decision === 'adjust'");
    expect(reviewAction).toContain("parsed.data.decision === 'complete'");
    expect(reviewAction).toContain(": 'released'");
  });

  it('imports local history idempotently without silent active conflicts', () => {
    expect(source).toContain('inArray(trajectoryContracts.id, ids)');
    expect(source).toContain('if (alreadyImported.length === ids.length) return { success: true }');
    expect(source).toContain('conflict: true');
    expect(source).toContain("mode === 'merge'");
    expect(source).toContain('eq(trajectoryContracts.userId, session.user.id)');
    expect(clientSource.indexOf('await importLocalTrajectory')).toBeLessThan(
      clientSource.indexOf('await archiveLocalTrajectory')
    );
    expect(clientSource).toContain('The device copy stays intact until');
  });
});
