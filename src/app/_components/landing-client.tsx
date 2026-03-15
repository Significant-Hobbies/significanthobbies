"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import type { Phase } from "~/lib/types";
import { blogPosts } from "~/lib/blog-posts";
import { getTimelineUrl } from "~/lib/timeline-url";
import { SaaSMakerTestimonials, SaaSMakerChangelog } from "~/components/saasmaker-feedback";

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
}

/* ─── Constants ──────────────────────────────────────────────────────────────── */

const HOBBY_EMOJIS = [
  { emoji: "🎸", top: "8%", left: "6%", size: "text-5xl", anim: "animate-float", delay: "0s", opacity: 0.22 },
  { emoji: "🎨", top: "14%", left: "88%", size: "text-6xl", anim: "animate-float2", delay: "1.2s", opacity: 0.18 },
  { emoji: "📚", top: "32%", left: "3%", size: "text-4xl", anim: "animate-float3", delay: "0.6s", opacity: 0.2 },
  { emoji: "🏔️", top: "55%", left: "91%", size: "text-5xl", anim: "animate-float", delay: "2s", opacity: 0.2 },
  { emoji: "🌱", top: "72%", left: "5%", size: "text-4xl", anim: "animate-float2", delay: "1.8s", opacity: 0.25 },
  { emoji: "🎮", top: "22%", left: "80%", size: "text-4xl", anim: "animate-float3", delay: "0.4s", opacity: 0.18 },
  { emoji: "🏊", top: "80%", left: "85%", size: "text-5xl", anim: "animate-float", delay: "3s", opacity: 0.17 },
  { emoji: "🎯", top: "45%", left: "95%", size: "text-3xl", anim: "animate-float2", delay: "1.5s", opacity: 0.22 },
  { emoji: "✍️", top: "88%", left: "12%", size: "text-4xl", anim: "animate-float3", delay: "2.4s", opacity: 0.2 },
  { emoji: "🎭", top: "10%", left: "42%", size: "text-3xl", anim: "animate-float", delay: "0.9s", opacity: 0.15 },
  { emoji: "🎻", top: "60%", left: "2%", size: "text-5xl", anim: "animate-float2", delay: "2.8s", opacity: 0.18 },
  { emoji: "🧩", top: "38%", left: "92%", size: "text-4xl", anim: "animate-float3", delay: "1.1s", opacity: 0.2 },
  { emoji: "🎪", top: "78%", left: "50%", size: "text-3xl", anim: "animate-float", delay: "3.5s", opacity: 0.14 },
  { emoji: "🏄", top: "5%", left: "68%", size: "text-4xl", anim: "animate-float2", delay: "0.2s", opacity: 0.2 },
  { emoji: "🎲", top: "92%", left: "72%", size: "text-5xl", anim: "animate-float3", delay: "1.7s", opacity: 0.16 },
  { emoji: "🎺", top: "50%", left: "8%", size: "text-3xl", anim: "animate-float", delay: "2.2s", opacity: 0.19 },
  { emoji: "🌿", top: "25%", left: "20%", size: "text-3xl", anim: "animate-float2", delay: "1.3s", opacity: 0.14 },
  { emoji: "🎹", top: "68%", left: "65%", size: "text-4xl", anim: "animate-float3", delay: "0.7s", opacity: 0.17 },
];

const PHASE_COLORS = [
  { bg: "#D1FAE5", border: "#10b981", label: "Childhood", hobbies: 8 },
  { bg: "#FEF3C7", border: "#F59E0B", label: "Teen Years", hobbies: 14 },
  { bg: "#DBEAFE", border: "#3B82F6", label: "College", hobbies: 11 },
  { bg: "#FCE7F3", border: "#EC4899", label: "Early Career", hobbies: 7 },
  { bg: "#EDE9FE", border: "#8B5CF6", label: "Now", hobbies: 9 },
];

const STATS = [
  { value: 2847, label: "hobbies tracked", suffix: "" },
  { value: 412, label: "timelines built", suffix: "" },
  { value: 89, label: "life phases mapped", suffix: "" },
];

const CARD_BORDER_COLORS = [
  "#10b981",
  "#F59E0B",
  "#3B82F6",
  "#EC4899",
  "#8B5CF6",
];

