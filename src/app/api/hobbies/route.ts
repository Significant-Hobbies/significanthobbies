import { NextResponse } from "next/server";

import { HOBBY_CATEGORIES } from "@/lib/hobbies";

export const dynamic = "force-static";

/**
 * Public JSON of the hobby taxonomy — every category and the hobbies
 * inside it. Lets external tooling (Notion templates, quizzes,
 * researcher datasets) reuse the same taxonomy.
 */
export function GET() {
  const total = HOBBY_CATEGORIES.reduce((s, c) => s + c.hobbies.length, 0);
  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      categoryCount: HOBBY_CATEGORIES.length,
      hobbyCount: total,
      categories: HOBBY_CATEGORIES,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    },
  );
}
