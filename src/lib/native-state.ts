export const MAX_NATIVE_STATE_BYTES = 512 * 1024;

export type NativeStateEnvelope = {
  document: Record<string, unknown>;
  baseRevision: number | null;
};

export function parseNativeStateEnvelope(value: unknown): NativeStateEnvelope | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Record<string, unknown>;
  if (!candidate.document || typeof candidate.document !== 'object') return null;
  const document = candidate.document as Record<string, unknown>;
  if (document.schemaVersion !== 1) return null;
  const baseRevision = candidate.baseRevision;
  if (baseRevision !== null && (!Number.isSafeInteger(baseRevision) || Number(baseRevision) < 0)) {
    return null;
  }
  if (!Object.hasOwn(candidate, 'baseRevision')) return null;
  return { document, baseRevision: baseRevision as number | null };
}
