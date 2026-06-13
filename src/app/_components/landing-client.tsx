"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Lumi } from "~/components/lumi";

import {
  SaaSMakerChangelogSection,
  SaaSMakerTestimonialsSection,
} from "~/components/saasmaker-feedback";
import { Button } from "~/components/ui/button";
import type { BlogPost } from "~/lib/blog-posts";
import { getTimelineUrl } from "~/lib/timeline-url";
import type { Phase } from "~/lib/types";

/* ─── Types ──────────────────────────────────────────────────────────────────── */

type DemoTimeline = {
  id: string;
  title: string | null;
  slug: string | null;
  phases: string; // raw JSON string from DB
  user: { name: string | null; username: string | null } | null;
};

interface LandingClientProps {
  demos: DemoTimeline[];
  blogPosts: BlogPost[];
}

/* ─── Constants ──────────────────────────────────────────────────────────────── */

const PHASE_COLORS = [
  { bg: "#D1FAE5", border: "#10b981", label: "Childhood" },
  { bg: "#FEF3C7", border: "#F59E0B", label: "Teen Years" },
  { bg: "#DBEAFE", border: "#3B82F6", label: "College" },
  { bg: "#FCE7F3", border: "#EC4899", label: "Early Career" },
  { bg: "#EDE9FE", border: "#8B5CF6", label: "Now" },
];

const CARD_BORDER_COLORS = [
  "#10b981",
  "#F59E0B",
  "#3B82F6",
  "#EC4899",
  "#8B5CF6",
];

const BLOG_CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Wellbeing: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  "Getting Started": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  Psychology: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  Reflection: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
};

/* ─── Hook: Intersection Observer ────────────────────────────────────────────── */

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry?.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

/* ─── Dark Hero Mini-Card ─────────────────────────────────────────────────────── */

const HERO_CARD_PHASES = [
  { label: "Childhood", color: "#10b981", hobbies: ["LEGO", "swimming", "chess"] },
  { label: "Teens", color: "#F59E0B", hobbies: ["guitar", "skateboarding"] },
  { label: "College", color: "#3B82F6", hobbies: ["hiking", "photography"] },
  { label: "Now", color: "#8B5CF6", hobbies: ["running", "pottery"] },
];

function HeroDarkCard() {
  return (
    <div
      className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl"
      style={{ animation: "fadeInUp 0.7s 0.6s ease-out both", opacity: 0 }}
    >
      {/* Card header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <span className="text-xs font-semibold text-white/70">Sam&apos;s hobby journey</span>
        <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">example</span>
      </div>
      {/* Phase rows */}
      {HERO_CARD_PHASES.map((phase) => (
        <div
          key={phase.label}
          className="flex items-start gap-3 border-b border-white/5 px-4 py-3 last:border-0"
        >
          <div className="flex min-w-[72px] items-center gap-1.5 pt-0.5">
            <div className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: phase.color }} />
            <span className="text-[11px] font-semibold" style={{ color: phase.color }}>{phase.label}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {phase.hobbies.map((h) => (
              <span
                key={h}
                className="rounded-full border px-2 py-0.5 text-[11px] font-medium text-white/80"
                style={{ borderColor: `${phase.color}40`, background: `${phase.color}14` }}
              >
                {h}
              </span>
            ))}
          </div>
        </div>
      ))}
      {/* Footer */}
      <div className="px-4 py-2 text-center text-[10px] text-white/30">
        4 phases · 10 hobbies tracked
      </div>
    </div>
  );
}

