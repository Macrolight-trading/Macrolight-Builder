import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { getAuthor } from "@/lib/authors";
import JsonLd from "@/components/JsonLd";
import CTASection from "@/components/CTASection";

const ACCENT = "#C8A24B";

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

  // Prefer the SEO-optimised short title for the <title> tag (and OG/Twitter
  // titles) when one is provided — keeps SERP titles under truncation while
  // letting the visible H1 stay descriptive. See SEO audit Finding 6.
  const metaTitle = post.seoTitle ?? post.title;

  return {
    title: metaTitle,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: `${metaTitle} — Macrolight Builder`,
      description: post.description,
      url: `https://macrolight-builder.com/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      images: [
        { url: post.ogImage, width: 1200, height: 630, alt: post.title },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: post.description,
      images: [post.ogImage],
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Simple markdown → HTML converter — themed to v2 stone/gold         */
/* ------------------------------------------------------------------ */

function markdownToHtml(md: string): string {
  let html = md
    // Headings (must come before paragraph handling)
    .replace(
      /^### (.+)$/gm,
      '<h3 class="font-display font-semibold text-stone-900 leading-snug tracking-tight mt-10 mb-3" style="font-size: clamp(1.05rem, 1.5vw, 1.25rem)">$1</h3>'
    )
    .replace(
      /^## (.+)$/gm,
      '<h2 class="font-display font-semibold text-stone-900 leading-[1.15] tracking-tight mt-14 mb-5" style="font-size: clamp(1.45rem, 2.4vw, 1.9rem)">$1</h2>'
    )
    .replace(
      /^# (.+)$/gm,
      '<h1 class="font-display font-semibold text-stone-900 leading-[1.05] tracking-tight mb-6" style="font-size: clamp(1.85rem, 3.4vw, 2.5rem)">$1</h1>'
    )
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-stone-900">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em class="text-stone-700">$1</em>')
    // Links
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-stone-900 underline decoration-stone-300 decoration-from-font underline-offset-4 hover:decoration-stone-900 transition-colors">$1</a>'
    )
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="my-12 border-stone-200" />');

  // Unordered lists
  html = html.replace(/(^- .+\n?)+/gm, (match) => {
    const items = match
      .trim()
      .split("\n")
      .map(
        (line) =>
          `<li class="text-stone-600 leading-relaxed pl-2">${line.replace(/^- /, "")}</li>`
      )
      .join("\n");
    return `<ul class="my-5 space-y-2 list-disc pl-5 marker:text-stone-300">\n${items}\n</ul>`;
  });

  // Paragraphs: wrap remaining bare lines
  html = html
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<ul") ||
        trimmed.startsWith("<ol") ||
        trimmed.startsWith("<hr") ||
        trimmed.startsWith("<blockquote")
      ) {
        return trimmed;
      }
      return `<p class="text-[1.0625rem] text-stone-600 leading-[1.75] mb-5">${trimmed}</p>`;
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

  // The post layout already renders the title as the page H1, and the
  // markdown source files start with `# Title`. Strip that leading H1 so
  // the rendered article body starts at H2 (avoids duplicate H1s — see
  // SEO audit Finding 4).
  const bodyMarkdown = post.content.replace(/^\s*#\s+.+\n+/, "");
  const articleHtml = markdownToHtml(bodyMarkdown);
  const author = post.authorKey ? getAuthor(post.authorKey) : undefined;

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: `https://macrolight-builder.com${post.ogImage}`,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Organization",
      name: post.author,
      url: "https://macrolight-builder.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Macrolight Builder",
      url: "https://macrolight-builder.com",
      logo: {
        "@type": "ImageObject",
        url: "https://macrolight-builder.com/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://macrolight-builder.com/blog/${post.slug}`,
    },
    wordCount: post.content.split(/\s+/).length,
  };

  return (
    <>
      <JsonLd data={blogPostingSchema} />

      {/* ── Article header ── */}
      <section className="relative isolate overflow-hidden bg-stone-50 border-b border-stone-200/70 pt-20 pb-14 sm:pt-28 sm:pb-16">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(55% 65% at 30% 30%, ${ACCENT}26 0%, transparent 65%)`,
          }}
        />

        <div className="relative mx-auto max-w-3xl px-5 sm:px-8">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors mb-8 group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
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
          <div className="flex items-center gap-3 mb-5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-2.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-stone-700">
              <span
                aria-hidden
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: ACCENT }}
              />
              {post.category}
            </span>
            <span className="text-[0.7rem] text-stone-400">{post.readTime}</span>
          </div>

          {/* Title */}
          <h1
            className="font-display font-semibold text-stone-900 leading-[1.05] tracking-tight"
            style={{ fontSize: "clamp(2rem, 4.6vw, 3.5rem)" }}
          >
            {post.title}
          </h1>

          {/* Meta */}
          <div className="mt-6 flex items-center gap-4 text-sm text-stone-500">
            <span>{post.author}</span>
            <span aria-hidden className="h-1 w-1 rounded-full bg-stone-300" />
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </div>
        </div>
      </section>

      {/* ── Hero image ── */}
      <div className="mx-auto max-w-4xl px-5 sm:px-8 -mt-10 sm:-mt-12 relative z-10">
        <div className="relative aspect-[2/1] rounded-2xl overflow-hidden shadow-[0_40px_80px_-30px_rgba(15,23,42,0.30),0_15px_30px_-15px_rgba(15,23,42,0.12)] border border-stone-200">
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
      <section className="bg-stone-50 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <div
            className="max-w-none"
            dangerouslySetInnerHTML={{ __html: articleHtml }}
          />
        </div>
      </section>

      {/* ── Author card ── */}
      {author && (
        <section className="bg-white border-t border-stone-200 py-14 sm:py-20">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <p className="text-[0.65rem] sm:text-xs font-medium uppercase tracking-[0.22em] text-stone-500 mb-6">
              About the author
            </p>
            <div className="flex items-start gap-5">
              {author.photo ? (
                <div className="relative h-16 w-16 shrink-0 rounded-full overflow-hidden ring-2 ring-stone-100 shadow-sm">
                  <Image
                    src={author.photo}
                    alt={author.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  className={`h-16 w-16 shrink-0 rounded-full ${author.color} flex items-center justify-center text-white text-xl font-bold`}
                  aria-hidden
                >
                  {author.initials}
                </div>
              )}
              <div>
                <p className="text-base font-semibold text-stone-900">{author.name}</p>
                <p
                  className="text-sm font-medium mt-0.5"
                  style={{ color: ACCENT }}
                >
                  {author.role}
                </p>
                <p className="mt-3 text-sm text-stone-600 leading-relaxed">{author.bio}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <CTASection />
    </>
  );
}