const ARCHETYPES = [
  { emoji: "🌍", name: "Renaissance Explorer", description: "Your interests span every corner of life" },
  { emoji: "🎯", name: "Deep Specialist", description: "You go deep, not wide" },
  { emoji: "🎨", name: "Creative Soul", description: "Art and expression run through everything you do" },
  { emoji: "💪", name: "Action Hero", description: "You're wired for movement and challenge" },
  { emoji: "🧠", name: "Mind Builder", description: "You feed your curiosity with knowledge" },
  { emoji: "🤝", name: "Social Butterfly", description: "Your hobbies connect you to others" },
  { emoji: "🔧", name: "Maker", description: "You build, craft, and create with your hands" },
  { emoji: "⚖️", name: "Balanced Explorer", description: "A little of everything, mastered through breadth" },
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
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

/* ─── Animated Counter ───────────────────────────────────────────────────────── */

function AnimatedCounter({ target, inView }: { target: number; inView: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), target);
      setCount(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span>{count.toLocaleString()}</span>;
}

/* ─── SVG Illustrations ──────────────────────────────────────────────────────── */

function PhaseMapIllustration() {
  return (
    <svg width="180" height="90" viewBox="0 0 180 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-5">
      {/* Phase bands */}
      {[
        { x: 0, color: "#D1FAE5", stroke: "#10b981" },
        { x: 36, color: "#FEF3C7", stroke: "#F59E0B" },
        { x: 72, color: "#DBEAFE", stroke: "#3B82F6" },
        { x: 108, color: "#FCE7F3", stroke: "#EC4899" },
        { x: 144, color: "#EDE9FE", stroke: "#8B5CF6" },
      ].map((band, i) => (
        <g key={i}>
          <rect x={band.x + 2} y={20} width={32} height={50} rx={6} fill={band.color} stroke={band.stroke} strokeWidth={1.5} />
          {/* Hobby dots */}
          {[32, 42, 52].map((cy, j) => (
            <circle key={j} cx={band.x + 18} cy={cy} r={3} fill={band.stroke} opacity={0.7} />
          ))}
        </g>
      ))}
      {/* Connecting line */}
      <polyline points="18,46 54,38 90,50 126,42 162,46" stroke="#059669" strokeWidth={1.5} strokeDasharray="4 2" fill="none" opacity={0.5} />
    </svg>
  );
}

function BarChartIllustration({ inView }: { inView: boolean }) {
  const bars = [
    { height: 48, color: "#10b981", delay: "0s" },
    { height: 64, color: "#059669", delay: "0.1s" },
    { height: 36, color: "#34d399", delay: "0.2s" },
    { height: 56, color: "#10b981", delay: "0.3s" },
    { height: 72, color: "#059669", delay: "0.4s" },
    { height: 44, color: "#34d399", delay: "0.5s" },
  ];
  return (
    <svg width="160" height="90" viewBox="0 0 160 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-5">
      {/* Baseline */}
      <line x1="10" y1="78" x2="150" y2="78" stroke="#d1d5db" strokeWidth="1.5" />
      {bars.map((bar, i) => (
        <rect
          key={i}
          x={10 + i * 22}
          y={78 - bar.height}
          width={16}
          height={bar.height}
          rx={3}
          fill={bar.color}
          opacity={0.85}
          style={inView ? {
            animation: `growUp 0.6s ease-out ${bar.delay} both`,
          } : { transform: "scaleY(0)", transformOrigin: "bottom" }}
        />
      ))}
      {/* Trend line */}
      <polyline
        points="18,42 40,26 62,50 84,34 106,18 128,38"
        stroke="#F59E0B"
        strokeWidth={2}
        strokeDasharray="4 2"
        fill="none"
        opacity={inView ? 1 : 0}
        style={inView ? { animation: "fadeInUp 0.8s 0.6s ease-out both" } : {}}
      />
    </svg>
  );
}

function HobbyTagsIllustration() {
  const tags = ["pottery", "running", "reading", "chess", "hiking"];
  return (
    <svg width="180" height="90" viewBox="0 0 180 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-5">
      {tags.map((tag, i) => {
        const x = 8 + (i % 3) * 60;
        const y = 10 + Math.floor(i / 3) * 42;
        return (
          <g key={tag} style={{ animation: `slideInRight 0.5s ${i * 0.12}s ease-out both` }}>
            <rect x={x} y={y} width={54} height={22} rx={11} fill="#D1FAE5" stroke="#10b981" strokeWidth={1.2} />
            <text x={x + 27} y={y + 14.5} textAnchor="middle" fill="#059669" fontSize={9} fontWeight={600}>{tag}</text>
          </g>
        );
      })}
      {/* Arrow hinting more */}
      <text x="152" y="48" fill="#10b981" fontSize="18" opacity={0.7}>→</text>
    </svg>
  );
}

/* ─── Hero Phase Preview Strip ───────────────────────────────────────────────── */

function HeroPhaseStrip() {
  return (
    <div className="mt-10 flex items-stretch gap-0 overflow-hidden rounded-2xl border border-stone-200/80 bg-white/60 shadow-lg shadow-stone-200/40 backdrop-blur-sm"
      style={{ maxWidth: 520, margin: "2.5rem auto 0" }}>
      {PHASE_COLORS.map((phase, i) => (
        <div
          key={phase.label}
          className="group relative flex-1 cursor-default overflow-hidden px-2 py-3 text-center transition-all duration-300 hover:flex-[1.5]"
          style={{
            background: phase.bg,
            borderRight: i < PHASE_COLORS.length - 1 ? `1px solid ${phase.border}22` : "none",
            animation: `phaseBarIn 0.5s ${i * 0.1}s ease-out both`,
          }}
        >
          <div className="text-xs font-semibold" style={{ color: phase.border }}>{phase.label}</div>
          <div className="mt-1 text-[10px] text-stone-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {phase.hobbies} hobbies
          </div>
          <div
            className="absolute inset-x-0 bottom-0 h-0.5"
            style={{
              background: phase.border,
              animation: `phaseBarIn 0.6s ${i * 0.12 + 0.3}s ease-out both`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

/* ─── Stats Bar ───────────────────────────────────────────────────────────────── */

function StatsBar() {
  const { ref, inView } = useInView(0.3);

  return (
    <section
      ref={ref}
      className="border-y border-amber-200/60 px-4 py-10"
      style={{ background: "linear-gradient(135deg, #FFF8EE 0%, #FFFBF5 50%, #FFF8EE 100%)" }}
    >
      <div className="mx-auto max-w-4xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="relative text-center"
              style={inView ? { animation: `counterUp 0.5s ${i * 0.15}s ease-out both` } : { opacity: 0 }}
            >
              {i > 0 && (
                <div className="absolute left-0 top-1/2 hidden h-8 w-px -translate-y-1/2 bg-amber-200 md:block" />
              )}
              <div className="text-4xl font-bold text-stone-900 sm:text-5xl">
                <AnimatedCounter target={stat.value} inView={inView} />
                {stat.suffix}
              </div>
              <div className="mt-1 text-sm font-medium text-stone-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Feature Cards ───────────────────────────────────────────────────────────── */

function FeatureCards() {
  const { ref, inView } = useInView(0.15);

  const features = [
    {
      title: "Map your journey",
      desc: "Build life phases from childhood to now. Add every hobby, interest, and passion along the way.",
      illustration: <PhaseMapIllustration />,
    },
    {
      title: "Discover your hobby personality",
      desc: "See rekindled hobbies, what stuck across decades, and uncover the archetype your interests reveal.",
      illustration: <BarChartIllustration inView={inView} />,
    },
    {
      title: "Share your identity artifact",
      desc: "Generate a stunning card of your hobby journey — a window into who you are, ready to share anywhere.",
      illustration: <HobbyTagsIllustration />,
    },
  ];

  return (
    <section className="px-4 py-20" style={{ background: "#FEFDF8" }}>
      <div className="mx-auto max-w-5xl">
        <div ref={ref} className="mb-12 text-center"
          style={inView ? { animation: "fadeInUp 0.6s ease-out both" } : { opacity: 0 }}>
          <span className="mb-3 inline-block rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-700">
            Why SignificantHobbies
          </span>
          <h2 className="text-3xl font-bold text-stone-900 sm:text-4xl">Everything your hobby journey needs</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-[0_8px_32px_rgba(16,185,129,0.12)]"
              style={inView ? { animation: `cardReveal 0.6s ${i * 0.15}s ease-out both` } : { opacity: 0 }}
            >
              {/* Top accent line */}
              <div
                className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-emerald-400 transition-transform duration-300 group-hover:scale-x-100"
              />
              {f.illustration}
              <h3 className="mb-2 text-lg font-semibold text-stone-800">{f.title}</h3>
              <p className="text-sm leading-relaxed text-stone-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ────────────────────────────────────────────────────────────── */

function HowItWorks() {
  const { ref, inView } = useInView(0.15);

  const steps = [
    {
      num: "01",
      title: "Add your phases",
      desc: "Name each chapter of your life — Childhood, College, First Job, whatever feels right.",
      mockup: (
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-stone-400">Life Phases</div>
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
      title: "Add hobbies to each phase",
      desc: "Tag every interest you remember — even the ones you only tried once.",
      mockup: (
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold text-emerald-700">Childhood</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["lego", "swimming", "drawing", "chess", "+ more"].map((h) => (
              <span
                key={h}
                className="rounded-full border px-2.5 py-0.5 text-[10px] font-medium"
                style={{
                  background: h === "+ more" ? "#f0fdf4" : "#D1FAE5",
                  borderColor: h === "+ more" ? "#a7f3d0" : "#10b981",
                  color: "#059669",
                }}
              >
                {h}
              </span>
            ))}
          </div>
        </div>
      ),
    },
    {
      num: "03",
      title: "Get your visual",
      desc: "Export a beautiful card of your full hobby journey, ready to share.",
      mockup: (
        <div className="rounded-xl border border-emerald-900/30 bg-slate-900 p-4 shadow-lg shadow-emerald-900/20">
          <div className="mb-3 text-xs font-semibold text-emerald-400">My Hobby Journey</div>
          <div className="mb-3 flex gap-1">
            {PHASE_COLORS.map((c) => (
              <div key={c.label} className="h-2 flex-1 rounded-full" style={{ background: c.border, opacity: 0.8 }} />
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {["lego", "swimming", "guitar", "chess"].map((h) => (
              <span key={h} className="rounded-full bg-emerald-900/50 px-2 py-0.5 text-[9px] text-emerald-300">{h}</span>
            ))}
          </div>
          <div className="mt-3 text-right text-[9px] text-slate-500">significanthobbies.com</div>
        </div>
      ),
    },
  ];

  return (
    <section className="px-4 py-20" style={{ background: "linear-gradient(180deg, #FFFBF5 0%, #FFF8EE 100%)" }}>
      <div className="mx-auto max-w-5xl">
        <div
          ref={ref}
          className="mb-14 text-center"
          style={inView ? { animation: "fadeInUp 0.6s ease-out both" } : { opacity: 0 }}
        >
          <span className="mb-3 inline-block rounded-full border border-amber-200 bg-amber-50 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-amber-700">
            How it works
          </span>
          <h2 className="text-3xl font-bold text-stone-900 sm:text-4xl">Three steps to your story</h2>
        </div>

        {/* Desktop: horizontal stepper */}
        <div className="hidden lg:block">
          <div className="relative grid grid-cols-3 gap-8">
            {/* Connecting line */}
            <div className="absolute left-[16.5%] right-[16.5%] top-[52px] h-px bg-gradient-to-r from-emerald-300 via-amber-300 to-blue-300" />

            {steps.map((step, i) => (
              <div
                key={step.num}
                className="relative"
                style={inView ? { animation: `fadeInUp 0.6s ${i * 0.2}s ease-out both` } : { opacity: 0 }}
              >
                {/* Step number bubble */}
                <div className="relative mx-auto mb-6 flex h-[52px] w-[52px] items-center justify-center rounded-full border-2 border-emerald-300 bg-white text-sm font-bold text-emerald-700 shadow-md">
                  {step.num}
                </div>
                <h3 className="mb-2 text-center text-base font-semibold text-stone-800">{step.title}</h3>
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
              {/* Left: line + number */}
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-emerald-300 bg-white text-xs font-bold text-emerald-700 shadow">
                  {step.num}
                </div>
                {i < steps.length - 1 && <div className="mt-1 w-px flex-1 bg-emerald-200" />}
              </div>
              {/* Right: content */}
              <div
                className="pb-10"
                style={inView ? { animation: `slideInRight 0.5s ${i * 0.2}s ease-out both` } : { opacity: 0 }}
              >
                <h3 className="mb-1 mt-2 font-semibold text-stone-800">{step.title}</h3>
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

/* ─── Community Gallery ───────────────────────────────────────────────────────── */

function CommunityGallery({ demos }: { demos: DemoTimeline[] }) {
  const { ref, inView } = useInView(0.1);

  if (demos.length === 0) return null;

  return (
    <section className="border-y border-stone-200/60 px-4 py-20" style={{ background: "#FEFDF8" }}>
      <div className="mx-auto max-w-5xl">
        <div
          ref={ref}
          className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
          style={inView ? { animation: "fadeInUp 0.6s ease-out both" } : { opacity: 0 }}
        >
          <div>
            <span className="mb-2 inline-block rounded-full border border-stone-200 bg-stone-50 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-stone-500">
              Community
            </span>
            <h2 className="text-2xl font-bold text-stone-900 sm:text-3xl">Real hobby journeys</h2>
            <p className="mt-1 text-stone-500">Shared by curious people like you</p>
          </div>
          <Link href="/hobbies">
            <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
              Explore all →
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {demos.map((t, idx) => {
            let phases: Phase[] = [];
            try { phases = JSON.parse(t.phases) as Phase[]; } catch { /* ignore */ }
            const totalHobbies = new Set(phases.flatMap((p) => p.hobbies.map((h) => h.name))).size;
            const borderColor = CARD_BORDER_COLORS[idx % CARD_BORDER_COLORS.length] ?? "#10b981";
            const allHobbies = phases.flatMap((p) => p.hobbies.map((h) => h.name)).slice(0, 8);

            return (
              <Link key={t.id} href={getTimelineUrl(t)}>
                <div
                  className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
                  style={inView ? { animation: `cardReveal 0.6s ${idx * 0.15}s ease-out both`, borderLeftWidth: 4, borderLeftColor: borderColor } : { opacity: 0, borderLeftWidth: 4, borderLeftColor: borderColor }}
                >
                  {/* Phase color bar strip */}
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

                    {/* Phase timeline visualization */}
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

                    {/* Hobby tag cloud */}
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

                  {/* Hover footer */}
                  <div className="translate-y-full border-t border-stone-100 bg-emerald-50 px-5 py-2.5 text-xs font-semibold text-emerald-700 transition-transform duration-200 group-hover:translate-y-0">
                    View timeline →
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Export CTA ──────────────────────────────────────────────────────────────── */

function ExportCTA() {
  const { ref, inView } = useInView(0.15);

  return (
    <section className="px-4 py-24" style={{ background: "linear-gradient(135deg, #FFFBF5 0%, #F0FDF4 50%, #FFFBF5 100%)" }}>
      <div className="mx-auto max-w-5xl">
        <div
          ref={ref}
          className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2"
        >
          {/* Left: text */}
          <div style={inView ? { animation: "slideInLeft 0.6s ease-out both" } : { opacity: 0 }}>
            <span className="mb-4 inline-block rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-700">
              Export
            </span>
            <h2 className="mb-4 text-3xl font-bold leading-tight text-stone-900 sm:text-4xl">
              Share your story<br />
              <span className="italic text-emerald-600">beautifully</span>
            </h2>
            <p className="mb-8 text-lg text-stone-500">
              Generate a stunning card of your hobby journey. One click, ready to share anywhere.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/timeline/new">
                <Button
                  size="lg"
                  className="animate-glow-pulse bg-emerald-600 px-8 text-white hover:bg-emerald-700"
                >
                  Start for free
                </Button>
              </Link>
              <Link href="/hobbies">
                <Button size="lg" variant="outline" className="border-stone-300 px-8 text-stone-600 hover:text-stone-900">
                  Browse hobbies
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-stone-400">No sign-up required. Always free.</p>
          </div>

          {/* Right: animated dark export card preview */}
          <div
            className="flex justify-center lg:justify-end"
            style={inView ? { animation: "slideInRight 0.6s 0.1s ease-out both" } : { opacity: 0 }}
          >
            <div
              className="animate-float relative w-full max-w-sm overflow-hidden rounded-2xl border border-emerald-900/30 bg-slate-900 p-7 shadow-2xl"
              style={{ boxShadow: "0 0 40px rgba(16,185,129,0.2), 0 24px 64px rgba(0,0,0,0.3)" }}
            >
              {/* Shine pass */}
              <div
                className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
                style={{ zIndex: 10 }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "-100%",
                    width: "60%",
                    height: "100%",
                    background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.06) 50%, transparent 70%)",
                    animation: "shinePass 4s 1s ease-in-out infinite",
                  }}
                />
              </div>

              {/* Card content */}
              <div className="relative z-0">
                <div className="mb-1 text-xs font-semibold tracking-widest text-emerald-400 uppercase">My Hobby Journey</div>
                <div className="mb-4 text-lg font-bold text-white">A Life in Hobbies</div>

                {/* Phase strip */}
                <div className="mb-4 overflow-hidden rounded-lg">
                  <div className="flex h-8">
                    {PHASE_COLORS.map((c) => (
                      <div
                        key={c.label}
                        className="flex flex-1 items-center justify-center"
                        style={{ background: `${c.border}22` }}
                      >
                        <div className="h-1.5 w-3/4 rounded-full" style={{ background: c.border, opacity: 0.8 }} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hobby cloud */}
                <div className="mb-5 flex flex-wrap gap-1.5">
                  {["guitar 🎸", "chess ♟", "hiking 🏔", "reading 📚", "pottery 🏺", "swimming 🏊"].map((h) => (
                    <span
                      key={h}
                      className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300"
                    >
                      {h}
                    </span>
                  ))}
                </div>

                {/* Stats row */}
                <div className="mb-4 grid grid-cols-3 gap-2">
                  {[
                    { val: "5", label: "phases" },
                    { val: "34", label: "hobbies" },
                    { val: "22", label: "years" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg bg-slate-800 px-2 py-2 text-center">
                      <div className="text-sm font-bold text-emerald-400">{s.val}</div>
                      <div className="text-[9px] text-slate-500">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Emerald glow bar */}
                <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
                <div className="mt-3 text-right text-[9px] text-slate-600">significanthobbies.com</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Blog Teaser ─────────────────────────────────────────────────────────────── */

function BlogTeaser() {
  const teaserPosts = blogPosts.slice(0, 3);
  const { ref, inView } = useInView(0.1);

  return (
    <section ref={ref} className="border-t border-stone-100 px-4 py-16 bg-amber-50/40">
      <div className="mx-auto max-w-5xl">
        <div
          className="mb-8 text-center"
          style={inView ? { animation: "fadeInUp 0.6s ease-out both" } : { opacity: 0 }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-2">
            The Hobby Journal
          </p>
          <h2 className="text-3xl font-bold text-stone-900">
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
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group block"
                style={inView ? { animation: `cardReveal 0.6s ${idx * 0.12}s ease-out both` } : { opacity: 0 }}
              >
                <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-[0_8px_32px_rgba(16,185,129,0.10)]">
                  {/* Accent bar */}
                  <div className="mb-4 h-0.5 origin-left scale-x-0 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-300 transition-transform duration-300 group-hover:scale-x-100" />

                  <div className="mb-3 text-3xl transition-transform duration-300 group-hover:scale-110">
                    {post.emoji}
                  </div>

                  <span
                    className={`mb-2 inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style.bg} ${style.text} ${style.border}`}
                  >
                    {post.category}
                  </span>

                  <h3 className="mb-2 text-sm font-bold leading-snug text-stone-900 transition-colors group-hover:text-emerald-700">
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
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 transition-all duration-200 hover:gap-2 hover:text-emerald-700"
          >
            Read all articles →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer Strip ────────────────────────────────────────────────────────────── */

function FooterStrip() {
  return (
    <footer className="border-t border-stone-200/60 px-4 py-8" style={{ background: "#FEFDF8" }}>
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-emerald-600">SH</span>
          <span className="text-sm font-semibold text-stone-700">SignificantHobbies</span>
        </div>
        <div className="flex gap-6 text-sm text-stone-400">
          <Link href="/timeline/new" className="transition-colors hover:text-stone-700">Start</Link>
          <Link href="/hobbies" className="transition-colors hover:text-stone-700">Explore</Link>
          <Link href="/explore" className="transition-colors hover:text-stone-700">Community</Link>
          <Link href="/blog" className="transition-colors hover:text-stone-700">Blog</Link>
        </div>
        <div className="text-xs text-stone-400">Made with love for curious people</div>
      </div>
    </footer>
  );
}

/* ─── Root Export ─────────────────────────────────────────────────────────────── */

export function LandingClient({ demos }: LandingClientProps) {
  return (
    <div className="min-h-screen">
      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section
        className="relative flex min-h-[600px] flex-col items-center justify-center overflow-hidden px-4 py-24 lg:min-h-screen"
      >
        {/* Animated gradient orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="animate-orb-float absolute rounded-full"
            style={{
              width: 600, height: 600, top: "-15%", left: "25%",
              background: "radial-gradient(circle, rgba(16,185,129,0.13) 0%, transparent 70%)",
              animationDuration: "14s",
            }}
          />
          <div
            className="animate-orb-float absolute rounded-full"
            style={{
              width: 500, height: 500, bottom: "-10%", right: "10%",
              background: "radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 70%)",
              animationDuration: "18s",
              animationDelay: "2s",
            }}
          />
          <div
            className="animate-orb-float absolute rounded-full"
            style={{
              width: 400, height: 400, top: "30%", left: "-8%",
              background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)",
              animationDuration: "16s",
              animationDelay: "4s",
            }}
          />
        </div>

        {/* Grain texture overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "128px",
          }}
        />

        {/* Floating hobby emojis — hidden on xs, fewer on sm */}
        <div className="pointer-events-none absolute inset-0 hidden sm:block">
          {HOBBY_EMOJIS.map((e, i) => (
            <span
              key={i}
              className={`absolute select-none ${e.size} ${e.anim}`}
              style={{
                top: e.top,
                left: e.left,
                opacity: e.opacity,
                animationDelay: e.delay,
                // hide some on sm to reduce clutter
                ...(i > 10 ? { display: "none" } : {}),
              }}
              aria-hidden="true"
            >
              {e.emoji}
            </span>
          ))}
          {/* Show all on lg+ */}
          <style>{`@media (min-width: 1024px) { .emoji-extra { display: block !important; } }`}</style>
          {HOBBY_EMOJIS.slice(11).map((e, i) => (
            <span
              key={`extra-${i}`}
              className={`emoji-extra absolute select-none ${e.size} ${e.anim}`}
              style={{ top: e.top, left: e.left, opacity: e.opacity, animationDelay: e.delay, display: "none" }}
              aria-hidden="true"
            >
              {e.emoji}
            </span>
          ))}
        </div>

        {/* Hero content */}
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          {/* Pill badge with shimmer */}
          <div
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-300/70 px-4 py-2 text-sm font-medium text-emerald-700"
            style={{
              background: "linear-gradient(90deg, #ecfdf5, #d1fae5, #ecfdf5)",
              backgroundSize: "300% auto",
              animation: "badgeShimmer 4s linear infinite",
            }}
          >
            <span className="animate-pulse-soft h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Map your hobby journey
            <span className="ml-0.5 text-base">✨</span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-stone-900 sm:text-5xl md:text-6xl lg:text-7xl">
            <span
              className="block"
              style={{ animation: "fadeInUp 0.6s 0.1s ease-out both", opacity: 0 }}
            >
              Map your hobby journey,
            </span>
            <span
              className="relative mt-1 block italic text-emerald-600"
              style={{ animation: "fadeInUp 0.6s 0.25s ease-out both", opacity: 0 }}
            >
              rediscover what shaped you
              {/* Wavy underline decoration */}
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12"
                preserveAspectRatio="none"
                style={{ height: 10 }}
              >
                <path
                  d="M0,6 C25,0 50,12 75,6 C100,0 125,12 150,6 C175,0 200,12 225,6 C250,0 275,12 300,6"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  opacity={0.5}
                />
              </svg>
            </span>
            <span
              className="block"
              style={{ animation: "fadeInUp 0.6s 0.35s ease-out both", opacity: 0 }}
            >
              and find what to try next.
            </span>
          </h1>

          {/* Subtext */}
          <p
            className="mx-auto mb-10 max-w-xl text-lg text-stone-500 sm:text-xl"
            style={{ animation: "fadeInUp 0.6s 0.4s ease-out both", opacity: 0 }}
          >
            Build a shareable timeline of your hobbies across life — and discover the story your interests tell about you.
          </p>

          {/* CTA buttons */}
          <div
            className="flex flex-wrap items-center justify-center gap-4"
            style={{ animation: "fadeInUp 0.6s 0.55s ease-out both", opacity: 0 }}
          >
            <Link href="/timeline/new">
              <Button
                size="lg"
                className="bg-emerald-600 px-8 text-white shadow-[0_0_24px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-[0_0_36px_rgba(16,185,129,0.45)]"
              >
                Discover your hobby story →
              </Button>
            </Link>
            <Link href="/hobbies">
              <Button
                size="lg"
                variant="outline"
                className="border-stone-300 px-8 text-stone-600 transition-all duration-200 hover:-translate-y-0.5 hover:text-stone-900"
              >
                See examples
              </Button>
            </Link>
          </div>

          <p
            className="mt-4 text-sm text-stone-400"
            style={{ animation: "fadeInUp 0.6s 0.7s ease-out both", opacity: 0 }}
          >
            No sign-up required to start
          </p>

          <p className="mt-2 text-sm text-emerald-600" style={{ animation: "fadeInUp 0.6s 0.75s ease-out both", opacity: 0 }}>
            <Link href="/get-started" className="hover:underline">
              Or get your username first →
            </Link>
          </p>

          {/* Phase strip preview */}
          <div style={{ animation: "fadeInUp 0.7s 0.85s ease-out both", opacity: 0 }}>
            <HeroPhaseStrip />
          </div>
        </div>
      </section>

      {/* ── Archetype Preview ─────────────────────────────────────────────────── */}
      {/* Archetype Preview */}
      <section className="py-16 bg-stone-50 -mx-4 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-stone-900 mb-2">
            What will your hobby story reveal?
          </h2>
          <p className="text-stone-500 mb-8">
            Your hobbies tell a story about who you are. Discover your archetype.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ARCHETYPES.map((a) => (
              <div key={a.name} className="rounded-xl border border-stone-200 bg-white p-4 text-center">
                <div className="text-3xl mb-2">{a.emoji}</div>
                <div className="font-semibold text-stone-800 text-sm">{a.name}</div>
                <div className="text-xs text-stone-500 mt-1">{a.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────────────────────── */}
      <StatsBar />

      {/* ── Feature Cards ─────────────────────────────────────────────────────── */}
      <FeatureCards />

      {/* ── How It Works ──────────────────────────────────────────────────────── */}
      <HowItWorks />

      {/* ── Community Gallery ─────────────────────────────────────────────────── */}
      <CommunityGallery demos={demos} />

      {/* ── Export CTA ────────────────────────────────────────────────────────── */}
      <ExportCTA />

      {/* ── Blog Teaser ───────────────────────────────────────────────────────── */}
      <BlogTeaser />

      {/* ── Testimonials ──────────────────────────────────────────────────────── */}
      <section className="border-t border-stone-100 px-4 py-16" style={{ background: "#FEFDF8" }}>
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-3xl font-bold text-stone-900">What people are saying</h2>
          <SaaSMakerTestimonials />
        </div>
      </section>

      {/* ── Changelog ─────────────────────────────────────────────────────────── */}
      <section className="border-t border-stone-100 px-4 py-16 bg-amber-50/40">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-8 text-center text-3xl font-bold text-stone-900">Changelog</h2>
          <SaaSMakerChangelog />
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <FooterStrip />
    </div>
  );
}
