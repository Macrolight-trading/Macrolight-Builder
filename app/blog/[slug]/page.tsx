import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import {
  getAllBlogFeedEntries,
  getBlogFeedEntry,
  getExternalPostByFeedEntry,
  getMdxPostBySlug,
} from "@/lib/blog-feed";
import { getAuthor } from "@/lib/authors";
import JsonLd from "@/components/JsonLd";
import CTASection from "@/components/CTASection";
import ExternalArticleBody from "@/components/blog/ExternalArticleBody";
import { mdxComponents } from "@/components/mdx/MdxComponents";

const ACCENT = "#C8A24B";

export const revalidate = 300;

export async function generateStaticParams() {
  const entries = await getAllBlogFeedEntries();
  return entries.map((entry) => ({ slug: entry.slug }));
}

function formatDate(dateString: string): string {
  return new Date(dateString + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function absoluteImage(url: string): string {
  return url.startsWith("http") ? url : `https://macrolight-builder.com${url}`;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const entry = await getBlogFeedEntry(params.slug);
  if (!entry) return {};

  const metaTitle = entry.seoTitle ?? entry.title;

  return {
    title: metaTitle,
    description: entry.description,
    alternates: { canonical: `/blog/${entry.slug}` },
    openGraph: {
      title: `${metaTitle} — Macrolight Builder`,
      description: entry.description,
      url: `https://macrolight-builder.com/blog/${entry.slug}`,
      type: "article",
      publishedTime: entry.date,
      authors: [entry.author],
      images: [{ url: absoluteImage(entry.ogImage), width: 1200, height: 630, alt: entry.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: entry.description,
      images: [absoluteImage(entry.ogImage)],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const entry = await getBlogFeedEntry(params.slug);
  if (!entry) notFound();

  if (entry.source === "mdx") {
    const post = await getMdxPostBySlug(entry.slug);
    if (!post) notFound();

    const author = post.authorKey ? getAuthor(post.authorKey) : undefined;

    const blogPostingSchema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      image: absoluteImage(post.ogImage),
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

    const faqSchema = post.faqs?.length
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: post.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

    return (
      <>
        <JsonLd data={blogPostingSchema} />
        {faqSchema && <JsonLd data={faqSchema} />}

        <ArticleChrome
          category={post.category}
          readTime={post.readTime}
          title={post.title}
          author={post.author}
          date={post.date}
          coverImage={post.coverImage}
          coverAlt={post.coverAlt}
        >
          <MDXRemote
            source={post.content}
            components={mdxComponents}
            options={{
              mdxOptions: { remarkPlugins: [remarkGfm] },
              parseFrontmatter: false,
            }}
          />
        </ArticleChrome>

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
                  <p className="text-sm font-medium mt-0.5" style={{ color: ACCENT }}>
                    {author.role}
                  </p>
                  <p className="mt-3 text-sm text-stone-600 leading-relaxed">{author.bio}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        <CTASection />
      </>
    );
  }

  const external = await getExternalPostByFeedEntry(entry);
  if (!external) notFound();

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: external.title,
    description: external.description,
    image: absoluteImage(external.ogImage),
    datePublished: external.date,
    dateModified: external.date,
    author: {
      "@type": "Organization",
      name: external.author,
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
      "@id": `https://macrolight-builder.com/blog/${external.slug}`,
    },
    wordCount: external.content.split(/\s+/).length,
  };

  return (
    <>
      <JsonLd data={blogPostingSchema} />

      <ArticleChrome
        category={external.category}
        readTime={external.readTime}
        title={external.title}
        author={external.author}
        date={external.date}
        coverImage={external.coverImage}
        coverAlt={external.coverAlt}
      >
        <ExternalArticleBody content={external.content} format={external.contentFormat} />
      </ArticleChrome>

      <CTASection />
    </>
  );
}

function ArticleChrome({
  category,
  readTime,
  title,
  author,
  date,
  coverImage,
  coverAlt,
  children,
}: {
  category: string;
  readTime: string;
  title: string;
  author: string;
  date: string;
  coverImage: string;
  coverAlt: string;
  children: ReactNode;
}) {
  const coverIsRemote = coverImage.startsWith("http");

  return (
    <>
      <section className="relative isolate overflow-hidden bg-stone-50 border-b border-stone-200/70 pt-20 pb-14 sm:pt-28 sm:pb-16">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(55% 65% at 30% 30%, ${ACCENT}26 0%, transparent 65%)`,
          }}
        />

        <div className="relative mx-auto max-w-3xl px-5 sm:px-8">
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

          <div className="flex items-center gap-3 mb-5">
            {category ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-2.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-stone-700">
                <span
                  aria-hidden
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: ACCENT }}
                />
                {category}
              </span>
            ) : null}
            <span className="text-[0.7rem] text-stone-400">{readTime}</span>
          </div>

          <h1
            className="font-display font-semibold text-stone-900 leading-[1.05] tracking-tight"
            style={{ fontSize: "clamp(2rem, 4.6vw, 3.5rem)" }}
          >
            {title}
          </h1>

          <div className="mt-6 flex items-center gap-4 text-sm text-stone-500">
            <span>{author}</span>
            <span aria-hidden className="h-1 w-1 rounded-full bg-stone-300" />
            <time dateTime={date}>{formatDate(date)}</time>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-5 sm:px-8 -mt-10 sm:-mt-12 relative z-10">
        <div className="relative aspect-[2/1] rounded-2xl overflow-hidden shadow-[0_40px_80px_-30px_rgba(15,23,42,0.30),0_15px_30px_-15px_rgba(15,23,42,0.12)] border border-stone-200">
          <Image
            src={coverImage}
            alt={coverAlt}
            fill
            unoptimized={coverIsRemote}
            sizes="(max-width: 1280px) 100vw, 900px"
            className="object-cover"
            priority
          />
        </div>
      </div>

      <section className="bg-stone-50 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">{children}</div>
      </section>
    </>
  );
}
