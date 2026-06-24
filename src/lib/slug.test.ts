import { describe, expect, it } from 'vitest';

import { safeDecodeURIComponent } from './slug';

describe('safeDecodeURIComponent', () => {
  it('decodes valid encoded strings', () => {
    expect(safeDecodeURIComponent('rock%20climbing')).toBe('rock climbing');
  });

  it('returns null for malformed encodings', () => {
    expect(safeDecodeURIComponent('%E0%A4%A')).toBeNull();
  });
});
