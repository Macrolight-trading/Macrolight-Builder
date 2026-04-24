import type { PricingTier } from "@/components/PricingCard";

export const pricingTiers: PricingTier[] = [
  {
    name: "Starter",
    tagline: "A clean, conversion-ready launch for new local businesses.",
    buildFee: 500,
    monthlyFee: 79,
    ctaLabel: "Start with Starter",
    ctaHref: "/contact?plan=starter",
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
    buildFee: 1000,
    monthlyFee: 149,
    highlighted: true,
    badge: "Most Popular",
    ctaLabel: "Install the Growth System",
    ctaHref: "/contact?plan=growth",
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
    buildFee: 2500,
    monthlyFee: 249,
    ctaLabel: "Scale with Pro",
    ctaHref: "/contact?plan=pro",
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
