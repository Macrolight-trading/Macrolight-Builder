import type { PricingTier } from "@/components/PricingCard";

/**
 * Single source of truth for base plan pricing. The `name` is also the
 * uppercased Plan enum key (STARTER, GROWTH, PRO).
 *
 * `buildFee` and `monthlyFee` are in WHOLE DOLLARS — they're rendered
 * directly in marketing copy. The server-side Stripe checkout helper uses
 * `basePlanCents()` below to convert them to cents safely.
 */
export const pricingTiers: PricingTier[] = [
  {
    name: "Starter",
    tagline: "A clean, conversion-ready launch for new local businesses.",
    buildFee: 1000,
    monthlyFee: 79,
    ctaLabel: "Book a call about Starter",
    ctaHref: "/book?plan=starter",
    features: [
      "3–5 page conversion-focused website",
      "Fast hosting on Vercel",
      "Ongoing security & uptime monitoring",
      "Mobile-first responsive design",
      "Basic on-page SEO foundation",
      "Contact form & click-to-call",
    ],
  },
  {
    name: "Growth",
    tagline: "Everything you need to consistently generate qualified leads.",
    buildFee: 1500,
    monthlyFee: 149,
    highlighted: true,
    badge: "Most Popular",
    ctaLabel: "Book a call to get started",
    ctaHref: "/book?plan=growth",
    features: [
      "5–8 pages with conversion copywriting",
      "Built-in lead capture system",
      "Analytics & conversion tracking",
      "Monthly performance reporting",
      "Unlimited content edits",
      "Priority support & updates",
    ],
  },
  {
    name: "Pro",
    tagline: "The full client acquisition engine for established businesses.",
    buildFee: 2000,
    monthlyFee: 249,
    ctaLabel: "Book a call about Pro",
    ctaHref: "/book?plan=pro",
    features: [
      "Unlimited pages + advanced funnels",
      "AI chatbot integration",
      "CRM & automation integrations",
      "A/B testing & conversion optimization",
      "Dedicated strategist",
      "Priority 24/7 support",
    ],
  },
];

/** Plan enum key — must match prisma `Plan` (excluding NONE/CUSTOM). */
export type BasePlanKey = "STARTER" | "GROWTH" | "PRO";

export function isBasePlanKey(value: unknown): value is BasePlanKey {
  return value === "STARTER" || value === "GROWTH" || value === "PRO";
}

/**
 * Resolve a Plan enum key to its base plan pricing in cents. Returns null
 * for NONE/CUSTOM/unknown values. Use this on the server when building
 * Stripe line items so the prices the UI shows can't drift from the prices
 * the user is actually charged.
 */
export function basePlanCents(
  plan: string,
): { buildCents: number; monthlyCents: number; name: string } | null {
  const tier = pricingTiers.find(
    (t) => t.name.toUpperCase() === plan.toUpperCase(),
  );
  if (!tier) return null;
  return {
    name: tier.name,
    // dollars -> cents, guarding against float drift.
    buildCents: Math.round(tier.buildFee * 100),
    monthlyCents: Math.round(tier.monthlyFee * 100),
  };
}
