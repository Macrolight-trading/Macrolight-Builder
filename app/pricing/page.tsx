import type { Metadata } from "next";
import Section from "@/components/Section";
import PricingCard from "@/components/PricingCard";
import CTASection from "@/components/CTASection";
import Card from "@/components/Card";
import { pricingTiers } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Transparent pricing for Macrolight Builders client acquisition systems. Starter, Growth, and Pro tiers — one build fee plus a monthly subscription.",
};

const faqs = [
  {
    q: "Is there a long-term contract?",
    a: "No. Your monthly plan is month-to-month. Cancel anytime after the first 90 days.",
  },
  {
    q: "What's included in 'unlimited edits'?",
    a: "Copy changes, image swaps, seasonal offers, new service pages — as many requests as you want, completed within 48 hours on average.",
  },
  {
    q: "Who owns the website?",
    a: "You do. If you ever leave, we hand over the full codebase and help you migrate hosting cleanly.",
  },
  {
    q: "How fast does a new site launch?",
    a: "Most Starter and Growth sites launch within 21 days of kickoff. Pro sites typically launch within 30 days.",
  },
];

export default function PricingPage() {
  return (
    <>
      <section className="relative overflow-hidden pt-20 pb-10 sm:pt-28">
        <div
          className="absolute inset-0 grid-bg pointer-events-none"
          aria-hidden
        />
        <div
          className="orb bg-violet-600 h-80 w-80 -top-20 -left-20"
          aria-hidden
        />
        <div
          className="orb bg-cyan-500 h-80 w-80 top-10 -right-20"
          aria-hidden
        />

        <div className="relative mx-auto max-w-4xl px-5 sm:px-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400 animate-fade-in">
            Pricing
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.05] animate-fade-in-up">
            Simple pricing. <span className="gradient-text">Serious ROI.</span>
          </h1>
          <p className="mt-5 text-lg text-white/70 max-w-2xl mx-auto animate-fade-in-up">
            One build fee. One monthly subscription. Everything included. No
            annual contracts, no surprise invoices.
          </p>
        </div>
      </section>

      <Section padding="md" className="border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {pricingTiers.map((tier) => (
            <PricingCard key={tier.name} tier={tier} />
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-white/50">
          All plans include hosting on Vercel, SSL, automatic backups, and
          ongoing security updates.
        </p>
      </Section>

      <Section padding="xl" className="border-t border-white/5">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Frequently asked questions
          </h2>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {faqs.map((f) => (
            <Card key={f.q} hover={false}>
              <h3 className="text-base font-semibold text-white">{f.q}</h3>
              <p className="mt-2 text-sm text-white/70 leading-relaxed">
                {f.a}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <CTASection
        eyebrow="Still deciding?"
        headline="Let us audit your site first — free."
        subhead="Get a no-obligation conversion audit. We'll show you exactly what's leaking leads before you spend a dollar."
      />
    </>
  );
}
