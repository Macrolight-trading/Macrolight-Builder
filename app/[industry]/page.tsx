import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getIndustry,
  industrySlugs,
  isValidIndustrySlug,
  type IndustryProfile,
} from "@/lib/industries";
import { caseStudies } from "@/lib/case-studies";
import { getAllPosts } from "@/lib/blog";
import IndustrySampleFrame from "@/components/industries/IndustrySampleFrame";
import JsonLd from "@/components/JsonLd";

interface PageProps {
  params: { industry: string };
}

/**
 * Tell Next.js exactly which slugs are valid. Combined with
 * `dynamicParams = false` below, any other slug returns the framework's
 * built-in 404 (HTTP 404) instead of rendering a generated industry page.
 */
export function generateStaticParams() {
  return industrySlugs.map((slug) => ({ industry: slug }));
}

// Crucial: refuse any param not produced by generateStaticParams above.
export const dynamicParams = false;

/* ------------------------------------------------------------------ */
/*  Metadata                                                           */
/* ------------------------------------------------------------------ */

// Per-industry SEO title — kept under 60 chars for SERP truncation.
const titleByIndustry: Record<string, string> = {
  roofing: "Websites for Roofers That Drive Storm-Season Calls",
  restaurants: "Websites for Restaurants That Fill More Tables",
  "law-firms": "Websites for Law Firms That Convert Case Leads",
  hvac: "Websites for HVAC Pros That Book Service Calls",
  dentists: "Websites for Dentists That Fill Appointments",
  "lawn-care": "Websites for Lawn Care Pros That Book Estimates",
};

export function generateMetadata({ params }: PageProps): Metadata {
  if (!isValidIndustrySlug(params.industry)) return {};
  const industry = getIndustry(params.industry)!;

  const seoTitle = titleByIndustry[params.industry];

  // Per-industry meta description — kept short enough to fit Google's
  // ~160-char SERP snippet without mid-word truncation. Uses the
  // industry's display name (not lowercased) so e.g. "HVAC" stays
  // capitalized.
  const description = `${industry.heroTagline} We build, host, and manage lead-generating sites for ${industry.name} businesses.`;
  // Belt-and-braces: if a future heroTagline pushes us over 160 chars,
  // truncate at the last word boundary instead of slicing mid-word.
  const trimmedDescription =
    description.length > 160
      ? description.slice(0, 157).replace(/\s+\S*$/, "").trimEnd() + "..."
      : description;

  return {
    title: seoTitle,
    description: trimmedDescription,
    alternates: { canonical: `/${params.industry}` },
    openGraph: {
      title: `${industry.name} Websites — Macrolight Builder`,
      description: trimmedDescription,
      url: `https://macrolight-builder.com/${params.industry}`,
      type: "website",
      images: [
        {
          url: "/og-default.png",
          width: 1200,
          height: 630,
          alt: `Macrolight Builder — websites for ${industry.name.toLowerCase()} businesses`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${industry.name} Websites — Macrolight Builder`,
      description: trimmedDescription,
      images: ["/og-default.png"],
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Helper: relevant blog posts (best-effort keyword match)            */
/* ------------------------------------------------------------------ */

function relatedPostsFor(industry: IndustryProfile, max = 2) {
  const posts = getAllPosts();
  const term = industry.name.toLowerCase();
  const matched = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
  );
  // Always fall back to most recent posts if nothing matches.
  return (matched.length ? matched : posts).slice(0, max);
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function IndustryPage({ params }: PageProps) {
  // Belt-and-braces: even if dynamicParams is bypassed somehow, 404.
  if (!isValidIndustrySlug(params.industry)) notFound();

  const industry = getIndustry(params.industry)!;

  // Service schema — signals page purpose to Google.
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: `${industry.name} Website Design & Lead Generation`,
    name: `Websites for ${industry.name} Businesses`,
    description: `High-converting ${industry.name.toLowerCase()} websites built, hosted, and managed by Macrolight Builder to generate consistent ${industry.clientsLabel.toLowerCase()}.`,
    provider: {
      "@type": "Organization",
      name: "Macrolight Builder",
      url: "https://macrolight-builder.com",
    },
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
    url: `https://macrolight-builder.com/${params.industry}`,
    offers: {
      "@type": "Offer",
      url: "https://macrolight-builder.com/pricing",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };

  // WebPage schema linking page to the parent Organization.
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${industry.name} Websites — Macrolight Builder`,
    url: `https://macrolight-builder.com/${params.industry}`,
    isPartOf: {
      "@type": "WebSite",
      name: "Macrolight Builder",
      url: "https://macrolight-builder.com",
    },
    about: {
      "@type": "Organization",
      name: "Macrolight Builder",
      url: "https://macrolight-builder.com",
    },
  };

  // Find the matching case study — slug parity for most industries.
  const caseStudy = caseStudies.find(
    (cs) => cs.sampleSiteHref === `/${params.industry}`
  );

  const relatedPosts = relatedPostsFor(industry);

  return (
    <>
      <JsonLd data={serviceSchema} />
      <JsonLd data={webPageSchema} />

      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-5xl px-5 sm:px-8 py-10 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-600">
            Macrolight Builder &middot; {industry.name}
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
            Websites That Get More {industry.clientsLabel} —{" "}
            <span className="text-violet-600">Built &amp; Managed for You.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base sm:text-lg text-gray-600 leading-relaxed">
            {industry.heroTagline} Below you&apos;ll see a full sample site
            we&apos;d build for a {industry.name.toLowerCase()} business —
            then exactly how the system turns visits into{" "}
            {industry.clientsLabel.toLowerCase()}.
          </p>

          {/* Primary CTAs + cross-links into case study / blog */}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            <Link
              href="/contact"
              className="inline-flex items-center rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-violet-700 transition-colors"
            >
              Request a free audit →
            </Link>
            <Link
              href="/pricing"
              className="font-semibold text-gray-700 hover:text-gray-900 transition-colors"
            >
              See pricing
            </Link>
            {caseStudy && (
              <Link
                href={`/case-studies/${caseStudy.slug}`}
                className="font-semibold text-violet-600 hover:text-violet-800 transition-colors"
              >
                See how we&apos;d build for {industry.name.toLowerCase()} →
              </Link>
            )}
          </div>

          {/* Related blog posts — small, contextual, crawlable */}
          {relatedPosts.length > 0 && (
            <div className="mt-8 border-t border-gray-100 pt-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                Related reading
              </p>
              <ul className="space-y-2">
                {relatedPosts.map((post) => (
                  <li key={post.slug}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-sm font-medium text-gray-700 hover:text-violet-600 transition-colors"
                    >
                      → {post.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </header>

      <section aria-label={`Sample ${industry.name} website preview`}>
        {/* The mockup lives at /sample/[industry] (noindex'd, blocked in
            robots.txt) so the fake business names, reviews and addresses
            never get indexed against macrolight-builder.com. The iframe
            also resolves the duplicate-H1 issue: the showcase has its
            own H1 and now lives in a separate document. */}
        <IndustrySampleFrame industry={industry} slug={params.industry} />
      </section>
    </>
  );
}
