import type { SVGProps } from "react";

type LumiProps = SVGProps<SVGSVGElement> & {
  size?: number;
  glow?: boolean;
  float?: boolean;
};

export function Lumi({ size = 80, glow = false, float = false, className = "", ...props }: LumiProps) {
  const id = "lumi-glow-static";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={[
        className,
        float ? "animate-lumi-float" : "",
        glow ? "animate-lumi-glow" : "",
      ].filter(Boolean).join(" ")}
      aria-label="Lumi — your bucket list guide"
      role="img"
      {...props}
    >
      {glow && (
        <defs>
          <radialGradient id={id} cx="50%" cy="60%" r="50%">
            <stop offset="0%" stopColor="#FCD34D" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
        </defs>
      )}

      {/* Glow halo */}
      {glow && (
        <ellipse cx="50" cy="95" rx="38" ry="12" fill={`url(#${id})`} />
      )}

      {/* Outer flame / aura */}
      <path
        d="M50 5 C28 5, 12 30, 12 58 C12 86, 28 110, 50 115 C72 110, 88 86, 88 58 C88 30, 72 5, 50 5Z"
        fill="#FCD34D"
        opacity="0.35"
      />

      {/* Main body */}
      <path
        d="M50 14 C32 14, 20 36, 20 60 C20 84, 33 108, 50 112 C67 108, 80 84, 80 60 C80 36, 68 14, 50 14Z"
        fill="#F59E0B"
      />

      {/* Inner highlight */}
      <path
        d="M50 22 C38 22, 30 40, 30 58 C30 76, 38 96, 50 100 C56 96, 62 84, 64 70 C66 56, 62 36, 50 22Z"
        fill="#FCD34D"
        opacity="0.6"
      />

      {/* Eyes */}
      <ellipse cx="37" cy="62" rx="7" ry="8" fill="#1C1917" />
      <ellipse cx="63" cy="62" rx="7" ry="8" fill="#1C1917" />

      {/* Eye shine */}
      <circle cx="40" cy="59" r="2.5" fill="white" opacity="0.9" />
      <circle cx="66" cy="59" r="2.5" fill="white" opacity="0.9" />

      {/* Small inner shine dot */}
      <circle cx="38" cy="63" r="1" fill="white" opacity="0.5" />
      <circle cx="64" cy="63" r="1" fill="white" opacity="0.5" />

      {/* Smile */}
      <path
        d="M38 78 Q50 89 62 78"
        stroke="#92400E"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Cheek blush */}
      <ellipse cx="28" cy="72" rx="5" ry="3" fill="#FBBF24" opacity="0.5" />
      <ellipse cx="72" cy="72" rx="5" ry="3" fill="#FBBF24" opacity="0.5" />

      {/* Sparkle top-left */}
      <path
        d="M20 22 L22 26 L26 22 L22 18Z"
        fill="#FDE68A"
        opacity="0.8"
      />
      {/* Sparkle top-right */}
      <path
        d="M74 18 L76 22 L80 18 L76 14Z"
        fill="#FDE68A"
        opacity="0.6"
      />
    </svg>
  );
}

export function LumiWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 font-bold tracking-tight ${className}`}>
      <Lumi size={28} />
      <span>Lumi</span>
    </span>
  );
}
