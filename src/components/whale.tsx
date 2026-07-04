import type { SVGProps } from 'react';

type WhaleProps = SVGProps<SVGSVGElement> & {
  size?: number;
  glow?: boolean;
  float?: boolean;
  onDark?: boolean;
};

// ─── Whale mascot ───────────────────────────────────────────────────────────
// A small golden whale, tail flukes lifted mid-dive. Calm closed eye, soft
// belly highlight, gentle spout. Drawn to read as "whale" from 28px to 180px.
// Iterated visually in screenshots/whale-lab.html.

export function Whale({
  size = 80,
  glow = false,
  float = false,
  onDark = false,
  className = '',
  ...props
}: WhaleProps) {
  const body = '#d4a843'; // gold-500
  const belly = '#e8c770'; // lighter gold
  const deep = '#b8862a'; // darker gold
  const eye = '#1a0a00';

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
      height={size * 0.75}
      viewBox="0 0 240 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={animClasses}
      aria-label="Whale — your gentle companion"
      role="img"
      {...props}
    >
      {/* Body: soft bean, blunt head left, tapering toward the tail */}
      <path
        d="M 20 95
           C 20 66, 52 50, 92 50
           C 128 50, 154 62, 164 80
           C 167 86, 168 92, 166 98
           C 162 108, 150 115, 134 119
           C 104 127, 60 123, 38 110
           C 26 103, 20 99, 20 95 Z"
        fill={body}
      />
      {/* Tail: narrow stock curving up into two smooth rounded flukes */}
      <path
        d="M 156 92
           C 163 88, 168 81, 170 73
           C 172 60, 178 49, 188 42
           C 191 40, 194 41, 194 44
           C 192 53, 190 62, 191 69
           C 198 64, 207 62, 216 63
           C 219 63, 220 66, 218 69
           C 209 74, 202 82, 197 92
           C 193 101, 184 107, 173 106
           C 165 105, 159 99, 156 92 Z"
        fill={body}
      />
      {/* Belly highlight */}
      <path
        d="M 28 103 C 55 118, 100 122, 138 114 C 110 124, 62 122, 34 108 Z"
        fill={belly}
        opacity="0.55"
      />
      {/* Eye: calm, closed arc */}
      <path
        d="M 50 84 Q 55 80, 60 84"
        stroke={eye}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Spout: two soft arcs */}
      <path
        d="M 86 42 C 84 34, 86 26, 92 20 M 96 42 C 97 34, 102 28, 110 25"
        stroke={onDark ? belly : deep}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.45"
        fill="none"
      />
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
      <Whale size={30} onDark={onDark} />
      <span>Significant Hobbies</span>
    </span>
  );
}
