"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import Magnetic from "@/components/motion/Magnetic";
import { DUR, EASE } from "@/components/motion/tokens";
import { ACCENT } from "@/components/theme/tokens";
import { pricingTiers } from "@/lib/pricing";

/**
 * V2 /pricing page — premium minimal, motion-aware.
 *
 * Sections:
 *   1. Hero (eyebrow + display headline + subhead, gradient backdrop)
 *   2. Three pricing tiers, Growth tier highlighted, lift on hover
 *   3. "Everything included" footnote
 *   4. FAQ accordion
 *   5. Final CTA bookend
 */

const FAQS = [
  {
    q: "Is there a long-term contract?",
    a: "No. Monthly plans are month-to-month. Cancel any month with 30 days notice. No annual contracts, no cancellation fees.",
  },
  {
    q: "What's included in 'unlimited edits'?",
    a: "Copy changes, image swaps, seasonal offers, new service pages — as many requests as you want, turned around in 48 hours on average.",
  },
  {
    q: "Who owns the website?",
    a: "You do, fully. Domain, design, source code — all yours. If you ever leave, we hand it over clean. No migration fee, no platform lock-in.",
  },
  {
    q: "How fast does a new site launch?",
    a: "Most Starter and Growth sites launch within 21 days of kickoff. Pro sites typically launch within 30 days. Faster is possible for smaller scopes.",
  },
  {
    q: "What's the difference between Growth and Pro?",
    a: "Growth handles most local businesses: 5-8 pages, lead capture, CRM integration, monthly reporting. Pro adds unlimited pages, AI chatbot, A/B testing, and a dedicated strategist — built for businesses where the website IS the sales channel.",
  },
  {
    q: "Are there setup fees beyond the build fee?",
    a: "No hidden setup fees. The build fee covers design, copywriting, integrations, and launch. Standard domain registration is included; premium domains (.io, .ai, short TLDs) may carry their registrar fee at cost.",
  },
];

export default function NewPricingPage() {
  return (
    <main>
      <PricingHero />
      <PricingTiers />
      <PricingFAQ />
      <PricingFinalCTA />
    </main>
  );
}

/* ─── Hero ────────────────────────────────────────────────────────── */
function PricingHero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);

  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden bg-stone-50 pt-20 sm:pt-28 pb-16 sm:pb-20"
    >
      {!reduce && (
        <motion.div
          aria-hidden
          style={{ y: bgY }}
          className="absolute inset-0 -z-10 pointer-events-none"
        >
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(60% 60% at 50% 30%, ${ACCENT}22 0%, transparent 65%)`,
            }}
          />
        </motion.div>
      )}

      <div className="mx-auto max-w-4xl px-5 sm:px-8 text-center">
        <Reveal>
          <p className="text-[0.65rem] sm:text-xs font-medium uppercase tracking-[0.22em] text-stone-500 mb-5 sm:mb-7">
            Pricing · no annual contracts
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1
            className="font-display font-semibold text-stone-900 leading-[1.02] tracking-tight text-balance"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
          >
            One build fee.
            <br />
            One monthly. <em className="text-stone-300">Everything in.</em>
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-7 sm:mt-9 text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl mx-auto">
            Pay once to build it. Pay monthly to host, monitor, and keep it
            fresh. Cancel any month with 30 days notice — you keep the site,
            the code, and the domain.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Tier cards ──────────────────────────────────────────────────── */
function PricingTiers() {
  return (
    <section className="bg-white py-16 sm:py-20 border-y border-stone-200/60">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Stagger
          className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6"
          delayChildren={0.1}
        >
          {pricingTiers.map((tier) => (
            <StaggerItem key={tier.name}>
              <TierCard tier={tier} />
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.4} className="mt-10 text-center">
          <p className="text-sm text-stone-500 leading-relaxed">
            All plans include Vercel edge hosting, SSL, automatic backups, and
            ongoing security updates.
          </p>
          <p className="mt-2 text-xs text-stone-400 max-w-xl mx-auto leading-relaxed">
            Standard domain registration included. Premium domains (.io, .ai,
            short TLDs) carry their registrar fee at cost.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function TierCard({ tier }: { tier: (typeof pricingTiers)[number] }) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const highlighted = tier.highlighted === true;

  const lift = !reduce && highlighted && hover ? -8 : 0;

  return (
    <motion.div
      animate={{ y: lift }}
      transition={{ duration: DUR.fast, ease: EASE }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`relative h-full flex flex-col rounded-2xl bg-white p-6 sm:p-8 border ${
        highlighted
          ? "border-stone-900 shadow-md"
          : "border-stone-200 shadow-sm"
      }`}
    >
      {highlighted && (
        <span
          className="absolute -top-3 left-6 sm:left-8 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-900"
          style={{ background: ACCENT }}
        >
          {tier.badge ?? "Most popular"}
        </span>
      )}

      <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">
        {tier.name}
      </p>
      <p className="mt-2 text-sm text-stone-600 leading-relaxed min-h-[3em]">
        {tier.tagline}
      </p>

      <div className="mt-7 flex items-baseline gap-2">
        <span className="font-display text-4xl sm:text-5xl font-semibold text-stone-900 tabular-nums">
          ${tier.buildFee.toLocaleString()}
        </span>
        <span className="text-sm text-stone-500">build fee</span>
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-display text-xl font-semibold text-stone-900 tabular-nums">
          ${tier.monthlyFee}
        </span>
        <span className="text-sm text-stone-500">/ month</span>
      </div>

      <ul className="mt-7 space-y-3 flex-1">
        {tier.features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-3 text-sm text-stone-700"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="h-4 w-4 flex-shrink-0 mt-0.5 text-stone-900"
              aria-hidden
            >
              <path
                d="M4 10l4 4 8-8"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {f}
          </li>
        ))}
      </ul>

      <Link
        href={tier.ctaHref}
        className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors whitespace-nowrap ${
          highlighted
            ? "bg-stone-900 text-stone-50 hover:bg-stone-800"
            : "border border-stone-300 text-stone-900 hover:bg-stone-100"
        }`}
      >
        {tier.ctaLabel}
        <span aria-hidden>→</span>
      </Link>
    </motion.div>
  );
}

