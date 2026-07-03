'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';

type Animation =
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'scale-up'
  | 'blur-in'
  | 'slide-up'
  | 'flip-up';

interface ScrollRevealProps {
  children: ReactNode;
  animation?: Animation;
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  once?: boolean;
  stagger?: number; // for staggered children
}

const ANIMATION_STYLES: Record<Animation, { from: string; to: string }> = {
  'fade-up': {
    from: 'opacity-0 translate-y-8',
    to: 'opacity-100 translate-y-0',
  },
  'fade-down': {
    from: 'opacity-0 -translate-y-8',
    to: 'opacity-100 translate-y-0',
  },
  'fade-left': {
    from: 'opacity-0 translate-x-8',
    to: 'opacity-100 translate-x-0',
  },
  'fade-right': {
    from: 'opacity-0 -translate-x-8',
    to: 'opacity-100 translate-x-0',
  },
  'scale-up': {
    from: 'opacity-0 scale-95',
    to: 'opacity-100 scale-100',
  },
  'blur-in': {
    from: 'opacity-0 blur-sm scale-[0.97]',
    to: 'opacity-100 blur-0 scale-100',
  },
  'slide-up': {
    from: 'opacity-0 translate-y-12',
    to: 'opacity-100 translate-y-0',
  },
  'flip-up': {
    from: 'opacity-0 translate-y-6 [transform:perspective(800px)_rotateX(8deg)]',
    to: 'opacity-100 translate-y-0 [transform:perspective(800px)_rotateX(0deg)]',
  },
};

export function ScrollReveal({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 600,
  threshold = 0.15,
  className = '',
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced motion preference — show content immediately
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setVisible(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, once]);

  const anim = ANIMATION_STYLES[animation];

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${visible ? anim.to : anim.from} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/** Wraps an array of items with staggered scroll reveals */
export function ScrollRevealGroup({
  children,
  animation = 'fade-up',
  stagger = 80,
  duration = 500,
  threshold = 0.1,
  className = '',
}: {
  children: ReactNode[];
  animation?: Animation;
  stagger?: number;
  duration?: number;
  threshold?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold, rootMargin: '0px 0px -30px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  const anim = ANIMATION_STYLES[animation];

  return (
    <div ref={ref} className={className}>
      {(children as ReactNode[]).map((child, i) => (
        <div
          key={i}
          className={`transition-all ease-out ${visible ? anim.to : anim.from}`}
          style={{
            transitionDuration: `${duration}ms`,
            transitionDelay: `${visible ? i * stagger : 0}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
