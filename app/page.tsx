import Hero from "@/components/Hero";
import Features from "@/components/Features";
import SocialProofBand from "@/components/SocialProofBand";
import HowItWorks from "@/components/HowItWorks";
import SamplePreviews from "@/components/SamplePreviews";
import PricingPreview from "@/components/PricingPreview";
import CTASection from "@/components/CTASection";

export default function HomePage() {
  return (
    <>
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
