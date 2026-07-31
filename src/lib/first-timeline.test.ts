import { describe, expect, it } from 'vitest';

import {
  buildFirstTimelineStarter,
  firstTimelineDestination,
  shouldShowFirstTimelinePublishedConfirmation,
  shouldShowFirstTimelinePrompt,
} from './first-timeline';

describe('first timeline journey', () => {
  it('builds a bounded editable starter from the setup hobby', () => {
    expect(buildFirstTimelineStarter('  film   photography  ')).toEqual({
      hobbyName: 'film photography',
      title: 'My film photography journey',
      phaseLabel: 'Now',
    });
    expect(buildFirstTimelineStarter('x'.repeat(120))?.hobbyName).toHaveLength(100);
  });

  it('does not invent a starter when the setup hobby is absent', () => {
    expect(buildFirstTimelineStarter(undefined)).toBeNull();
    expect(buildFirstTimelineStarter('   ')).toBeNull();
  });

  it('uses the canonical owner route and marks only the first save', () => {
    expect(
      firstTimelineDestination({
        id: 'timeline-1',
        slug: 'film-years',
        username: 'river',
        isFirst: true,
      })
    ).toBe('/u/river/film-years?first=1');
    expect(
      firstTimelineDestination({
        id: 'timeline-2',
        slug: 'guitar',
        username: 'river',
        isFirst: false,
      })
    ).toBe('/u/river/guitar');
    expect(
      firstTimelineDestination({
        id: 'timeline 3',
        slug: null,
        username: null,
        isFirst: true,
      })
    ).toBe('/timeline/timeline%203?first=1');
  });

  it('shows the publication choice only to the owner of a private first timeline', () => {
    expect(
      shouldShowFirstTimelinePrompt({
        marker: '1',
        isOwner: true,
        visibility: 'PRIVATE',
      })
    ).toBe(true);
    expect(
      shouldShowFirstTimelinePrompt({
        marker: '1',
        isOwner: false,
        visibility: 'PRIVATE',
      })
    ).toBe(false);
    expect(
      shouldShowFirstTimelinePrompt({
        marker: '1',
        isOwner: true,
        visibility: 'PUBLIC',
      })
    ).toBe(false);
    expect(
      shouldShowFirstTimelinePrompt({
        marker: undefined,
        isOwner: true,
        visibility: 'PRIVATE',
      })
    ).toBe(false);
  });

  it('confirms publication only after the server-rendered timeline is public', () => {
    expect(
      shouldShowFirstTimelinePublishedConfirmation({
        marker: '1',
        isOwner: true,
        visibility: 'PUBLIC',
      })
    ).toBe(true);
    expect(
      shouldShowFirstTimelinePublishedConfirmation({
        marker: '1',
        isOwner: true,
        visibility: 'PRIVATE',
      })
    ).toBe(false);
    expect(
      shouldShowFirstTimelinePublishedConfirmation({
        marker: '1',
        isOwner: false,
        visibility: 'PUBLIC',
      })
    ).toBe(false);
  });
});
