import { getServerAuthSession } from '~/server/auth';

import { OnboardingFlow } from './onboarding-flow';

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function SetupPage() {
  const session = await getServerAuthSession();
  return (
    <OnboardingFlow
      user={{ name: session?.user?.name, image: session?.user?.image }}
      storageMode={session?.user ? 'account' : 'local'}
    />
  );
}
