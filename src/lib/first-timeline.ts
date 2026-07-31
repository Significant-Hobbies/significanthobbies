import type { TimelineVisibility } from './types';

const MAX_HOBBY_LENGTH = 100;

export type FirstTimelineStarter = {
  hobbyName: string;
  title: string;
  phaseLabel: string;
};

export function buildFirstTimelineStarter(value: unknown): FirstTimelineStarter | null {
  if (typeof value !== 'string') return null;

  const hobbyName = value.trim().replace(/\s+/g, ' ').slice(0, MAX_HOBBY_LENGTH);
  if (!hobbyName) return null;

  return {
    hobbyName,
    title: `My ${hobbyName} journey`,
    phaseLabel: 'Now',
  };
}

export function firstTimelineDestination(input: {
  id: string;
  slug: string | null;
  username: string | null | undefined;
  isFirst: boolean;
}): string {
  const base =
    input.username && input.slug
      ? `/u/${encodeURIComponent(input.username)}/${encodeURIComponent(input.slug)}`
      : `/timeline/${encodeURIComponent(input.id)}`;
  return input.isFirst ? `${base}?first=1` : base;
}

export function shouldShowFirstTimelinePrompt(input: {
  marker: string | undefined;
  isOwner: boolean;
  visibility: TimelineVisibility;
}): boolean {
  return input.marker === '1' && input.isOwner && input.visibility === 'PRIVATE';
}

export function shouldShowFirstTimelinePublishedConfirmation(input: {
  marker: string | undefined;
  isOwner: boolean;
  visibility: TimelineVisibility;
}): boolean {
  return input.marker === '1' && input.isOwner && input.visibility === 'PUBLIC';
}
