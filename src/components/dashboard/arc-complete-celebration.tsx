'use client';

import { motion } from 'motion/react';

import { BorderBeam, GradientMesh, SpotlightCard } from '~/components/aceternity';
import { Whale } from '~/components/whale';

interface ArcCompleteCelebrationProps {
  arc: {
    id: string;
    title: string;
    emoji: string | null;
    type: string;
  } | null;
  onDismiss?: () => void;
}

/**
 * Arc Complete Celebration — a full-screen overlay that appears the moment a
 * quest (arc) is marked complete. It frames the closing as a chapter sealed
 * into the user's stamp, not a checkbox ticked. The card scales in with a
 * spring; the arc emoji does a subtle bounce.
 *
 * Renders null when `arc` is null.
 */
export function ArcCompleteCelebration({ arc, onDismiss }: ArcCompleteCelebrationProps) {
  if (!arc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="relative w-full max-w-md px-4"
      >
        <SpotlightCard
          className="shadow-soft"
          innerClassName="relative flex flex-col items-center p-8 text-center"
          spotlightColor="oklch(0.82 0.13 88 / 0.14)"
        >
          <GradientMesh variant="gold" />
          <BorderBeam size={220} duration={14} />

          {/* Whale mascot floating calmly above the arc emoji */}
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            <Whale size={56} glow />
          </motion.div>

          {/* Arc emoji — subtle bounce */}
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            className="relative mt-3 text-4xl"
            aria-hidden="true"
          >
            {arc.emoji ?? '🔄'}
          </motion.div>

          <h2 className="relative mt-5 font-serif text-2xl font-semibold tracking-tight text-foreground">
            Arc complete
          </h2>

          <p className="relative mt-2 text-lg text-muted-foreground">{arc.title}</p>

          <p className="relative mt-5 font-serif text-base italic text-foreground/80">
            This is now part of your stamp.
          </p>

          <button
            type="button"
            onClick={onDismiss}
            className="relative mt-7 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 hover:shadow-glow"
          >
            Continue
          </button>
        </SpotlightCard>
      </motion.div>
    </div>
  );
}
