import { NextResponse } from 'next/server';

import { searchPublicExperiences } from '@/lib/mcp-public';

export function GET(request: Request) {
  return NextResponse.json(searchPublicExperiences(new URL(request.url).searchParams), {
    headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
  });
}
