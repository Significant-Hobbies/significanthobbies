import { desc,eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "~/components/json-ld";
import { Badge } from "~/components/ui/badge";
import { timelines, users } from "~/db/schema";
import { HOBBY_CATEGORIES, type HobbyCategory } from "~/lib/hobbies";
import { getTimelineUrl } from "~/lib/timeline-url";
import type { Phase } from "~/lib/types";
import { db } from "~/server/db";

interface Props {
  params: Promise<{ category: string }>;
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Creative:
    "Express yourself through art, design, and craft. Creative hobbies are where imagination meets skill — from putting brush to canvas to shaping clay with your hands.",
  Music:
    "Whether you play, produce, or simply lose yourself in sound. Music hobbies range from picking up your first instrument to mastering audio production.",
  Physical:
    "Move your body, challenge your limits. Physical hobbies build strength, endurance, and the kind of clarity that only comes after a good sweat.",
  Intellectual:
    "Feed your curiosity. Intellectual hobbies stretch your mind — from deep reading to strategic games to learning a new language.",
  Gaming:
    "Play with purpose. Gaming hobbies connect you to stories, strategy, and communities — from board game nights to competitive esports.",
  Outdoor:
    "Step outside and explore. Outdoor hobbies connect you to nature — from tending a garden to spotting birds to sleeping under the stars.",
  Culinary:
    "Create with flavor. Culinary hobbies turn your kitchen into a playground — from perfecting sourdough to brewing the perfect cup.",
  Collecting:
    "Curate what matters. Collecting hobbies are about the thrill of the hunt and the joy of a well-organized shelf.",
  Making:
    "Build with your hands. Making hobbies produce tangible results — from woodworking joints to 3D-printed prototypes to hand-stitched leather.",
  Social:
    "Connect through shared experiences. Social hobbies bring people together — from hosting dinner parties to improv comedy to volunteering.",
};


function slugToCategory(slug: string): HobbyCategory | undefined {
  return HOBBY_CATEGORIES.find(
    (c) => c.name.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase(),
  );
}

export function generateStaticParams() {
  return HOBBY_CATEGORIES.map((c) => ({
    category: c.name.toLowerCase().replace(/\s+/g, "-"),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const cat = slugToCategory(slug);
  if (!cat) return { title: "Category — SignificantHobbies" };
  return {
    title: `${cat.name} Hobbies — SignificantHobbies`,
    description: `Explore ${cat.hobbies.length} ${cat.name.toLowerCase()} hobbies. Browse community timelines, find tools, and discover your next ${cat.name.toLowerCase()} passion.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params;
  const cat = slugToCategory(slug);
  if (!cat) notFound();

  const description = CATEGORY_DESCRIPTIONS[cat.name] ?? "";

  // Query public timelines that contain any hobby from this category
  const categoryHobbyNames = new Set(cat.hobbies.map((h) => h.toLowerCase()));

  const rawTimelines = await db
    .select({
      id: timelines.id,
      title: timelines.title,
      slug: timelines.slug,
      phases: timelines.phases,
      updatedAt: timelines.updatedAt,
      userName: users.name,
      userUsername: users.username,
    })
    .from(timelines)
    .leftJoin(users, eq(timelines.userId, users.id))
    .where(eq(timelines.visibility, "PUBLIC"))
    .orderBy(desc(timelines.updatedAt))
    .limit(100);

  const matchingTimelines = rawTimelines.filter((t) => {
    try {
      const phases = JSON.parse(t.phases) as Phase[];
      return phases.some((p) =>
        p.hobbies.some((h) => categoryHobbyNames.has(h.name.toLowerCase())),
      );
    } catch {
      return false;
    }
  });

  const displayedTimelines = matchingTimelines.slice(0, 6);

  const relatedCategories = HOBBY_CATEGORIES.filter(
    (c) => c.name !== cat.name,
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Hobbies",
              item: "https://significanthobbies.com/hobbies",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: `${cat.name} Hobbies`,
              item: `https://significanthobbies.com/hobbies/category/${slug}`,
            },
          ],
        }}
      />

      {/* Breadcrumb */}
      <div className="mb-4">
        <Link href="/hobbies" className="text-sm text-stone-500 hover:text-stone-700">
          ← Hobby directory
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-5xl">{cat.emoji}</span>
          <div>
            <h1 className="text-3xl font-bold text-stone-900">
              {cat.name} Hobbies
            </h1>
            <p className="text-stone-500 text-sm mt-0.5">
              {cat.hobbies.length} hobbies
            </p>
          </div>
        </div>
        <p className="text-stone-600 leading-relaxed max-w-2xl">{description}</p>
      </div>

      {/* Hobbies grid */}
      <div className="mb-12">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-stone-500">
          Browse {cat.name.toLowerCase()} hobbies
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {cat.hobbies.map((hobby) => {
            const hobbySlug = hobby.toLowerCase().replace(/\s+/g, "-");
            return (
              <Link
                key={hobby}
                href={`/hobbies/${encodeURIComponent(hobbySlug)}`}
              >
                <div className="group rounded-xl border border-stone-200 bg-white p-4 transition-all hover:border-emerald-400 hover:shadow-sm cursor-pointer">
                  <span className="font-medium text-stone-700 group-hover:text-emerald-600 transition-colors text-sm">
                    {hobby}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Community timelines */}
      <div className="mb-12">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-stone-500">
          Popular {cat.name.toLowerCase()} timelines
        </h2>
        {displayedTimelines.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {displayedTimelines.map((t) => {
              let phases: Phase[] = [];
              try {
                phases = JSON.parse(t.phases) as Phase[];
              } catch {
                /* ignore */
              }
              const totalHobbies = new Set(
                phases.flatMap((p) => p.hobbies.map((h) => h.name)),
              ).size;
              return (
                <Link key={t.id} href={getTimelineUrl({ id: t.id, slug: t.slug, user: t.userUsername ? { username: t.userUsername } : null })}>
                  <div className="group rounded-xl border border-stone-200 bg-white p-4 transition-colors hover:border-emerald-400">
                    <h3 className="font-medium text-stone-800 group-hover:text-emerald-600 transition-colors">
                      {t.title ?? "Hobby Timeline"}
                    </h3>
                    {t.userName && (
                      <p className="text-xs text-stone-500 mt-0.5">
                        @{t.userUsername ?? t.userName}
                      </p>
                    )}
                    <p className="text-xs text-stone-400 mt-1.5">
                      {phases.length} phases · {totalHobbies} hobbies
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-8 text-center">
            <p className="text-stone-500">
              No public timelines for {cat.name.toLowerCase()} hobbies yet.
            </p>
            <Link href="/timeline/new">
              <button className="mt-3 text-sm text-emerald-600 hover:text-emerald-700">
                Be the first →
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="mb-12 rounded-xl border border-emerald-200 bg-emerald-50 p-6 flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-stone-900">
            Track your {cat.name.toLowerCase()} journey
          </p>
          <p className="text-sm text-stone-600 mt-0.5">
            Build a timeline that captures every phase of your hobby life.
          </p>
        </div>
        <Link
          href="/timeline/new"
          className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
        >
          Start now →
        </Link>
      </div>

      {/* Related categories */}
      <div>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-stone-500">
          Explore other categories
        </h2>
        <div className="flex flex-wrap gap-2">
          {relatedCategories.map((c) => {
            const catSlug = c.name.toLowerCase().replace(/\s+/g, "-");
            return (
              <Link key={c.name} href={`/hobbies/category/${catSlug}`}>
                <Badge
                  variant="outline"
                  className="border-stone-200 text-stone-500 hover:border-emerald-400 hover:text-emerald-600 cursor-pointer transition-colors py-1 px-3"
                >
                  {c.emoji} {c.name}
                </Badge>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
