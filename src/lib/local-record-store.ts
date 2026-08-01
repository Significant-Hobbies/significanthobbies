export interface LocalEnvelope<T> {
  key: string;
  domain: string;
  schemaVersion: number;
  installationId: string;
  updatedAt: string;
  value: T;
}

export interface LocalRecordAdapter {
  get(key: string): Promise<unknown>;
  put(key: string, value: unknown): Promise<void>;
  remove(key: string): Promise<void>;
}

const DATABASE_NAME = 'significant-hobbies-local';
const STORE_NAME = 'records';
const INSTALLATION_KEY = 'significanthobbies.installation-id';

export class LocalRecordError extends Error {}

export function browserRecordAdapter(): LocalRecordAdapter {
  return {
    async get(key) {
      return runRequest('readonly', (store) => store.get(key));
    },
    async put(key, value) {
      await runRequest('readwrite', (store) => store.put(value, key));
    },
    async remove(key) {
      await runRequest('readwrite', (store) => store.delete(key));
    },
  };
}

export async function readLocalRecord<T>(
  adapter: LocalRecordAdapter,
  key: string,
  domain: string,
  validate: (value: unknown) => value is T
): Promise<T | null> {
  const raw = await adapter.get(key);
  if (raw == null) return null;
  if (!isEnvelope(raw) || raw.key !== key || raw.domain !== domain || raw.schemaVersion !== 1) {
    await quarantine(adapter, key, raw);
    return null;
  }
  if (!validate(raw.value)) {
    await quarantine(adapter, key, raw);
    return null;
  }
  return raw.value;
}

export async function writeLocalRecord<T>(
  adapter: LocalRecordAdapter,
  key: string,
  domain: string,
  value: T
): Promise<void> {
  const envelope: LocalEnvelope<T> = {
    key,
    domain,
    schemaVersion: 1,
    installationId: getInstallationId(),
    updatedAt: new Date().toISOString(),
    value,
  };
  try {
    await adapter.put(key, envelope);
  } catch (error) {
    throw new LocalRecordError(
      error instanceof Error ? error.message : 'Browser storage is unavailable.'
    );
  }
}

export async function removeLocalRecord(adapter: LocalRecordAdapter, key: string): Promise<void> {
  await adapter.remove(key);
}

export async function archiveLocalRecordByKey(
  adapter: LocalRecordAdapter,
  key: string
): Promise<void> {
  const raw = await adapter.get(key);
  if (raw == null) return;
  await adapter.put(`archive:${key}:${Date.now()}`, raw);
  await adapter.remove(key);
}

function isEnvelope(value: unknown): value is LocalEnvelope<unknown> {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.key === 'string' &&
    typeof record.domain === 'string' &&
    typeof record.schemaVersion === 'number' &&
    typeof record.installationId === 'string' &&
    typeof record.updatedAt === 'string' &&
    'value' in record
  );
}

async function quarantine(adapter: LocalRecordAdapter, key: string, raw: unknown) {
  await adapter.put(`quarantine:${key}:${Date.now()}`, raw);
  await adapter.remove(key);
}

function getInstallationId(): string {
  const fallback = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  if (typeof localStorage === 'undefined') return fallback;
  const existing = localStorage.getItem(INSTALLATION_KEY);
  if (existing) return existing;
  const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : fallback;
  localStorage.setItem(INSTALLATION_KEY, id);
  localStorage.setItem('significanthobbies.storage-schema', '1');
  return id;
}

async function runRequest<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  if (typeof indexedDB === 'undefined')
    throw new LocalRecordError('Browser storage is unavailable.');
  const database = await openDatabase();
  return new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const request = operation(transaction.objectStore(STORE_NAME));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Browser storage request failed.'));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => database.close();
  });
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open browser storage.'));
  });
}
