import { NextResponse } from 'next/server';

import { getPublicExperience } from '@/lib/mcp-public';

export function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  return context.params.then(({ slug }) => {
    const item = getPublicExperience(slug);
    return item
      ? NextResponse.json({ item }, { headers: { 'Cache-Control': 'public, max-age=86400' } })
      : NextResponse.json({ code: 'NOT_FOUND', message: 'Experience not found.' }, { status: 404 });
  });
}
