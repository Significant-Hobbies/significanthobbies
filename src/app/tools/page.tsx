import type { LucideIcon } from 'lucide-react';
import { Calculator, Package, Scale, Target, Timer } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import {
  CardHoverEffect,
  FadeIn,
  GridBackground,
  StaggerContainer,
  StaggerItem,
} from '~/components/aceternity';

export const metadata: Metadata = {
  title: 'Hobby Tools — SignificantHobbies',
  description:
    'Free tools to help you discover, plan, and commit to hobbies. Hobby quiz, time calculator, hobby comparison, and more.',
};

interface Tool {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  badge?: string;
}

const TOOLS: Tool[] = [
  {
    icon: Target,
    title: 'Hobby Finder Quiz',
    description:
      'Answer 5 questions and get personalized hobby recommendations matched to your personality, schedule, and interests.',
    href: '/find-your-hobby',
    badge: 'Popular',
  },
  {
    icon: Timer,
    title: 'Time Calculator',
    description:
      "Find out how much free time you actually have for hobbies each week — and discover hidden hours you didn't know existed.",
    href: '/tools/time-calculator',
    badge: 'New',
  },
  {
    icon: Scale,
    title: 'Hobby Comparison',
    description:
      'Compare two hobbies side by side on cost, time commitment, skill curve, and more to find the right fit.',
    href: '/compare',
  },
  {
    icon: Package,
    title: 'Starter Kits',
    description:
      'Run a first hobby experiment with nearby materials, a small budget, and a clear signal for whether to keep going.',
    href: '/starter-kits',
  },
  {
    icon: Calculator,
    title: 'Cost Calculator',
    description:
      'Add equipment, lessons, subscriptions and supplies — see the honest year-one and steady-state cost before you commit.',
    href: '/tools/cost-calculator',
    badge: 'New',
  },
];

const BADGE_STYLES: Record<string, string> = {
  Popular: 'bg-foreground/10 text-foreground border-foreground/20',
  New: 'bg-primary/10 text-foreground border-primary/30',
};

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-16 sm:py-24">
        <GridBackground variant="dots" size={22} />
        <FadeIn className="relative mx-auto max-w-3xl text-center">
          <h1 className="mb-4 font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Hobby Tools
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Free, practical tools to help you discover, plan, and commit to hobbies that actually
            stick.
          </p>
        </FadeIn>
      </section>

      {/* Tools grid */}
      <section className="px-4 py-14">
        <div className="mx-auto max-w-5xl">
          <StaggerContainer className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TOOLS.map((tool) => (
              <StaggerItem key={tool.href}>
                <CardHoverEffect className="h-full rounded-2xl shadow-soft">
                  <Link
                    href={tool.href}
                    className="group relative flex h-full flex-col p-6"
                    prefetch={false}
                  >
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

                    <tool.icon className="mb-4 h-4 w-4 text-primary" aria-hidden="true" />

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
                </CardHoverEffect>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Back link */}
          <FadeIn className="mt-12 text-center" delay={0.2}>
            <Link
              href="/"
              className="text-sm text-muted-foreground/60 transition-colors hover:text-muted-foreground"
            >
              ← Back to SignificantHobbies
            </Link>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
