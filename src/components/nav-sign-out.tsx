'use client';

import { useRouter } from 'next/navigation';

import { DropdownMenuItem } from '~/components/ui/dropdown-menu';
import { authClient } from '~/lib/auth-client';

export function NavSignOut() {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <DropdownMenuItem
      onClick={handleSignOut}
      className="cursor-pointer text-foreground hover:text-foreground"
    >
      Sign out
    </DropdownMenuItem>
  );
}
