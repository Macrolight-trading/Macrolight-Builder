import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import JsonLd from "@/components/JsonLd";
import CTASection from "@/components/CTASection";

/* ------------------------------------------------------------------ */
/*  Static params                                                      */
/* ------------------------------------------------------------------ */

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

/* ------------------------------------------------------------------ */
/*  Metadata                                                           */
/* ------------------------------------------------------------------ */

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: `${post.title} — Macrolight Builders`,
      description: post.description,
      url: `https://macrolightbuilders.com/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      images: [
        {
          url: post.ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [post.ogImage],
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Simple markdown → HTML converter                                   */
/* ------------------------------------------------------------------ */

function markdownToHtml(md: string): string {
  let html = md
    // Headings (must come before paragraph handling)
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold text-gray-900 mt-10 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mt-12 mb-4">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6">$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Links
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-violet-600 underline hover:text-violet-800 transition-colors">$1</a>'
    )
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="my-10 border-gray-200" />');

  // Unordered lists
  html = html.replace(
    /(^- .+\n?)+/gm,
    (match) => {
      const items = match
        .trim()
        .split("\n")
        .map((line) => `<li class="text-gray-600 leading-relaxed">${line.replace(/^- /, "")}</li>`)
        .join("\n");
      return `<ul class="my-4 space-y-2 list-disc list-inside">\n${items}\n</ul>`;
    }
  );

  // Paragraphs: wrap remaining bare lines
  html = html
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      // Don't wrap blocks that are already HTML elements
      if (
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<ul") ||
        trimmed.startsWith("<ol") ||
        trimmed.startsWith("<hr") ||
        trimmed.startsWith("<blockquote")
      ) {
        return trimmed;
      }
      return `<p class="text-gray-600 leading-relaxed mb-4">${trimmed}</p>`;
    })
    .join("\n\n");

  return html;
}

/* ------------------------------------------------------------------ */
/*  Date formatter                                                     */
/* ------------------------------------------------------------------ */

function formatDate(dateString: string): string {
  return new Date(dateString + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const articleHtml = markdownToHtml(post.content);

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: `https://macrolightbuilders.com${post.ogImage}`,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Organization",
      name: post.author,
      url: "https://macrolightbuilders.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Macrolight Builders",
      url: "https://macrolightbuilders.com",
      logo: {
        "@type": "ImageObject",
        url: "https://macrolightbuilders.com/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://macrolightbuilders.com/blog/${post.slug}`,
    },
    wordCount: post.content.split(/\s+/).length,
  };

  return (
    <>
      <JsonLd data={blogPostingSchema} />

      {/* ── Article header ── */}
      <section className="relative overflow-hidden bg-gray-50 border-b border-gray-200 pt-20 pb-14 sm:pt-28">
        <div
          className="absolute inset-0 dot-bg pointer-events-none"
          aria-hidden
        />
        <div
          className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-violet-100 opacity-60 blur-3xl pointer-events-none"
          aria-hidden
        />

        <div className="relative mx-auto max-w-3xl px-5 sm:px-8">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-800 transition-colors mb-8 animate-fade-in"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
            Back to blog
          </Link>

          {/* Category + read time */}
          <div className="flex items-center gap-3 mb-4 animate-fade-in">
            <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-violet-50 text-violet-600">
              {post.category}
            </span>
            <span className="text-xs text-gray-400">{post.readTime}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.1] animate-fade-in-up">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="mt-6 flex items-center gap-4 text-sm text-gray-400 animate-fade-in-up">
            <span>{post.author}</span>
            <span className="h-1 w-1 rounded-full bg-gray-300" />
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </div>
        </div>
      </section>

      {/* ── Hero image ── */}
      <div className="mx-auto max-w-4xl px-5 sm:px-8 -mt-8 relative z-10">
        <div className="relative aspect-[2/1] rounded-2xl overflow-hidden shadow-xl shadow-gray-200/80">
          <Image
            src={post.coverImage}
            alt={post.coverAlt}
            fill
            sizes="(max-width: 1280px) 100vw, 900px"
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* ── Article body ── */}
      <section className="bg-white py-16 sm:py-20">
        <article
          className="mx-auto max-w-3xl px-5 sm:px-8 [&>h1]:font-display [&>h2]:font-display [&>h3]:font-display"
          dangerouslySetInnerHTML={{ __html: articleHtml }}
        />
      </section>

      {/* ── Bottom CTA ── */}
      <CTASection
        eyebrow="Ready to grow?"
        headline="Turn your website into a lead machine."
        subhead="Get a free, no-obligation website audit. We'll show you exactly where you're losing leads and how to fix it."
      />
    </>
  );
}
