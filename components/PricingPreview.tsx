import Link from "next/link";
import TabbedPricing from "./TabbedPricing";
import Section from "./Section";
import SectionHeader from "./SectionHeader";
import { pricingTiers } from "@/lib/pricing";

export default function PricingPreview() {
  return (
    <Section id="pricing" padding="xl" className="bg-gray-50 border-t border-gray-100">
      <SectionHeader
        eyebrow="Pricing"
        meta="No hidden fees · No annual contracts"
        accent="amber"
      />

      <div className="mb-12 max-w-2xl">
        <h2
          className="font-display font-bold tracking-tight text-gray-900 leading-[1.1]"
          style={{ fontSize: "clamp(1.8rem, 4vw, 3.2rem)" }}
        >
          Transparent pricing.<br />
          <em className="not-italic text-violet-600">Predictable results.</em>
        </h2>
        <p className="mt-4 text-base text-gray-500 leading-relaxed">
          One build fee. One monthly subscription. Everything included.
        </p>
      </div>

      <TabbedPricing tiers={pricingTiers} />

      <p className="mt-8 text-center sm:text-left text-xs text-gray-400 max-w-xl">
        Standard domain registration is included. Premium domains — short,
        branded, or specialty TLDs (.io, .ai, .co, etc.) — may carry an
        additional one-time or annual fee at cost.
      </p>

      <div className="mt-6 flex justify-center sm:justify-start">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-800 transition-colors"
        >
          Compare all features →
        </Link>
      </div>
    </Section>
  );
}
