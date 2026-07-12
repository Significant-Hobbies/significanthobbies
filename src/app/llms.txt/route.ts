import { buildLlmsIndex } from '~/lib/agent-content';

export const dynamic = 'force-static';

export function GET() {
  return new Response(buildLlmsIndex(false), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'Content-Signal': 'search=yes, ai-train=no, use=reference',
    },
  });
}
