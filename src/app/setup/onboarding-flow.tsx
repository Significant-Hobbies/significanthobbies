'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { setUsername } from '~/lib/actions/user';

type OnboardingUser = {
  name?: string | null;
  image?: string | null;
};

// ─── Decorative background emojis ──────────────────────────────────────────
const BG_EMOJIS = [
  {
    emoji: '🎸',
    top: '8%',
    left: '6%',
    size: 'text-7xl',
    rotate: '-12deg',
    duration: '14s',
    delay: '0s',
    animKey: 'floatDrift',
  },
  {
    emoji: '🎨',
    top: '15%',
    left: '82%',
    size: 'text-6xl',
    rotate: '8deg',
    duration: '18s',
    delay: '2s',
    animKey: 'floatDrift2',
  },
  {
    emoji: '📚',
    top: '72%',
    left: '5%',
    size: 'text-8xl',
    rotate: '-6deg',
    duration: '12s',
    delay: '1s',
    animKey: 'floatDrift',
  },
  {
    emoji: '🏔️',
    top: '60%',
    left: '88%',
    size: 'text-7xl',
    rotate: '14deg',
    duration: '16s',
    delay: '3s',
    animKey: 'floatDrift3',
  },
  {
    emoji: '🌱',
    top: '85%',
    left: '55%',
    size: 'text-5xl',
    rotate: '-20deg',
    duration: '20s',
    delay: '0.5s',
    animKey: 'floatDrift2',
  },
  {
    emoji: '🎮',
    top: '30%',
    left: '92%',
    size: 'text-6xl',
    rotate: '6deg',
    duration: '11s',
    delay: '4s',
    animKey: 'floatDrift',
  },
  {
    emoji: '🏊',
    top: '78%',
    left: '22%',
    size: 'text-7xl',
    rotate: '10deg',
    duration: '15s',
    delay: '1.5s',
    animKey: 'floatDrift3',
  },
  {
    emoji: '🎯',
    top: '5%',
    left: '48%',
    size: 'text-5xl',
    rotate: '-8deg',
    duration: '13s',
    delay: '2.5s',
    animKey: 'floatDrift2',
  },
  {
    emoji: '✍️',
    top: '45%',
    left: '2%',
    size: 'text-6xl',
    rotate: '16deg',
    duration: '17s',
    delay: '0.8s',
    animKey: 'floatDrift',
  },
  {
    emoji: '🎭',
    top: '20%',
    left: '25%',
    size: 'text-5xl',
    rotate: '-18deg',
    duration: '19s',
    delay: '3.5s',
    animKey: 'floatDrift3',
  },
  {
    emoji: '🎻',
    top: '90%',
    left: '78%',
    size: 'text-6xl',
    rotate: '4deg',
    duration: '10s',
    delay: '1.2s',
    animKey: 'floatDrift2',
  },
  {
    emoji: '🧩',
    top: '55%',
    left: '70%',
    size: 'text-5xl',
    rotate: '-10deg',
    duration: '14s',
    delay: '2.8s',
    animKey: 'floatDrift',
  },
  {
    emoji: '🎪',
    top: '38%',
    left: '78%',
    size: 'text-4xl',
    rotate: '22deg',
    duration: '16s',
    delay: '0.3s',
    animKey: 'floatDrift3',
  },
  {
    emoji: '🧘',
    top: '12%',
    left: '60%',
    size: 'text-5xl',
    rotate: '-5deg',
    duration: '9s',
    delay: '4.5s',
    animKey: 'floatDrift2',
  },
  {
    emoji: '🎬',
    top: '65%',
    left: '42%',
    size: 'text-4xl',
    rotate: '12deg',
    duration: '21s',
    delay: '1.8s',
    animKey: 'floatDrift',
  },
  {
    emoji: '🏋️',
    top: '50%',
    left: '15%',
    size: 'text-5xl',
    rotate: '-15deg',
    duration: '13s',
    delay: '3.2s',
    animKey: 'floatDrift3',
  },
  {
    emoji: '🌍',
    top: '95%',
    left: '10%',
    size: 'text-4xl',
    rotate: '8deg',
    duration: '18s',
    delay: '0.6s',
    animKey: 'floatDrift2',
  },
  {
    emoji: '🎲',
    top: '3%',
    left: '18%',
    size: 'text-5xl',
    rotate: '-22deg',
    duration: '12s',
    delay: '2.2s',
    animKey: 'floatDrift',
  },
  {
    emoji: '🍳',
    top: '82%',
    left: '62%',
    size: 'text-4xl',
    rotate: '18deg',
    duration: '15s',
    delay: '4.8s',
    animKey: 'floatDrift3',
  },
  {
    emoji: '🔭',
    top: '25%',
    left: '50%',
    size: 'text-4xl',
    rotate: '-3deg',
    duration: '22s',
    delay: '1.1s',
    animKey: 'floatDrift2',
  },
];

