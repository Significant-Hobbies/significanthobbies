export const LOCAL_WORKSPACE_COOKIE = 'sh_local_workspace';

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

/**
 * Keep a non-sensitive hint beside the real IndexedDB workspace.
 *
 * The hint lets the Worker and the Next.js root choose the local dashboard
 * before React hydrates. IndexedDB remains authoritative; this cookie contains
 * no profile or journal data and is corrected after the client reads the
 * onboarding record.
 */
export function syncLocalWorkspaceCookie(complete: boolean): void {
  if (typeof document === 'undefined') return;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  // biome-ignore lint/suspicious/noDocumentCookie: broad browser support is required for the Worker routing hint.
  document.cookie = complete
    ? `${LOCAL_WORKSPACE_COOKIE}=1; Path=/; Max-Age=${ONE_YEAR_IN_SECONDS}; SameSite=Lax${secure}`
    : `${LOCAL_WORKSPACE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}
