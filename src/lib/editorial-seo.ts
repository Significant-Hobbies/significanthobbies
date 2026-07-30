import type { Metadata } from 'next';

import type { EditorialArticle } from '~/lib/editorial-content';
import { DEFAULT_SOCIAL_IMAGE, SITE_URL } from '~/lib/site-metadata';

export function articleCanonicalUrl(article: EditorialArticle): string {
  return `${SITE_URL}/blog/${article.slug}`;
}

export function buildArticleMetadata(article: EditorialArticle): Metadata {
  const canonical = articleCanonicalUrl(article);
  const thumbnail = article.package?.youtube?.thumbnailUrl;

  return {
    title: { absolute: article.title },
    description: article.excerpt,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      url: canonical,
      title: article.title,
      description: article.excerpt,
      images: [{ url: thumbnail ?? DEFAULT_SOCIAL_IMAGE }],
      ...(thumbnail ? { videos: [{ url: article.package!.youtube!.url }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [thumbnail ?? DEFAULT_SOCIAL_IMAGE],
    },
  };
}

export function buildArticleJsonLd(article: EditorialArticle): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    author: {
      '@type': 'Organization',
      name: 'SignificantHobbies',
    },
    publisher: {
      '@type': 'Organization',
      name: 'SignificantHobbies',
    },
    mainEntityOfPage: articleCanonicalUrl(article),
  };
}

export function buildVideoJsonLd(article: EditorialArticle): Record<string, unknown> | null {
  const video = article.package?.youtube;
  if (!video) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: article.title,
    description: article.excerpt,
    uploadDate: video.publishedAt,
    contentUrl: video.url,
    embedUrl: `https://www.youtube-nocookie.com/embed/${video.videoId}`,
    ...(video.thumbnailUrl ? { thumbnailUrl: video.thumbnailUrl } : {}),
    ...(video.chapters?.length
      ? {
          hasPart: video.chapters.map((chapter, index, chapters) => ({
            '@type': 'Clip',
            name: chapter.title,
            startOffset: chapter.startSeconds,
            ...(chapters[index + 1] ? { endOffset: chapters[index + 1].startSeconds } : {}),
            url: `${video.url}&t=${chapter.startSeconds}`,
          })),
        }
      : {}),
  };
}
