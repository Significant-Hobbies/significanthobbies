import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "~/components/json-ld";
import { Lumi } from "~/components/lumi";

export const metadata: Metadata = {
  title: "How to Make a Bucket List That You'll Actually Complete — SignificantHobbies",
  description:
    "A step-by-step guide to making a bucket list you'll actually finish — not just write. Six proven steps, from choosing what scares you to quarterly reviews with Lumi.",
  openGraph: {
    title: "How to Make a Bucket List (That You'll Actually Complete)",
    description:
      "Most bucket lists die in a drawer. These six steps keep yours alive — from choosing the right goals to reviewing them quarterly with Lumi.",
  },
  alternates: { canonical: "https://significanthobbies.com/how-to-make-a-bucket-list" },
};

const STEPS = [
  {
    number: 1,
    title: "Start with what scares you (not what sounds good)",
    body: "The most common bucket list mistake is writing what you think you should want. \"See Paris\" lands on ten million lists because it sounds good at a dinner party — not because it lights you up at 2am. The real list starts with the things you've never admitted out loud: the fear you want to conquer, the version of yourself you're quietly building toward. Write those first. The conventional destinations can come later.",
    tip: "Write 10 things you'd be embarrassed to tell anyone you want. Those are your real bucket list.",
  },
  {
    number: 2,
    title: "Use categories — travel, adventure, creative, achievement, social, humanitarian",
    body: "A bucket list that skews entirely toward travel is just a trip planner. A bucket list that skews entirely toward achievement is a career plan with exotic branding. The best lists are balanced across six domains: travel (places and experiences), adventure (physical and sensory), creative (making things that outlast you), achievement (things that require sustained effort), social (relationships and belonging), and humanitarian (giving back and leaving something behind). Fill at least one entry in each category before you finalize your list.",
    tip: "Aim for at least 3–5 items per category. Imbalance reveals blind spots.",
  },
  {
    number: 3,
    title: "Steal from people you admire",
    body: "This is the most underrated shortcut. Look at what the people you respect most have done — not what they post on Instagram, but what they've said, in long interviews and memoirs, they wanted from life. Obama wanted to see Stonehenge. Oprah wanted to walk the Serengeti. Will Smith turned his 50th birthday into a skydiving bucket-list mission. These aren't just interesting facts — they're data points about what a life well-lived looks like. Browse famous lists and take what resonates.",
    tip: "See what's already on famous people's bucket lists",
    link: { href: "/bucket-lists", label: "Browse famous bucket lists →" },
  },
  {
    number: 4,
    title: "Add a deadline or a \"by when\"",
    body: "\"Climb Kilimanjaro\" is a wish. \"Climb Kilimanjaro by my 40th birthday\" is a goal. The difference is everything. A deadline forces you to answer practical questions: how fit do you need to be, what will it cost, who will come with you? It also creates a forcing function — you can work backwards from a date in a way you can't from a vague aspiration. For items that don't naturally have a deadline, add an age milestone or a life event: \"before I have kids,\" \"in my first year of retirement.\"",
    tip: "If you can't imagine a deadline, the item may not belong on your list yet.",
  },
  {
    number: 5,
    title: "Make some items public, keep others private",
    body: "Research on goal-setting is genuinely mixed on whether sharing your goals helps or hurts. What's clear is that it depends on the goal type. Accountability goals — running a marathon, finishing a book, learning a language — benefit from public commitment. Identity goals — the private ambitions that are still fragile and forming — can be killed by premature exposure. Make a rule: share the things you need accountability for, protect the things that are still becoming.",
    tip: "Public accountability works for process goals. Private space works for identity goals.",
  },
  {
    number: 6,
    title: "Review quarterly with Lumi",
    body: "A bucket list is not a static document. It's a living record of who you're becoming. Review it every 90 days: cross off what you've done (and write a note about how it felt), add what's emerged, and drop what no longer fits. The items you're most reluctant to drop — even though life has moved on — deserve the most attention. Lumi tracks your list over time, surfaces what you've neglected, and helps you see the shape of your ambition from year to year.",
    tip: "Schedule your next quarterly review before you close this tab.",
  },
];

