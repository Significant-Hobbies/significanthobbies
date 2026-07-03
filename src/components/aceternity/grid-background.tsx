import { cn } from '~/lib/utils';

/**
 * Grid Background — a subtle dot/line grid pattern used behind hero sections.
 * Very Stripe/Linear aesthetic. Fades out at the edges via mask.
 */
export function GridBackground({
  className,
  variant = 'dots',
  size = 20,
  color = 'oklch(0.97 0.003 285 / 0.04)',
}: {
  className?: string;
  variant?: 'dots' | 'lines';
  size?: number;
  color?: string;
}) {
  const pattern =
    variant === 'dots'
      ? {
          backgroundImage: `radial-gradient(${color} 1px, transparent 1px)`,
          backgroundSize: `${size}px ${size}px`,
        }
      : {
          backgroundImage: `linear-gradient(to right, ${color} 1px, transparent 1px), linear-gradient(to bottom, ${color} 1px, transparent 1px)`,
          backgroundSize: `${size}px ${size}px`,
        };

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]',
        className
      )}
      style={pattern}
      aria-hidden="true"
    />
  );
}
