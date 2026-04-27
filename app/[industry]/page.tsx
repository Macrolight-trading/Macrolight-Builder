import type { Metadata } from "next";
import {
  getIndustry,
  industrySlugs,
  type IndustryProfile,
} from "@/lib/industries";
import RoofingShowcase from "@/components/industries/RoofingShowcase";
import RestaurantsShowcase from "@/components/industries/RestaurantsShowcase";
import LawFirmsShowcase from "@/components/industries/LawFirmsShowcase";
import HVACShowcase from "@/components/industries/HVACShowcase";
import DentistsShowcase from "@/components/industries/DentistsShowcase";
import LawnShowcase from "@/components/industries/LawnShowcase";
import GenericIndustryShowcase from "@/components/industries/GenericIndustryShowcase";
import IndustryPreviewFrame from "@/components/industries/IndustryPreviewFrame";

interface PageProps {
  params: { industry: string };
}

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

export function generateMetadata({ params }: PageProps): Metadata {
  const industry = getIndustry(params.industry);
  return {
    title: `Websites That Get More ${industry.clientsLabel}`,
    description: `${industry.heroTagline} Macrolight Builders installs a full client acquisition system for ${industry.name.toLowerCase()} businesses.`,
    alternates: { canonical: `/${params.industry}` },
    openGraph: {
      title: `${industry.name} Websites — Macrolight Builders`,
      description: `${industry.heroTagline} See how our client acquisition system works for ${industry.name.toLowerCase()} businesses.`,
      url: `https://macrolightbuilders.com/${params.industry}`,
    },
  };
}

export default function IndustryPage({ params }: PageProps) {
  const industry = getIndustry(params.industry);
  const Showcase =
    showcases[params.industry.toLowerCase()] ?? GenericIndustryShowcase;
  return (
    <IndustryPreviewFrame industry={industry}>
      <Showcase industry={industry} />
    </IndustryPreviewFrame>
  );
}
