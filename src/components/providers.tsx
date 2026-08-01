'use client';

import { Toaster } from '~/components/ui/sonner';
import { StorageModeProvider } from '~/components/storage-mode-provider';
import { authClient } from '~/lib/auth-client';
import { LocalImportCoordinator } from '~/components/local-import-coordinator';

export function Providers({ children }: { children: React.ReactNode }) {
  const { data: session } = authClient.useSession();
  return (
    <StorageModeProvider mode={session?.user ? 'account' : 'local'}>
      {children}
      <LocalImportCoordinator isAuthenticated={Boolean(session?.user)} />
      <Toaster />
    </StorageModeProvider>
  );
}
