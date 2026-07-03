import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Hobby Tools — SignificantHobbies',
  description:
    'Free tools to help you discover, plan, and commit to hobbies. Hobby quiz, time calculator, hobby comparison, and more.',
};

interface Tool {
  emoji: string;
  title: string;
  description: string;
  href: string;
  badge?: string;
}

const TOOLS: Tool[] = [
  {
    emoji: '🎯',
    title: 'Hobby Finder Quiz',
    description:
      'Answer 5 questions and get personalized hobby recommendations matched to your personality, schedule, and interests.',
    href: '/find-your-hobby',
    badge: 'Popular',
  },
  {
    emoji: '⏱️',
    title: 'Time Calculator',
    description:
      "Find out how much free time you actually have for hobbies each week — and discover hidden hours you didn't know existed.",
    href: '/tools/time-calculator',
    badge: 'New',
  },
  {
    emoji: '⚖️',
    title: 'Hobby Comparison',
    description:
      'Compare two hobbies side by side on cost, time commitment, skill curve, and more to find the right fit.',
    href: '/compare',
  },
  {
    emoji: '🧰',
    title: 'Starter Kits',
    description:
      'Run a first hobby experiment with nearby materials, a small budget, and a clear signal for whether to keep going.',
    href: '/starter-kits',
  },
  {
    emoji: '💰',
    title: 'Cost Calculator',
    description:
      'Add equipment, lessons, subscriptions and supplies — see the honest year-one and steady-state cost before you commit.',
    href: '/tools/cost-calculator',
    badge: 'New',
  },
];

const BADGE_STYLES: Record<string, string> = {
  Popular: 'bg-foreground/10 text-foreground border-foreground/20',
  New: 'bg-amber-400/10 text-foreground border-amber-400/30',
};

export default function ToolsPage() {
  return (
    <div className="min-h-screen" style={{ background: '#FAFAFA' }}>
      {/* Hero */}
      <section
        className="relative overflow-hidden px-4 py-16 sm:py-24"
        style={{
          background: 'linear-gradient(160deg, #ECFDF5 0%, #F5F5F4 50%, #ECFDF5 100%)',
        }}
      >
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-foreground/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
            Free Tools
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Hobby Tools
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Practical tools to help you discover, plan, and commit to hobbies that actually stick.
          </p>
        </div>
      </section>

      {/* Tools grid */}
      <section className="px-4 py-14">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TOOLS.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-[0_8px_32px_rgba(16,185,129,0.10)]"
                prefetch={false}
              >
                {/* Top accent */}
                <div className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 rounded-t-2xl bg-gradient-to-r from-foreground to-foreground/60 transition-transform duration-300 group-hover:scale-x-100" />

                {/* Badge */}
                {tool.badge && (
                  <div className="mb-4 self-start">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${BADGE_STYLES[tool.badge] ?? 'bg-card/40 text-muted-foreground border-border'}`}
                    >
                      {tool.badge}
                    </span>
                  </div>
                )}

                {/* Emoji */}
                <div className="mb-4 text-4xl transition-transform duration-300 group-hover:scale-110">
                  {tool.emoji}
                </div>

                {/* Content */}
                <h2 className="mb-2 text-lg font-bold text-foreground transition-colors group-hover:text-foreground">
                  {tool.title}
                </h2>
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                  {tool.description}
                </p>

                {/* CTA */}
                <div className="mt-5 flex items-center gap-1 text-sm font-semibold text-foreground transition-all duration-200 group-hover:gap-2">
                  Try it
                  <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Back link */}
          <div className="mt-12 text-center">
            <Link
              href="/"
              className="text-sm text-muted-foreground/60 transition-colors hover:text-muted-foreground"
            >
              ← Back to SignificantHobbies
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
