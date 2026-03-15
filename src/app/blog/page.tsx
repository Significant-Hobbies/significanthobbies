import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts, type BlogPost } from "~/lib/blog-posts";
import { EmailCapture } from "~/components/email-capture";

export const metadata: Metadata = {
  title: "The Hobby Journal",
  description:
    "Thoughts on hobbies, identity, and living curiously. Articles on the psychology of leisure, rekindled passions, and finding what matters.",
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Wellbeing: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  "Getting Started": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  Psychology: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  Reflection: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  Inspiration: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
};

function categoryStyle(category: string) {
  return (
    CATEGORY_COLORS[category] ?? {
      bg: "bg-stone-50",
      text: "text-stone-600",
      border: "border-stone-200",
    }
  );
}

function PostCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  const style = categoryStyle(post.category);

  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <div
        className={`relative flex h-full overflow-hidden border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300 ${
          featured
            ? "flex-col gap-6 rounded-3xl p-8 hover:shadow-[0_12px_40px_rgba(16,185,129,0.12)] sm:flex-row sm:items-center sm:gap-12 sm:p-10"
            : "flex-col rounded-2xl hover:shadow-[0_8px_32px_rgba(16,185,129,0.10)]"
        }`}
      >
        {/* Top accent */}
        <div
          className={`absolute inset-x-0 top-0 origin-left scale-x-0 bg-gradient-to-r from-emerald-400 to-emerald-300 transition-transform duration-300 group-hover:scale-x-100 ${
            featured ? "h-1 rounded-t-3xl" : "h-0.5"
          }`}
        />

        {/* Emoji */}
        <div
          className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${
            featured
              ? "flex h-24 w-24 items-center justify-center rounded-2xl border border-stone-100 bg-stone-50 text-5xl shadow-sm"
              : "p-6 pb-0 text-4xl"
          }`}
        >
          {post.emoji}
        </div>

        <div className={`flex flex-1 flex-col ${featured ? "" : "p-6 pt-4"}`}>
          {/* Category + meta */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style.bg} ${style.text} ${style.border}`}
            >
              {post.category}
            </span>
            <span className="text-xs text-stone-400">{post.readTime} min read</span>
            <span className="text-xs text-stone-300">·</span>
            <span className="text-xs text-stone-400">{post.publishedAt}</span>
          </div>

          {/* Title */}
          {featured ? (
            <h2 className="mb-3 text-2xl font-bold leading-snug text-stone-900 transition-colors group-hover:text-emerald-700 sm:text-3xl">
              {post.title}
            </h2>
          ) : (
            <h3 className="mb-2 text-lg font-bold leading-snug text-stone-900 transition-colors group-hover:text-emerald-700">
              {post.title}
            </h3>
          )}

          {/* Excerpt */}
          <p
            className={`flex-1 leading-relaxed text-stone-500 ${
              featured ? "text-base sm:text-lg" : "line-clamp-2 text-sm"
            }`}
          >
            {post.excerpt}
          </p>

          {/* Footer */}
          {featured ? (
            <div className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 transition-all duration-200 group-hover:gap-2">
              Read article
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </div>
          ) : (
            <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4">
              <span className="text-xs text-stone-400">{post.readTime} min read</span>
              <span className="text-xs font-semibold text-emerald-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                Read →
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function BlogPage() {
  const [featured, ...rest] = blogPosts;

  return (
    <div className="min-h-screen" style={{ background: "#FEFDF8" }}>
      {/* Hero */}
      <section
        className="relative overflow-hidden px-4 py-20 sm:py-28"
        style={{
          background:
            "linear-gradient(160deg, #FFF8EE 0%, #ECFDF5 40%, #FFFBF5 70%, #FFF8EE 100%)",
        }}
      >
        {/* Subtle decorative orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute rounded-full"
            style={{
              width: 500,
              height: 500,
              top: "-20%",
              right: "-5%",
              background:
                "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: 400,
              height: 400,
              bottom: "-15%",
              left: "10%",
              background:
                "radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-5xl text-center">
          <div className="scroll-reveal mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            The Hobby Journal
          </div>

          <h1 className="scroll-reveal scroll-reveal-d1 mb-4 text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl md:text-6xl">
            The Hobby Journal
          </h1>

          <p className="scroll-reveal scroll-reveal-d2 mx-auto max-w-xl text-lg text-stone-500 sm:text-xl">
            Thoughts on hobbies, identity, and living curiously.
          </p>

          {/* Decorative dots */}
          <div className="scroll-reveal scroll-reveal-d3 mt-8 flex justify-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-emerald-300"
                style={{ opacity: 0.4 + i * 0.12 }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="px-4 py-14">
        <div className="mx-auto max-w-5xl">
          {/* Featured post */}
          {featured && (
            <div className="scroll-reveal-blur mb-10">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-stone-400">
                Featured
              </p>
              <PostCard post={featured} featured />
            </div>
          )}

          {/* Email capture */}
          <div className="scroll-reveal mb-10 rounded-xl border border-stone-200 bg-stone-50 p-6 text-center">
            <p className="font-medium text-stone-800 mb-2">Enjoy the journal?</p>
            <p className="text-sm text-stone-500 mb-4">Get new articles and hobby inspiration in your inbox.</p>
            <EmailCapture source="blog" />
          </div>

          {/* Divider */}
          <div className="scroll-reveal mb-10 flex items-center gap-4">
            <div className="h-px flex-1 bg-stone-200" />
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">
              All articles
            </p>
            <div className="h-px flex-1 bg-stone-200" />
          </div>

          {/* Rest of posts grid */}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {rest.map((post, i) => (
                <div key={post.slug} className={`scroll-reveal-flip scroll-reveal-d${Math.min(i + 1, 6)}`}>
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Back to site */}
      <section className="border-t border-stone-100 px-4 py-10">
        <div className="scroll-reveal-scale mx-auto max-w-5xl text-center">
          <p className="mb-3 text-sm text-stone-500">
            Ready to map your own hobby story?
          </p>
          <Link
            href="/timeline/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md"
          >
            Build your timeline
            <span>→</span>
          </Link>
          <div className="mt-5">
            <Link
              href="/"
              className="text-sm text-stone-400 transition-colors hover:text-stone-600"
            >
              ← Back to SignificantHobbies
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
