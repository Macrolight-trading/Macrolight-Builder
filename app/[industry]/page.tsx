import type { Metadata } from "next";
import React from "react";
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
import RoofingShowcase from "@/components/industries/RoofingShowcase";
import RestaurantsShowcase from "@/components/industries/RestaurantsShowcase";
import LawFirmsShowcase from "@/components/industries/LawFirmsShowcase";
import HVACShowcase from "@/components/industries/HVACShowcase";
import DentistsShowcase from "@/components/industries/DentistsShowcase";
import LawnShowcase from "@/components/industries/LawnShowcase";
import RelatedIndustries from "@/components/industries/RelatedIndustries";
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
/*  Showcase map — slug → showcase component                           */
/* ------------------------------------------------------------------ */

const showcases: Record<
  string,
  React.ComponentType<{ industry: IndustryProfile }>
> = {
  roofing: RoofingShowcase,
  restaurants: RestaurantsShowcase,
  "law-firms": LawFirmsShowcase,
  hvac: HVACShowcase,
  dentists: DentistsShowcase,
  "lawn-care": LawnShowcase,
};

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
  const Showcase = showcases[params.industry];
  if (!Showcase) notFound();

  return (
    <>
      <JsonLd data={serviceSchema} />
      <JsonLd data={webPageSchema} />

      {/* Visually-hidden H1 + cross-links — kept for SEO, accessibility,
          and crawlable internal links. The previous full marketing
          <header> sat between the Macrolight Navbar (from the layout)
          and the iframed showcase, reading as a second header on top
          of the page. Per UX feedback we removed it; the showcase
          itself now carries the visual hero. */}
      <div className="sr-only">
        <h1>
          Websites That Get More {industry.clientsLabel} — Built &amp;
          Managed for You.
        </h1>
        <p>
          {industry.heroTagline} Below is a sample site we&apos;d build
          for a {industry.name.toLowerCase()} business.
        </p>
        <Link href="/contact">Request a free audit</Link>
        <Link href="/pricing">See pricing</Link>
        {caseStudy && (
          <Link href={`/case-studies/${caseStudy.slug}`}>
            See how we&apos;d build for {industry.name.toLowerCase()}
          </Link>
        )}
        {relatedPosts.length > 0 && (
          <ul>
            {relatedPosts.map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <section aria-label={`Sample ${industry.name} website preview`}>
        <Showcase industry={industry} />
      </section>

      <RelatedIndustries current={industry} />
    </>
  );
}
