import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllCaseStudies, getCaseStudyBySlug } from "@/lib/case-studies";
import JsonLd from "@/components/JsonLd";
import CTASection from "@/components/CTASection";

/* ------------------------------------------------------------------ */
/*  Static params                                                      */
/* ------------------------------------------------------------------ */

export function generateStaticParams() {
  return getAllCaseStudies().map((cs) => ({ slug: cs.slug }));
}

/* ------------------------------------------------------------------ */
/*  Metadata                                                           */
/* ------------------------------------------------------------------ */

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const cs = getCaseStudyBySlug(params.slug);
  if (!cs) return {};

  const title = `${cs.company} Case Study`;
  const description = `How ${cs.company} in ${cs.location} transformed their online presence with Macrolight Builders. ${cs.results[0].value} ${cs.results[0].metric.toLowerCase()}.`;

  return {
    title,
    description,
    alternates: { canonical: `/case-studies/${cs.slug}` },
    openGraph: {
      title: `${title} — Macrolight Builders`,
      description,
      url: `https://macrolightbuilders.com/case-studies/${cs.slug}`,
      type: "article",
      images: [
        {
          url: "/og-default.png",
          width: 1200,
          height: 630,
          alt: `${cs.company} — Macrolight Builders Case Study`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — Macrolight Builders`,
      description,
      images: ["/og-default.png"],
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function CaseStudyPage({
  params,
}: {
  params: { slug: string };
}) {
  const cs = getCaseStudyBySlug(params.slug);
  if (!cs) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${cs.company} Case Study — Macrolight Builders`,
    description: `How ${cs.company} in ${cs.location} transformed their online presence.`,
    author: {
      "@type": "Organization",
      name: "Macrolight Builders",
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
      "@id": `https://macrolightbuilders.com/case-studies/${cs.slug}`,
    },
  };

  return (
    <>
      <JsonLd data={articleSchema} />

      {/* ── Hero ── */}
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
            href="/case-studies"
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
            All case studies
          </Link>

          {/* Industry + location */}
          <div className="flex items-center gap-3 mb-4 animate-fade-in">
            <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-violet-50 text-violet-600">
              {cs.industry}
            </span>
            <span className="text-xs text-gray-400">{cs.location}</span>
            <span className="text-xs text-gray-400">
              &middot; {cs.timeframe}
            </span>
          </div>

          {/* Company name */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.1] animate-fade-in-up">
            {cs.company}
          </h1>

          <p className="mt-4 text-lg text-gray-500 animate-fade-in-up">
            How a {cs.industry.toLowerCase()} company in {cs.location}{" "}
            transformed their online presence with Macrolight Builders.
          </p>
        </div>
      </section>

      {/* ── Challenge ── */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-600 mb-3">
            The Challenge
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            Where they started
          </h2>
          <p className="text-gray-600 leading-relaxed">{cs.challenge}</p>
        </div>
      </section>

      {/* ── Solution ── */}
      <section className="bg-gray-50 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-600 mb-3">
            Our Solution
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            What we built
          </h2>
          <p className="text-gray-600 leading-relaxed">{cs.solution}</p>
        </div>
      </section>

      {/* ── Results ── */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-600 mb-3">
              The Results
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900">
              Numbers that speak for themselves
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cs.results.map((result) => (
              <div
                key={result.metric}
                className="rounded-2xl border border-gray-200 shadow-sm p-8 text-center"
              >
                <p className="text-3xl font-bold gradient-text mb-2">
                  {result.value}
                </p>
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  {result.metric}
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {result.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonial ── */}
      <section className="bg-gray-50 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <blockquote className="relative">
            {/* Decorative quote mark */}
            <svg
              className="absolute -top-4 -left-2 h-16 w-16 text-violet-100"
              fill="currentColor"
              viewBox="0 0 32 32"
              aria-hidden
            >
              <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
            </svg>

            <p className="relative text-xl sm:text-2xl font-medium text-gray-900 leading-relaxed pl-10">
              &ldquo;{cs.testimonialQuote}&rdquo;
            </p>

            <footer className="mt-8 pl-10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-sm">
                  {cs.testimonialAuthor.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {cs.testimonialAuthor}
                  </p>
                  <p className="text-xs text-gray-400">
                    {cs.testimonialRole}
                  </p>
                </div>
              </div>
            </footer>
          </blockquote>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <CTASection
        eyebrow="Your turn"
        headline="Ready for results like these?"
        subhead="Get a free, no-obligation website audit. We'll show you exactly where you're leaving leads on the table and how to fix it."
      />
    </>
  );
}
