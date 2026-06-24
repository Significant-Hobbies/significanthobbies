import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Astro owns anon GET `/` in production:
 * - `landing-astro/` builds static HTML overlaid into `.open-next/assets/index.html`
 * - `wrangler.toml` sets `run_worker_first = ["/*", "!/"]` so `/` skips the Worker
 *
 * This Next route is only a fallback when a signed-in request reaches OpenNext
 * (e.g. preview without overlay, or a cache miss on the assets binding).
 */
export default async function HomePage() {
  const cookieStore = await cookies();
  const session =
    cookieStore.get('better-auth.session_token') ??
    cookieStore.get('__Secure-better-auth.session_token');

  if (session) {
    redirect('/dashboard');
  }

  redirect('/timeline/new');
}
