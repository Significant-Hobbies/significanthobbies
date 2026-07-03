'use client';

import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

import { BorderBeam, FadeIn, GradientMesh, SpotlightCard } from '~/components/aceternity';
import { setUsername } from '~/lib/actions/user';

type OnboardingUser = {
  name?: string | null;
  image?: string | null;
};

// ─── Age fun facts ───────────────────────────────────────────────────────────
function getAgeFact(birthYear: number): string {
  const age = new Date().getFullYear() - birthYear;
  if (birthYear === 1991) return 'Same year as the World Wide Web.';
  if (birthYear === 1969) return 'Year of the Moon landing.';
  if (birthYear === 1984) return 'Same year as the first Mac.';
  if (birthYear === 2000) return 'A true millennium kid.';
  if (birthYear === 1999) return 'Born at the turn of the millennium.';
  if (birthYear === 1989) return 'Same year as the fall of the Berlin Wall.';
  if (age <= 16) return 'Gen Alpha has arrived.';
  if (age <= 27) return 'Full-on Gen Z energy.';
  if (age <= 43) return 'Millennial, certified.';
  if (age <= 59) return 'Gen X — the cool ones.';
  if (age <= 75) return 'Baby Boomer with stories to tell.';
  return 'A lifetime of incredible hobbies.';
}