const FAQ_ITEMS = [
  {
    q: "How many items should a bucket list have?",
    a: "There's no magic number, but research suggests 50–100 items hits the sweet spot. Fewer than 20 often reflects limited imagination; more than 200 usually dilutes focus. Start with 50 across all six life categories and expand naturally over time.",
  },
  {
    q: "What's the difference between a bucket list and a goal list?",
    a: "A goal list is generally shorter-term, professional, and measurable. A bucket list is for your whole life — it includes the experiences, relationships, and transformations you want before you die. Bucket list items often have deeper emotional resonance and may not be quantifiable.",
  },
  {
    q: "Should I include easy things on my bucket list?",
    a: "Yes. Including achievable items isn't cheating — it creates momentum. Checking off items regularly reinforces the habit of pursuing the list. Mix easy wins (visit a farmers market in a new city) with genuinely hard goals (complete an Ironman) to keep the list dynamic.",
  },
  {
    q: "How do I stop my bucket list from becoming just a travel wishlist?",
    a: "Enforce the six-category rule: travel, adventure, creative, achievement, social, humanitarian. If your list is dominated by one category, set it aside and deliberately fill the others. The most interesting bucket lists reflect every dimension of a full life, not just geography.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

export default function HowToMakeABucketListPage() {
  return (
    <main className="bg-white">
      <JsonLd data={faqSchema} />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="bg-white pt-16 pb-10 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
            <Lumi size={88} glow float className="shrink-0" />
            <div className="space-y-4 text-center sm:text-left">
              <p className="text-[#e05533] text-sm font-semibold uppercase tracking-widest">
                Guided by Lumi · 6 proven steps
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-stone-900 text-balance">
                How to Make a Bucket List{" "}
                <span className="text-[#e05533]">(That You&apos;ll Actually Complete)</span>
              </h1>
              <p className="text-stone-500 text-lg max-w-xl">
                Most bucket lists are forgotten within a week. Here&apos;s the system that keeps yours alive — from choosing the right goals to reviewing them every quarter.
              </p>
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full bg-[#e05533] px-6 py-3 text-sm font-semibold text-white hover:bg-[#c94420] transition-colors shadow-md"
                >
                  Start my bucket list
                </Link>
                <Link
                  href="/bucket-lists"
                  className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-6 py-3 text-sm font-medium text-stone-600 hover:border-[#e05533] hover:text-[#e05533] transition-colors"
                >
                  See famous lists →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Intro ────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-stone-700 text-lg leading-relaxed">
          The average person writes a bucket list twice in their life: once in their 20s, drunk on possibility, and once facing a health scare or milestone birthday. Both times, the list gets forgotten. The problem isn&apos;t motivation — it&apos;s structure. Here&apos;s what actually works.
        </p>
      </div>

      {/* ── Steps ────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-3xl px-4 pb-16 space-y-12">
        {STEPS.map((step) => (
          <section key={step.number} className="scroll-mt-20">
            <div className="flex gap-5">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-[#e05533] flex items-center justify-center">
                  <span className="text-lg font-bold text-white">{step.number}</span>
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-stone-900 leading-snug text-balance">
                  {step.title}
                </h2>
                <p className="text-stone-700 text-base leading-relaxed">{step.body}</p>
                <div className="rounded-xl bg-[#fff0ec] border border-[#f0a090] px-5 py-4">
                  <p className="text-sm font-semibold text-[#c94420]">
                    Lumi tip: {step.tip}
                  </p>
                  {step.link && (
                    <Link
                      href={step.link.href}
                      className="mt-2 inline-flex items-center text-sm font-medium text-[#e05533] hover:text-[#c94420] transition-colors"
                    >
                      {step.link.label}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="bg-stone-50 border-t border-stone-200">
        <div className="mx-auto max-w-3xl px-4 py-16 space-y-8">
          <h2 className="text-2xl font-bold text-stone-900 text-balance">Frequently asked questions</h2>
          <div className="space-y-6">
            {FAQ_ITEMS.map((item) => (
              <div key={item.q} className="rounded-xl border border-stone-200 bg-white px-6 py-5 space-y-3">
                <h3 className="font-semibold text-stone-900">{item.q}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="bg-[#fff0ec] border-t border-[#f0a090]">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center space-y-6">
          <Lumi size={64} glow float className="mx-auto" />
          <h2 className="text-3xl font-bold text-stone-900 text-balance">Ready to build yours?</h2>
          <p className="text-stone-600 max-w-md mx-auto">
            Lumi helps you build, track, and review your bucket list — and shows you the famous person whose ambitions look most like yours.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-[#e05533] px-6 py-3 text-sm font-semibold text-white hover:bg-[#c94420] transition-colors shadow-md"
            >
              Start my bucket list
            </Link>
            <Link
              href="/bucket-lists"
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-stone-700 hover:border-[#e05533] transition-colors"
            >
              Browse famous lists →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
