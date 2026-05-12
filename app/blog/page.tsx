import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getAllPosts } from "@/lib/blog";
import JsonLd from "@/components/JsonLd";

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

  // BreadcrumbList — helps Google show breadcrumb chips in SERPs.
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://macrolight-builder.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://macrolight-builder.com/blog",
      },
    ],
  };

  // Blog schema — explicit signal that this is a blog index, with each
  // post listed as a BlogPosting node.
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
      author: {
        "@type": "Organization",
        name: p.author,
      },
    })),
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={blogSchema} />
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
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                {/* Card body */}
                <div className="flex flex-col flex-1 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-2.5 py-0.5 rounded-full">
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-400">{post.readTime}</span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 leading-snug mb-2 group-hover:text-violet-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-gray-500 line-clamp-3 flex-1">
                    {post.description}
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                      {formatDate(post.date)}
                    </span>
                    <span className="text-xs font-semibold text-violet-600 group-hover:underline">
                      Read more →
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
      