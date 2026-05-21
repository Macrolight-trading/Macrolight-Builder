import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import Section from "@/components/Section";
import TabbedPricing from "@/components/TabbedPricing";
import CTASection from "@/components/CTASection";
import JsonLd from "@/components/JsonLd";
import { pricingTiers } from "@/lib/pricing";
import { authOptions } from "@/lib/auth";
import { getUserSubscriptionState } from "@/lib/plan-selection";
import NewPricingPage from "@/components/pricing/NewPricingPage";

/**
 * Runtime feature flag for the /pricing redesign — mirrors the home
 * page pattern in app/page.tsx. Flip to `false` to instantly revert
 * to the original design.
 */
const USE_NEW_PRICING = true;

// /pricing CTAs change based on whether the visitor is logged in and
// whether they already have an active subscription, so the page can't
// be statically pre-rendered. The metadata above still applies.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Website Pricing for Local Businesses",
  description:
    "Transparent pricing for Macrolight Builder client acquisition systems. Starter, Growth, and Pro tiers — one build fee plus a monthly subscription.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing — Macrolight Builder",
    description:
      "One build fee. One monthly subscription. Everything included to turn your website into a lead machine.",
    url: "https://macrolight-builder.com/pricing",
    type: "website",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Macrolight Builder pricing — websites that generate leads",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing — Macrolight Builder",
    description:
      "One build fee. One monthly subscription. Everything included to turn your website into a lead machine.",
    images: ["/og-default.png"],
  },
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

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.a,
    },
  })),
};

export default async function PricingPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const subState = userId ? await getUserSubscriptionState(userId) : null;
  const currentBasePlan = subState?.basePlan ?? null;

  // FAQ JSON-LD applies to both versions of the page.
  if (USE_NEW_PRICING) {
    return (
      <>
        <JsonLd data={faqSchema} />
        <NewPricingPage />
      </>
    );
  }

  // Legacy design preserved verbatim behind the flag.
  return (
    <>
      <JsonLd data={faqSchema} />
      <section className="relative overflow-hidden bg-gray-50 border-b border-gray-200 pt-20 pb-14 sm:pt-28">
        <div className="absolute inset-0 dot-bg pointer-events-none" aria-hidden />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-violet-100 opacity-60 blur-3xl pointer-events-none" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-5 sm:px-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-600 animate-fade-in">
            Pricing
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.05] animate-fade-in-up">
            Simple pricing. <span className="gradient-text">Serious ROI.</span>
          </h1>
          <p className="mt-5 text-lg text-gray-500 max-w-2xl mx-auto animate-fade-in-up">
            One build fee. One monthly subscription. Everything included. No
            annual contracts, no surprise invoices.
          </p>
        </div>
      </section>

      <Section padding="lg" className="bg-white">
        <TabbedPricing tiers={pricingTiers} currentBasePlan={currentBasePlan} />
        <p className="mt-10 text-center text-sm text-gray-400">
          All plans include hosting on Vercel, SSL, automatic backups, and
          ongoing security updates.
        </p>
        <p className="mt-2 text-center text-xs text-gray-400 max-w-xl mx-auto">
          Standard domain registration is included. Premium domains may carry
          an additional one-time or annual fee at cost.
        </p>
      </Section>

      <Section padding="xl" className="bg-gray-50 border-t border-gray-100">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            Frequently asked questions
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {faqs.map((f) => (
            <div
              key={f.q}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
            >
              <h3 className="font-semibold text-gray-900 mb-2">{f.q}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </Section>

      <CTASection />
    </>
  );
}
