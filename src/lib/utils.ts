import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parse a JSON text column expected to hold a string[].
 * Tolerates corrupt/non-array data instead of throwing, so one bad row
 * can't permanently 500 every action that reads it.
 */
export function parseStringArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * Parse a JSON text column with a typed fallback. Logs parse failures with
 * context so corrupt data is visible in observability instead of silently
 * producing an empty array — the user's data doesn't vanish without a trace.
 */
export function parseJSONColumn<T>(
  raw: string | null | undefined,
  fallback: T,
  context = 'unknown'
): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`[parseJSONColumn] ${context}: failed to parse JSON column`, err);
    return fallback;
  }
}