/* ─── Section 1: HERO ─────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section
      className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-stone-950 px-6 py-24 lg:px-12"
    >
      {/* Subtle emerald radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background: "radial-gradient(ellipse 80% 50% at 30% 40%, oklch(0.20 0.05 162 / 0.3), transparent)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left: headline + CTAs */}
          <div className="max-w-2xl">
            <h1
              className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl"
              style={{
                lineHeight: 1.05,
                animation: "fadeInUp 0.6s ease-out both",
                opacity: 0,
              }}
            >
              <span className="block">The hobbies that shaped you.</span>
              <span className="block text-stone-400">The life you still want to live.</span>
            </h1>

            <p
              className="mt-4 max-w-xl text-lg text-stone-400 sm:text-xl"
              style={{ animation: "fadeInUp 0.6s 0.2s ease-out both", opacity: 0 }}
            >
              Map every hobby from childhood to now. Build the bucket list you&apos;ll actually complete.
            </p>

            <div
              className="mt-8 flex flex-wrap items-center gap-4"
              style={{ animation: "fadeInUp 0.6s 0.35s ease-out both", opacity: 0 }}
            >
              <Link href="/timeline/new" prefetch={false}>
                <button
                  type="button"
                  className="rounded-full bg-emerald-500 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-400"
                >
                  Start your hobby map →
                </button>
              </Link>
              <Link href="/bucket-lists" prefetch={false}>
                <button
                  type="button"
                  className="rounded-full border border-stone-600 px-7 py-3 text-sm font-semibold text-stone-300 transition-colors hover:border-[#e05533] hover:text-white"
                >
                  Build your bucket list →
                </button>
              </Link>
            </div>

            <p
              className="mt-4 text-sm text-stone-600"
              style={{ animation: "fadeInUp 0.6s 0.5s ease-out both", opacity: 0 }}
            >
              No sign-up required to start
            </p>
          </div>

          {/* Right: dark mini timeline card */}
          <div className="hidden lg:flex lg:justify-end">
            <HeroDarkCard />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Section 2: FEATURE ROW ─────────────────────────────────────────────────── */

const SAMPLE_JOURNEY_PHASES = [
  { label: "Childhood", color: "#10b981", bg: "#D1FAE5", hobbies: ["lego", "swimming", "chess", "drawing"] },
  { label: "Teen Years", color: "#F59E0B", bg: "#FEF3C7", hobbies: ["guitar", "skateboarding", "video games"] },
  { label: "College", color: "#3B82F6", bg: "#DBEAFE", hobbies: ["hiking", "photography", "coding"] },
  { label: "Now", color: "#8B5CF6", bg: "#EDE9FE", hobbies: ["running", "cooking", "pottery"] },
];

function TimelineFeatureCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-100 bg-stone-50 shadow-sm">
      <div className="border-b border-stone-100 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
        Your hobby timeline
      </div>
      {SAMPLE_JOURNEY_PHASES.map((phase) => (
        <div
          key={phase.label}
          className="flex items-start gap-3 border-b border-stone-50 px-5 py-3.5 last:border-0"
          style={{ background: `${phase.bg}55` }}
        >
          <div className="flex min-w-[80px] items-center gap-1.5 pt-0.5">
            <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: phase.color }} />
            <span className="text-[11px] font-semibold" style={{ color: phase.color }}>{phase.label}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {phase.hobbies.map((h) => (
              <span
                key={h}
                className="rounded-full border px-2 py-0.5 text-[11px] font-medium"
                style={{ background: phase.bg, borderColor: `${phase.color}50`, color: phase.color }}
              >
                {h}
              </span>
            ))}
          </div>
        </div>
      ))}
      <div className="px-5 py-3 text-center text-[10px] text-stone-400">
        4 phases · 13 hobbies · your story will look different
      </div>
    </div>
  );
}

