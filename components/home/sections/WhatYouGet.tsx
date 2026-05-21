"use client";

import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

/**
 * "What you get" outcome-stats grid — Macrolight's version of
 * FlowNinja's "What you get with the WebOps team" section (§6).
 *
 * Six stat blocks in a responsive grid. Each block is structured as:
 *   - Big number (or short phrase)
 *   - Bold outcome label (what the customer GETS)
 *   - One-line explanation in customer-outcome language
 *
 * The axes are intentionally different from TrustStrip (which covers
 * speed/turnaround): pricing transparency, ownership, hosting, lead
 * capture, mobile, contracts. So the two sections don't repeat.
 */

const STATS: { value: string; outcome: string; detail: string }[] = [
  {
    value: "$1,000",
    outcome: "Starter build fee.",
    detail:
      "Most agencies start at $5K-$15K. Our Starter plan covers a 3-5 page lead-engine site without making you finance it.",
  },
  {
    value: "100%",
    outcome: "Yours, forever.",
    detail:
      "You own the domain, the code, the design. No platform lock-in, no held-hostage assets. If you ever leave, we hand it over clean.",
  },
  {
    value: "Sub-second",
    outcome: "Page loads, always.",
    detail:
      "Edge-hosted on Vercel's global network. Your visitors never wait — and Google notices.",
  },
  {
    value: "Mobile-first",
    outcome: "Looks right everywhere.",
    detail:
      "Designed for the phone where 70% of local-business traffic lands, then scaled up to tablet and desktop.",
  },
  {
    value: "Built in",
    outcome: "Lead capture, wired up.",
    detail:
      "Forms, click-to-call, and CRM integration ship with every build. Leads go where you actually see them.",
  },
  {
    value: "Zero",
    outcome: "Long-term contracts.",
    detail:
      "Month-to-month, cancel any month with 30 days notice. We earn the relationship, we don't lock it in.",
  },
];

export default function WhatYouGet() {
  return (
    <section className="bg-stone-50 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="text-[0.65rem] sm:text-xs font-medium uppercase tracking-[0.22em] text-stone-500 mb-4 sm:mb-5">
            What&rsquo;s included
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2
            className="font-display font-semibold text-stone-900 leading-[1.05] tracking-tight max-w-3xl"
            style={{ fontSize: "clamp(1.85rem, 4.5vw, 3.4rem)" }}
          >
            Everything a local business actually needs.{" "}
            <em className="text-stone-400">Nothing it doesn&rsquo;t.</em>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-4 sm:mt-5 text-[0.95rem] sm:text-base text-stone-500 leading-relaxed max-w-xl">
            No enterprise features for an enterprise budget. We bundle what
            converts — and skip the parts that bloat the invoice without
            ringing the phone.
          </p>
        </Reveal>

        <Stagger
          className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 sm:gap-x-12 gap-y-10 sm:gap-y-14"
          delayChildren={0.15}
        >
          {STATS.map((s) => (
            <StaggerItem
              key={s.outcome}
              className="border-l border-stone-300/60 pl-5 sm:pl-6"
            >
              <p className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-tight text-stone-900 leading-none">
                {s.value}
              </p>
              <p className="mt-4 text-sm sm:text-base font-medium text-stone-900 leading-snug">
                {s.outcome}
              </p>
              <p className="mt-2 text-[0.8rem] sm:text-sm text-stone-500 leading-relaxed">
                {s.detail}
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
