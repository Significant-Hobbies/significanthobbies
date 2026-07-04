import type { SVGProps } from 'react';

type WhaleProps = SVGProps<SVGSVGElement> & {
  size?: number;
  glow?: boolean;
  float?: boolean;
  onDark?: boolean;
};

// ─── Whale mascot ───────────────────────────────────────────────────────────
// A small floating whale — calm, wise, present. Not cartoonish.
// Warm gold/amber palette to match the brand. Slow breathing animation.
//
// Replaces the old "Lumi" oval mascot. The whale symbolizes long journeys,
// deep wisdom, and gentle presence. It drifts, it doesn't bounce.

export function Whale({
  size = 80,
  glow = false,
  float = false,
  onDark = false,
  className = '',
  ...props
}: WhaleProps) {
  const body = onDark ? '#d4a843' : '#d4a843'; // gold-500
  const belly = onDark ? '#e8c770' : '#e8c770'; // lighter gold
  const deep = onDark ? '#b8862a' : '#b8862a'; // darker gold for depth
  const eye = onDark ? '#1a0a00' : '#1a0a00';
  const sparkle = onDark ? '#e8c770' : '#d4a843';

  const animClasses = [
    className,
    float ? 'animate-whale-float' : '',
    glow ? 'animate-whale-glow' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={animClasses}
      aria-label="Whale — your gentle companion"
      role="img"
      {...props}
    >
      {/* Soft glow aura */}
      {glow && <ellipse cx="60" cy="55" rx="55" ry="40" fill={body} opacity="0.08" />}

      {/* Tail — elegant flowing shape */}
      <path
        d="M95 50 Q108 38, 112 30 Q115 42, 108 52 Q115 62, 112 74 Q108 66, 95 54"
        fill={deep}
        opacity="0.85"
      />

      {/* Main body — rounded, gentle, whale-like */}
      <path
        d="M15 55
           Q15 35, 40 30
           Q65 27, 88 38
           Q98 43, 98 52
           Q98 62, 88 67
           Q65 78, 40 75
           Q15 72, 15 55Z"
        fill={body}
      />

      {/* Belly — lighter underside for depth */}
      <path
        d="M22 58
           Q25 68, 45 70
           Q65 72, 85 65
           Q92 62, 92 56
           Q88 64, 70 66
           Q50 68, 30 64
           Q24 62, 22 58Z"
        fill={belly}
        opacity="0.5"
      />

      {/* Fin — small, delicate */}
      <path d="M45 68 Q42 78, 38 82 Q48 80, 52 72" fill={deep} opacity="0.7" />

      {/* Eye — small, calm, half-lidded (not wide-eyed cartoon) */}
      <path
        d="M32 48 Q35 45, 39 48"
        stroke={eye}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Eye shine — tiny, subtle */}
      <circle cx="36" cy="47" r="0.8" fill="white" opacity="0.6" />

      {/* Smile — gentle, barely there */}
      <path
        d="M28 56 Q33 59, 38 56"
        stroke={deep}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />

      {/* Blowhole — tiny dot, anatomical detail */}
      <circle cx="55" cy="33" r="1.5" fill={deep} opacity="0.4" />

      {/* Water spout — gentle, calming */}
      <path
        d="M55 33 Q53 22, 56 15 Q58 8, 55 3"
        stroke={sparkle}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
      {/* Water droplets */}
      <circle cx="58" cy="18" r="1.2" fill={sparkle} opacity="0.5" />
      <circle cx="52" cy="12" r="0.8" fill={sparkle} opacity="0.4" />

      {/* Tiny bubbles trailing behind */}
      <circle cx="8" cy="50" r="1.5" fill={sparkle} opacity="0.3" />
      <circle cx="5" cy="45" r="1" fill={sparkle} opacity="0.2" />
      <circle cx="3" cy="55" r="0.8" fill={sparkle} opacity="0.15" />
    </svg>
  );
}

export function WhaleWordmark({
  className = '',
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 font-bold tracking-tight ${className}`}>
      <Whale size={28} onDark={onDark} />
      <span>Significant Hobbies</span>
    </span>
  );
}
