'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { EmailCapture } from '~/components/email-capture';

type CheckState = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

const EXAMPLE_PROFILES = [
  { handle: 'stevejobs', display: 'significanthobbies.com/u/stevejobs' },
  { handle: 'alberteinstein', display: 'significanthobbies.com/u/alberteinstein' },
  { handle: 'richardfeynman', display: 'significanthobbies.com/u/richardfeynman' },
];

const BENEFITS = [
  {
    icon: '🔗',
    title: 'Shareable URL',
    desc: 'Your own significanthobbies.com/u/yourname',
  },
  {
    icon: '🎭',
    title: 'Hobby personality',
    desc: 'Discover your archetype',
  },
  {
    icon: '🗺️',
    title: 'Hobby timeline',
    desc: 'Map your journey across life phases',
  },
];

function validateUsername(value: string): string | null {
  if (value.length < 3) return 'At least 3 characters required';
  if (value.length > 20) return 'Maximum 20 characters';
  if (!/^[a-z0-9-]+$/.test(value)) return 'Only lowercase letters, numbers, and hyphens';
  return null;
}

export function GetStartedClient() {
  const [input, setInput] = useState('');
  const [state, setState] = useState<CheckState>('idle');
  const [validationError, setValidationError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setInput(raw);

    if (!raw) {
      setState('idle');
      setValidationError(null);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      return;
    }

    const err = validateUsername(raw);
    if (err) {
      setState('invalid');
      setValidationError(err);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      return;
    }

    setValidationError(null);
    setState('checking');

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/check-username?username=${encodeURIComponent(raw)}`);
        const data = (await res.json()) as { available: boolean; reason: string | null };
        if (data.available) {
          setState('available');
        } else if (data.reason === 'taken') {
          setState('taken');
        } else {
          setState('invalid');
          setValidationError('Invalid username');
        }
      } catch {
        setState('idle');
      }
    }, 500);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <main className="min-h-screen bg-stone-50">
      {/* Hero */}
      <section className="mx-auto max-w-2xl px-4 pt-20 pb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
          Get your hobby profile
        </h1>
        <p className="mt-4 text-lg text-stone-500">
          Choose a username and share your hobby journey with the world.
        </p>
      </section>

      {/* Username checker */}
      <section className="mx-auto max-w-xl px-4 pb-12">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          {/* Input row */}
          <div className="flex items-center overflow-hidden rounded-xl border border-stone-300 bg-stone-50 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
            <span className="select-none whitespace-nowrap px-4 py-4 text-base text-stone-400 font-medium">
              significanthobbies.com/u/
            </span>
            <input
              type="text"
              value={input}
              onChange={handleChange}
              placeholder="yourname"
              maxLength={20}
              autoFocus
              spellCheck={false}
              autoCapitalize="none"
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent py-4 pr-4 text-base font-semibold text-stone-900 placeholder-stone-300 outline-none"
            />
          </div>

          {/* Status feedback */}
          <div className="mt-4 min-h-[4rem]">
            {state === 'idle' && (
              <p className="text-sm text-stone-400">Start typing to check availability</p>
            )}

            {state === 'checking' && (
              <div className="flex items-center gap-2 text-sm text-stone-400">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Checking…
              </div>
            )}

            {state === 'available' && (
              <div>
                <div className="flex items-center gap-2 text-emerald-600">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-semibold">This username is yours for the taking!</span>
                </div>
                <Link
                  href={`/login?callbackUrl=/setup&username=${encodeURIComponent(input)}`}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                >
                  Sign up with Google
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </div>
            )}

            {state === 'taken' && (
              <div>
                <div className="flex items-center gap-2 text-red-500">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="font-semibold">Already taken</span>
                </div>
                <Link
                  href={`/u/${input}`}
                  className="mt-2 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 hover:underline transition-colors"
                >
                  See their profile →
                </Link>
              </div>
            )}

            {state === 'invalid' && validationError && (
              <div className="flex items-start gap-2 text-amber-600">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  />
                </svg>
                <span className="text-sm">{validationError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Example profiles */}
        <div className="mt-6">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-stone-400">
            Example profiles
          </p>
          <div className="flex flex-col gap-2">
            {EXAMPLE_PROFILES.map(({ handle, display }) => (
              <Link
                key={handle}
                href={`/u/${handle}`}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-500 hover:bg-stone-100 hover:text-emerald-700 transition-colors"
              >
                <span className="font-mono text-emerald-500">/u/</span>
                <span>{handle}</span>
                <span className="ml-auto text-xs text-stone-400">{display}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="mx-auto max-w-xl px-4 pb-12">
        <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-400">
          What you get with a profile
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {BENEFITS.map(({ icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="mb-2 text-2xl">{icon}</div>
              <p className="font-semibold text-stone-900 text-sm">{title}</p>
              <p className="mt-1 text-xs text-stone-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Email capture */}
      <section className="mx-auto max-w-xl px-4 pb-20">
        <div className="mt-12 rounded-xl border border-stone-200 bg-stone-50 p-6 text-center max-w-lg mx-auto">
          <p className="font-medium text-stone-800 mb-2">Not ready to sign up yet?</p>
          <p className="text-sm text-stone-500 mb-4">Get weekly hobby inspiration in your inbox.</p>
          <EmailCapture source="get-started" />
        </div>
      </section>
    </main>
  );
}
