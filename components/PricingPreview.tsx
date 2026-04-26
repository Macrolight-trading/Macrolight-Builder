import Link from "next/link";
import PricingCard from "./PricingCard";
import Section from "./Section";
import { pricingTiers } from "@/lib/pricing";

export default function PricingPreview() {
  return (
    <Section id="pricing" padding="xl" className="bg-gray-50 border-t border-gray-100">
      <div className="flex items-center justify-between border-b border-gray-200 pb-5 mb-16">
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Pricing
        </span>
        <span className="text-xs text-gray-300 uppercase tracking-widest hidden sm:block">
          No hidden fees · No annual contracts
        </span>
      </div>

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

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {pricingTiers.map((tier) => (
          <PricingCard key={tier.name} tier={tier} />
        ))}
      </div>

      <div className="mt-10 flex justify-start">
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
