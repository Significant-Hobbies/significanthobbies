import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "~/components/json-ld";
import { Lumi } from "~/components/lumi";

export const metadata: Metadata = {
  title: "50 Things to Do Before You Turn 50 — Meaningful Bucket List Goals",
  description:
    "50 profound bucket list goals for your 30s and 40s: mentor 10 people, write a book, run a marathon, live abroad, start a foundation, see your grandkids grow. Legacy over novelty.",
  openGraph: {
    title: "50 Things to Do Before You Turn 50",
    description:
      "The 40s are peak ambition. Here are 50 bucket list goals that reflect depth, legacy, and a life fully inhabited.",
  },
  alternates: { canonical: "https://significanthobbies.com/bucket-list-before-50" },
};

const ITEMS: { emoji: string; title: string; desc: string }[] = [
  // Legacy & giving back
  { emoji: "🏛️", title: "Start a foundation or fund something that outlasts you", desc: "A scholarship, a community project, a trust. Something that keeps working after you stop." },
  { emoji: "👩‍🏫", title: "Mentor 10 people meaningfully", desc: "Not advice over coffee — sustained, intentional mentorship that changes someone's trajectory." },
  { emoji: "📖", title: "Write a book", desc: "Memoir, business, fiction. The discipline of writing a book is unlike anything else. The finished object is proof of self." },
  { emoji: "🌱", title: "Plant something that will outlive you", desc: "Trees, a garden, an orchard. Something that will still be growing when you're gone." },
  { emoji: "🎓", title: "Fund a child's education from start to finish", desc: "Sponsor a student all the way through school or university. Watch them graduate." },
  { emoji: "🏡", title: "Build or restore a home", desc: "Design it yourself, or gut-renovate an old one. Live in something you shaped." },
  { emoji: "📜", title: "Write your ethical will", desc: "Not your financial will — your values, lessons, and what you want passed down. The thing that matters." },
  { emoji: "🙏", title: "Spend a year volunteering at serious scale", desc: "Not a one-off day — a sustained year where your absence would genuinely set things back." },
  // Depth & expertise
  { emoji: "🧠", title: "Become a recognized expert in your field", desc: "Spoken at the conferences, quoted in the coverage, asked to advise. The expertise that earns trust." },
  { emoji: "🔬", title: "Learn a second discipline deeply", desc: "If you're in medicine, learn law. If you're in business, learn philosophy. Cross-domain mastery changes how you think." },
  { emoji: "🌐", title: "Live abroad for at least one full year", desc: "Not a posting, not tourism — actual residency. Shopping, commuting, building local relationships." },
  { emoji: "🎭", title: "Perform or exhibit something you made", desc: "A painting show, a musical performance, a comedy night. Make something and put it in front of strangers." },
  { emoji: "🤿", title: "Achieve a serious physical certification", desc: "Divemaster, black belt, mountaineering cert. Something that took years and a real grading process." },
  { emoji: "📡", title: "Build something that reaches a million people", desc: "A product, a piece of writing, a course, a tool. Something that works at genuine scale." },
  // Body & peak fitness
  { emoji: "🏃", title: "Run a marathon", desc: "The full 26.2. After mile 20, everyone discovers something about themselves." },
  { emoji: "🏊", title: "Complete a triathlon", desc: "Sprint or Olympic distance at minimum. The swim, the bike, the run — each one humbling for a different reason." },
  { emoji: "⛰️", title: "Reach peak physical fitness for your age", desc: "Not for vanity — the kind of fitness that makes everything else in life easier." },
  { emoji: "🥋", title: "Earn a black belt or equivalent mastery", desc: "In any martial art or serious physical discipline. The journey is the transformation." },
  { emoji: "🧗", title: "Climb something that genuinely frightens you", desc: "A big wall, a serious alpine route, a peak that requires real technical skill." },
  { emoji: "🚴", title: "Complete a major cycling challenge", desc: "The Tour de France route, a coast-to-coast, a serious multi-day mountain route." },
  // Family & relationships
  { emoji: "👶", title: "Be present for a birth", desc: "Your child's, a sibling's, a close friend's. The arrival of life changes the scale of things." },
  { emoji: "💍", title: "Renew your vows or celebrate a major partnership milestone", desc: "Deliberately, with intention. Not because it's expected — because you mean it more now." },
  { emoji: "🤗", title: "Repair a relationship you've damaged", desc: "The call you've been putting off. Make it." },
  { emoji: "🌅", title: "Take a trip with your parents before it's too late", desc: "While they're well enough to travel. Go somewhere they've always wanted to go." },
  { emoji: "🏠", title: "Create a home that feels like you", desc: "Designed, considered, full of things that mean something. A place that tells your story." },
  // Wisdom & reflection
  { emoji: "🧘", title: "Do a serious meditation retreat (10+ days)", desc: "Vipassana or equivalent. Ten days of silence resets how you relate to your own mind." },
  { emoji: "📚", title: "Read the 100 books you always meant to read", desc: "The classics, the philosophy, the history. The ones you nodded along to pretending you'd read." },
  { emoji: "🗺️", title: "Lose something significant and rebuild from it", desc: "A company, a relationship, a belief. And come back from it with something you didn't have before." },
  { emoji: "✍️", title: "Keep a journal for a decade", desc: "Daily or weekly, consistently. Read it back at the end. The person who started it will be a stranger." },
  { emoji: "🌓", title: "Change your mind publicly on something important", desc: "Find a belief you've held for years and genuinely re-examine it. Change it if the evidence warrants. Say so." },
  // Adventure & experience
  { emoji: "🛥️", title: "Sail somewhere that requires real navigation", desc: "An ocean crossing, a serious coastal passage. Not a sunset cruise — actual seamanship." },
  { emoji: "🌋", title: "Witness a geological or astronomical event", desc: "A total solar eclipse, an erupting volcano, the aurora. Scale that puts your problems in perspective." },
  { emoji: "🏜️", title: "Survive a wilderness expedition", desc: "Multi-day, self-supported, genuinely remote. The kind where your decisions have consequences." },
  { emoji: "✈️", title: "Visit every continent", desc: "Including Antarctica if you can. Each one has a climate, a culture, a geometry that's unlike anywhere else." },
  { emoji: "🎿", title: "Ski or snowboard a black diamond run", desc: "Work up to it. The mountain demands honesty about your limits." },
  // Creative & intellectual
  { emoji: "🎬", title: "Make a documentary about something you care about", desc: "Even a short one. The discipline of finding and telling a true story is extraordinary." },
  { emoji: "🎵", title: "Record and release music you made", desc: "One song, properly produced. Your voice or your instrument, out in the world." },
  { emoji: "🖼️", title: "Have your work shown publicly", desc: "A gallery, a publication, a stage. Something with your name on it, for strangers." },
  { emoji: "🏛️", title: "Teach a class or course", desc: "Formally or informally — something you know well, passed on to people who don't yet." },
  { emoji: "🌍", title: "Speak a second language fluently", desc: "Not at tourist level. Well enough to give a speech, argue a point, make a friend." },
  // Courage & transformation
  { emoji: "💰", title: "Make a bet on yourself", desc: "Leave the job, fund the project, start the company. Something where you're the asset." },
  { emoji: "🤝", title: "Forgive someone you haven't forgiven", desc: "For your sake, not theirs. Carrying a grievance through your 40s is a tax you can stop paying." },
  { emoji: "🚪", title: "Walk away from something comfortable but wrong", desc: "The job, the relationship, the city. Comfortable and right are different things." },
  { emoji: "🌟", title: "Do something that gets you recognized publicly", desc: "An award, a feature, a speaking slot. Not for vanity — for evidence that the work is real." },
  { emoji: "🔑", title: "Own something that matters to your community", desc: "A building, a team, a publication. Stewardship is different from ownership." },
  // Will Smith reference — turning 50 as a mission
  { emoji: "🎂", title: "Turn your next decade birthday into a mission", desc: "Will Smith skydived for his 50th. Make yours a declaration, not a dinner party." },
  { emoji: "🌊", title: "Swim in all five oceans", desc: "Pacific, Atlantic, Indian, Arctic, Southern. A slow, deliberate life goal that forces extraordinary travel." },
  { emoji: "🏆", title: "Win something you genuinely competed for", desc: "A race, a pitch, a competition. Something where other people were trying to beat you." },
  { emoji: "📰", title: "Be quoted or profiled in the press", desc: "For something real — your expertise, your work, your cause. Not a PR stunt." },
  { emoji: "🧬", title: "Understand your own health at a deep level", desc: "Full bloodwork, genetics, a proper physical baseline. Know your body before it tells you something is wrong." },
  { emoji: "🌙", title: "Watch the sunrise from a place that moved you", desc: "Not a beach resort — somewhere that earned the view. A summit, a desert, a cliffside you walked to." },
];

