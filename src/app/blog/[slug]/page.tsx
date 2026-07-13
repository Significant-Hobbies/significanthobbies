import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  FadeIn,
  GradientMesh,
  SpotlightCard,
  StaggerContainer,
  StaggerItem,
} from '~/components/aceternity';
import { JsonLd } from '~/components/json-ld';
import type { BlogPost, ContentBlock } from '~/lib/blog-posts';
import { editorialArticles, getEditorialArticle } from '~/lib/editorial-content';

/* ─── Static generation ──────────────────────────────────────────────────────── */

export function generateStaticParams() {
  return editorialArticles.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getEditorialArticle(slug);
  if (!post) return { title: 'Not Found' };

  const canonical = `https://significanthobbies.com/blog/${post.slug}`;
  const thumbnail = post.package?.youtube?.thumbnailUrl;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      url: canonical,
      title: post.title,
      description: post.excerpt,
      ...(thumbnail
        ? { images: [{ url: thumbnail }], videos: [{ url: post.package!.youtube!.url }] }
        : {}),
    },
    twitter: {
      card: thumbnail ? 'summary_large_image' : 'summary',
      title: post.title,
      description: post.excerpt,
      ...(thumbnail ? { images: [thumbnail] } : {}),
    },
  };
}

/* ─── Category color helper ──────────────────────────────────────────────────── */

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Wellbeing: { bg: 'bg-foreground/10', text: 'text-foreground', border: 'border-foreground/20' },
  'Getting Started': {
    bg: 'bg-primary/10',
    text: 'text-foreground',
    border: 'border-primary/30',
  },
  Psychology: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  Reflection: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Inspiration: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
};

function categoryStyle(category: string) {
  return (
    CATEGORY_COLORS[category] ?? {
      bg: 'bg-card/40',
      text: 'text-muted-foreground',
      border: 'border-border',
    }
  );
}

/* ─── Content renderer ───────────────────────────────────────────────────────── */

