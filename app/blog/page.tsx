import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getAllPosts } from "@/lib/blog";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/motion/Reveal";

const ACCENT = "#C8A24B";

export const metadata: Metadata = {
  // Keyword-rich title (template appends " | Macrolight Builder").
  title: "Local Business Web Design Blog",
  description:
    "Actionable insights on web design, lead generation, and online growth for local businesses. Learn how to turn your website into a client acquisition system.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog — Macrolight Builder",
    description:
      "Actionable insights on web design, lead generation, and online growth for local businesses.",
    url: "https://macrolight-builder.com/blog",
    type: "website",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Macrolight Builder blog — local business web design insights",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog — Macrolight Builder",
    description:
      "Actionable insights on web design, lead generation, and online growth for local businesses.",
    images: ["/og-default.png"],
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

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://macrolight-builder.com" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://macrolight-builder.com/blog" },
    ],
  };

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Macrolight Builder Blog",
    url: "https://macrolight-builder.com/blog",
    description:
      "Actionable insights on web design, lead generation, and online growth for local businesses.",
    publisher: {
      "@type": "Organization",
      name: "Macrolight Builder",
      url: "https://macrolight-builder.com",
    },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `https://macrolight-builder.com/blog/${p.slug}`,
      datePublished: p.date,
      author: { "@type": "Organization", name: p.author },
    })),
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={blogSchema} />

      {/* ── Hero header ── */}
      <section className="relative isolate overflow-hidden bg-stone-50 border-b border-stone-200/70 pt-20 pb-16 sm:pt-28 sm:pb-20">
        {/* Soft gold radial — matches the homepage hero backdrop */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(55% 65% at 65% 35%, ${ACCENT}26 0%, transparent 65%)`,
          }}
        />

        <div className="relative mx-auto max-w-4xl px-5 sm:px-8 text-center">
          <Reveal>
            <p className="text-[0.65rem] sm:text-xs font-medium uppercase tracking-[0.22em] text-stone-500">
              Macrolight Journal
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1
              className="mt-5 font-display font-semibold text-stone-900 leading-[1.02] tracking-tight"
              style={{ fontSize: "clamp(2.25rem, 5vw, 4.25rem)" }}
            >
              Insights for{" "}
              <em className="text-stone-400">local businesses.</em>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 sm:mt-6 text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl mx-auto">
              Actionable strategies to turn your website into your
              hardest-working employee. No fluff, just results.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Post grid ── */}
      <section className="bg-stone-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 sm:gap-8">
            {posts.map((post, i) => (
              <Reveal key={post.slug} delay={Math.min(i, 5) * 0.05}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col h-full bg-white rounded-2xl border border-stone-200 overflow-hidden transition-all duration-500 hover:border-stone-300 hover:shadow-[0_30px_60px_-30px_rgba(15,23,42,0.18),0_10px_25px_-12px_rgba(15,23,42,0.10)] hover:-translate-y-1"
                >
                  {/* Cover image */}
                  <div className="relative h-52 overflow-hidden bg-stone-100">
                    <Image
                      src={post.coverImage}
                      alt={post.coverAlt}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>

                  {/* Card body */}
                  <div className="flex flex-col flex-1 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-stone-700"
                      >
                        <span
                          aria-hidden
                          className="inline-block h-1.5 w-1.5 rounded-full"
                          style={{ background: ACCENT }}
                        />
                        {post.category}
                      </span>
                      <span className="text-[0.7rem] text-stone-400">{post.readTime}</span>
                    </div>
                    <h2
                      className="font-display font-semibold text-stone-900 leading-snug tracking-tight mb-3 group-hover:text-stone-700 transition-colors"
                      style={{ fontSize: "clamp(1.1rem, 1.6vw, 1.35rem)" }}
                    >
                      {post.title}
                    </h2>
                    <p className="text-sm text-stone-500 leading-relaxed line-clamp-3 flex-1">
                      {post.description}
                    </p>
                    <div className="flex items-center justify-between mt-5 pt-5 border-t border-stone-100">
                      <span className="text-xs text-stone-400">
                        {formatDate(post.date)}
                      </span>
                      <span className="text-xs font-medium text-stone-900 inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">
                        Read article
                        <span aria-hidden>→</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
