'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'motion/react';

import { cn } from '~/lib/utils';

/**
 * Card Hover Effect — a card with a mouse-following radial glow border.
 * The glow appears on hover and follows the cursor. Multiple cards in a grid
 * create a beautiful "spotlight passes between cards" effect.
 */
export function CardHoverEffect({
  children,
  className,
  glowColor = 'oklch(0.82 0.13 88 / 0.12)',
}: {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring for natural movement
  const springConfig = { damping: 25, stiffness: 300 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = ref.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  const glow = useMotionTemplate`radial-gradient(300px circle at ${smoothMouseX}px ${smoothMouseY}px, ${glowColor}, transparent 70%)`;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border bg-card transition-colors duration-300 hover:border-primary/30',
        className
      )}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: glow }}
        aria-hidden="true"
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
