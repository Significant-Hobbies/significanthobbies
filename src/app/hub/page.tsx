import { redirect } from 'next/navigation';

import { PersonalAppsHub } from '~/components/personal-apps-hub';
import { loginPath } from '~/lib/auth-routing';
import { getPersonalDataInventory } from '~/server/personal-platform';

export const metadata = {
  title: 'Personal Apps Hub',
  description: 'A private, read-only view of your personal applications and compatibility data.',
  robots: { index: false, follow: false },
};

export default async function HubPage() {
  const inventory = await getPersonalDataInventory();
  if (!inventory) redirect(loginPath('/hub'));

  return <PersonalAppsHub inventory={inventory} />;
}
