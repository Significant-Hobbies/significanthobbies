import { describe, expect, it } from 'vitest';
import { changedContractFields, contractSummary } from './trajectory-contract';

const contract = {
  constraintsText: 'Weekday energy is limited.',
  intentText: 'Make small films consistently.',
  decisionPolicyText: 'Choose finished over ambitious.',
  feedbackLoopText: 'Review desire and friction every Sunday.',
};

describe('trajectory contract', () => {
  it('distills the intent, reality, and choice rule', () => {
    expect(contractSummary(contract)).toBe(
      'Make small films consistently. Given weekday energy is limited, choose finished over ambitious.'
    );
  });

  it('identifies only revised framing fields', () => {
    expect(
      changedContractFields(
        { ...contract, intentText: 'Publish one small film a month.' },
        contract
      )
    ).toEqual(['intentText']);
    expect(changedContractFields(contract, null)).toEqual([]);
  });
});
