export type JournalContextKind = 'timeline' | 'commitment';

export type JournalContextRef = {
  kind: JournalContextKind;
  id: string;
};

export type JournalContextChoice = JournalContextRef & {
  label: string;
  href: string;
};

export type JournalContextColumns = {
  timelineId: string | null;
  commitmentId: string | null;
};

const MAX_CONTEXT_ID_LENGTH = 128;

export function parseJournalContextValue(value: string): JournalContextRef | null {
  if (!value) return null;

  const separator = value.indexOf(':');
  const kind = value.slice(0, separator);
  const id = value.slice(separator + 1).trim();
  if (
    separator < 1 ||
    (kind !== 'timeline' && kind !== 'commitment') ||
    !id ||
    id.length > MAX_CONTEXT_ID_LENGTH
  ) {
    throw new Error('Invalid journal context');
  }

  return { kind, id };
}

export function journalContextValue(context: JournalContextRef | null): string {
  return context ? `${context.kind}:${context.id}` : '';
}

export function journalContextFromColumns(
  timelineId: string | null | undefined,
  commitmentId: string | null | undefined
): JournalContextRef | null {
  if (timelineId && commitmentId) {
    throw new Error('Journal entry has more than one context');
  }
  if (timelineId) return { kind: 'timeline', id: timelineId };
  if (commitmentId) return { kind: 'commitment', id: commitmentId };
  return null;
}

export function columnsForVerifiedJournalContext(
  requested: JournalContextRef | null,
  verified: JournalContextRef | null
): JournalContextColumns {
  if (!requested) {
    return { timelineId: null, commitmentId: null };
  }
  if (!verified || requested.kind !== verified.kind || requested.id !== verified.id) {
    throw new Error('Journal context not found');
  }

  return requested.kind === 'timeline'
    ? { timelineId: requested.id, commitmentId: null }
    : { timelineId: null, commitmentId: requested.id };
}
