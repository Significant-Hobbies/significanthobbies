import { performance } from 'node:perf_hooks';

import { describe, expect, it } from 'vitest';

import { getBucketListSuggestions } from './bucket-list-insights';

const EXISTING_ITEM_COUNTS = [0, 10, 50];
const ITERATIONS = 10;

describe('bucket-list suggestion performance', () => {
  it('scales across existing bucket-list sizes', () => {
    const fixture = getBucketListSuggestions([], 50, 99).map((suggestion) => ({
      title: suggestion.title,
      category: suggestion.category,
    }));
    const metrics: string[] = [];

    for (const size of EXISTING_ITEM_COUNTS) {
      const existingItems = fixture.slice(0, size);
      expect(getBucketListSuggestions(existingItems, 6, 0)).toHaveLength(6);

      let duration = 0;
      for (let iteration = 0; iteration < ITERATIONS; iteration += 1) {
        const startedAt = performance.now();
        const suggestions = getBucketListSuggestions(existingItems, 6, iteration);
        duration += performance.now() - startedAt;
        expect(suggestions).toHaveLength(6);
      }
      metrics.push(`size${size}=${(duration / ITERATIONS).toFixed(3)}ms/op`);
    }

    console.log(`[benchmark] ${metrics.join(' ')} (${ITERATIONS} iterations)`);
  });
});
