import { LocalRootExperience } from '~/components/local-root-experience';
import { BRAND_NAME } from '~/lib/site-metadata';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: `Dashboard — ${BRAND_NAME}`,
  robots: { index: false, follow: false },
};

/**
 * Internal target for the Worker's signed-out local-workspace rewrite.
 * The public URL remains `/`; IndexedDB is revalidated by LocalRootExperience.
 */
export default function LocalWorkspacePage() {
  return <LocalRootExperience initialComplete />;
}