// ─── Progress dots ────────────────────────────────────────────────────────────
function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2.5 rounded-full transition-all duration-300 ${
            i === current
              ? 'w-7 bg-primary'
              : i < current
                ? 'w-2.5 bg-foreground/40'
                : 'w-2.5 bg-foreground/10'
          }`}
        />
      ))}
    </div>
  );
}

// ─── Main OnboardingFlow ─────────────────────────────────────────────────────
export function OnboardingFlow({ user }: { user: OnboardingUser }) {
  const [step, setStep] = useState(0);
  const [username, setUsernameValue] = useState('');
  const [birthYear, setBirthYear] = useState<number>(new Date().getFullYear() - 25);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <GradientMesh />
      <FadeIn key={step} className="relative w-full max-w-md">
        <SpotlightCard className="shadow-soft" innerClassName="px-5 py-8 sm:px-8 sm:py-10">
          {/* ══ Step 0: Welcome ═══════════════════════════════════════ */}
          {step === 0 && (
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="mb-6 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full sm:h-20 sm:w-20">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt={user?.name ?? 'Avatar'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary text-xl font-bold text-primary-foreground sm:text-2xl">
                    {initials}
                  </div>
                )}
              </div>

              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Hey, {firstName}!</h1>
              <p className="mt-2 text-lg font-semibold text-foreground sm:text-xl">
                Your hobby journey starts here.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Map the hobbies that shaped who you are, discover patterns, and find what to explore
                next.
              </p>

              {/* CTA button */}
              <button
                onClick={() => setStep(1)}
                className="mt-8 w-full rounded-xl bg-primary py-3.5 text-base font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              >
                Let&apos;s begin →
              </button>
            </div>
          )}

          {/* ══ Step 1: Username ══════════════════════════════════════ */}
          {step === 1 && (
            <div>
              <ProgressDots current={0} total={2} />

              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Claim your space</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your profile lives at a unique URL, just for you.
                </p>
              </div>

              {/* Username input */}
              <div className="mb-3">
                <div
                  className={`flex items-center rounded-xl border bg-card px-4 py-1 transition-colors duration-200 ${
                    isUsernameValid ? 'border-growth' : 'border-border'
                  }`}
                >
                  <span className="select-none pr-0.5 text-base font-medium text-muted-foreground/60">
                    @
                  </span>
                  <input
                    value={username}
                    onChange={(e) =>
                      setUsernameValue(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                    }
                    placeholder="yourname"
                    maxLength={30}
                    className="flex-1 bg-transparent py-3 text-base text-foreground outline-none placeholder:text-muted-foreground/40"
                    autoFocus
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                  />
                  {isUsernameValid && (
                    <span className="text-lg font-bold text-growth" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </div>

                {/* Validation message */}
                {username.length > 0 && !isUsernameValid && (
                  <p className="mt-1.5 text-xs text-destructive">
                    {username.length < 3
                      ? 'At least 3 characters required'
                      : 'Lowercase letters, numbers, and hyphens only'}
                  </p>
                )}
                {username.length === 0 && (
                  <p className="mt-1.5 text-xs text-muted-foreground/60">
                    Lowercase letters, numbers, and hyphens only
                  </p>
                )}
              </div>

              {/* Profile URL preview */}
              <div className="mb-8 flex items-center gap-2 rounded-xl border border-border bg-muted px-3 py-2.5">
                <span className="truncate text-xs text-muted-foreground/60">
                  significanthobbies.com/u/
                </span>
                <span
                  className={`flex-shrink-0 text-xs font-semibold transition-colors duration-200 ${
                    isUsernameValid
                      ? 'text-growth'
                      : username.length > 0
                        ? 'text-foreground'
                        : 'text-muted-foreground/40'
                  }`}
                >
                  {username.length > 0 ? username : 'yourname'}
                </span>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!isUsernameValid}
                className="w-full rounded-xl bg-primary py-3.5 text-base font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
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
                <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                  When were you born?
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  We&apos;ll automatically calculate each life phase — so you don&apos;t have to.
                </p>
              </div>

              {/* Big year display */}
              <div className="mb-2 text-center">
                <span className="text-5xl font-black tracking-tight text-growth sm:text-6xl">
                  {birthYear}
                </span>
              </div>

              {/* Year stepper */}
              <div className="mb-4 flex items-center justify-center gap-5">
                {/* Minus */}
                <button
                  onClick={() => {
                    setBirthYear((y) => Math.max(1940, y - 1));
                  }}
                  onMouseDown={() => startHold('minus')}
                  onMouseUp={stopHold}
                  onMouseLeave={stopHold}
                  onTouchStart={() => startHold('minus')}
                  onTouchEnd={stopHold}
                  className="flex h-12 w-12 touch-none select-none items-center justify-center rounded-xl border border-border bg-muted text-2xl font-bold text-muted-foreground transition-all duration-150 hover:opacity-80 active:scale-90 sm:h-14 sm:w-14"
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
                  className="pointer-events-none absolute h-0 w-0 opacity-0"
                  tabIndex={-1}
                  aria-hidden="true"
                />

                {/* Plus */}
                <button
                  onClick={() => {
                    setBirthYear((y) => Math.min(currentYear, y + 1));
                  }}
                  onMouseDown={() => startHold('plus')}
                  onMouseUp={stopHold}
                  onMouseLeave={stopHold}
                  onTouchStart={() => startHold('plus')}
                  onTouchEnd={stopHold}
                  className="flex h-12 w-12 touch-none select-none items-center justify-center rounded-xl border border-border bg-muted text-2xl font-bold text-muted-foreground transition-all duration-150 hover:opacity-80 active:scale-90 sm:h-14 sm:w-14"
                >
                  +
                </button>
              </div>

              {/* Age display + fun fact */}
              <div className="mb-3 text-center">
                <p className="text-sm text-muted-foreground/60">
                  That makes you{' '}
                  <span className="font-semibold text-growth">
                    {currentYear - birthYear} years old
                  </span>
                </p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  {getAgeFact(birthYear)}
                </p>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => handleFinish(false)}
                  disabled={loading}
                  className="w-full rounded-xl bg-primary py-3.5 text-base font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Setting up...
                    </span>
                  ) : (
                    'Finish setup →'
                  )}
                </button>

                <button
                  onClick={() => handleFinish(true)}
                  disabled={loading}
                  className="mt-3 w-full rounded-xl py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground disabled:opacity-50"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {/* ══ Step 3: Done! ════════════════════════════════════════ */}
          {step === 3 && (
            <div className="flex flex-col items-center text-center">
              <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-growth-soft">
                <span className="text-2xl text-growth" aria-hidden="true">
                  ✓
                </span>
              </div>

              <h2 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
                You&apos;re all set, <span className="text-primary">@{username}</span>!
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Your profile is ready. Time to map your hobby journey.
              </p>

              <div className="mt-8 flex w-full flex-col gap-3">
                <Link
                  href="/timeline/new"
                  className="block w-full rounded-xl bg-primary py-3.5 text-center text-base font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                >
                  Build my first timeline →
                </Link>

                <Link
                  href={`/u/${username}`}
                  className="block w-full rounded-xl border border-border bg-muted py-3.5 text-center text-base font-semibold text-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                >
                  View my profile
                </Link>
              </div>

              <p className="mt-6 text-xs font-medium text-muted-foreground/60">
                First profile unlocked
              </p>
            </div>
          )}
        </SpotlightCard>
      </FadeIn>
    </div>
  );
}
