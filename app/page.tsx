import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import SamplePreviews from "@/components/SamplePreviews";
import PricingPreview from "@/components/PricingPreview";
import CTASection from "@/components/CTASection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <SamplePreviews />
      <PricingPreview />
      <CTASection />
    </>
  );
}
