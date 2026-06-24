// Thin SaaS Maker waitlist client — a direct POST to /v1/waitlist (no SDK).
// The only SaaS Maker API this project calls; not worth the @saas-maker/sdk dep.

const API_KEY = process.env.NEXT_PUBLIC_SAASMAKER_API_KEY;
const API_URL = process.env.NEXT_PUBLIC_SAASMAKER_API_URL || 'https://api.sassmaker.com';

/** Join the SaaS Maker waitlist. No-op when no project key is configured. */
export async function joinWaitlist(email: string): Promise<void> {
  if (!API_KEY) return;
  await fetch(`${API_URL.replace(/\/+$/, '')}/v1/waitlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Project-Key': API_KEY },
    body: JSON.stringify({ email }),
  });
}
