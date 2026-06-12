import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/motion/Reveal";
import SoroBlogEmbed from "@/components/SoroBlogEmbed";

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

export default function BlogPage() {
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

      {/* ── Soro blog embed ── */}
      <section className="bg-stone-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <SoroBlogEmbed />
        </div>
      </section>
    </>
  );
}
