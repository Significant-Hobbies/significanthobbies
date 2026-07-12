import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Play } from 'lucide-react';
import type { PublishedVideo } from '~/lib/videos';

export function VideoCard({
  video,
  featured = false,
}: {
  video: PublishedVideo;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/videos/${video.slug}`}
      className={`group grid overflow-hidden rounded-[1.75rem] border border-stone-200 bg-[#fffdf8] shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl ${featured ? 'md:grid-cols-[1.12fr_0.88fr]' : ''}`}
    >
      <div className="relative aspect-video overflow-hidden bg-stone-900">
        <Image
          src={video.thumbnailUrl}
          alt=""
          fill
          sizes={featured ? '(min-width: 768px) 58vw, 100vw' : '(min-width: 768px) 33vw, 100vw'}
          className="object-cover transition duration-500 group-hover:scale-[1.025]"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
        <span className="absolute bottom-4 left-4 grid h-12 w-12 place-items-center rounded-full bg-[#fffaf0] text-emerald-800 shadow-lg transition group-hover:scale-105">
          <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden="true" />
        </span>
      </div>
      <div className={`flex flex-col justify-between ${featured ? 'p-7 sm:p-9' : 'p-6'}`}>
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-emerald-700">
            Field film · {video.shortTitle}
          </p>
          <h2
            className={`mt-4 font-serif font-semibold leading-[1.02] tracking-[-0.035em] text-stone-900 ${featured ? 'text-4xl' : 'text-3xl'}`}
          >
            {video.title}
          </h2>
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-stone-600">{video.description}</p>
        </div>
        <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-emerald-700">
          Watch and try it{' '}
          <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}
