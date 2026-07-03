import { cn } from '~/lib/utils';

/**
 * Aceternity Border Beam — an animated gradient beam that travels around the
 * border of a container. Place inside a `relative overflow-hidden` container.
 */
export function BorderBeam({
  className,
  size = 200,
  duration = 12,
  delay = 0,
  colorFrom = 'oklch(0.82 0.13 88)',
  colorTo = 'oklch(0.72 0.13 150)',
}: {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
}) {
  return (
    <div
      style={
        {
          '--size': size,
          '--duration': duration,
          '--delay': `-${delay}s`,
          '--color-from': colorFrom,
          '--color-to': colorTo,
        } as React.CSSProperties
      }
      className={cn(
        'pointer-events-none absolute inset-0 rounded-[inherit] [border:calc(var(--border-width,1px))_solid_transparent]',
        '![mask-clip:padding-box,border-box] ![mask-composite:intersect] [mask:linear-gradient(transparent,transparent),linear-gradient(white,white)]',
        'after:absolute after:aspect-square after:w-[calc(var(--size)*1px)] after:animate-border-beam after:[animation-delay:var(--delay)] after:[background:linear-gradient(to_left,var(--color-from),var(--color-to),var(--color-from))] after:[offset-anchor:90%_50%] after:[offset-path:rect(0_auto_auto_0_round_calc(var(--size)*1px))]',
        className
      )}
    />
  );
}