/* ─── FAQ ─────────────────────────────────────────────────────────── */
function PricingFAQ() {
  return (
    <section className="bg-stone-50 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <Reveal>
          <p className="text-[0.65rem] sm:text-xs font-medium uppercase tracking-[0.22em] text-stone-500 mb-4 sm:mb-5 text-center">
            Common pricing questions
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2
            className="font-display font-semibold text-stone-900 leading-[1.05] tracking-tight text-center"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.9rem)" }}
          >
            What you&rsquo;re actually paying for.
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-10 sm:mt-14 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {FAQS.map((f) => (
              <div
                key={f.q}
                className="rounded-2xl border border-stone-200 bg-white p-6"
              >
                <h3 className="font-display text-lg font-semibold text-stone-900 leading-tight">
                  {f.q}
                </h3>
                <p className="mt-3 text-sm text-stone-500 leading-relaxed">
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Final CTA ───────────────────────────────────────────────────── */
function PricingFinalCTA() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-10%", "20%"]);

  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden bg-stone-50 py-24 sm:py-32 border-t border-stone-200/60"
    >
      {!reduce && (
        <motion.div
          aria-hidden
          style={{ y: bgY }}
          className="absolute inset-0 -z-10 pointer-events-none"
        >
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(50% 50% at 50% 65%, ${ACCENT}26 0%, transparent 65%)`,
            }}
          />
        </motion.div>
      )}

      <div className="mx-auto max-w-3xl px-5 sm:px-8 text-center">
        <Reveal>
          <p className="text-[0.65rem] sm:text-xs font-medium uppercase tracking-[0.22em] text-stone-500 mb-5 sm:mb-7">
            Not sure which fits?
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2
            className="font-display font-semibold text-stone-900 leading-[1.05] tracking-tight text-balance"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            Book a <em>free</em> 15-min audit call.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-6 sm:mt-8 text-[0.95rem] sm:text-lg text-stone-600 leading-relaxed max-w-xl mx-auto">
            We&rsquo;ll screen-share your current site, run a 20-point audit
            live, and recommend the plan that actually fits — not the most
            expensive one. No pitch, no contract.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="mt-10 sm:mt-12">
          <Magnetic strength={0.25}>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-7 sm:px-8 py-3.5 sm:py-4 text-sm font-semibold text-stone-50 shadow-sm hover:bg-stone-800 transition-colors whitespace-nowrap"
            >
              Grab a time on our calendar
              <span aria-hidden>→</span>
            </Link>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  );
}