const FAQ_ITEMS = [
  {
    q: "Is it too late to start a bucket list at 40?",
    a: "Your 40s are statistically when most people are at peak earning, network breadth, and accumulated skill. The bucket list doesn't get smaller with age — it gets more specific and more achievable. The resources and context you have at 40 make many goals more possible, not less.",
  },
  {
    q: "How does a before-50 bucket list differ from a before-30 list?",
    a: "The before-30 list is about breadth — experiencing as many forms of life as possible. The before-50 list is about depth — becoming something, leaving something behind, and inhabiting your life rather than sampling it. The shift from novelty to meaning is the defining characteristic.",
  },
  {
    q: "Who inspired turning 50 into a bucket list mission?",
    a: "Will Smith famously skydived for his 50th birthday and has spoken publicly about using milestone birthdays to confront fears and attempt transformative experiences. His approach — treating a birthday as a declaration of intent rather than a retrospective — is worth stealing.",
  },
  {
    q: "What's the single most important thing to do before 50?",
    a: "Mentoring someone. The compounding effect of helping another person across a threshold you've already crossed is enormous — for them and for you. It's also the one goal on this list that forces you to articulate what you actually believe about how to live.",
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

export default function BucketListBefore50Page() {
  return (
    <main>
      <JsonLd data={faqSchema} />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-stone-950 text-white">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {[
            [6, 15], [20, 8], [38, 22], [55, 10], [72, 20], [87, 6],
            [10, 45], [30, 60], [50, 38], [68, 52], [85, 42], [15, 75],
            [45, 80], [70, 85], [90, 68],
          ].map(([x, y], i) => (
            <span
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: i % 4 === 0 ? "2px" : "1px",
                height: i % 4 === 0 ? "2px" : "1px",
                opacity: i % 3 === 0 ? 0.45 : 0.18,
              }}
            />
          ))}
        </div>

        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-3xl scale-[2]" />
              <Lumi size={88} glow float className="relative" />
            </div>
          </div>
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest">
            Guided by Lumi · 50 goals worth your best years
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
            50 Things to Do<br />
            <span className="text-amber-400">Before You Turn 50</span>
          </h1>
          <p className="text-stone-400 text-lg max-w-xl mx-auto">
            The 40s are peak ambition. Here are 50 goals that reflect depth, legacy, and a life fully inhabited — not just visited.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-stone-950 hover:bg-amber-300 transition-colors shadow-[0_0_20px_rgba(245,158,11,0.4)]"
            >
              Build my bucket list
            </Link>
            <Link
              href="/bucket-lists"
              className="inline-flex items-center gap-2 rounded-full border border-stone-700 px-6 py-3 text-sm font-medium text-stone-300 hover:border-stone-500 hover:text-white transition-colors"
            >
              See famous lists →
            </Link>
          </div>
        </div>
        <div className="h-12 bg-gradient-to-b from-stone-950 to-white" />
      </section>

      {/* ── Intro ────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-3xl px-4 py-12 space-y-4">
        <h2 className="text-2xl font-bold text-stone-900">The 40s are peak ambition</h2>
        <p className="text-stone-700 text-base leading-relaxed">
          Something shifts in your 30s and crystallizes in your 40s: you stop trying to figure out who you are and start deciding who you'll become. The before-50 bucket list isn't about novelty — it's about depth. It's the list of the person who knows enough to choose deliberately.
        </p>
        <p className="text-stone-700 text-base leading-relaxed">
          Will Smith skydived for his 50th birthday and has spoken about using decade milestones as declarations of intent — not retrospectives. The goal isn't to arrive at 50 having sampled everything; it's to arrive having become something. This list is built around that principle.
        </p>
        <p className="text-stone-600 text-sm">
          See Will Smith's full bucket list journey:{" "}
          <Link href="/bucket-lists/will-smith" className="text-amber-600 hover:text-amber-800 font-medium transition-colors">
            Will Smith's bucket list →
          </Link>
        </p>
      </div>

      {/* ── List ─────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-4xl px-4 pb-16">
        <div className="grid gap-3 sm:grid-cols-2">
          {ITEMS.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-4 rounded-xl border border-amber-100 bg-amber-50/40 px-4 py-4 hover:border-amber-300 hover:bg-amber-50 transition-colors"
            >
              <span className="text-2xl leading-none mt-0.5">{item.emoji}</span>
              <div className="space-y-1 min-w-0">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-amber-600 shrink-0 mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="font-semibold text-stone-900 text-sm leading-snug">{item.title}</p>
                </div>
                <p className="text-stone-600 text-xs leading-relaxed pl-5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="bg-stone-50 border-t border-stone-200">
        <div className="mx-auto max-w-3xl px-4 py-16 space-y-8">
          <h2 className="text-2xl font-bold text-stone-900">Frequently asked questions</h2>
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
      <section className="bg-amber-50 border-t border-amber-100">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center space-y-6">
          <Lumi size={64} glow float className="mx-auto" />
          <h2 className="text-3xl font-bold text-stone-900">Ready to build yours?</h2>
          <p className="text-stone-600 max-w-md mx-auto">
            Lumi tracks your goals over time, shows you what you've accomplished, and connects your ambitions to the famous people who share them.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-stone-950 hover:bg-amber-300 transition-colors"
            >
              Build my bucket list
            </Link>
            <Link
              href="/bucket-lists"
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-stone-700 hover:border-amber-400 transition-colors"
            >
              Browse famous lists →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
