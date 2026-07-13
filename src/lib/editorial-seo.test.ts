import { describe, expect, it } from 'vitest';

import { buildLlmArticleIndex, GET as getLlmIndex } from '~/app/llms-full.txt/route';
import { buildVideoSitemap, GET as getVideoSitemap } from '~/app/video-sitemap.xml/route';
import nextConfig from '../../next.config';
import type { ContentPackage } from './content-packages';
import type { EditorialArticle } from './editorial-content';
import {
  articleCanonicalUrl,
  buildArticleJsonLd,
  buildArticleMetadata,
  buildVideoJsonLd,
} from './editorial-seo';

const article: EditorialArticle = {
  slug: 'start-watercolor',
  title: 'Start Watercolor & Keep Going',
  excerpt: 'A sourced route into watercolor.',
  category: 'Getting Started',
  emoji: '🎨',
  readTime: 6,
  publishedAt: '2026-07-13',
  content: [{ type: 'paragraph', text: 'Start with one brush.' }],
};

const packageWithVideo = {
  id: 'watercolor-001',
  revision: 1,
  state: 'published',
  slug: article.slug,
  title: article.title,
  excerpt: article.excerpt,
  category: article.category,
  emoji: article.emoji,
  readTime: article.readTime,
  publishedAt: article.publishedAt,
  relatedHobbies: ['Watercolor'],
  sections: [{ heading: 'Start small', paragraphs: ['Start with one brush.'] }],
  takeaways: [],
  productActions: [],
  sources: [{ title: 'A & B', url: 'https://example.com/source' }],
  reels: [],
  youtube: {
    videoId: 'video-123',
    url: 'https://www.youtube.com/watch?v=video-123',
    publishedAt: '2026-07-13T10:00:00.000Z',
    thumbnailUrl: 'https://i.ytimg.com/vi/video-123/maxresdefault.jpg',
    chapters: [
      { title: 'Choose tools', startSeconds: 0 },
      { title: 'Paint', startSeconds: 30 },
    ],
  },
} as ContentPackage;

const videoArticle: EditorialArticle = { ...article, package: packageWithVideo };

describe('editorial discovery and structured data', () => {
  it('keeps canonical, social, and visible Article facts aligned', () => {
    const metadata = buildArticleMetadata(article);
    const jsonLd = buildArticleJsonLd(article);

    expect(articleCanonicalUrl(article)).toBe(
      'https://significanthobbies.com/blog/start-watercolor'
    );
    expect(metadata.alternates?.canonical).toBe(articleCanonicalUrl(article));
    expect(metadata.openGraph).toMatchObject({
      type: 'article',
      url: articleCanonicalUrl(article),
      title: article.title,
      description: article.excerpt,
    });
    expect(metadata.twitter).toMatchObject({ card: 'summary' });
    expect(jsonLd).toMatchObject({
      '@type': 'Article',
      headline: article.title,
      description: article.excerpt,
      datePublished: article.publishedAt,
      mainEntityOfPage: articleCanonicalUrl(article),
    });
    expect(buildVideoJsonLd(article)).toBeNull();
  });

  it('derives a complete VideoObject and ordered chapter clips from the same package', () => {
    const metadata = buildArticleMetadata(videoArticle);
    const jsonLd = buildVideoJsonLd(videoArticle);

    expect(metadata.twitter).toMatchObject({
      card: 'summary_large_image',
      images: [packageWithVideo.youtube!.thumbnailUrl],
    });
    expect(jsonLd).toMatchObject({
      '@type': 'VideoObject',
      name: videoArticle.title,
      description: videoArticle.excerpt,
      uploadDate: packageWithVideo.youtube!.publishedAt,
      contentUrl: packageWithVideo.youtube!.url,
      embedUrl: 'https://www.youtube-nocookie.com/embed/video-123',
      thumbnailUrl: packageWithVideo.youtube!.thumbnailUrl,
      hasPart: [
        {
          '@type': 'Clip',
          name: 'Choose tools',
          startOffset: 0,
          endOffset: 30,
          url: 'https://www.youtube.com/watch?v=video-123&t=0',
        },
        {
          '@type': 'Clip',
          name: 'Paint',
          startOffset: 30,
          url: 'https://www.youtube.com/watch?v=video-123&t=30',
        },
      ],
    });
  });

  it('builds an escaped video sitemap from only video-enriched packages', async () => {
    const xml = buildVideoSitemap([
      packageWithVideo,
      { ...packageWithVideo, id: 'no-video', slug: 'no-video', youtube: null },
    ]);

    expect(xml).toContain('xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"');
    expect(xml).toContain('<loc>https://significanthobbies.com/blog/start-watercolor</loc>');
    expect(xml).toContain('<video:title>Start Watercolor &amp; Keep Going</video:title>');
    expect(xml).not.toContain('/blog/no-video');

    const response = getVideoSitemap();
    expect(response.headers.get('content-type')).toBe('application/xml; charset=utf-8');
    expect(await response.text()).toMatch(/^<\?xml version="1\.0"/);
  });

  it('negotiates the LLM index as Markdown while preserving the plain-text fallback', async () => {
    const body = buildLlmArticleIndex([article]);
    expect(body).toContain(
      '- [Start Watercolor & Keep Going](https://significanthobbies.com/blog/start-watercolor)'
    );

    const markdown = getLlmIndex(
      new Request('https://significanthobbies.com/llms-full.txt', {
        headers: { Accept: 'text/markdown' },
      })
    );
    expect(markdown.headers.get('content-type')).toBe('text/markdown; charset=utf-8');
    expect(markdown.headers.get('vary')).toBe('Accept');
    expect(await markdown.text()).toContain('# SignificantHobbies article index');

    const plain = getLlmIndex(new Request('https://significanthobbies.com/llms-full.txt'));
    expect(plain.headers.get('content-type')).toBe('text/plain; charset=utf-8');
  });

  it('declares permanent redirects for both retired video URL shapes', async () => {
    expect(nextConfig.redirects).toBeTypeOf('function');
    const redirects = await nextConfig.redirects!();
    expect(redirects).toEqual(
      expect.arrayContaining([
        { source: '/videos', destination: '/blog', permanent: true },
        { source: '/videos/:slug', destination: '/blog/:slug', permanent: true },
      ])
    );
  });
});
