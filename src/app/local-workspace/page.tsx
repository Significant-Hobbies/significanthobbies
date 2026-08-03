import { LocalRootExperience } from '~/components/local-root-experience';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dashboard — SignificantHobbies',
  robots: { index: false, follow: false },
};

/**
 * Internal target for the Worker's signed-out local-workspace rewrite.
 * The public URL remains `/`; IndexedDB is revalidated by LocalRootExperience.
 */
export default function LocalWorkspacePage() {
  return <LocalRootExperience initialComplete />;
}
