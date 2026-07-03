'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, useMotionValue, useSpring } from 'motion/react';

import { cn } from '~/lib/utils';

/**
 * Aceternity Number Ticker — animates from 0 to the target value when scrolled
 * into view. Uses spring physics for a natural counting feel.
 */
export function NumberTicker({
  value,
  direction = 'up',
  delay = 0,
  className,
  decimalPlaces = 0,
}: {
  value: number;
  direction?: 'up' | 'down';
  delay?: number;
  className?: string;
  decimalPlaces?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === 'down' ? value : 0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: '0px 0px -50px 0px' });
  const [displayValue, setDisplayValue] = useState(direction === 'down' ? value : 0);

  useEffect(() => {
    if (isInView) {
      const t = setTimeout(() => {
        motionValue.set(direction === 'down' ? 0 : value);
      }, delay * 1000);
      return () => clearTimeout(t);
    }
  }, [isInView, motionValue, direction, value, delay]);

  useEffect(() => {
    return springValue.on('change', (latest) => {
      setDisplayValue(Number(latest.toFixed(decimalPlaces)));
    });
  }, [springValue, decimalPlaces]);

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {displayValue.toLocaleString('en-US', {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      })}
    </span>
  );
}