// Emojis visible on mobile (indices into BG_EMOJIS)
const MOBILE_VISIBLE_INDICES = new Set([0, 1, 3, 7, 11, 14]);

// ─── Color orbs ─────────────────────────────────────────────────────────────
const COLOR_ORBS = [
  { color: '#059669', top: '10%', left: '5%', size: '400px', delay: '0s' },
  { color: '#F59E0B', top: '60%', left: '65%', size: '500px', delay: '3s' },
  { color: '#F43F5E', top: '75%', left: '10%', size: '350px', delay: '6s' },
];

// ─── Orbit emojis for avatar ─────────────────────────────────────────────────
const ORBIT_EMOJIS = ['🎸', '📚', '🎨', '🏔️', '🎮', '✍️'];

// ─── Sparkle positions ───────────────────────────────────────────────────────
const SPARKLES = [
  { top: '-18px', left: '50%', delay: '0s', duration: '1.8s' },
  { top: '-8px', left: '10%', delay: '0.4s', duration: '2.2s' },
  { top: '-8px', left: '85%', delay: '0.8s', duration: '1.6s' },
  { top: '10px', left: '0%', delay: '1.2s', duration: '2.4s' },
  { top: '10px', left: '95%', delay: '0.6s', duration: '2.0s' },
];

// ─── Tag pills (step 0) ──────────────────────────────────────────────────────
const WELCOME_TAGS = [
  { label: '🎸 Guitar', delay: '0.6s' },
  { label: '📚 Reading', delay: '1.0s' },
  { label: '🎨 Painting', delay: '1.4s' },
];

// ─── Confetti ────────────────────────────────────────────────────────────────
const CONFETTI_PIECES = Array.from({ length: 30 }, (_, i) => {
  const colors = [
    '#FBBF24',
    '#34D399',
    '#60A5FA',
    '#F472B6',
    '#A78BFA',
    '#FB923C',
    '#FACC15',
    '#2DD4BF',
    '#F87171',
    '#818CF8',
    '#4ADE80',
    '#E879F9',
    '#38BDF8',
    '#FCA5A5',
    '#86EFAC',
  ];
  const shapes = ['square', 'circle', 'triangle'] as const;
  return {
    color: colors[i % colors.length]!,
    delay: i * 0.09,
    left: 3 + (i * 97) / 30 + (i % 3) * 1.5,
    shape: shapes[i % 3]!,
    size: 6 + (i % 5) * 2,
    duration: 2.8 + (i % 4) * 0.5,
    rotation: (i % 8) * 45,
  };
});

// ─── Age fun facts ───────────────────────────────────────────────────────────
function getAgeFact(birthYear: number): string {
  const age = new Date().getFullYear() - birthYear;
  if (birthYear === 1991) return 'Same year as the World Wide Web! 🌐';
  if (birthYear === 1969) return 'Year of the Moon landing! 🚀';
  if (birthYear === 1984) return 'Same year as the first Mac! 🍎';
  if (birthYear === 2000) return 'A true millennium kid! 🥳';
  if (birthYear === 1999) return 'Born at the turn of the millennium!';
  if (birthYear === 1989) return 'Same year as the fall of the Berlin Wall! 🧱';
  if (age <= 16) return 'Gen Alpha has arrived! ✨';
  if (age <= 27) return 'Full-on Gen Z energy 💫';
  if (age <= 43) return 'Millennial, certified ✓';
  if (age <= 59) return 'Gen X — the cool ones 😎';
  if (age <= 75) return 'Baby Boomer with stories to tell 📖';
  return 'A lifetime of incredible hobbies!';
}

