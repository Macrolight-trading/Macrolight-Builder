import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Actionable insights on web design, lead generation, and online growth for local businesses. Learn how to turn your website into a client acquisition system.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog — Macrolight Builders",
    description:
      "Actionable insights on web design, lead generation, and online growth for local businesses.",
    url: "https://macrolightbuilders.com/blog",
  },
};

function formatDate(dateString: string): string {
  return new Date(dateString + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      {/* ── Hero header ── */}
      <section className="relative overflow-hidden bg-gray-50 border-b border-gray-200 pt-20 pb-14 sm:pt-28">
        <div className="absolute inset-0 dot-bg pointer-events-none" aria-hidden />
        <div
          className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-violet-100 opacity-60 blur-3xl pointer-events-none"
          aria-hidden
        />

        <div className="relative mx-auto max-w-4xl px-5 sm:px-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-600 animate-fade-in">
            Blog
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.05] animate-fade-in-up">
            Insights for{" "}
            <span className="gradient-text">local businesses.</span>
          </h1>
          <p className="mt-5 text-lg text-gray-500 max-w-2xl mx-auto animate-fade-in-up">
            Actionable strategies to turn your website into your
            hardest-working employee. No fluff, just results.
          </p>
        </div>
      </section>

      {/* ── Post grid ── */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                {/* Cover image */}
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={post.coverImage}
                    alt={post.coverAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-violet-50 text-violet-600">
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-400">
                      {post.readTime}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-violet-600 transition-colors mb-2">
                    {post.title}
                  </h2>

                  <p className="text-sm text-gray-500 leading-relaxed flex-1">
                    {post.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <time
                      dateTime={post.date}
                      className="text-xs text-gray-400"
                    >
                      {formatDate(post.date)}
                    </time>
                    <span className="text-xs font-semibold text-violet-600 group-hover:translate-x-0.5 transition-transform">
                      Read article →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
