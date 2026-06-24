import type { SVGProps } from 'react';

type LumiProps = SVGProps<SVGSVGElement> & {
  size?: number;
  glow?: boolean;
  float?: boolean;
  /** Override the primary coral color for surfaces where white works better */
  onDark?: boolean;
};

export function Lumi({
  size = 80,
  glow = false,
  float = false,
  onDark = false,
  className = '',
  ...props
}: LumiProps) {
  // Coral palette — oklch(0.62 0.20 27) family
  const body = onDark ? '#f87171' : '#e05533'; // coral-500 / coral-400 on dark
  const highlight = onDark ? '#fca5a5' : '#f07050'; // lighter coral
  const deep = onDark ? '#e05533' : '#b83520'; // darker coral for depth
  const smile = onDark ? '#7f1d1d' : '#7f1d1d'; // dark red for smile
  const sparkle = onDark ? '#fca5a5' : '#f87171'; // light coral sparkle

  const animClasses = [
    className,
    float ? 'animate-lumi-float' : '',
    glow ? 'animate-lumi-glow' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={animClasses}
      aria-label="Lumi — your bucket list guide"
      role="img"
      {...props}
    >
      {/* Outer aura */}
      <path
        d="M50 5 C28 5, 12 30, 12 58 C12 86, 28 110, 50 115 C72 110, 88 86, 88 58 C88 30, 72 5, 50 5Z"
        fill={body}
        opacity="0.18"
      />
      {/* Main body */}
      <path
        d="M50 14 C32 14, 20 36, 20 60 C20 84, 33 108, 50 112 C67 108, 80 84, 80 60 C80 36, 68 14, 50 14Z"
        fill={body}
      />
      {/* Inner highlight — gives depth */}
      <path
        d="M50 22 C38 22, 30 40, 30 58 C30 76, 38 96, 50 100 C56 96, 62 84, 64 70 C66 56, 62 36, 50 22Z"
        fill={highlight}
        opacity="0.45"
      />
      {/* Eyes */}
      <ellipse cx="37" cy="62" rx="7" ry="8" fill="#1a0a00" />
      <ellipse cx="63" cy="62" rx="7" ry="8" fill="#1a0a00" />
      {/* Eye shine — gives life */}
      <circle cx="40" cy="59" r="2.5" fill="white" opacity="0.92" />
      <circle cx="66" cy="59" r="2.5" fill="white" opacity="0.92" />
      <circle cx="38" cy="64" r="1" fill="white" opacity="0.45" />
      <circle cx="64" cy="64" r="1" fill="white" opacity="0.45" />
      {/* Smile */}
      <path
        d="M38 78 Q50 89 62 78"
        stroke={smile}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Cheek blush */}
      <ellipse cx="27" cy="72" rx="5" ry="3" fill={deep} opacity="0.3" />
      <ellipse cx="73" cy="72" rx="5" ry="3" fill={deep} opacity="0.3" />
      {/* Sparkles */}
      <path d="M20 22 L22 26 L26 22 L22 18Z" fill={sparkle} opacity="0.8" />
      <path d="M74 18 L76 22 L80 18 L76 14Z" fill={sparkle} opacity="0.6" />
    </svg>
  );
}

export function LumiWordmark({
  className = '',
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 font-bold tracking-tight ${className}`}>
      <Lumi size={28} onDark={onDark} />
      <span>Lumi</span>
    </span>
  );
}
