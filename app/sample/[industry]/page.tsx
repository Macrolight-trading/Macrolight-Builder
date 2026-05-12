import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getIndustry,
  industrySlugs,
  isValidIndustrySlug,
  type IndustryProfile,
} from "@/lib/industries";
import RoofingShowcase from "@/components/industries/RoofingShowcase";
import RestaurantsShowcase from "@/components/industries/RestaurantsShowcase";
import LawFirmsShowcase from "@/components/industries/LawFirmsShowcase";
import HVACShowcase from "@/components/industries/HVACShowcase";
import DentistsShowcase from "@/components/industries/DentistsShowcase";
import LawnShowcase from "@/components/industries/LawnShowcase";
import RelatedIndustries from "@/components/industries/RelatedIndustries";

/**
 * /sample/[industry]
 *
 * Standalone, noindex'd render of the industry showcase mockup. This is
 * what the public /[industry] page iframes in. Two reasons it lives on
 * its own URL:
 *
 *   1. The mockups contain fake business names, reviews, addresses and
 *      pricing. We do NOT want any of that text indexed against
 *      macrolight-builder.com — it dilutes our actual rankings and
 *      looks spammy to Google. Putting it behind a `noindex` route
 *      keeps the agency-side /[industry] page clean while still
 *      letting visitors see the full sample.
 *   2. Iframing also fixes the duplicate-H1 problem: the showcase
 *      uses an H1 ("Welcome to Acme HVAC…"), and the agency page also
 *      has its own H1 ("Websites That Get More …"). Splitting them
 *      across two documents means each page has exactly one H1.
 *
 * Disallowed in robots.ts as a belt-and-braces measure too.
 */

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

export function generateStaticParams() {
  return industrySlugs.map((slug) => ({ industry: slug }));
}

export const dynamicParams = false;

export function generateMetadata({
  params,
}: {
  params: { industry: string };
}): Metadata {
  if (!isValidIndustrySlug(params.industry)) return { robots: { index: false } };
  const industry = getIndustry(params.industry)!;
  return {
    title: `${industry.name} sample site`,
    // The whole point of this route is that it's not in any index.
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
    // Don't let it get linked to as the canonical version of anything.
    alternates: { canonical: `/sample/${params.industry}` },
  };
}

export default function SampleIndustryPage({
  params,
}: {
  params: { industry: string };
}) {
  if (!isValidIndustrySlug(params.industry)) notFound();

  const industry = getIndustry(params.industry)!;
  const Showcase = showcases[params.industry.toLowerCase()];
  if (!Showcase) notFound();

  return (
    <div className="industry-site-light text-zinc-900 antialiased">
      <Showcase industry={industry} />
      <RelatedIndustries current={industry} />
    </div>
  );
}
