export interface JournalContent {
  amEntry: string | null;
  pmEntry: string | null;
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function buildJournalDateWindow(today: string, length = 21): string[] {
  if (!ISO_DATE_PATTERN.test(today)) {
    throw new Error('today must use YYYY-MM-DD format');
  }
  if (!Number.isInteger(length) || length < 1) {
    throw new Error('length must be a positive integer');
  }

  const end = new Date(`${today}T00:00:00.000Z`);
  if (Number.isNaN(end.getTime()) || end.toISOString().slice(0, 10) !== today) {
    throw new Error('today must be a valid calendar date');
  }

  return Array.from({ length }, (_, index) => {
    const date = new Date(end);
    date.setUTCDate(end.getUTCDate() - (length - index - 1));
    return date.toISOString().slice(0, 10);
  });
}

export function hasJournalContent(entry: JournalContent | null | undefined): boolean {
  return Boolean(entry?.amEntry?.trim() || entry?.pmEntry?.trim());
}
