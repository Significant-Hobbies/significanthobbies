import { SpotlightCard, StaggerContainer, StaggerItem } from '~/components/aceternity';
import { cn } from '~/lib/utils';
import type { BehavioralInsight } from '~/lib/behavioral-insights';

interface BehavioralInsightsProps {
  insights: BehavioralInsight[];
}

const TYPE_STYLES: Record<BehavioralInsight['type'], { label: string; className: string }> = {
  pattern: { label: 'Pattern', className: 'border-primary/30 bg-primary/10 text-primary' },
  progress: { label: 'Progress', className: 'border-growth/30 bg-growth/10 text-growth' },
  contrast: { label: 'Contrast', className: 'border-blue-400/30 bg-blue-400/10 text-blue-400' },
  nudge: { label: 'Nudge', className: 'border-amber-500/30 bg-amber-500/10 text-amber-500' },
};

export function BehavioralInsights({ insights }: BehavioralInsightsProps) {
  if (insights.length === 0) return null;

  return (
    <section className="space-y-5">
      {/* Section header */}
      <div className="space-y-1">
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
          Insights
        </h2>
        <p className="text-sm text-muted-foreground">Based on what you&apos;ve actually done</p>
      </div>

      <StaggerContainer className="grid gap-4 sm:grid-cols-2">
        {insights.map((insight) => {
          const style = TYPE_STYLES[insight.type];
          return (
            <StaggerItem key={insight.id}>
              <SpotlightCard
                className="h-full shadow-soft"
                innerClassName="flex h-full flex-col p-5"
                spotlightColor="oklch(0.82 0.13 88 / 0.10)"
              >
                {/* Header row: emoji + type badge */}
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-xl">
                    {insight.emoji}
                  </div>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                      style.className
                    )}
                  >
                    {style.label}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-medium text-foreground">{insight.title}</h3>

                {/* Description */}
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {insight.description}
                </p>

                {/* Confidence bar */}
                <div className="mt-auto pt-4">
                  <div className="h-0.5 w-full overflow-hidden rounded-full bg-foreground/10">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${insight.confidence}%` }}
                    />
                  </div>
                </div>
              </SpotlightCard>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    </section>
  );
}
