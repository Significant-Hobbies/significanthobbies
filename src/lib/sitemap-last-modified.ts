const EPOCH_MILLISECONDS_THRESHOLD = 10_000_000_000;

export function sitemapLastModified(value: unknown, fallback: Date): Date {
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value : fallback;
  }

  if (typeof value === 'number') {
    return numericDate(value, fallback);
  }

  if (typeof value !== 'string' || value.trim() === '') return fallback;
  const numeric = Number(value);
  if (Number.isFinite(numeric)) return numericDate(numeric, fallback);

  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed : fallback;
}

function numericDate(value: number, fallback: Date): Date {
  if (!Number.isFinite(value)) return fallback;
  const milliseconds = Math.abs(value) < EPOCH_MILLISECONDS_THRESHOLD ? value * 1000 : value;
  const parsed = new Date(milliseconds);
  return Number.isFinite(parsed.getTime()) ? parsed : fallback;
}
