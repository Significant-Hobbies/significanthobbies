'use client';

import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { BorderBeam, FadeIn, GradientMesh, SpotlightCard } from '~/components/aceternity';
import { AmbientMusic } from '~/components/ambient-music';
import { Whale } from '~/components/whale';
import { createHabit, toggleHabitLog } from '~/lib/actions/daily';
import { saveOnboardingAnswers, setUsername } from '~/lib/actions/user';

type OnboardingUser = {
  name?: string | null;
  image?: string | null;
};

type LastFinished = 'recently' | 'months_ago' | 'cant_remember' | 'doesnt_matter';
type NextYearFeeling = 'excited' | 'neutral' | 'dread' | 'blank';

const TOTAL_STEPS = 7; // steps 0..6 (welcome is 0, done is 6)

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

// ─── Option card for single-select questions ─────────────────────────────────
function OptionCard({
  emoji,
  label,
  selected,
  onClick,
}: {
  emoji: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-xl border bg-card px-5 py-4 text-left transition-all duration-200 hover:border-primary/60 active:scale-[0.99] ${
        selected ? 'border-primary shadow-soft' : 'border-border'
      }`}
    >
      <span className="text-2xl" aria-hidden="true">
        {emoji}
      </span>
      <span className="flex-1 text-base font-medium text-foreground">{label}</span>
      {selected && (
        <span className="text-lg font-bold text-primary" aria-hidden="true">
          ✓
        </span>
      )}
    </button>
  );
}

// ─── Main OnboardingFlow ─────────────────────────────────────────────────────
export function OnboardingFlow({ user }: { user: OnboardingUser }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [username, setUsernameValue] = useState('');
  const [birthYear, setBirthYear] = useState<number>(new Date().getFullYear() - 25);
  const [loading, setLoading] = useState(false);
  const [pending, startTransition] = useTransition();

  // Diagnostic answers
  const [droppedHobby, setDroppedHobby] = useState('');
  const [lastFinished, setLastFinished] = useState<LastFinished | null>(null);
  const [nextYearFeeling, setNextYearFeeling] = useState<NextYearFeeling | null>(null);

  // First-kick state
  const [habitId, setHabitId] = useState<string | null>(null);
  const [habitName, setHabitName] = useState<string>('');
  const [habitChecked, setHabitChecked] = useState(false);

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

  async function handleUsernameAndYear(skipBirthYear = false) {
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

  // Step 6: create the habit, then save onboarding answers.
  async function handleFirstKickSetup() {
    const name = droppedHobby.trim() ? droppedHobby.trim() : 'Show up today';
    setLoading(true);
    try {
      const habit = await createHabit(name, 'daily');
      if (!habit) {
        toast.error('Could not create your habit. Try again.');
        return;
      }
      setHabitId(habit.id);
      setHabitName(habit.name);
      // Save diagnostic answers in parallel-ish (after habit so we don't block UI).
      startTransition(async () => {
        await saveOnboardingAnswers({
          droppedHobby: droppedHobby.trim() || undefined,
          lastFinished: lastFinished ?? undefined,
          nextYearFeeling: nextYearFeeling ?? undefined,
        });
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckHabit(checked: boolean) {
    if (!habitId) return;
    const today = new Date().toISOString().slice(0, 10);
    setHabitChecked(checked);
    startTransition(async () => {
      try {
        await toggleHabitLog(habitId, today, checked);
      } catch {
        // Revert on failure
        setHabitChecked(!checked);
        toast.error('Could not save check-in.');
      }
    });
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

  // Steps that should show the gradient mesh (emotionally important moments).
  const showMesh = step === 0 || step === 5;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {showMesh && <GradientMesh />}

      {/* Ambient music toggle — top right corner */}
      <div className="fixed right-4 top-4 z-50">
        <AmbientMusic />
      </div>

      <FadeIn key={step} className="relative w-full max-w-lg">
        <SpotlightCard className="shadow-soft" innerClassName="px-5 py-8 sm:px-8 sm:py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* ══ Step 0: Welcome ═══════════════════════════════════════ */}
              {step === 0 && (
                <div className="flex flex-col items-center text-center">
                  {/* Whale mascot — floating gently */}
                  <div className="mb-4">
                    <Whale size={72} float glow />
                  </div>
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

                  <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                    Hey, {firstName}!
                  </h1>
                  <p className="mt-2 text-lg font-semibold text-foreground sm:text-xl">
                    Your hobby journey starts here.
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    This takes 2 minutes. It will set up your first habit and detect where you are
                    right now.
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
                  <ProgressDots current={0} total={TOTAL_STEPS - 1} />

                  <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                      Claim your space
                    </h2>
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
                  <ProgressDots current={1} total={TOTAL_STEPS - 1} />

                  <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                      When were you born?
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      We&apos;ll automatically calculate each life phase — so you don&apos;t have
                      to.
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
                      onClick={() => handleUsernameAndYear(false)}
                      disabled={loading}
                      className="w-full rounded-xl bg-primary py-3.5 text-base font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                          Setting up...
                        </span>
                      ) : (
                        'Continue →'
                      )}
                    </button>

                    <button
                      onClick={() => handleUsernameAndYear(true)}
                      disabled={loading}
                      className="mt-3 w-full rounded-xl py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground disabled:opacity-50"
                    >
                      Skip for now
                    </button>
                  </div>
                </div>
              )}

              {/* ══ Step 3: Dropped hobby ══════════════════════════════════ */}
              {step === 3 && (
                <div>
                  <ProgressDots current={2} total={TOTAL_STEPS - 1} />

                  <div className="mb-6 text-center">
                    <h2
                      className="text-2xl font-bold text-foreground sm:text-3xl"
                      style={{ fontFamily: 'var(--font-serif), serif' }}
                    >
                      What&apos;s something you used to do that you stopped?
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      This isn&apos;t nostalgia. This is the first thing you&apos;re going to pick
                      back up.
                    </p>
                  </div>

                  <div className="mb-3">
                    <input
                      value={droppedHobby}
                      onChange={(e) => setDroppedHobby(e.target.value.slice(0, 200))}
                      placeholder="Photography, guitar, running, drawing..."
                      maxLength={200}
                      className="w-full rounded-xl border border-border bg-card px-4 py-3.5 text-base text-foreground outline-none transition-colors duration-200 placeholder:text-muted-foreground/40 focus:border-primary"
                      autoFocus
                      autoComplete="off"
                      spellCheck={false}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && droppedHobby.trim()) setStep(4);
                      }}
                    />
                  </div>

                  <button
                    onClick={() => setStep(4)}
                    disabled={!droppedHobby.trim()}
                    className="w-full rounded-xl bg-primary py-3.5 text-base font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Continue →
                  </button>

                  <button
                    onClick={() => {
                      setDroppedHobby('');
                      setStep(4);
                    }}
                    className="mt-3 w-full rounded-xl py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    Skip — I&apos;ll think of one later
                  </button>
                </div>
              )}

              {/* ══ Step 4: Last finished (agency detection) ════════════════ */}
              {step === 4 && (
                <div>
                  <ProgressDots current={3} total={TOTAL_STEPS - 1} />

                  <div className="mb-6 text-center">
                    <h2
                      className="text-2xl font-bold text-foreground sm:text-3xl"
                      style={{ fontFamily: 'var(--font-serif), serif' }}
                    >
                      When was the last time you finished something you started?
                    </h2>
                  </div>

                  <div className="flex flex-col gap-3">
                    <OptionCard
                      emoji="✅"
                      label="Recently — within the last month"
                      selected={lastFinished === 'recently'}
                      onClick={() => {
                        setLastFinished('recently');
                        setStep(5);
                      }}
                    />
                    <OptionCard
                      emoji="🕐"
                      label="A few months ago"
                      selected={lastFinished === 'months_ago'}
                      onClick={() => {
                        setLastFinished('months_ago');
                        setStep(5);
                      }}
                    />
                    <OptionCard
                      emoji="🌫️"
                      label="I can't remember"
                      selected={lastFinished === 'cant_remember'}
                      onClick={() => {
                        setLastFinished('cant_remember');
                        setStep(5);
                      }}
                    />
                    <OptionCard
                      emoji="❓"
                      label="Does finishing even matter?"
                      selected={lastFinished === 'doesnt_matter'}
                      onClick={() => {
                        setLastFinished('doesnt_matter');
                        setStep(5);
                      }}
                    />
                  </div>
                </div>
              )}

              {/* ══ Step 5: Next year feeling (doom detection) ═════════════ */}
              {step === 5 && (
                <div>
                  <ProgressDots current={4} total={TOTAL_STEPS - 1} />

                  <div className="mb-6 text-center">
                    <h2
                      className="text-2xl font-bold text-foreground sm:text-3xl"
                      style={{ fontFamily: 'var(--font-serif), serif' }}
                    >
                      When you think about the next year, how do you feel?
                    </h2>
                  </div>

                  <div className="flex flex-col gap-3">
                    <OptionCard
                      emoji="🔥"
                      label="Excited — there's things I want to do"
                      selected={nextYearFeeling === 'excited'}
                      onClick={() => {
                        setNextYearFeeling('excited');
                        setStep(6);
                      }}
                    />
                    <OptionCard
                      emoji="😐"
                      label="Neutral — it'll be what it'll be"
                      selected={nextYearFeeling === 'neutral'}
                      onClick={() => {
                        setNextYearFeeling('neutral');
                        setStep(6);
                      }}
                    />
                    <OptionCard
                      emoji="🌧️"
                      label="Dread — I know how it'll go"
                      selected={nextYearFeeling === 'dread'}
                      onClick={() => {
                        setNextYearFeeling('dread');
                        setStep(6);
                      }}
                    />
                    <OptionCard
                      emoji="⬜"
                      label="Blank — I don't feel anything about it"
                      selected={nextYearFeeling === 'blank'}
                      onClick={() => {
                        setNextYearFeeling('blank');
                        setStep(6);
                      }}
                    />
                  </div>
                </div>
              )}

              {/* ══ Step 6: First kick ══════════════════════════════════════ */}
              {step === 6 && (
                <div className="flex flex-col items-center text-center">
                  {/* Whale — watching calmly */}
                  <div className="mb-4">
                    <Whale size={64} float glow />
                  </div>
                  <ProgressDots current={5} total={TOTAL_STEPS - 1} />

                  {!habitId ? (
                    <>
                      <h2
                        className="text-2xl font-bold text-foreground sm:text-3xl"
                        style={{ fontFamily: 'var(--font-serif), serif' }}
                      >
                        Your first kick.
                      </h2>
                      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                        {droppedHobby.trim()
                          ? `We made a habit from your answer: "${droppedHobby.trim()}". Check it. Watch the grid light up.`
                          : 'We made a habit for you: "Show up today." Check it.'}
                      </p>

                      <button
                        onClick={handleFirstKickSetup}
                        disabled={loading}
                        className="mt-8 w-full rounded-xl bg-primary py-3.5 text-base font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                            Setting up your habit...
                          </span>
                        ) : (
                          'Reveal my habit →'
                        )}
                      </button>
                    </>
                  ) : (
                    <>
                      <h2
                        className="text-2xl font-bold text-foreground sm:text-3xl"
                        style={{ fontFamily: 'var(--font-serif), serif' }}
                      >
                        Check the box.
                      </h2>
                      <p className="mt-3 text-sm text-muted-foreground">
                        Your habit:{' '}
                        <span className="font-semibold text-foreground">{habitName}</span>
                      </p>

                      {/* The satisfying checkbox + visual feedback */}
                      <div className="relative mt-8 flex items-center justify-center">
                        {/* Gold pulse ring */}
                        <AnimatePresence>
                          {habitChecked && (
                            <motion.span
                              initial={{ scale: 0.6, opacity: 0.7 }}
                              animate={{ scale: 2.4, opacity: 0 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.9, ease: 'easeOut' }}
                              className="pointer-events-none absolute h-24 w-24 rounded-full"
                              style={{
                                background:
                                  'radial-gradient(circle, oklch(0.82 0.13 88 / 0.5), transparent 70%)',
                              }}
                              aria-hidden="true"
                            />
                          )}
                        </AnimatePresence>

                        <button
                          onClick={() => handleCheckHabit(!habitChecked)}
                          disabled={pending}
                          aria-pressed={habitChecked}
                          className={`relative flex h-24 w-24 items-center justify-center rounded-2xl border-2 transition-all duration-200 active:scale-95 ${
                            habitChecked
                              ? 'border-primary bg-primary/10'
                              : 'border-border bg-card hover:border-primary/50'
                          }`}
                        >
                          <motion.span
                            initial={false}
                            animate={{ scale: habitChecked ? 1 : 0, opacity: habitChecked ? 1 : 0 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                            className="text-5xl"
                            style={{ color: 'oklch(0.82 0.13 88)' }}
                            aria-hidden="true"
                          >
                            ✓
                          </motion.span>
                        </button>
                      </div>

                      {/* Mini life-grid square lighting up */}
                      <div className="mt-6 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground/60">Today:</span>
                        <motion.div
                          initial={false}
                          animate={{
                            backgroundColor: habitChecked
                              ? 'oklch(0.82 0.13 88)'
                              : 'oklch(0.3 0.02 60 / 0.4)',
                            scale: habitChecked ? [1, 1.18, 1] : 1,
                          }}
                          transition={{ duration: 0.4 }}
                          className="h-5 w-5 rounded-sm"
                        />
                      </div>

                      {habitChecked && (
                        <motion.p
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="mt-6 text-sm leading-relaxed text-muted-foreground"
                        >
                          That&apos;s it. You did something. The world changed. Come back tomorrow
                          and do it again.
                        </motion.p>
                      )}

                      <button
                        onClick={() => setStep(7)}
                        className="mt-8 w-full rounded-xl bg-primary py-3.5 text-base font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                      >
                        Continue →
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* ══ Step 7: Done ═══════════════════════════════════════════ */}
              {step === 7 && (
                <div className="relative flex flex-col items-center text-center">
                  <BorderBeam size={160} duration={10} />
                  <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-growth-soft">
                    <span className="text-2xl text-growth" aria-hidden="true">
                      ✓
                    </span>
                  </div>

                  <h2
                    className="mt-4 text-3xl font-bold text-foreground sm:text-4xl"
                    style={{ fontFamily: 'var(--font-serif), serif' }}
                  >
                    You&apos;re set up.
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    You have one habit. One square lit up. That&apos;s the beginning.
                  </p>

                  <button
                    onClick={() => router.push('/dashboard')}
                    className="mt-8 w-full rounded-xl bg-primary py-3.5 text-base font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                  >
                    Go to dashboard →
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </SpotlightCard>
      </FadeIn>
    </div>
  );
}
