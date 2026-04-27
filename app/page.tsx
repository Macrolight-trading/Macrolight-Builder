import Hero from "@/components/Hero";
import Features from "@/components/Features";
import SocialProofBand from "@/components/SocialProofBand";
import HowItWorks from "@/components/HowItWorks";
import SamplePreviews from "@/components/SamplePreviews";
import PricingPreview from "@/components/PricingPreview";
import CTASection from "@/components/CTASection";
import JsonLd from "@/components/JsonLd";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Macrolight Builders",
  url: "https://macrolightbuilders.com",
  logo: "https://macrolightbuilders.com/logo.png",
  description:
    "We build, host, and manage high-converting websites that turn visitors into paying customers for local businesses.",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    url: "https://macrolightbuilders.com/contact",
  },
  sameAs: [],
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Macrolight Builders",
  url: "https://macrolightbuilders.com",
  description:
    "Client acquisition websites for local businesses — built, hosted, and managed so your phone rings more every month.",
  priceRange: "$$",
  areaServed: {
    "@type": "Country",
    name: "United States",
  },
  serviceType: [
    "Web Design",
    "Web Development",
    "SEO",
    "Lead Generation",
    "CRM Integration",
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "127",
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={organizationSchema} />
      <JsonLd data={localBusinessSchema} />
      <Hero />
      <SamplePreviews />
      <SocialProofBand />
      <HowItWorks />
      <Features />
      <PricingPreview />
      <CTASection />
    </>
  );
}
