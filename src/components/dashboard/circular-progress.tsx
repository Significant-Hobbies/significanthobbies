'use client';

import { type LucideIcon, Check } from 'lucide-react';
import { cn } from '~/lib/utils';

interface Props {
  /** 0..1 — fraction of the ring to fill. */
  progress: number;
  /** Label shown below the ring (e.g. "AM" / "PM"). */
  label: string;
  /** Optional sublabel (e.g. "Focus"). */
  sublabel?: string;
  /** Icon shown in the center when complete. */
  icon?: LucideIcon;
  /** Ring diameter in px. Default 64. */
  size?: number;
  /** Stroke width in px. Default 5. */
  strokeWidth?: number;
  className?: string;
}

/**
 * Circular Progress Ring — an SVG progress ring that fills in gold. Used for
 * AM/PM check-in visualization. When progress reaches 1, a checkmark icon
 * appears in the center.
 */
export function CircularProgress({
  progress,
  label,
  sublabel,
  icon: Icon = Check,
  size = 64,
  strokeWidth = 5,
  className,
}: Props) {
  const clamped = Math.max(0, Math.min(1, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped);
  const isComplete = clamped >= 1;

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="stroke-foreground/10"
          />
          {/* Progress — gold fill */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            stroke="oklch(0.82 0.13 88)"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
            style={{
              filter: isComplete ? 'drop-shadow(0 0 6px oklch(0.82 0.13 88 / 0.5))' : 'none',
            }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isComplete ? (
            <Icon className="h-5 w-5 text-primary" />
          ) : (
            <span className="font-serif text-sm font-medium tabular-nums text-muted-foreground">
              {Math.round(clamped * 100)}%
            </span>
          )}
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-medium text-foreground">{label}</p>
        {sublabel && <p className="text-[10px] text-muted-foreground/60">{sublabel}</p>}
      </div>
    </div>
  );
}