function BlogContent({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'paragraph':
            return (
              <p key={idx} className="scroll-reveal mb-5 text-lg leading-relaxed text-foreground">
                {block.text}
              </p>
            );

          case 'heading':
            if (block.level === 2) {
              return (
                <h2
                  key={idx}
                  className="scroll-reveal-left mb-4 mt-10 text-2xl font-bold text-foreground"
                >
                  {block.text}
                </h2>
              );
            }
            return (
              <h3
                key={idx}
                className="scroll-reveal-left mb-3 mt-8 text-xl font-semibold text-foreground"
              >
                {block.text}
              </h3>
            );

          case 'list':
            return (
              <ul key={idx} className="scroll-reveal mb-5 space-y-2">
                {block.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-lg text-foreground">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            );

          case 'callout':
            return (
              <FadeIn key={idx} className="my-8">
                <SpotlightCard
                  className="border-primary/30 bg-primary/10 shadow-soft"
                  innerClassName="flex gap-4 px-6 py-5"
                >
                  <span className="mt-0.5 shrink-0 text-2xl" role="img" aria-hidden="true">
                    {block.emoji}
                  </span>
                  <p className="text-base italic leading-relaxed text-lumi-300">{block.text}</p>
                </SpotlightCard>
              </FadeIn>
            );

          case 'divider':
            return (
              <div key={idx} className="my-10 flex items-center justify-center gap-3">
                <div className="h-px flex-1 bg-foreground/10" />
                <div className="h-1.5 w-1.5 rounded-full bg-foreground/15" />
                <div className="h-px flex-1 bg-foreground/10" />
              </div>
            );

          case 'quote':
            return (
              <blockquote
                key={idx}
                className="scroll-reveal-blur my-8 border-l-2 border-foreground/40 py-1 pl-6"
              >
                <p className="text-lg italic leading-relaxed text-muted-foreground">
                  &ldquo;{block.text}&rdquo;
                </p>
                {block.attribution && (
                  <cite className="mt-2 block text-sm text-muted-foreground/60 not-italic">
                    — {block.attribution}
                  </cite>
                )}
              </blockquote>
            );

          case 'video': {
            const videoId = block.url.includes('youtu.be/')
              ? block.url.split('youtu.be/')[1]?.split('?')[0]
              : new URL(block.url).searchParams.get('v');
            return (
              <div key={idx} className="scroll-reveal my-10">
                <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
                  <div className="relative aspect-video">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                      title={block.caption ?? 'Video'}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full"
                    />
                  </div>
                </div>
                {block.caption && (
                  <p className="mt-3 text-center text-sm text-muted-foreground/60">
                    {block.caption}
                  </p>
                )}
              </div>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
}

/* ─── Related post card ──────────────────────────────────────────────────────── */

function RelatedCard({ post }: { post: BlogPost }) {
  const style = categoryStyle(post.category);

  return (
    <Link href={`/blog/${post.slug}`} className="group block" prefetch={false}>
      <SpotlightCard className="shadow-soft" innerClassName="flex h-full flex-col p-6">
        <div className="mb-3 text-3xl transition-transform duration-300 group-hover:scale-110">
          {post.emoji}
        </div>
        <span
          className={`mb-2 inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style.bg} ${style.text} ${style.border}`}
        >
          {post.category}
        </span>
        <h3 className="mb-2 text-base font-bold leading-snug text-foreground transition-colors group-hover:text-foreground">
          {post.title}
        </h3>
        <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs text-muted-foreground/60">{post.readTime} min read</span>
          <span className="text-xs font-semibold text-foreground opacity-0 transition-opacity group-hover:opacity-100">
            Read →
          </span>
        </div>
      </SpotlightCard>
    </Link>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getEditorialArticle(slug);

  if (!post) notFound();

  const relatedPosts = editorialArticles.filter((p) => p.slug !== slug).slice(0, 2);

  const style = categoryStyle(post.category);

  return (
    <div className="min-h-screen bg-background">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: post.excerpt,
          datePublished: post.publishedAt,
          author: {
            '@type': 'Organization',
            name: 'SignificantHobbies',
          },
          publisher: {
            '@type': 'Organization',
            name: 'SignificantHobbies',
          },
          mainEntityOfPage: `https://significanthobbies.com/blog/${post.slug}`,
        }}
      />
      {post.package?.youtube && (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'VideoObject',
            name: post.title,
            description: post.excerpt,
            uploadDate: post.package.youtube.publishedAt,
            contentUrl: post.package.youtube.url,
            embedUrl: `https://www.youtube-nocookie.com/embed/${post.package.youtube.videoId}`,
            ...(post.package.youtube.thumbnailUrl
              ? { thumbnailUrl: post.package.youtube.thumbnailUrl }
              : {}),
            ...(post.package.youtube.chapters?.length
              ? {
                  hasPart: post.package.youtube.chapters.map((chapter, index, chapters) => ({
                    '@type': 'Clip',
                    name: chapter.title,
                    startOffset: chapter.startSeconds,
                    ...(chapters[index + 1] ? { endOffset: chapters[index + 1].startSeconds } : {}),
                    url: `${post.package!.youtube!.url}&t=${chapter.startSeconds}`,
                  })),
                }
              : {}),
          }}
        />
      )}
      {/* Back link */}
      <div className="border-b border-border px-4 py-3">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground/60 transition-colors hover:text-foreground"
          >
            <span>←</span>
            <span>Blog</span>
          </Link>
        </div>
      </div>

      {/* Article header */}
      <header className="px-4 pb-12 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          {/* Category + meta row */}
          <div className="scroll-reveal mb-5 flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold ${style.bg} ${style.text} ${style.border}`}
            >
              {post.category}
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-foreground/5 px-3 py-0.5 text-xs text-muted-foreground">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M6 3.5v2.75l1.5 1.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              {post.readTime} min read
            </span>
            <span className="text-xs text-muted-foreground/60">{post.publishedAt}</span>
          </div>

          {/* Emoji */}
          <div className="scroll-reveal scroll-reveal-d1 mb-6 text-6xl sm:text-7xl">
            {post.emoji}
          </div>

          {/* Title */}
          <h1 className="scroll-reveal scroll-reveal-d2 mb-5 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="scroll-reveal scroll-reveal-d3 text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {post.excerpt}
          </p>
        </div>
      </header>

      {/* Article body */}
      <article className="px-4 py-14">
        <div className="mx-auto max-w-3xl">
          {post.package?.youtube && (
            <div className="mb-10 overflow-hidden rounded-2xl border border-border shadow-sm">
              <div className="relative aspect-video">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${post.package.youtube.videoId}`}
                  title={post.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            </div>
          )}
          <BlogContent blocks={post.content} />
          {post.package && (
            <div className="mt-12 space-y-10">
              {post.package.takeaways.length > 0 && (
                <section>
                  <h2 className="mb-4 text-2xl font-bold text-foreground">Key takeaways</h2>
                  <ul className="space-y-2">
                    {post.package.takeaways.map((takeaway) => (
                      <li key={takeaway} className="flex gap-3 text-lg text-foreground">
                        <span aria-hidden="true">✓</span>
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {post.package.productActions.length > 0 && (
                <section>
                  <h2 className="mb-4 text-2xl font-bold text-foreground">Put it into practice</h2>
                  <div className="flex flex-wrap gap-3">
                    {post.package.productActions.map((action) => (
                      <Link
                        key={action.url}
                        href={action.url}
                        className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                      >
                        {action.label} →
                      </Link>
                    ))}
                  </div>
                </section>
              )}
              <section>
                <h2 className="mb-4 text-2xl font-bold text-foreground">Related hobbies</h2>
                <div className="flex flex-wrap gap-2">
                  {post.package.relatedHobbies.map((hobby) => (
                    <Link
                      key={hobby}
                      href={`/hobbies/${encodeURIComponent(hobby.toLowerCase().replace(/\s+/g, '-'))}`}
                      className="rounded-full border border-border px-4 py-2 text-sm text-foreground hover:border-foreground/30"
                    >
                      {hobby}
                    </Link>
                  ))}
                </div>
              </section>
              {post.package.sources.length > 0 && (
                <section>
                  <h2 className="mb-4 text-2xl font-bold text-foreground">Sources</h2>
                  <ol className="space-y-3 text-sm text-muted-foreground">
                    {post.package.sources.map((source) => (
                      <li key={source.url}>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-foreground underline underline-offset-4"
                        >
                          {source.title}
                        </a>
                        {source.claim ? <span> — {source.claim}</span> : null}
                      </li>
                    ))}
                  </ol>
                </section>
              )}
            </div>
          )}
        </div>
      </article>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-border px-4 py-14">
          <div className="mx-auto max-w-3xl">
            {/* Divider with label */}
            <div className="mb-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-foreground/10" />
              <p className="text-sm font-semibold text-muted-foreground/60">
                More from the journal
              </p>
              <div className="h-px flex-1 bg-foreground/10" />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {relatedPosts.map((p, i) => (
                <div key={p.slug} className={`scroll-reveal-flip scroll-reveal-d${i + 1}`}>
                  <RelatedCard post={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="border-t border-border px-4 py-16">
        <div className="scroll-reveal-scale mx-auto max-w-3xl text-center">
          <div className="mb-3 text-3xl">🗺️</div>
          <h2 className="mb-3 text-2xl font-bold text-foreground">
            Ready to map your own hobby journey?
          </h2>
          <p className="mb-6 text-muted-foreground">
            Track your hobbies across life phases. Discover what rekindled, what persisted, and what
            to explore next.
          </p>
          <Link
            href="/timeline/new"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-md"
          >
            Build your timeline →
          </Link>
          <div className="mt-5">
            <Link
              href="/blog"
              className="text-sm text-muted-foreground/60 transition-colors hover:text-muted-foreground"
            >
              ← Back to all articles
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
