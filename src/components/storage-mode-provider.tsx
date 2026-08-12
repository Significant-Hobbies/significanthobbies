'use client';

import { createContext, useContext } from 'react';

import type { StorageMode } from '~/lib/storage-mode';

const StorageModeContext = createContext<StorageMode>('local');

export function StorageModeProvider({
  mode,
  children,
}: {
  mode: StorageMode;
  children: React.ReactNode;
}) {
  return <StorageModeContext.Provider value={mode}>{children}</StorageModeContext.Provider>;
}

function useStorageMode(): StorageMode {
  return useContext(StorageModeContext);
}

export function StorageModeStatus() {
  const mode = useStorageMode();
  return (
    <p className="text-xs text-muted-foreground" role="status">
      {mode === 'account'
        ? 'Saved to your account and available across your devices.'
        : 'Saved privately on this device. Sign in only when you want cross-device access.'}
    </p>
  );
}
