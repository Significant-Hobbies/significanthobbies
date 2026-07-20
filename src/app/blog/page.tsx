import type { Metadata } from 'next';
import Link from 'next/link';

import {
  CardHoverEffect,
  FadeIn,
  GridBackground,
  SpotlightCard,
  StaggerContainer,
  StaggerItem,
} from '~/components/aceternity';
import type { BlogPost } from '~/lib/blog-posts';
import { editorialArticles } from '~/lib/editorial-content';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Thoughts on hobbies, identity, and living curiously. Articles on the psychology of leisure, rekindled passions, and finding what matters.',
};

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

function PostCardContent({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  const style = categoryStyle(post.category);

  return (
    <div className="group relative h-full">
      {/* Top accent */}
      <div
        className={`absolute inset-x-0 top-0 origin-left scale-x-0 bg-gradient-to-r from-foreground to-foreground/60 transition-transform duration-300 group-hover:scale-x-100 ${
          featured ? 'h-1 rounded-t-3xl' : 'h-0.5'
        }`}
      />

      {/* Emoji */}
      <div
        className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${
          featured
            ? 'flex h-24 w-24 items-center justify-center rounded-2xl border border-border bg-card/40 text-5xl shadow-sm'
            : 'p-6 pb-0 text-4xl'
        }`}
      >
        {post.emoji}
      </div>

      <div className={`flex flex-1 flex-col ${featured ? '' : 'p-6 pt-4'}`}>
        {/* Category + meta */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style.bg} ${style.text} ${style.border}`}
          >
            {post.category}
          </span>
          <span className="text-xs text-muted-foreground">{post.readTime} min read</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">{post.publishedAt}</span>
        </div>

        {/* Title */}
        {featured ? (
          <h2 className="mb-3 text-2xl font-bold leading-snug text-foreground transition-colors group-hover:text-foreground sm:text-3xl">
            {post.title}
          </h2>
        ) : (
          <h3 className="mb-2 text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-foreground">
            {post.title}
          </h3>
        )}

        {/* Excerpt */}
        <p
          className={`flex-1 leading-relaxed text-muted-foreground ${
            featured ? 'text-base sm:text-lg' : 'line-clamp-2 text-sm'
          }`}
        >
          {post.excerpt}
        </p>

        {/* Footer */}
        {featured ? (
          <div className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-foreground transition-all duration-200 group-hover:gap-2">
            Read article
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </div>
        ) : (
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="text-xs text-muted-foreground">{post.readTime} min read</span>
            <span className="text-xs font-semibold text-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              Read →
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function PostCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full" prefetch={false}>
      {featured ? (
        <SpotlightCard
          className={`h-full shadow-soft ${featured ? 'rounded-3xl' : 'rounded-2xl'}`}
          innerClassName={`flex h-full flex-col ${featured ? 'gap-6 p-8 sm:flex-row sm:items-center sm:gap-12 sm:p-10' : ''}`}
        >
          <PostCardContent post={post} featured />
        </SpotlightCard>
      ) : (
        <CardHoverEffect className="h-full overflow-hidden rounded-2xl p-0 shadow-soft transition-transform duration-300 hover:-translate-y-0.5">
          <div className="flex h-full flex-col">
            <PostCardContent post={post} />
          </div>
        </CardHoverEffect>
      )}
    </Link>
  );
}

export default function BlogPage() {
  const [featured, ...rest] = editorialArticles;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-20 sm:py-28">
        <GridBackground variant="dots" size={22} />
        <div className="relative mx-auto max-w-5xl text-center">
          <FadeIn className="mb-5 inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-foreground/10 px-4 py-1.5 text-sm font-semibold text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
            The Hobby Journal
          </FadeIn>

          <FadeIn delay={0.08}>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              The Hobby Journal
            </h1>
          </FadeIn>

          <FadeIn delay={0.16}>
            <p className="mx-auto max-w-xl text-lg text-muted-foreground sm:text-xl">
              Thoughts on hobbies, identity, and living curiously.
            </p>
          </FadeIn>

          {/* Decorative dots */}
          <FadeIn delay={0.24} className="mt-8 flex justify-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-foreground/60"
                style={{ opacity: 0.4 + i * 0.12 }}
              />
            ))}
          </FadeIn>
        </div>
      </section>

      {/* Content */}
      <section className="px-4 py-14">
        <div className="mx-auto max-w-5xl">
          {/* Featured post */}
          {featured && (
            <FadeIn className="mb-10">
              <p className="mb-4 text-sm font-semibold text-muted-foreground">Featured</p>
              <PostCard post={featured} featured />
            </FadeIn>
          )}

          {/* Divider */}
          <FadeIn className="mb-10 flex items-center gap-4">
            <div className="h-px flex-1 bg-foreground/10" />
            <p className="text-sm font-semibold text-muted-foreground">All articles</p>
            <div className="h-px flex-1 bg-foreground/10" />
          </FadeIn>

          {/* Rest of posts grid */}
          {rest.length > 0 && (
            <StaggerContainer className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {rest.map((post) => (
                <StaggerItem key={post.slug} className="h-full">
                  <PostCard post={post} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </section>

      {/* Back to site */}
      <section className="border-t border-border px-4 py-10">
        <FadeIn className="mx-auto max-w-5xl text-center">
          <p className="mb-3 text-sm text-muted-foreground">Ready to map your own hobby story?</p>
          <Link
            href="/timeline/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-md"
          >
            Build your timeline
            <span>→</span>
          </Link>
          <div className="mt-5">
            <Link
              href="/"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              ← Back to SignificantHobbies
            </Link>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