function FeatureRow() {
  const { ref, inView } = useInView(0.12);

  return (
    <section className="bg-white px-6 py-24 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div
          ref={ref}
          className="grid grid-cols-1 gap-6 lg:grid-cols-5"
        >
          {/* Large left panel: timeline */}
          <div
            className="lg:col-span-3"
            style={inView ? { animation: "fadeInUp 0.6s ease-out both" } : { opacity: 0 }}
          >
            <div className="mb-3">
              <h2 className="text-balance text-2xl font-bold text-stone-900 sm:text-3xl">
                Every hobby you&apos;ve ever had, mapped across your life
              </h2>
              <p className="mt-2 text-stone-500">
                Build life phases — childhood, teen years, college, career — and tag every interest you remember, even the ones you only tried once.
              </p>
            </div>
            <div className="mt-6">
              <TimelineFeatureCard />
            </div>
          </div>

          {/* Two smaller right panels */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* Personality panel */}
            <div
              className="flex-1 rounded-2xl border border-stone-100 bg-stone-50 p-6"
              style={inView ? { animation: "fadeInUp 0.6s 0.12s ease-out both" } : { opacity: 0 }}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2L12.5 7.5H18L13.5 11L15 17L10 13.5L5 17L6.5 11L2 7.5H7.5L10 2Z" fill="#10b981" />
                </svg>
              </div>
              <h3 className="text-balance text-base font-bold text-stone-900">Discover your hobby archetype</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-500">
                See what stuck across decades, what you rekindled, and the personality archetype your interests reveal.
              </p>
            </div>

            {/* Share panel */}
            <div
              className="flex-1 rounded-2xl border border-stone-100 bg-stone-50 p-6"
              style={inView ? { animation: "fadeInUp 0.6s 0.24s ease-out both" } : { opacity: 0 }}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="5" cy="10" r="2" stroke="#10b981" strokeWidth="1.5" />
                  <circle cx="15" cy="4" r="2" stroke="#10b981" strokeWidth="1.5" />
                  <circle cx="15" cy="16" r="2" stroke="#10b981" strokeWidth="1.5" />
                  <path d="M7 9L13 5M7 11L13 15" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-balance text-base font-bold text-stone-900">Share a beautiful identity card</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-500">
                Export your whole hobby journey as a stunning card — a window into who you are, ready to share anywhere.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Section 3: CORAL BUCKET LIST PANEL ─────────────────────────────────────── */

const FAMOUS_PILLS = [
  { name: "Will Smith", emoji: "🎬", slug: "will-smith" },
  { name: "Obama", emoji: "🇺🇸", slug: "barack-obama" },
  { name: "Serena", emoji: "🎾", slug: "serena-williams" },
  { name: "Musk", emoji: "🚀", slug: "elon-musk" },
  { name: "Branson", emoji: "🎈", slug: "richard-branson" },
  { name: "Zuckerberg", emoji: "💻", slug: "mark-zuckerberg" },
];

function CoralBucketListPanel() {
  const { ref, inView } = useInView(0.12);

  return (
    <section
      ref={ref}
      className="px-6 py-24 lg:px-12"
      style={{ background: "#c94420" }}
    >
      <div className="mx-auto max-w-4xl text-center">
        {/* Lumi */}
        <div
          className="mb-8 flex justify-center"
          style={inView ? { animation: "fadeInUp 0.5s ease-out both" } : { opacity: 0 }}
        >
          <Lumi size={72} onDark />
        </div>

        {/* Headline */}
        <h2
          className="text-balance text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
          style={inView ? { animation: "fadeInUp 0.6s 0.1s ease-out both" } : { opacity: 0 }}
        >
          What will you do before you die?
        </h2>

        {/* Sub */}
        <p
          className="mx-auto mt-4 max-w-xl text-lg text-white/80"
          style={inView ? { animation: "fadeInUp 0.6s 0.2s ease-out both" } : { opacity: 0 }}
        >
          Twelve remarkable people wrote theirs down. Browse their bucket lists — then build yours.
        </p>

        {/* Famous person pills */}
        <div
          className="mt-8 flex flex-wrap justify-center gap-2"
          style={inView ? { animation: "fadeInUp 0.6s 0.3s ease-out both" } : { opacity: 0 }}
        >
          {FAMOUS_PILLS.map((person) => (
            <Link
              key={person.slug}
              href={`/bucket-lists/${person.slug}`}
              prefetch={false}
              className="rounded-full border border-white/30 px-4 py-1.5 text-sm text-white/90 transition hover:bg-white/10"
            >
              {person.emoji} {person.name}
            </Link>
          ))}
        </div>

        {/* CTAs */}
        <div
          className="mt-10 flex flex-wrap justify-center gap-4"
          style={inView ? { animation: "fadeInUp 0.6s 0.4s ease-out both" } : { opacity: 0 }}
        >
          <Link href="/bucket-lists" prefetch={false}>
            <button
              type="button"
              className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#c94420] transition hover:bg-white/90"
            >
              Browse famous bucket lists →
            </button>
          </Link>
          <Link href="/bucket-list-ideas" prefetch={false}>
            <button
              type="button"
              className="rounded-full border border-white/40 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              150+ ideas →
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Section 4: HOW IT WORKS ─────────────────────────────────────────────────── */

function HowItWorks() {
  const { ref, inView } = useInView(0.12);

  const steps = [
    {
      num: "01",
      title: "Add your life phases",
      desc: "Name each chapter — Childhood, College, First Job, whatever feels right. No template to follow.",
      mockup: (
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-400">Life phases</div>
          {["Childhood", "Teen Years", "College"].map((p, i) => (
            <div key={p} className="mb-2 flex items-center gap-2 rounded-lg bg-stone-50 px-3 py-2">
              <span className="h-2 w-2 rounded-full" style={{ background: PHASE_COLORS[i]?.border ?? "#10b981" }} />
              <span className="text-xs font-medium text-stone-700">{p}</span>
            </div>
          ))}
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-dashed border-stone-300 px-3 py-2">
            <span className="text-xs text-stone-400">+ Add phase</span>
          </div>
        </div>
      ),
    },
    {
      num: "02",
      title: "Tag every hobby you remember",
      desc: "Even the ones you only tried once. Swimming at six, photography in college, pottery last winter.",
      mockup: (
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-emerald-700">Childhood</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["lego", "swimming", "drawing", "chess"].map((h) => (
              <span
                key={h}
                className="rounded-full border px-2.5 py-0.5 text-[10px] font-medium"
                style={{ background: "#D1FAE5", borderColor: "#10b98150", color: "#059669" }}
              >
                {h}
              </span>
            ))}
            <span
              className="rounded-full border border-dashed px-2.5 py-0.5 text-[10px] text-stone-400"
              style={{ borderColor: "#a7f3d0" }}
            >
              + add
            </span>
          </div>
        </div>
      ),
    },
    {
      num: "03",
      title: "See the map of your life",
      desc: "Your full journey in one view. Share it, export it as a card, or keep it private.",
      mockup: (
        <div className="rounded-xl border border-stone-800/30 bg-stone-900 p-4 shadow-lg">
          <div className="mb-3 text-xs font-semibold text-emerald-400">My Hobby Journey</div>
          <div className="mb-3 flex gap-1">
            {PHASE_COLORS.map((c) => (
              <div key={c.label} className="h-2 flex-1 rounded-full" style={{ background: c.border, opacity: 0.8 }} />
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {["lego", "swimming", "guitar", "chess", "hiking"].map((h) => (
              <span key={h} className="rounded-full bg-stone-800 px-2 py-0.5 text-[9px] text-emerald-300">{h}</span>
            ))}
          </div>
          <div className="mt-3 text-right text-[9px] text-stone-600">significanthobbies.com</div>
        </div>
      ),
    },
  ];

  return (
    <section className="bg-white px-6 py-24 lg:px-12">
      <div className="mx-auto max-w-5xl">
        {/* Section eyebrow — only one on the page */}
        <div
          ref={ref}
          className="mb-14 text-center"
          style={inView ? { animation: "fadeInUp 0.6s ease-out both" } : { opacity: 0 }}
        >
          <span className="mb-3 inline-block rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-700">
            How it works
          </span>
          <h2 className="text-balance text-3xl font-bold text-stone-900 sm:text-4xl">
            Three steps to your story
          </h2>
        </div>

        {/* Desktop: horizontal stepper */}
        <div className="hidden lg:block">
          <div className="relative grid grid-cols-3 gap-8">
            {/* Connecting line */}
            <div className="absolute left-[16.5%] right-[16.5%] top-[52px] h-px bg-gradient-to-r from-emerald-300 via-emerald-200 to-emerald-300" />

            {steps.map((step, i) => (
              <div
                key={step.num}
                className="relative"
                style={inView ? { animation: `fadeInUp 0.6s ${i * 0.2}s ease-out both` } : { opacity: 0 }}
              >
                <div className="relative mx-auto mb-6 flex h-[52px] w-[52px] items-center justify-center rounded-full border-2 border-emerald-300 bg-white text-sm font-bold text-emerald-700 shadow-md">
                  {step.num}
                </div>
                <h3 className="text-balance mb-2 text-center text-base font-semibold text-stone-800">{step.title}</h3>
                <p className="mb-4 text-center text-sm text-stone-500">{step.desc}</p>
                {step.mockup}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: vertical stepper */}
        <div className="flex flex-col gap-0 lg:hidden">
          {steps.map((step, i) => (
            <div key={step.num} className="relative flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-emerald-300 bg-white text-xs font-bold text-emerald-700 shadow">
                  {step.num}
                </div>
                {i < steps.length - 1 && <div className="mt-1 w-px flex-1 bg-emerald-200" />}
              </div>
              <div
                className="pb-10"
                style={inView ? { animation: `fadeInUp 0.5s ${i * 0.2}s ease-out both` } : { opacity: 0 }}
              >
                <h3 className="text-balance mb-1 mt-2 font-semibold text-stone-800">{step.title}</h3>
                <p className="mb-4 text-sm text-stone-500">{step.desc}</p>
                {step.mockup}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Section 5: COMMUNITY ────────────────────────────────────────────────────── */

const SAMPLE_DEMO_TIMELINES = [
  {
    title: "Alex's Hobby Journey",
    username: "alex",
    phases: [
      { name: "Childhood", hobbies: ["LEGO", "Cycling", "Swimming"] },
      { name: "College", hobbies: ["Photography", "Guitar", "Hiking"] },
      { name: "Now", hobbies: ["Rock Climbing", "Cooking", "Reading"] },
    ],
  },
  {
    title: "Jamie's Creative Path",
    username: "jamie",
    phases: [
      { name: "Teen Years", hobbies: ["Sketching", "Piano"] },
      { name: "Early Career", hobbies: ["Oil Painting", "Pottery", "Ceramics"] },
      { name: "Now", hobbies: ["Digital Art", "Illustration", "Photography"] },
    ],
  },
  {
    title: "Morgan's Adventure Log",
    username: "morgan",
    phases: [
      { name: "Childhood", hobbies: ["Football", "Swimming", "Chess"] },
      { name: "College", hobbies: ["Hiking", "Photography", "Yoga"] },
      { name: "Now", hobbies: ["Trail Running", "Rock Climbing", "Meditation"] },
    ],
  },
];

function SampleTimelineCard({ sample }: { sample: typeof SAMPLE_DEMO_TIMELINES[0]; idx: number }) {
  const allHobbies = sample.phases.flatMap((p) => p.hobbies);
  const totalHobbies = new Set(allHobbies).size;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      {/* Sample badge */}
      <div className="absolute right-3 top-3 rounded-full bg-stone-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-stone-400">
        Sample
      </div>

      {/* Top color strip */}
      <div className="flex h-1.5 overflow-hidden">
        {sample.phases.map((_, pi) => (
          <div
            key={pi}
            className="flex-1"
            style={{ background: CARD_BORDER_COLORS[pi % CARD_BORDER_COLORS.length] }}
          />
        ))}
      </div>

      <div className="p-5">
        <h3 className="mb-0.5 font-semibold text-stone-800">{sample.title}</h3>
        <p className="mb-3 text-xs text-stone-400">@{sample.username}</p>

        <div className="mb-3 flex items-center gap-2">
          <div className="flex flex-1 gap-0.5 overflow-hidden rounded-full">
            {sample.phases.map((_, pi) => (
              <div
                key={pi}
                className="h-1.5 flex-1 rounded-full"
                style={{ background: CARD_BORDER_COLORS[pi % CARD_BORDER_COLORS.length], opacity: 0.6 }}
              />
            ))}
          </div>
          <span className="shrink-0 text-[10px] text-stone-400">
            {sample.phases.length} phases · {totalHobbies} hobbies
          </span>
        </div>

        <div className="flex flex-wrap gap-1">
          {allHobbies.slice(0, 6).map((h) => (
            <span
              key={h}
              className="rounded-full border border-stone-100 bg-stone-50 px-2 py-0.5 text-[10px] text-stone-500"
            >
              {h}
            </span>
          ))}
          {totalHobbies > 6 && (
            <span className="rounded-full border border-stone-100 bg-stone-50 px-2 py-0.5 text-[10px] text-stone-400">
              +{totalHobbies - 6} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function CommunityGallery({ demos }: { demos: DemoTimeline[] }) {
  const { ref, inView } = useInView(0.1);
  const isEmpty = demos.length === 0;

  return (
    <section className="bg-stone-50 px-6 py-24 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <div
          ref={ref}
          className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
          style={inView ? { animation: "fadeInUp 0.6s ease-out both" } : { opacity: 0 }}
        >
          <div>
            <h2 className="text-balance text-2xl font-bold text-stone-900 sm:text-3xl">Real hobby journeys</h2>
            <p className="mt-1 text-stone-500">
              {isEmpty ? "Be the first to share your journey" : "Shared by curious people like you"}
            </p>
          </div>
          <Link href="/hobbies" prefetch={false}>
            <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
              Explore all →
            </Button>
          </Link>
        </div>

        {isEmpty ? (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {SAMPLE_DEMO_TIMELINES.map((sample, idx) => (
                <SampleTimelineCard key={sample.username} sample={sample} idx={idx} />
              ))}
            </div>
            <div className="mt-8 flex flex-col items-center gap-3 text-center">
              <p className="text-sm text-stone-500">These are examples — no timelines have been shared yet.</p>
              <Link href="/timeline/new" prefetch={false}>
                <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700">
                  Build and share yours →
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {demos.map((t, idx) => {
              let phases: Phase[] = [];
              try { phases = JSON.parse(t.phases) as Phase[]; } catch { /* ignore */ }
              const totalHobbies = new Set(phases.flatMap((p) => p.hobbies.map((h) => h.name))).size;
              const allHobbies = phases.flatMap((p) => p.hobbies.map((h) => h.name)).slice(0, 8);

              return (
                <Link key={t.id} href={getTimelineUrl(t)} prefetch={false}>
                  <div
                    className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
                    style={inView ? { animation: `cardReveal 0.6s ${idx * 0.15}s ease-out both` } : { opacity: 0 }}
                  >
                    {/* Top color strip */}
                    <div className="flex h-1.5 overflow-hidden">
                      {phases.slice(0, 5).map((_, pi) => (
                        <div
                          key={pi}
                          className="flex-1"
                          style={{ background: CARD_BORDER_COLORS[pi % CARD_BORDER_COLORS.length] }}
                        />
                      ))}
                    </div>

                    <div className="p-5">
                      <h3 className="mb-0.5 font-semibold text-stone-800 transition-colors group-hover:text-emerald-600">
                        {t.title ?? "Hobby Timeline"}
                      </h3>
                      {t.user && (
                        <p className="mb-3 text-xs text-stone-400">@{t.user.username ?? t.user.name}</p>
                      )}

                      <div className="mb-3 flex items-center gap-2">
                        <div className="flex flex-1 gap-0.5 overflow-hidden rounded-full">
                          {phases.slice(0, 6).map((_, pi) => (
                            <div
                              key={pi}
                              className="h-1.5 flex-1 rounded-full transition-opacity group-hover:opacity-100"
                              style={{ background: CARD_BORDER_COLORS[pi % CARD_BORDER_COLORS.length], opacity: 0.6 }}
                            />
                          ))}
                        </div>
                        <span className="shrink-0 text-[10px] text-stone-400">
                          {phases.length} phases · {totalHobbies} hobbies
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {allHobbies.slice(0, 6).map((h) => (
                          <span
                            key={h}
                            className="rounded-full border border-stone-100 bg-stone-50 px-2 py-0.5 text-[10px] text-stone-500 transition-colors group-hover:border-emerald-200 group-hover:bg-emerald-50 group-hover:text-emerald-700"
                          >
                            {h}
                          </span>
                        ))}
                        {totalHobbies > 6 && (
                          <span className="rounded-full border border-stone-100 bg-stone-50 px-2 py-0.5 text-[10px] text-stone-400">
                            +{totalHobbies - 6} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="translate-y-full border-t border-stone-100 bg-emerald-50 px-5 py-2.5 text-xs font-semibold text-emerald-700 transition-transform duration-200 group-hover:translate-y-0">
                      View timeline →
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── Section 6: FINAL CTA ────────────────────────────────────────────────────── */

function FinalCTA() {
  const { ref, inView } = useInView(0.15);

  return (
    <section
      className="bg-stone-950 px-6 py-28 text-center lg:px-12"
    >
      <div
        ref={ref}
        className="mx-auto max-w-2xl"
        style={inView ? { animation: "fadeInUp 0.6s ease-out both" } : { opacity: 0 }}
      >
        <h2 className="text-balance text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
          Your hobby story is worth telling
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-lg text-stone-400">
          Start free. No account needed. Build the map of a life well-lived.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/timeline/new" prefetch={false}>
            <button
              type="button"
              className="rounded-full bg-emerald-500 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-400"
            >
              Start your hobby map →
            </button>
          </Link>
          <Link href="/bucket-lists" prefetch={false}>
            <button
              type="button"
              className="rounded-full border border-stone-700 px-8 py-3.5 text-sm font-semibold text-stone-300 transition hover:border-stone-500 hover:text-white"
            >
              Browse bucket lists →
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Blog Teaser ─────────────────────────────────────────────────────────────── */

function BlogTeaser({ posts }: { posts: BlogPost[] }) {
  const teaserPosts = posts.slice(0, 3);
  const { ref, inView } = useInView(0.1);

  return (
    <section ref={ref} className="border-t border-stone-100 bg-stone-50 px-6 py-16 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <div
          className="mb-8 text-center"
          style={inView ? { animation: "fadeInUp 0.6s ease-out both" } : { opacity: 0 }}
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-600">
            The Hobby Journal
          </p>
          <h2 className="text-balance text-3xl font-bold text-stone-900">
            Thoughts on hobbies &amp; identity
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {teaserPosts.map((post, idx) => {
            const style =
              BLOG_CATEGORY_COLORS[post.category] ?? {
                bg: "bg-stone-50",
                text: "text-stone-600",
                border: "border-stone-200",
              };

            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                prefetch={false}
                className="group block"
                style={inView ? { animation: `cardReveal 0.6s ${idx * 0.12}s ease-out both` } : { opacity: 0 }}
              >
                <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-[0_8px_32px_rgba(16,185,129,0.10)]">
                  <div className="mb-3 text-3xl transition-transform duration-300 group-hover:scale-110">
                    {post.emoji}
                  </div>

                  <span
                    className={`mb-2 inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style.bg} ${style.text} ${style.border}`}
                  >
                    {post.category}
                  </span>

                  <h3 className="text-balance mb-2 text-sm font-bold leading-snug text-stone-900 transition-colors group-hover:text-emerald-700">
                    {post.title}
                  </h3>

                  <p className="line-clamp-2 flex-1 text-xs leading-relaxed text-stone-500">
                    {post.excerpt}
                  </p>

                  <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3">
                    <span className="text-xs text-stone-400">{post.readTime} min read</span>
                    <span className="text-xs font-semibold text-emerald-600 opacity-0 transition-opacity group-hover:opacity-100">
                      Read →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div
          className="mt-6 text-center"
          style={inView ? { animation: "fadeInUp 0.6s 0.4s ease-out both" } : { opacity: 0 }}
        >
          <Link
            href="/blog"
            prefetch={false}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 transition-all duration-200 hover:gap-2 hover:text-emerald-700"
          >
            Read all articles →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Root Export ─────────────────────────────────────────────────────────────── */

export function LandingClient({ demos, blogPosts }: LandingClientProps) {
  return (
    <div className="min-h-screen">
      {/* 1. Hero — dark */}
      <Hero />

      {/* 2. Feature Row — white, asymmetric */}
      <FeatureRow />

      {/* 3. Coral Bucket List Panel */}
      <CoralBucketListPanel />

      {/* 4. How It Works — white */}
      <HowItWorks />

      {/* 5. Community — stone-50 */}
      <CommunityGallery demos={demos} />

      {/* 6. Final CTA — near-black */}
      <FinalCTA />

      {/* Blog Teaser */}
      <BlogTeaser posts={blogPosts} />

      <SaaSMakerTestimonialsSection />
      <SaaSMakerChangelogSection />
    </div>
  );
}
