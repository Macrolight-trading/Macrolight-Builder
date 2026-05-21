"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { DUR, EASE } from "@/components/motion/tokens";

/**
 * Two-card pricing teaser. Compact view — full comparison lives at
 * /pricing. The "Growth" card is the recommended tier; it lifts on
 * hover (only this card lifts, not both, so the recommendation reads).
 */

const ACCENT = "#C8A24B";

const TIERS = [
  {
    name: "Starter",
    tagline:
      "For businesses launching their first real website — or replacing a Wix.",
    buildFee: 1000,
    monthlyFee: 79,
    highlights: [
      "3–5 page conversion-focused site",
      "Edge hosting on Vercel — sub-second loads",
      "Click-to-call & lead capture form",
    ],
    cta: "Book a call about Starter",
    href: "/book?plan=starter",
    highlighted: false,
  },
  {
    name: "Growth",
    tagline:
      "For businesses ready to make the website their #1 sales channel.",
    buildFee: 1500,
    monthlyFee: 149,
    highlights: [
      "5–8 pages with conversion copywriting",
      "Lead capture wired into your CRM or inbox",
      "Analytics, A/B testing, monthly reporting",
      "Unlimited content edits · 48 hr turnaround",
    ],
    cta: "Book a call to get started",
    href: "/book?plan=growth",
    highlighted: true,
  },
] as const;

export default function PricingTeaser() {
  return (
    <section id="pricing" className="bg-stone-50 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <Reveal>
          <p className="text-[0.65rem] sm:text-xs font-medium uppercase tracking-[0.22em] text-stone-500 mb-4 sm:mb-5">
            Pricing · no annual contracts
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2
            className="font-display font-semibold text-stone-900 leading-[1.05] tracking-tight max-w-3xl"
            style={{ fontSize: "clamp(1.85rem, 4.5vw, 3.4rem)" }}
          >
            One build fee. One monthly. <em>Everything included.</em>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-4 sm:mt-5 text-[0.95rem] sm:text-base text-stone-500 leading-relaxed max-w-xl">
            Pay once to build it. Pay monthly to host, monitor, and keep it
            fresh. Cancel any month with 30 days notice — and you keep the
            site, the code, and the domain.
          </p>
        </Reveal>

        <Stagger
          className="mt-10 sm:mt-14 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
          delayChildren={0.15}
        >
          {TIERS.map((tier) => (
            <StaggerItem key={tier.name}>
              <TierCard tier={tier} />
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.25} className="mt-10 text-center">
          <Link
            href="/pricing"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-stone-700 hover:text-stone-900"
          >
            See full pricing comparison
            <span
              aria-hidden
              className="inline-block transition-transform group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

function TierCard({ tier }: { tier: (typeof TIERS)[number] }) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);

  // Only the recommended tier lifts on hover.
  const lift = !reduce && tier.highlighted && hover ? -6 : 0;

  return (
    <motion.div
      animate={{ y: lift }}
      transition={{ duration: DUR.fast, ease: EASE }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`relative rounded-2xl bg-white p-6 sm:p-8 border ${
        tier.highlighted
          ? "border-stone-900 shadow-md"
          : "border-stone-200 shadow-sm"
      }`}
    >
      {tier.highlighted && (
        <span
          className="absolute -top-3 left-6 sm:left-8 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-900"
          style={{ background: ACCENT }}
        >
          Most popular
        </span>
      )}

      <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">
        {tier.name}
      </p>
      <p className="mt-2 text-sm text-stone-600 leading-relaxed">
        {tier.tagline}
      </p>

      <div className="mt-7 flex items-baseline gap-2">
        <span className="font-display text-4xl font-semibold text-stone-900 tabular-nums">
          ${tier.buildFee.toLocaleString()}
        </span>
        <span className="text-sm text-stone-500">build</span>
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-display text-xl font-semibold text-stone-900 tabular-nums">
          ${tier.monthlyFee}
        </span>
        <span className="text-sm text-stone-500">/ month</span>
      </div>

      <ul className="mt-7 space-y-3">
        {tier.highlights.map((h) => (
          <li key={h} className="flex items-start gap-3 text-sm text-stone-700">
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="h-4 w-4 flex-shrink-0 mt-0.5"
              aria-hidden
            >
              <path
                d="M4 10l4 4 8-8"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-stone-900"
              />
            </svg>
            {h}
          </li>
        ))}
      </ul>

      <Link
        href={tier.href}
        className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors ${
          tier.highlighted
            ? "bg-stone-900 text-stone-50 hover:bg-stone-800"
            : "border border-stone-300 text-stone-900 hover:bg-stone-100"
        }`}
      >
        {tier.cta}
      </Link>
    </motion.div>
  );
}
