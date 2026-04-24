import Button from "./Button";
import PricingCard from "./PricingCard";
import Section from "./Section";
import { pricingTiers } from "@/lib/pricing";

export default function PricingPreview() {
  return (
    <Section id="pricing" padding="xl" className="border-t border-white/5">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
          Pricing
        </p>
        <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
          Transparent pricing. Predictable results.
        </h2>
        <p className="mt-4 text-lg text-white/60">
          One build fee. One monthly subscription. Everything included — no
          hidden charges, no annual contracts.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {pricingTiers.map((tier) => (
          <PricingCard key={tier.name} tier={tier} />
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Button href="/pricing" variant="ghost" size="md">
          Compare all features
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
            aria-hidden
          >
            <path
              d="M5 12h14M13 5l7 7-7 7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
      </div>
    </Section>
  );
}
