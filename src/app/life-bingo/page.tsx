import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Circle, Sparkles } from "lucide-react";
import { BingoBoard } from "~/components/bucket-list/bingo-board";
import { Button } from "~/components/ui/button";
import { generateLifeBingo } from "~/lib/life-bingo";

export const metadata: Metadata = {
  title: "Life Bingo — Make Life Less Repetitive",
  description: "Turn the life you want into a beautiful, playable bucket list. Make a personal Life Bingo board, live it, and keep the stories.",
  alternates: { canonical: "/life-bingo" },
  openGraph: {
    title: "Life Bingo — Make Life Less Repetitive",
    description: "A bucket list you can actually play. Make a personal board in under a minute.",
    type: "website",
  },
};

const sample = generateLifeBingo({
  horizon: "season",
  intentions: ["adventure", "creativity", "connection"],
  boldness: "brave",
  seed: "significant-hobbies-life-bingo-home",
});

sample.title = "My season of saying yes";
sample.subtitle = "Nine small reasons to leave the usual path.";
sample.items = sample.items.map((item, index) =>
  [0, 4, 7].includes(index) ? { ...item, completedAt: "2026-07-12T00:00:00.000Z" } : item,
);

export default function LifeBingoPage() {
  return (
    <div className="overflow-hidden bg-[#f7f1e7] text-stone-900">
      <section
        className="relative px-4 pb-14 pt-10 sm:pb-24 sm:pt-24"
        style={{
          backgroundImage:
            "radial-gradient(circle at 8% 12%, rgba(205,222,201,.58), transparent 31%), radial-gradient(circle at 92% 74%, rgba(226,197,178,.38), transparent 27%)",
        }}
      >
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[0.88fr_1.12fr] lg:gap-20">
          <div>
            <div className="mb-6 inline-flex rotate-[-2deg] items-center gap-2 rounded-full border border-[#c9bfae] bg-[#fffaf0] px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-emerald-800 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" /> Bucket list, but playable
            </div>
            <h1 className="max-w-2xl font-serif text-[clamp(3.35rem,8.5vw,7.2rem)] font-semibold leading-[0.86] tracking-[-0.058em] text-[#1d3028]">
              Make life less repetitive.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-stone-600 sm:mt-7 sm:text-xl">
              Turn the things you keep saying “someday” about into a beautiful board of real experiences. Then go live them.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 rounded-xl bg-[#176b4a] px-6 text-white shadow-[0_10px_30px_rgba(23,107,74,0.2)] hover:bg-[#10583d]">
                <Link href="/bucket-list/new">Make my Life Bingo <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <span className="flex items-center justify-center gap-2 px-3 text-xs font-medium text-stone-500 sm:justify-start"><Check className="h-3.5 w-3.5 text-emerald-700" /> No account needed</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-2xl lg:translate-y-6 lg:rotate-[1.5deg]">
            <div className="absolute -left-6 -top-6 hidden rotate-[-9deg] rounded-lg border border-[#d3c4a9] bg-[#f3d776] px-4 py-3 font-serif text-lg text-stone-800 shadow-md sm:block">
              Start with possibility,<br />not productivity.
            </div>
            <BingoBoard draft={sample} />
          </div>
        </div>
      </section>

      <section className="border-y border-[#d9cfbd] bg-[#fffdf8] px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-700">Not another goal tracker</p>
              <h2 className="mt-4 font-serif text-5xl font-semibold leading-[0.95] tracking-[-0.04em] sm:text-6xl">A list should pull you into your life.</h2>
            </div>
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                ["01", "Choose a chapter", "A month, a season, this year, or whatever comes next."],
                ["02", "Make it yours", "We suggest concrete experiences. You edit anything that does not feel like you."],
                ["03", "Keep the story", "Every completed square becomes a date, a note, and a life you can look back on."],
              ].map(([number, title, copy]) => (
                <article key={number} className="border-t border-stone-300 pt-4">
                  <p className="font-serif text-3xl text-emerald-700">{number}</p>
                  <h3 className="mt-6 text-sm font-bold text-stone-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-500">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl rounded-[2rem] bg-[#1e3029] px-6 py-12 text-[#fffaf0] shadow-[0_30px_90px_rgba(30,48,41,0.24)] sm:px-12 sm:py-16">
          <div className="grid items-end gap-10 md:grid-cols-[1fr_auto]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#a8c5b5]">One list. Two ways to use it.</p>
              <h2 className="mt-4 max-w-3xl font-serif text-5xl font-semibold leading-[0.95] tracking-[-0.04em] sm:text-6xl">Plan it as a list. Live it as Bingo.</h2>
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#d8e2dc]">
                <span className="flex items-center gap-2"><Circle className="h-3.5 w-3.5" /> Add your own ideas</span>
                <span className="flex items-center gap-2"><Circle className="h-3.5 w-3.5" /> Mark moments lived</span>
                <span className="flex items-center gap-2"><Circle className="h-3.5 w-3.5" /> Export the board</span>
              </div>
            </div>
            <Button asChild size="lg" className="h-12 rounded-xl bg-[#f3d776] px-6 text-[#1e3029] hover:bg-[#f7e39a]">
              <Link href="/bucket-list/new">Start with nine squares <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
