import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Clapperboard, Compass, Sparkles } from 'lucide-react';
import { VideoCard } from '~/components/video/video-card';
import { publishedVideos } from '~/lib/videos';

const hasPublishedVideos = publishedVideos.length > 0;

export const metadata: Metadata = {
  title: 'Hobby Videos That Get You Doing',
  description:
    'Practical hobby field films with clear takeaways, chapters, and one small thing to try next.',
  alternates: { canonical: '/videos' },
  robots: hasPublishedVideos ? { index: true, follow: true } : { index: false, follow: true },
  openGraph: {
    title: 'Hobby Videos That Get You Doing',
    description: 'Watch less passively. Find a hobby, try a Side Quest, and keep the experience.',
    url: '/videos',
    images: [
      { url: '/opengraph-image', width: 1200, height: 630, alt: 'Significant Hobbies field films' },
    ],
  },
};

export default function VideosPage() {
  const [featured, ...rest] = publishedVideos;

  return (
    <div className="min-h-screen bg-[#f7f1e7] text-stone-900">
      <section className="relative overflow-hidden border-b border-[#ddd1bd] px-4 py-20 sm:py-28">
        <div className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-[#d6e5d8]/70 blur-3xl" />
        <div className="relative mx-auto max-w-6xl">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.26em] text-emerald-700">
            <Clapperboard className="h-4 w-4" /> Field films
          </p>
          <div className="mt-7 grid items-end gap-8 lg:grid-cols-[1fr_0.55fr]">
            <h1 className="max-w-4xl font-serif text-6xl font-semibold leading-[0.9] tracking-[-0.055em] sm:text-8xl">
              Watch something. Then do something.
            </h1>
            <p className="max-w-md text-lg leading-8 text-stone-600">
              Practical films for finding hobbies, beginning badly, and turning curiosity into a
              life you can remember.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          {featured ? (
            <>
              <VideoCard video={featured} featured />
              {rest.length > 0 && (
                <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {rest.map((video) => (
                    <VideoCard key={video.slug} video={video} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="grid gap-8 rounded-[2rem] border border-[#d8cbb6] bg-[#fffdf8] p-8 shadow-sm sm:p-12 lg:grid-cols-[1fr_0.8fr] lg:items-center">
              <div>
                <span className="inline-grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-800">
                  <Sparkles className="h-6 w-6" />
                </span>
                <h2 className="mt-7 max-w-2xl font-serif text-4xl font-semibold leading-tight tracking-[-0.035em] sm:text-5xl">
                  The first field films are being made.
                </h2>
                <p className="mt-5 max-w-xl text-base leading-7 text-stone-600">
                  No filler and no endless watching. Every film will come with the useful notes,
                  chapters, sources, and one concrete experience to try next.
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-[#20352c] p-7 text-[#fffaf0] sm:p-9">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a9c8b7]">
                  While the camera rolls
                </p>
                <h3 className="mt-4 font-serif text-3xl font-semibold">
                  Find the hobby that fits now.
                </h3>
                <div className="mt-7 grid gap-3">
                  <Link
                    href="/find-your-hobby"
                    className="inline-flex items-center justify-between rounded-xl bg-[#f3d776] px-5 py-4 text-sm font-bold text-[#20352c] transition hover:bg-[#f8e7a6]"
                  >
                    Take the hobby quiz <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/side-quests"
                    className="inline-flex items-center justify-between rounded-xl border border-white/20 px-5 py-4 text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    Try a Side Quest <Compass className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
