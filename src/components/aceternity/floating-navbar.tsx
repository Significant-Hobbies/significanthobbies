'use client';

import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';

import { cn } from '~/lib/utils';

/**
 * Floating Navbar — a pill-shaped nav that floats at the top with a spring
 * animation. Visible when scrolling up or at top, hidden when scrolling down.
 */
export function FloatingNavbar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(true);

  useMotionValueEvent(scrollYProgress, 'change', (current) => {
    if (typeof current === 'number') {
      const prev = scrollYProgress.getPrevious() ?? 0;
      const direction = current - prev;
      if (current < 0.05) {
        setVisible(true);
      } else if (direction < 0) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    }
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 1, y: -100 }}
        animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className={cn('fixed left-1/2 top-4 z-50 -translate-x-1/2', className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
