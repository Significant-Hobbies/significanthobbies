import { describe, expect, it } from 'vitest';

import {
  BUCKET_LIST_CATEGORY_STYLES,
  getBucketListCategoryStyle,
} from '~/lib/bucket-list-category-styles';
import { EXPERIENCES_BY_CATEGORY } from '~/lib/experiences';

describe('bucket-list category styles', () => {
  it('defines an explicit style for every current experience group', () => {
    for (const group of Object.values(EXPERIENCES_BY_CATEGORY)) {
      expect(BUCKET_LIST_CATEGORY_STYLES).toHaveProperty(group.color);
    }
  });

  it('falls back safely for an unexpected future color', () => {
    expect(getBucketListCategoryStyle('future-color')).toEqual(BUCKET_LIST_CATEGORY_STYLES.emerald);
  });
});