// ─── Decade timeline dots ────────────────────────────────────────────────────
function DecadeDots({ birthYear }: { birthYear: number }) {
  const currentYear = new Date().getFullYear();
  const decades: number[] = [];
  const startDecade = Math.ceil(birthYear / 10) * 10;
  for (let y = startDecade; y <= currentYear; y += 10) {
    decades.push(y);
  }

  return (
    <div className="flex items-center justify-center gap-1.5 flex-wrap mt-3">
      {decades.map((decade, i) => (
        <div
          key={decade}
          className="flex flex-col items-center gap-1"
          style={{
            animation: `slideInUp 0.3s ${i * 0.08}s both`,
          }}
        >
          <div
            className="rounded-full"
            style={{
              width: '8px',
              height: '8px',
              background:
                i === 0
                  ? '#059669'
                  : i === decades.length - 1
                    ? '#10b981'
                    : `hsl(${160 + i * 12}, 70%, 55%)`,
              boxShadow: `0 0 4px hsl(${160 + i * 12}, 70%, 55%)`,
            }}
          />
          {decades.length <= 8 && (
            <span style={{ fontSize: '9px', color: '#A8A29E' }}>{decade}</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Confetti piece ──────────────────────────────────────────────────────────
function ConfettiPiece({
  color,
  delay,
  left,
  shape,
  size,
  duration,
  rotation,
}: {
  color: string;
  delay: number;
  left: number;
  shape: 'square' | 'circle' | 'triangle';
  size: number;
  duration: number;
  rotation: number;
}) {
  const clipPath = shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : undefined;
  const borderRadius = shape === 'circle' ? '50%' : shape === 'square' ? '2px' : undefined;

  return (
    <div
      className="fixed top-0 pointer-events-none"
      style={{
        left: `${left}%`,
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        borderRadius,
        clipPath,
        animation: `confettiFall ${duration}s ease-in forwards`,
        animationDelay: `${delay}s`,
        transform: `rotate(${rotation}deg)`,
        zIndex: 50,
      }}
    />
  );
}

// ─── Progress dots ────────────────────────────────────────────────────────────
function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-500 ${
            i === current
              ? 'w-7 h-2.5 bg-primary'
              : i < current
                ? 'w-2.5 h-2.5 bg-foreground/40'
                : 'w-2.5 h-2.5 bg-foreground/10'
          }`}
          style={i === current ? { boxShadow: '0 0 8px rgba(5,150,105,0.5)' } : {}}
        />
      ))}
    </div>
  );
}

// ─── Main OnboardingFlow ─────────────────────────────────────────────────────
export function OnboardingFlow({ user }: { user: OnboardingUser }) {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [username, setUsernameValue] = useState('');
  const [birthYear, setBirthYear] = useState<number>(new Date().getFullYear() - 25);
  const [loading, setLoading] = useState(false);
  const [yearBounce, setYearBounce] = useState<'minus' | 'plus' | null>(null);

  // Long-press refs
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const avatarUrl = user?.image;
  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ?? '?';

  const isUsernameValid = /^[a-z0-9-]{3,30}$/.test(username);
  const currentYear = new Date().getFullYear();

  async function handleFinish(skipBirthYear = false) {
    if (!isUsernameValid) return;
    setLoading(true);
    try {
      await setUsername(username, skipBirthYear ? undefined : birthYear);
      setStep(3);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  // Long-press handlers
  const startHold = useCallback(
    (dir: 'minus' | 'plus') => {
      const change = dir === 'minus' ? -1 : 1;
      holdTimerRef.current = setTimeout(() => {
        intervalRef.current = setInterval(() => {
          setBirthYear((y) => Math.min(currentYear, Math.max(1940, y + change)));
        }, 80);
      }, 400);
    },
    [currentYear]
  );

  const stopHold = useCallback(() => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  function triggerBounce(dir: 'minus' | 'plus') {
    setYearBounce(dir);
    setTimeout(() => setYearBounce(null), 350);
  }

  return (
    <>
      {/* ── Global animation styles ─────────────────────────────────── */}
      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(5,150,105,0.15), 0 0 0 8px rgba(5,150,105,0.06); }
          50%       { box-shadow: 0 0 0 7px rgba(5,150,105,0.28), 0 0 0 16px rgba(5,150,105,0.09); }
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(52px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(52px) rotate(-360deg); }
        }
        @keyframes arrowBounce {
          0%, 100% { transform: translateX(0); }
          50%       { transform: translateX(4px); }
        }
        @keyframes springBounce {
          0%   { transform: scale(0); opacity: 0; }
          50%  { transform: scale(1.3); opacity: 1; }
          70%  { transform: scale(0.9); }
          85%  { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0.5) translateX(-50%); }
          50%       { opacity: 1; transform: scale(1.2) translateX(-50%); }
        }
        @keyframes floatDrift {
          0%   { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.07; }
          25%  { transform: translateY(-15px) translateX(8px) rotate(3deg); opacity: 0.09; }
          50%  { transform: translateY(-8px) translateX(-5px) rotate(-2deg); opacity: 0.07; }
          75%  { transform: translateY(-20px) translateX(12px) rotate(5deg); opacity: 0.1; }
          100% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.07; }
        }
        @keyframes floatDrift2 {
          0%   { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.07; }
          30%  { transform: translateY(-22px) translateX(-10px) rotate(-4deg); opacity: 0.1; }
          60%  { transform: translateY(-10px) translateX(14px) rotate(2deg); opacity: 0.08; }
          100% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.07; }
        }
        @keyframes floatDrift3 {
          0%   { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.06; }
          20%  { transform: translateY(-12px) translateX(6px) rotate(6deg); opacity: 0.09; }
          40%  { transform: translateY(-25px) translateX(-8px) rotate(-3deg); opacity: 0.08; }
          70%  { transform: translateY(-8px) translateX(10px) rotate(4deg); opacity: 0.1; }
          100% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.06; }
        }
        @keyframes tagRise {
          0%   { opacity: 0; transform: translateY(0px); }
          30%  { opacity: 1; }
          70%  { opacity: 1; }
          100% { opacity: 0; transform: translateY(-70px); }
        }
        @keyframes glowPulseBtn {
          0%, 100% { box-shadow: 0 4px 14px rgba(5,150,105,0.3); }
          50%       { box-shadow: 0 4px 28px rgba(5,150,105,0.6), 0 0 40px rgba(5,150,105,0.18); }
        }
        @keyframes shimmerText {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(40px, -30px) scale(1.05); }
          66%       { transform: translate(-25px, 20px) scale(0.97); }
        }
        @keyframes bounceClick {
          0%   { transform: scale(1); }
          30%  { transform: scale(0.88); }
          60%  { transform: scale(1.12); }
          80%  { transform: scale(0.96); }
          100% { transform: scale(1); }
        }
        @keyframes yearGlow {
          0%, 100% { text-shadow: 0 0 20px rgba(5,150,105,0.2); }
          50%       { text-shadow: 0 0 30px rgba(5,150,105,0.45), 0 0 60px rgba(5,150,105,0.15); }
        }
        @keyframes borderCycle {
          0%   { border-color: #059669; }
          25%  { border-color: #10b981; }
          50%  { border-color: #34d399; }
          75%  { border-color: #10b981; }
          100% { border-color: #059669; }
        }
        @keyframes starPop {
          0%   { opacity: 0; transform: scale(0) rotate(0deg); }
          40%  { opacity: 1; transform: scale(1.3) rotate(20deg); }
          70%  { opacity: 0.8; transform: scale(1) rotate(-10deg); }
          100% { opacity: 0; transform: scale(0) rotate(30deg); }
        }
        @keyframes checkBurst {
          0%   { transform: scale(0) translate(0, 0); opacity: 1; }
          100% { transform: scale(1) translate(var(--tx), var(--ty)); opacity: 0; }
        }
        @keyframes nameUnderline {
          0%   { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        .animate-slide-in-up {
          animation: slideInUp 0.45s cubic-bezier(0.16,1,0.3,1) both;
        }
        .avatar-glow {
          animation: glowPulse 2.5s ease-in-out infinite;
        }
        .arrow-bounce-span {
          display: inline-block;
          animation: arrowBounce 1.2s ease-in-out infinite;
        }
        .btn-glow-pulse {
          animation: glowPulseBtn 2s ease-in-out infinite;
        }
        .shimmer-text {
          background: linear-gradient(90deg, #059669 0%, #34d399 40%, #059669 60%, #10b981 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmerText 2.5s linear infinite;
        }
        .year-glow {
          animation: yearGlow 2s ease-in-out infinite;
        }
        .year-bounce {
          animation: bounceClick 0.35s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        }
        .border-cycle {
          animation: borderCycle 3s linear infinite;
        }
      `}</style>

      {/* ── Full-screen warm cream background ───────────────────────── */}
      <div
        className="fixed inset-0"
        style={{
          background: 'linear-gradient(135deg, #FAFAFA 0%, #F5F5F4 50%, #FAFAF9 100%)',
        }}
      />

      {/* ── Subtle grain texture overlay ─────────────────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
          opacity: 0.4,
          zIndex: 0,
        }}
      />

      {/* ── Color orbs ───────────────────────────────────────────────── */}
      {COLOR_ORBS.map((orb, i) => (
        <div
          key={i}
          className="fixed pointer-events-none"
          style={{
            top: orb.top,
            left: orb.left,
            width: orb.size,
            height: orb.size,
            borderRadius: '50%',
            background: orb.color,
            filter: 'blur(80px)',
            opacity: 0.09,
            animation: `orbFloat ${18 + i * 4}s ease-in-out infinite`,
            animationDelay: orb.delay,
            transform: 'translate(-50%, -50%)',
            zIndex: 0,
          }}
        />
      ))}

      {/* ── Decorative background emojis ─────────────────────────────── */}
      {BG_EMOJIS.map(({ emoji, top, left, size, rotate, duration, delay, animKey }, i) => (
        <div
          key={i}
          className={`fixed pointer-events-none select-none ${size} ${
            MOBILE_VISIBLE_INDICES.has(i) ? 'opacity-100' : 'hidden sm:block'
          }`}
          style={{
            top,
            left,
            transform: `rotate(${rotate})`,
            animation: `${animKey} ${duration} ${delay} ease-in-out infinite`,
            zIndex: 0,
          }}
        >
          {emoji}
        </div>
      ))}

      {/* ── Confetti on step 3 ────────────────────────────────────────── */}
      {step === 3 && CONFETTI_PIECES.map((piece, i) => <ConfettiPiece key={i} {...piece} />)}

      {/* ── Center the card ──────────────────────────────────────────── */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div key={step} className="animate-slide-in-up w-full max-w-md">
          <div
            className="rounded-3xl sm:rounded-[28px] bg-card px-5 py-8 sm:px-8 sm:py-10"
            style={{
              boxShadow:
                '0 20px 60px rgba(251,191,36,0.12), 0 8px 24px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            {/* ══ Step 0: Welcome ═══════════════════════════════════════ */}
            {step === 0 && (
              <div className="flex flex-col items-center text-center">
                {/* Sparkle particles above avatar */}
                <div className="relative mb-1" style={{ height: '20px', width: '120px' }}>
                  {SPARKLES.map((sp, i) => (
                    <span
                      key={i}
                      className="absolute text-amber-300 font-bold text-sm"
                      style={{
                        top: sp.top,
                        left: sp.left,
                        animation: `sparkle ${sp.duration} ${sp.delay} ease-in-out infinite`,
                        transform: 'translateX(-50%)',
                      }}
                    >
                      ✦
                    </span>
                  ))}
                </div>

                {/* Avatar with orbit ring */}
                <div
                  className="relative mb-6 flex items-center justify-center"
                  style={{ width: '120px', height: '120px' }}
                >
                  {/* Orbit emojis — hidden on xs */}
                  {ORBIT_EMOJIS.map((em, i) => (
                    <span
                      key={i}
                      className="absolute text-base hidden sm:block"
                      style={{
                        top: '50%',
                        left: '50%',
                        marginTop: '-10px',
                        marginLeft: '-10px',
                        animation: `orbit ${7 + i * 1.2}s linear infinite`,
                        animationDelay: `${i * -(7 / ORBIT_EMOJIS.length)}s`,
                      }}
                    >
                      {em}
                    </span>
                  ))}

                  {/* Avatar image or initials */}
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={user?.name ?? 'Avatar'}
                      className="avatar-glow h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover relative z-10"
                    />
                  ) : (
                    <div
                      className="avatar-glow flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full text-xl sm:text-2xl font-bold text-foreground relative z-10"
                      style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}
                    >
                      {initials}
                    </div>
                  )}
                </div>

                {/* Name with animated underline */}
                <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#1C1917' }}>
                  Hey,{' '}
                  <span className="relative inline-block">
                    {firstName}!
                    <span
                      className="absolute left-0 right-0 bottom-0 h-0.5 rounded-full bg-foreground"
                      style={{
                        animation: 'nameUnderline 0.6s 0.4s cubic-bezier(0.16,1,0.3,1) both',
                        transformOrigin: 'left center',
                      }}
                    />
                  </span>{' '}
                  👋
                </h1>
                <p className="mt-2 text-lg sm:text-xl font-semibold" style={{ color: '#1C1917' }}>
                  Your hobby journey starts here.
                </p>
                <p className="mt-4 text-sm leading-relaxed" style={{ color: '#78716C' }}>
                  Map the hobbies that shaped who you are, discover patterns, and find what to
                  explore next.
                </p>

                {/* CTA button */}
                <button
                  onClick={() => setStep(1)}
                  className="mt-8 w-full rounded-2xl py-3.5 text-base font-semibold text-foreground transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    animation: 'glowPulseBtn 2.5s ease-in-out infinite',
                  }}
                >
                  Let&apos;s begin <span className="arrow-bounce-span">→</span>
                </button>

                {/* Floating hobby tag pills */}
                <div className="relative mt-5 h-12 w-full overflow-hidden">
                  <div className="flex items-center justify-center gap-3">
                    {WELCOME_TAGS.map(({ label, delay }) => (
                      <span
                        key={label}
                        className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                        style={{
                          background: 'rgba(5,150,105,0.08)',
                          color: '#059669',
                          border: '1px solid rgba(5,150,105,0.15)',
                          animation: `tagRise 2.8s ${delay} ease-in-out infinite`,
                        }}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══ Step 1: Username ══════════════════════════════════════ */}
            {step === 1 && (
              <div>
                <ProgressDots current={0} total={2} />

                <div className="mb-8 text-center">
                  <div
                    className="mb-3 text-4xl"
                    style={{ animation: 'springBounce 0.6s 0.1s both' }}
                  >
                    ✨
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: '#1C1917' }}>
                    Claim your space
                  </h2>
                  <p className="mt-2 text-sm" style={{ color: '#78716C' }}>
                    Your profile lives at a unique URL, just for you.
                  </p>
                </div>

                {/* Username input */}
                <div className="mb-3 relative">
                  <div
                    className={`flex items-center rounded-2xl border-2 bg-card px-4 py-1 transition-all duration-300 focus-within:shadow-md ${
                      isUsernameValid ? 'border-cycle' : ''
                    }`}
                    style={{
                      borderColor: isUsernameValid
                        ? '#059669'
                        : username.length > 0
                          ? '#E7E5E4'
                          : '#E7E5E4',
                      boxShadow: isUsernameValid ? '0 0 0 4px rgba(5,150,105,0.12)' : undefined,
                    }}
                  >
                    <span
                      className="select-none text-base font-medium pr-0.5"
                      style={{ color: '#A8A29E' }}
                    >
                      @
                    </span>
                    <input
                      value={username}
                      onChange={(e) =>
                        setUsernameValue(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                      }
                      placeholder="yourname"
                      maxLength={30}
                      className="flex-1 bg-transparent py-3 text-base outline-none placeholder:text-muted-foreground/40"
                      style={{ color: '#1C1917' }}
                      autoFocus
                      autoComplete="off"
                      autoCapitalize="none"
                      spellCheck={false}
                    />
                    {isUsernameValid && (
                      <div className="relative flex items-center justify-center">
                        <span className="text-foreground text-lg font-bold">✓</span>
                        {/* Burst dots */}
                        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                          <div
                            key={i}
                            className="absolute rounded-full"
                            style={
                              {
                                width: '5px',
                                height: '5px',
                                background: [
                                  '#059669',
                                  '#34d399',
                                  '#fbbf24',
                                  '#f472b6',
                                  '#60a5fa',
                                  '#a78bfa',
                                ][i],
                                '--tx': `${Math.cos((angle * Math.PI) / 180) * 14}px`,
                                '--ty': `${Math.sin((angle * Math.PI) / 180) * 14}px`,
                                animation: 'checkBurst 0.5s ease-out forwards',
                              } as React.CSSProperties
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Validation message */}
                  {username.length > 0 && !isUsernameValid && (
                    <p className="mt-1.5 text-xs" style={{ color: '#EF4444' }}>
                      {username.length < 3
                        ? 'At least 3 characters required'
                        : 'Lowercase letters, numbers, and hyphens only'}
                    </p>
                  )}
                  {username.length === 0 && (
                    <p className="mt-1.5 text-xs" style={{ color: '#A8A29E' }}>
                      Lowercase letters, numbers, and hyphens only
                    </p>
                  )}
                </div>

                {/* Browser address bar mockup */}
                <div
                  className="mb-8 flex items-center gap-2 rounded-xl px-3 py-2.5"
                  style={{
                    background: '#F5F5F4',
                    border: '1px solid #E7E5E4',
                  }}
                >
                  {/* Lock icon */}
                  <svg
                    width="11"
                    height="13"
                    viewBox="0 0 11 13"
                    fill="none"
                    className="flex-shrink-0"
                  >
                    <rect
                      x="1"
                      y="5.5"
                      width="9"
                      height="7"
                      rx="1.5"
                      stroke="#A8A29E"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M3 5.5V3.5a2.5 2.5 0 015 0v2"
                      stroke="#A8A29E"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Green secure dot */}
                  <div className="h-1.5 w-1.5 rounded-full bg-foreground flex-shrink-0" />
                  <span className="text-xs truncate" style={{ color: '#A8A29E' }}>
                    significanthobbies.com/u/
                  </span>
                  <span
                    className={`text-xs font-semibold transition-colors duration-200 flex-shrink-0 ${
                      isUsernameValid ? 'shimmer-text' : ''
                    }`}
                    style={
                      isUsernameValid ? {} : { color: username.length > 0 ? '#1C1917' : '#C7C3BF' }
                    }
                  >
                    {username.length > 0 ? username : 'yourname'}
                  </span>
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!isUsernameValid}
                  className="w-full rounded-2xl py-3.5 text-base font-semibold text-foreground transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                  style={{
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    boxShadow: isUsernameValid ? '0 4px 14px rgba(5,150,105,0.35)' : undefined,
                    animation: isUsernameValid ? 'glowPulseBtn 2s ease-in-out infinite' : undefined,
                  }}
                >
                  Continue →
                </button>
              </div>
            )}

            {/* ══ Step 2: Birth Year ════════════════════════════════════ */}
            {step === 2 && (
              <div>
                <ProgressDots current={1} total={2} />

                <div className="mb-6 text-center">
                  <div
                    className="mb-3 text-4xl"
                    style={{ animation: 'springBounce 0.6s 0.1s both' }}
                  >
                    🎂
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: '#1C1917' }}>
                    When were you born?
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: '#78716C' }}>
                    We&apos;ll automatically calculate each life phase — so you don&apos;t have to.
                  </p>
                </div>

                {/* Big year display with glow */}
                <div className="mb-2 text-center">
                  <span
                    className={`text-5xl sm:text-6xl font-black tracking-tight year-glow ${
                      yearBounce ? 'year-bounce' : ''
                    }`}
                    style={{ color: '#059669' }}
                  >
                    {birthYear}
                  </span>
                </div>

                {/* Year stepper */}
                <div className="mb-4 flex items-center justify-center gap-5">
                  {/* Minus */}
                  <button
                    onClick={() => {
                      setBirthYear((y) => Math.max(1940, y - 1));
                      triggerBounce('minus');
                    }}
                    onMouseDown={() => startHold('minus')}
                    onMouseUp={stopHold}
                    onMouseLeave={stopHold}
                    onTouchStart={() => startHold('minus')}
                    onTouchEnd={stopHold}
                    className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border text-2xl font-bold transition-all duration-150 hover:scale-110 hover:shadow-md active:scale-90 select-none"
                    style={{
                      borderColor: '#E7E5E4',
                      color: '#78716C',
                      background: '#FAFAF9',
                      touchAction: 'none',
                    }}
                  >
                    −
                  </button>

                  {/* Hidden number input for manual entry */}
                  <input
                    type="number"
                    value={birthYear}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!Number.isNaN(val) && val >= 1940 && val <= currentYear) {
                        setBirthYear(val);
                      }
                    }}
                    min={1940}
                    max={currentYear}
                    className="w-0 h-0 opacity-0 absolute pointer-events-none"
                    tabIndex={-1}
                    aria-hidden="true"
                  />

                  {/* Plus */}
                  <button
                    onClick={() => {
                      setBirthYear((y) => Math.min(currentYear, y + 1));
                      triggerBounce('plus');
                    }}
                    onMouseDown={() => startHold('plus')}
                    onMouseUp={stopHold}
                    onMouseLeave={stopHold}
                    onTouchStart={() => startHold('plus')}
                    onTouchEnd={stopHold}
                    className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border text-2xl font-bold transition-all duration-150 hover:scale-110 hover:shadow-md active:scale-90 select-none"
                    style={{
                      borderColor: '#E7E5E4',
                      color: '#78716C',
                      background: '#FAFAF9',
                      touchAction: 'none',
                    }}
                  >
                    +
                  </button>
                </div>

                {/* Age display + fun fact */}
                <div className="mb-3 text-center">
                  <p className="text-sm" style={{ color: '#A8A29E' }}>
                    That makes you{' '}
                    <span className="font-semibold" style={{ color: '#059669' }}>
                      {currentYear - birthYear} years old
                    </span>
                  </p>
                  <p className="mt-1 text-xs font-medium" style={{ color: '#78716C' }}>
                    {getAgeFact(birthYear)}
                  </p>
                </div>

                {/* Decade timeline visualization */}
                <DecadeDots birthYear={birthYear} />

                <div className="mt-8">
                  <button
                    onClick={() => handleFinish(false)}
                    disabled={loading}
                    className="w-full rounded-2xl py-3.5 text-base font-semibold text-foreground transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
                    style={{
                      background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                      boxShadow: '0 4px 14px rgba(5,150,105,0.35)',
                      animation: loading ? undefined : 'glowPulseBtn 2s ease-in-out infinite',
                    }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Setting up...
                      </span>
                    ) : (
                      'Finish setup →'
                    )}
                  </button>

                  <button
                    onClick={() => handleFinish(true)}
                    disabled={loading}
                    className="mt-3 w-full rounded-2xl py-2.5 text-sm font-medium transition-colors duration-200 hover:underline disabled:opacity-50"
                    style={{ color: '#A8A29E' }}
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            )}

            {/* ══ Step 3: Done! ════════════════════════════════════════ */}
            {step === 3 && (
              <div className="flex flex-col items-center text-center">
                {/* Big celebration emoji with spring bounce */}
                <div className="relative mb-2">
                  <span
                    className="text-6xl sm:text-7xl block"
                    style={{ animation: 'springBounce 0.7s 0.1s both' }}
                  >
                    🎉
                  </span>
                  {/* Animated stars around emoji */}
                  {['✦', '⋆', '✦', '⋆', '✦'].map((star, i) => (
                    <span
                      key={i}
                      className="absolute text-amber-300 font-bold"
                      style={{
                        fontSize: `${10 + (i % 3) * 4}px`,
                        top: `${-10 + Math.sin((i * 72 * Math.PI) / 180) * 36}px`,
                        left: `${50 + Math.cos((i * 72 * Math.PI) / 180) * 36}%`,
                        transform: 'translateX(-50%)',
                        animation: `starPop 1.5s ${0.15 + i * 0.18}s ease-out both`,
                      }}
                    >
                      {star}
                    </span>
                  ))}
                </div>

                <h2
                  className="mt-4 text-2xl sm:text-3xl font-bold"
                  style={{ color: '#1C1917', animation: 'slideInUp 0.4s 0.3s both' }}
                >
                  You&apos;re all set, <span className="shimmer-text">@{username}</span>!
                </h2>
                <p
                  className="mt-3 text-sm leading-relaxed"
                  style={{ color: '#78716C', animation: 'slideInUp 0.4s 0.45s both' }}
                >
                  Your profile is ready. Time to map your hobby journey.
                </p>

                <div
                  className="mt-8 flex w-full flex-col gap-3"
                  style={{ animation: 'slideInUp 0.4s 0.55s both' }}
                >
                  <Link
                    href="/timeline/new"
                    className="block w-full rounded-2xl py-3.5 text-center text-base font-semibold text-foreground transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                      animation: 'glowPulseBtn 2s ease-in-out infinite',
                    }}
                  >
                    Build my first timeline →
                  </Link>

                  <Link
                    href={`/u/${username}`}
                    className="block w-full rounded-2xl border py-3.5 text-center text-base font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-sm active:scale-[0.98]"
                    style={{
                      borderColor: '#E7E5E4',
                      color: '#78716C',
                      background: '#FAFAF9',
                    }}
                  >
                    View my profile
                  </Link>
                </div>

                {/* Bonus trophy decoration */}
                <div
                  className="mt-6 flex flex-col items-center gap-1"
                  style={{ animation: 'slideInUp 0.4s 0.8s both' }}
                >
                  <span className="text-3xl" style={{ animation: 'springBounce 0.7s 1s both' }}>
                    🏆
                  </span>
                  <span className="text-xs font-medium" style={{ color: '#C7C3BF' }}>
                    First profile unlocked
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
