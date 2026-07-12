import { z } from 'zod';

const BASE_URL = 'https://significanthobbies.com';

const chapterSchema = z.object({
  title: z.string().trim().min(3).max(90),
  startSeconds: z.number().int().min(0),
});

const transcriptSectionSchema = z.object({
  heading: z.string().trim().min(3).max(120),
  paragraphs: z.array(z.string().trim().min(20)).min(1),
});

export const publishedVideoSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  youtubeId: z.string().regex(/^[A-Za-z0-9_-]{11}$/),
  title: z.string().trim().min(20).max(100),
  shortTitle: z.string().trim().min(8).max(64),
  description: z.string().trim().min(80).max(220),
  searchIntent: z.string().trim().min(12).max(120),
  hobbySlug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  creatorName: z.string().trim().min(2).max(80),
  uploadDate: z.string().date(),
  duration: z.string().regex(/^PT(?=\d|T\d)(?:\d+H)?(?:\d+M)?(?:\d+S)?$/),
  thumbnailUrl: z.string().url().startsWith('https://'),
  summary: z.array(z.string().trim().min(40)).min(2).max(6),
  takeaways: z.array(z.string().trim().min(12).max(180)).min(3).max(7),
  chapters: z.array(chapterSchema).min(3).max(24),
  transcript: z.array(transcriptSectionSchema).optional(),
  relatedArticleSlugs: z.array(z.string()).max(4).default([]),
  bucketListPrompt: z.string().trim().min(12).max(140),
});

export type PublishedVideo = z.infer<typeof publishedVideoSchema>;

function assertChapterOrder(video: PublishedVideo) {
  if (video.chapters[0]?.startSeconds !== 0) {
    throw new Error(`Video "${video.slug}" must start its first chapter at 0 seconds`);
  }

  for (let index = 1; index < video.chapters.length; index += 1) {
    const previous = video.chapters[index - 1]!;
    const current = video.chapters[index]!;
    if (current.startSeconds <= previous.startSeconds) {
      throw new Error(`Video "${video.slug}" chapters must be in ascending order`);
    }
  }
}

export function validatePublishedVideoCatalog(input: unknown[]): PublishedVideo[] {
  const videos = input.map((record) => publishedVideoSchema.parse(record));
  const slugs = new Set<string>();
  const intents = new Set<string>();
  const youtubeIds = new Set<string>();

  for (const video of videos) {
    assertChapterOrder(video);

    const normalizedIntent = video.searchIntent.toLowerCase();
    if (slugs.has(video.slug)) throw new Error(`Duplicate video slug: ${video.slug}`);
    if (intents.has(normalizedIntent))
      throw new Error(`Duplicate video search intent: ${video.searchIntent}`);
    if (youtubeIds.has(video.youtubeId))
      throw new Error(`Duplicate YouTube id: ${video.youtubeId}`);

    slugs.add(video.slug);
    intents.add(normalizedIntent);
    youtubeIds.add(video.youtubeId);
  }

  return videos;
}

/**
 * Only complete, live videos belong here. Draft scripts and placeholder ids are
 * intentionally kept out so they cannot leak into routes or sitemaps.
 */
const VIDEO_CATALOG: unknown[] = [];

export const publishedVideos = validatePublishedVideoCatalog(VIDEO_CATALOG);

export function getVideoBySlug(slug: string): PublishedVideo | undefined {
  return publishedVideos.find((video) => video.slug === slug);
}

export function getVideosForHobby(hobbySlug: string): PublishedVideo[] {
  return publishedVideos.filter((video) => video.hobbySlug === hobbySlug);
}

export function getVideoCanonicalUrl(video: PublishedVideo): string {
  return `${BASE_URL}/videos/${video.slug}`;
}

export function getYouTubePublishingPackage(video: PublishedVideo) {
  const canonicalUrl = getVideoCanonicalUrl(video);
  const chapters = video.chapters
    .map((chapter) => `${formatTimestamp(chapter.startSeconds)} ${chapter.title}`)
    .join('\n');

  return {
    canonicalUrl,
    chapters,
    description: `${video.description}\n\nRead the guide, key takeaways, and next steps: ${canonicalUrl}\n\n${chapters}`,
  };
}

export function formatTimestamp(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const clock = [minutes, seconds].map((part) => part.toString().padStart(2, '0')).join(':');
  return hours > 0 ? `${hours}:${clock}` : clock;
}

export function getVideoJsonLd(video: PublishedVideo) {
  const canonicalUrl = getVideoCanonicalUrl(video);
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description,
    thumbnailUrl: [video.thumbnailUrl],
    uploadDate: video.uploadDate,
    duration: video.duration,
    embedUrl: `https://www.youtube-nocookie.com/embed/${video.youtubeId}`,
    url: canonicalUrl,
    publisher: {
      '@type': 'Organization',
      name: 'SignificantHobbies',
      url: BASE_URL,
    },
    hasPart: video.chapters.map((chapter, index) => ({
      '@type': 'Clip',
      name: chapter.title,
      startOffset: chapter.startSeconds,
      ...(video.chapters[index + 1] ? { endOffset: video.chapters[index + 1]!.startSeconds } : {}),
      url: `${canonicalUrl}?t=${chapter.startSeconds}`,
    })),
    potentialAction: {
      '@type': 'SeekToAction',
      target: `${canonicalUrl}?t={seek_to_second_number}`,
      'startOffset-input': 'required name=seek_to_second_number',
    },
  };
}
