'use client';

import { useMemo } from 'react';

export interface ChartSeries {
  label: string;
  points: { monthKey: string; value: number }[];
}

interface Props {
  series: ChartSeries[];
}

// Design-system chart tokens (see globals.css). Gold is chart-1 — the
// Lumi accent — so the first series always reads as the "primary" thread.
const SERIES_COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
];

/**
 * Minimal SVG trajectory chart. One line per numeric label, plotted across
 * monthKey on the x-axis. The ideal is *not* drawn as a target line —
 * ideals are free-form text and drawing a target would require parsing
 * "12 months of runway" into a number, which is exactly the kind of
 * app-opinion the no-score thesis rejects. The ideal renders as a caption
 * above the chart (in the parent); the user reads the gap themselves.
 *
 * No external chart lib — keeps the bundle small and the visual style
 * consistent with the editorial dark palette.
 */
export function TrajectoryChart({ series }: Props) {
  const width = 640;
  const height = 220;
  const padding = { top: 16, right: 20, bottom: 36, left: 44 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const { xLabels, xScale, yScale, yMin, yMax } = useMemo(() => {
    const allPoints = series.flatMap((s) => s.points);
    if (allPoints.length === 0) {
      return { xLabels: [], xScale: (_: string) => 0, yScale: (_: number) => 0, yMin: 0, yMax: 1 };
    }
    const labelSet = new Set<string>();
    for (const p of allPoints) labelSet.add(p.monthKey);
    const xLabels = Array.from(labelSet).sort();
    const xStep = xLabels.length > 1 ? innerWidth / (xLabels.length - 1) : 0;
    const xScale = (monthKey: string) => {
      const idx = xLabels.indexOf(monthKey);
      return idx === -1 ? 0 : idx * xStep;
    };
    const values = allPoints.map((p) => p.value);
    const yMin = Math.min(...values);
    const yMax = Math.max(...values);
    const yRange = yMax - yMin || 1;
    const yPad = yRange * 0.12;
    const yScale = (v: number) => {
      const t = (v - (yMin - yPad)) / (yRange + 2 * yPad);
      return innerHeight - t * innerHeight;
    };
    return { xLabels, xScale, yScale, yMin, yMax };
  }, [series, innerWidth, innerHeight]);

  if (series.length === 0 || xLabels.length === 0) {
    return null;
  }

  // Y tick marks: 4 evenly spaced between yMin and yMax.
  const yTicks = [0, 1, 2, 3, 4].map((i) => {
    const t = i / 4;
    const v = yMin + t * (yMax - yMin);
    return { v, y: yScale(v) };
  });

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ minWidth: 320, height: 'auto' }}
        role="img"
        aria-label="Trajectory chart"
      >
        {/* Y grid lines + tick labels */}
        {yTicks.map((tick, i) => (
          <g key={`y-${i}`}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={padding.top + tick.y}
              y2={padding.top + tick.y}
              stroke="currentColor"
              className="text-border"
              strokeWidth={1}
              strokeDasharray="2 5"
              opacity={0.7}
            />
            <text
              x={padding.left - 8}
              y={padding.top + tick.y + 3}
              textAnchor="end"
              className="fill-muted-foreground"
              fontSize={10}
              fontFamily="var(--font-sans)"
            >
              {formatTick(tick.v)}
            </text>
          </g>
        ))}

        {/* X tick labels — abbreviated month + year */}
        {xLabels.map((label) => {
          const x = padding.left + xScale(label);
          return (
            <text
              key={`x-${label}`}
              x={x}
              y={height - padding.bottom + 18}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize={10}
              fontFamily="var(--font-sans)"
            >
              {formatXLabel(label)}
            </text>
          );
        })}

        {/* Lines + points per series */}
        {series.map((s, i) => {
          const color = SERIES_COLORS[i % SERIES_COLORS.length];
          const points = s.points.slice().sort((a, b) => a.monthKey.localeCompare(b.monthKey));
          if (points.length === 0) return null;
          const path = points
            .map((p, idx) => {
              const x = padding.left + xScale(p.monthKey);
              const y = padding.top + yScale(p.value);
              return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
            })
            .join(' ');
          return (
            <g key={s.label}>
              <path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth={1.75}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {points.map((p) => {
                const x = padding.left + xScale(p.monthKey);
                const y = padding.top + yScale(p.value);
                return (
                  <circle
                    key={`${s.label}-${p.monthKey}`}
                    cx={x}
                    cy={y}
                    r={2.75}
                    fill={color}
                    stroke="var(--color-card)"
                    strokeWidth={1.5}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Legend — quiet, inline */}
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
        {series.map((s, i) => (
          <div key={s.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: SERIES_COLORS[i % SERIES_COLORS.length] }}
              aria-hidden
            />
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatTick(v: number): string {
  if (Number.isInteger(v)) return v.toString();
  // Trim trailing zeros for non-integers (e.g. 7.5, not 7.5000).
  return v.toFixed(2).replace(/\.?0+$/, '');
}

function formatXLabel(monthKey: string): string {
  // "2026-07" → "Jul '26" — compact for the x-axis.
  const match = /^(\d{4})-(\d{2})$/.exec(monthKey);
  if (!match) return monthKey;
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const year = match[1].slice(2);
  const month = Number(match[2]) - 1;
  if (month < 0 || month > 11) return monthKey;
  return `${monthNames[month]} ’${year}`;
}
