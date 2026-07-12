import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, BookOpen, Check, Clock3, ListPlus, Play } from 'lucide-react';
import { JsonLd } from '~/components/json-ld';
import { VideoAnalytics } from '~/components/video/video-analytics';
import { blogPosts } from '~/lib/blog-posts';
import {
  formatTimestamp,
  getVideoBySlug,
  getVideoCanonicalUrl,
  getVideoJsonLd,
  publishedVideos,
} from '~/lib/videos';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ t?: string }>;
};

export function generateStaticParams() {
  return publishedVideos.map((video) => ({ slug: video.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const video = getVideoBySlug(slug);
  if (!video) return { title: 'Video not found', robots: { index: false, follow: false } };

  return {
    title: video.title,
    description: video.description,
    alternates: { canonical: `/videos/${video.slug}` },
    openGraph: {
      type: 'video.other',
      title: video.title,
      description: video.description,
      url: `/videos/${video.slug}`,
      images: [{ url: video.thumbnailUrl, width: 1280, height: 720, alt: video.title }],
      videos: [
        { url: `https://www.youtube.com/embed/${video.youtubeId}`, width: 1280, height: 720 },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: video.title,
      description: video.description,
      images: [video.thumbnailUrl],
    },
  };
}

export default async function VideoWatchPage({ params, searchParams }: Props) {
  const [{ slug }, { t }] = await Promise.all([params, searchParams]);
  const video = getVideoBySlug(slug);
  if (!video) notFound();

  const requestedStart = Number.parseInt(t ?? '0', 10);
  const startSeconds = Number.isFinite(requestedStart) && requestedStart >= 0 ? requestedStart : 0;
  const relatedArticles = video.relatedArticleSlugs
    .map((articleSlug) => blogPosts.find((post) => post.slug === articleSlug))
    .filter((post) => post !== undefined);

  return (
    <article className="min-h-screen bg-[#f7f1e7] text-stone-900">
      <JsonLd data={getVideoJsonLd(video)} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Videos',
              item: 'https://significanthobbies.com/videos',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: video.shortTitle,
              item: getVideoCanonicalUrl(video),
            },
          ],
        }}
      />
      <VideoAnalytics slug={video.slug} />

      <header className="border-b border-[#ddd1bd] px-4 pb-10 pt-7 sm:pb-14 sm:pt-10">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/videos"
            className="inline-flex items-center gap-2 text-sm font-semibold text-stone-500 transition hover:text-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" /> All field films
          </Link>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.42fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">
                {video.shortTitle}
              </p>
              <h1 className="mt-4 max-w-4xl font-serif text-5xl font-semibold leading-[0.94] tracking-[-0.048em] sm:text-7xl">
                {video.title}
              </h1>
            </div>
            <p className="text-base leading-7 text-stone-600">{video.description}</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="overflow-hidden rounded-[1.5rem] border-4 border-[#20352c] bg-black shadow-[0_28px_80px_rgba(32,53,44,0.22)]">
          <div className="relative aspect-video">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?rel=0&start=${startSeconds}`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-20">
          <div>
            <section aria-labelledby="field-notes-heading">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">
                Field notes
              </p>
              <h2
                id="field-notes-heading"
                className="mt-3 font-serif text-4xl font-semibold tracking-[-0.035em]"
              >
                The useful part, in writing.
              </h2>
              <div className="mt-6 space-y-5 text-lg leading-8 text-stone-700">
                {video.summary.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>

            <section
              className="mt-12 rounded-[1.5rem] border border-[#d8cbb6] bg-[#fffdf8] p-6 sm:p-8"
              aria-labelledby="takeaways-heading"
            >
              <h2 id="takeaways-heading" className="font-serif text-3xl font-semibold">
                Take this with you
              </h2>
              <ul className="mt-6 space-y-4">
                {video.takeaways.map((takeaway) => (
                  <li key={takeaway} className="flex gap-3 text-base leading-7 text-stone-700">
                    <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-800">
                      <Check className="h-3 w-3" />
                    </span>
                    {takeaway}
                  </li>
                ))}
              </ul>
            </section>

            {video.transcript && (
              <section className="mt-14" aria-labelledby="transcript-heading">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-emerald-700" />
                  <h2 id="transcript-heading" className="font-serif text-3xl font-semibold">
                    Edited transcript
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-6 text-stone-500">
                  Edited for readability while preserving the meaning of the film.
                </p>
                <div className="mt-7 space-y-9">
                  {video.transcript.map((section) => (
                    <section key={section.heading}>
                      <h3 className="text-lg font-bold">{section.heading}</h3>
                      <div className="mt-3 space-y-4 text-base leading-7 text-stone-700">
                        {section.paragraphs.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-6">
            <section
              className="rounded-[1.5rem] bg-[#20352c] p-6 text-[#fffaf0]"
              aria-labelledby="chapters-heading"
            >
              <div className="flex items-center gap-2 text-[#a9c8b7]">
                <Clock3 className="h-4 w-4" />
                <h2 id="chapters-heading" className="text-xs font-bold uppercase tracking-[0.2em]">
                  Chapters
                </h2>
              </div>
              <ol className="mt-5 space-y-2">
                {video.chapters.map((chapter) => (
                  <li key={chapter.startSeconds}>
                    <Link
                      href={`/videos/${video.slug}?t=${chapter.startSeconds}`}
                      data-video-event="video_chapter_opened"
                      data-video-label={chapter.title}
                      className="group flex items-start gap-3 rounded-xl px-3 py-3 text-sm transition hover:bg-white/10"
                    >
                      <span className="font-mono text-xs text-[#f3d776]">
                        {formatTimestamp(chapter.startSeconds)}
                      </span>
                      <span className="leading-5">{chapter.title}</span>
                      <Play className="ml-auto mt-0.5 h-3.5 w-3.5 shrink-0 opacity-0 transition group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ol>
            </section>

            <section className="rounded-[1.5rem] border border-[#d8cbb6] bg-[#fffdf8] p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
                Do, do not just save
              </p>
              <h2 className="mt-3 font-serif text-2xl font-semibold">{video.bucketListPrompt}</h2>
              <Link
                href={`/bucket-list/new?idea=${encodeURIComponent(video.bucketListPrompt)}&source=${encodeURIComponent(video.slug)}`}
                data-video-event="video_bucket_list_clicked"
                data-video-label={video.bucketListPrompt}
                className="mt-5 inline-flex w-full items-center justify-between rounded-xl bg-[#f3d776] px-4 py-3 text-sm font-bold text-[#20352c] transition hover:bg-[#f8e7a6]"
              >
                Add to Bucket List <ListPlus className="h-4 w-4" />
              </Link>
              <Link
                href={`/hobbies/${video.hobbySlug}`}
                data-video-event="video_hobby_clicked"
                data-video-label={video.hobbySlug}
                className="mt-3 inline-flex w-full items-center justify-between px-2 py-2 text-sm font-bold text-emerald-700"
              >
                Explore the hobby guide <ArrowRight className="h-4 w-4" />
              </Link>
            </section>

            {relatedArticles.length > 0 && (
              <section className="border-t border-stone-300 pt-6">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
                  Read next
                </h2>
                <div className="mt-4 space-y-3">
                  {relatedArticles.map((post) => (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className="block text-sm font-semibold leading-5 text-stone-800 hover:text-emerald-700"
                    >
                      {post.title} →
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>
    </article>
  );
}
