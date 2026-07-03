import { cn } from '~/lib/utils';

/**
 * Aceternity Spotlight — a radial glow that follows the mouse on hover.
 * Place inside a `relative` container. Pure CSS, no JS.
 */
export function Spotlight({
  className,
  fill = 'oklch(0.82 0.13 88 / 0.15)',
}: {
  className?: string;
  fill?: string;
}) {
  return (
    <svg
      className={cn(
        'pointer-events-none absolute z-[1] h-[169%] w-[138%] opacity-0 transition-opacity duration-500 group-hover:opacity-100',
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3787 2842"
      fill="none"
      aria-hidden="true"
    >
      <g filter="url(#spotlight-filter)">
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="718"
          ry="282"
          fill={fill}
          transform="rotate(-25.7548 1893.21 273.501)"
        />
      </g>
      <defs>
        <filter
          id="spotlight-filter"
          x="0.860352"
          y="0.838989"
          width="3785.16"
          height="2840.26"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="151" result="effect1_foregroundBlur_1065_8" />
        </filter>
      </defs>
    </svg>
  );
}
