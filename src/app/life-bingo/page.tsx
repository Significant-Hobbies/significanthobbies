import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, Circle } from 'lucide-react';
import { BingoBoard } from '~/components/bucket-list/bingo-board';
import { Button } from '~/components/ui/button';
import { generateLifeBingo } from '~/lib/life-bingo';

export const metadata: Metadata = {
  title: 'Life Bingo — Make Life Less Repetitive',
  description:
    'Turn the life you want into a beautiful, playable bucket list. Make a personal Life Bingo board, live it, and keep the stories.',
  alternates: { canonical: '/life-bingo' },
  openGraph: {
    title: 'Life Bingo — Make Life Less Repetitive',
    description: 'A bucket list you can actually play. Make a personal board in under a minute.',
    type: 'website',
  },
};

const sample = generateLifeBingo({
  horizon: 'season',
  intentions: ['adventure', 'creativity', 'connection'],
  boldness: 'brave',
  seed: 'significant-hobbies-life-bingo-home',
});

sample.title = 'My season of saying yes';
sample.subtitle = 'Nine small reasons to leave the usual path.';
sample.items = sample.items.map((item, index) =>
  [0, 4, 7].includes(index) ? { ...item, completedAt: '2026-07-12T00:00:00.000Z' } : item
);

const steps = [
  ['01', 'Choose a chapter', 'A month, a season, this year, or whatever comes next.'],
  [
    '02',
    'Make it yours',
    'We suggest concrete experiences. You edit anything that does not feel like you.',
  ],
  [
    '03',
    'Keep the story',
    'Every completed square becomes a date, a note, and a life you can look back on.',
  ],
] as const;

export default function LifeBingoPage() {
  return (
    <div data-life-bingo-page className="overflow-hidden bg-background text-foreground">
      <section className="px-4 py-10 sm:py-14">
        <div className="mx-auto grid max-w-6xl items-center gap-12 overflow-hidden rounded-[1.75rem] bg-[#c5abfa] px-6 py-10 shadow-[0_16px_44px_rgba(73,49,112,0.12)] lg:grid-cols-[0.84fr_1.16fr] lg:gap-16 lg:px-12 lg:py-14">
          <div className="text-[#241a31]">
            <p className="mb-5 text-base font-bold">A bucket list you can play</p>
            <h1 className="max-w-2xl font-serif text-5xl font-medium leading-[0.94] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
              Make life less repetitive.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-[#4b3861] sm:text-xl">
              Turn the things you keep saying “someday” about into a board of real experiences. Then
              go live them.
            </p>
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="h-12 rounded-xl px-6">
                <Link href="/bucket-list/new">
                  Make my Life Bingo <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <span className="flex min-h-11 items-center gap-2 px-2 text-sm text-[#4b3861]">
                <Check className="h-4 w-4 text-growth" /> No account needed
              </span>
            </div>
          </div>

          <div className="mx-auto w-full max-w-2xl">
            <BingoBoard draft={sample} />
          </div>
        </div>
      </section>

      <section className="mt-10 bg-[#fffdf3] px-4 py-20 sm:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
          <div>
            <p className="text-sm font-semibold text-primary">Not another goal tracker.</p>
            <h2 className="mt-4 max-w-xl font-serif text-4xl font-semibold leading-[1.02] tracking-[-0.03em] sm:text-5xl">
              A list should pull you into your life.
            </h2>
          </div>
          <ol className="grid list-none gap-8 sm:grid-cols-3">
            {steps.map(([number, title, copy]) => (
              <li key={number} className="border-t border-border pt-5">
                <p className="font-serif text-2xl text-primary">{number}</p>
                <h3 className="mt-8 text-base font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-[#b9dcf5] px-4 py-20 sm:py-28">
        <div className="mx-auto grid max-w-5xl items-end gap-10 border-y border-border py-12 md:grid-cols-[1fr_auto] sm:py-16">
          <div>
            <p className="text-sm font-semibold text-[#493000]">One list. Two ways to use it.</p>
            <h2 className="mt-4 max-w-3xl font-serif text-4xl font-semibold leading-[1.02] tracking-[-0.03em] sm:text-5xl">
              Plan it as a list. Live it as Bingo.
            </h2>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Circle className="h-3.5 w-3.5 text-primary" /> Add your own ideas
              </span>
              <span className="flex items-center gap-2">
                <Circle className="h-3.5 w-3.5 text-primary" /> Mark moments lived
              </span>
              <span className="flex items-center gap-2">
                <Circle className="h-3.5 w-3.5 text-primary" /> Export the board
              </span>
            </div>
          </div>
          <Button asChild size="lg" className="h-12 rounded-xl px-6">
            <Link href="/bucket-list/new">
              Start with nine squares <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
