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

      <div className="mb-10 max-w-2xl">
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

      {/* ── Industries strip ──
          Adds visual color to an otherwise text-only section. Each pill
          uses the industry's signature emoji + a brand-tinted background
          so the row scans as a quick "who this is for" anchor before the
          visitor reads price numbers. */}
      <div className="mb-10 flex flex-wrap gap-2 items-center">
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gray-400 mr-1">
          Built for:
        </span>
        {[
          { label: "Restaurants", emoji: "🍽️" },
          { label: "Roofing", emoji: "🏠" },
          { label: "HVAC", emoji: "🔧" },
          { label: "Law firms", emoji: "⚖️" },
          { label: "Dental", emoji: "🦷" },
          { label: "Lawn care", emoji: "🌿" },
        ].map(({ label, emoji }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm"
          >
            <span aria-hidden>{emoji}</span>
            {label}
          </span>
        ))}
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
