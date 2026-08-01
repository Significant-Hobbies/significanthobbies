import { ArrowRight, Dice5, ListChecks } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

export function LiveMoreAtlas({
  name,
  currentHobbies = [],
  nextThings = [],
}: {
  name?: string | null;
  currentHobbies?: string[];
  nextThings?: string[];
}) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] bg-white text-[#201f18] shadow-[0_18px_50px_rgba(66,55,22,0.10)]">
      <div className="grid min-h-[34rem] lg:grid-cols-[0.92fr_1.08fr]">
        <div className="relative flex flex-col justify-center bg-[#f7e957] px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
          <p className="text-base font-bold">Live More</p>
          <h1 className="mt-5 max-w-xl font-serif text-5xl font-medium leading-[0.98] tracking-[-0.035em] sm:text-6xl xl:text-7xl">
            Don&apos;t just plan a life. Go have one.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-[#4d4828] sm:text-lg">
            {name ? `${name}, pick` : 'Pick'} one thing that makes the next few days feel more
            alive. It can be tiny. It only has to be real.
          </p>
          <Link
            href="/side-quests"
            className="mt-8 inline-flex min-h-12 w-fit items-center gap-2 rounded-xl bg-[#201f18] px-5 font-semibold text-white shadow-[0_5px_0_#b9a91f] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#201f18] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7e957]"
          >
            Give me something to do
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="relative min-h-80 overflow-hidden lg:min-h-full">
          <Image
            src="/images/live-more/lake-jump-v1.webp"
            alt="Friends laughing and jumping into a lake on a sunny afternoon"
            fill
            priority
            sizes="(min-width: 1024px) 54vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>

      <div className="bg-[#fffdf3] px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
        <div className="mb-9 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <h2 className="max-w-lg font-serif text-4xl font-medium tracking-[-0.025em] sm:text-5xl">
            Four ways back into your life
          </h2>
          <p className="max-w-sm text-base leading-relaxed text-[#4b493d]">
            Browse less. Choose one door and make a small move through it.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <PhotoPath
            href="/find-your-hobby"
            title="Find a hobby"
            note="Follow a curiosity until it becomes part of your week."
            action="Find your thing"
            image="/images/live-more/pottery-v1.webp"
            alt="Hands shaping a clay bowl at a sunlit community pottery table"
            className="lg:col-span-7"
          />

          <ColorPath
            href="/bucket-list/new"
            title="Want something bigger"
            note="Name the experiences you would regret leaving unlived."
            action="Add a possibility"
            className="bg-[#ff9d7d] lg:col-span-5"
            icon={<ListChecks className="size-7" strokeWidth={1.8} aria-hidden="true" />}
          />

          <ColorPath
            href="/life-bingo"
            title="Make life playful"
            note="Turn this season into a board of small, surprising wins."
            action="Play Life Bingo"
            className="bg-[#c5abfa] lg:col-span-5"
            icon={<Dice5 className="size-7" strokeWidth={1.8} aria-hidden="true" />}
          />

          <PhotoPath
            href="/side-quests"
            title="Do something this week"
            note="Take a detour. Try the slightly odd thing. Collect a story."
            action="Pick a side quest"
            image="/images/live-more/bike-ride-v1.webp"
            alt="Two friends riding bicycles through a colorful neighborhood at golden hour"
            className="lg:col-span-7"
          />
        </div>
      </div>

      {(currentHobbies.length > 0 || nextThings.length > 0) && (
        <div className="grid gap-8 border-t border-[#e7dfbd] bg-white px-6 py-9 sm:px-10 lg:px-14 md:grid-cols-2">
          <LifeList
            title="Already lighting you up"
            items={currentHobbies}
            empty="Nothing here yet. That is what the paths above are for."
          />
          <LifeList
            title="Things calling your name"
            items={nextThings}
            empty="Your next possibility can start small."
          />
        </div>
      )}
    </section>
  );
}

function PhotoPath({
  href,
  title,
  note,
  action,
  image,
  alt,
  className,
}: {
  href: string;
  title: string;
  note: string;
  action: string;
  image: string;
  alt: string;
  className: string;
}) {
  return (
    <Link
      href={href}
      className={`group grid min-h-[28rem] overflow-hidden rounded-2xl bg-white text-[#201f18] shadow-[0_8px_24px_rgba(66,55,22,0.10)] ${className}`}
    >
      <div className="relative min-h-64 overflow-hidden">
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 58vw, 100vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
        />
      </div>
      <div className="p-6 sm:flex sm:items-end sm:justify-between sm:gap-6 sm:p-7">
        <div>
          <h3 className="font-serif text-3xl font-medium tracking-[-0.02em] text-[#201f18]">
            {title}
          </h3>
          <p className="mt-2 max-w-md text-base leading-relaxed text-[#4b493d]">{note}</p>
        </div>
        <span className="mt-5 inline-flex min-h-11 shrink-0 items-center gap-2 border-b-2 border-[#201f18] text-base font-bold sm:mt-0">
          {action}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function ColorPath({
  href,
  title,
  note,
  action,
  icon,
  className,
}: {
  href: string;
  title: string;
  note: string;
  action: string;
  icon: ReactNode;
  className: string;
}) {
  return (
    <Link
      href={href}
      className={`group flex min-h-[28rem] flex-col justify-between rounded-2xl p-7 text-[#261e18] transition-transform hover:-translate-y-0.5 sm:p-8 ${className}`}
    >
      {icon}
      <div>
        <h3 className="max-w-sm font-serif text-4xl font-medium leading-[1.03] tracking-[-0.025em]">
          {title}
        </h3>
        <p className="mt-4 max-w-sm text-base leading-relaxed text-[#3f3028]">{note}</p>
        <span className="mt-7 inline-flex min-h-11 items-center gap-2 border-b-2 border-current text-base font-bold">
          {action}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function LifeList({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <div>
      <p className="text-sm font-bold text-[#514d3b]">{title}</p>
      {items.length ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {items.slice(0, 6).map((item) => (
            <li key={item} className="rounded-full bg-[#f7e957] px-3 py-1.5 text-base font-medium">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-base text-[#514d3b]">{empty}</p>
      )}
    </div>
  );
}
