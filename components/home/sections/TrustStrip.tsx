"use client";

import { Stagger, StaggerItem } from "../motion/Stagger";
import Reveal from "../motion/Reveal";
import CountUp from "./CountUp";

/**
 * Trust strip — three confident metrics framed as customer OUTCOMES,
 * not vendor capabilities (FlowNinja pattern, §6 of design notes).
 *
 * Each row reads as:
 *   [Big number]
 *   [Bold outcome label — what the customer gets]
 *   [One-line explanation tying the number to their situation]
 *
 * Counted-up numerals; staggered reveal. Static row, no carousel.
 */

const METRICS: {
  value: number;
  suffix: string;
  outcome: string;
  detail: string;
}[] = [
  {
    value: 21,
    suffix: " days",
    outcome: "From kickoff to live site.",
    detail:
      "Your campaign launches in three weeks, not six months. We move at startup speed without skipping the conversion work.",
  },
  {
    value: 24,
    suffix: " hr",
    outcome: "Audit, in your inbox.",
    detail:
      "A written 20-point review of your current site — speed, conversion, mobile, lead flow. No commitment, no sales pitch.",
  },
  {
    value: 48,
    suffix: " hr",
    outcome: "Edits turned around.",
    detail:
      "Unlimited content requests once you launch. Submit it Monday, it's live Wednesday. Your site stays current.",
  },
];

export default function TrustStrip() {
  return (
    <section className="bg-white border-y border-stone-200/70">
      <div className="mx-auto max-w-5xl px-5 sm:px-8 py-14 sm:py-20">
        <Reveal>
          <p className="text-[0.65rem] sm:text-xs font-medium uppercase tracking-[0.22em] text-stone-500 mb-8 sm:mb-10 text-center md:text-left">
            What you can count on · in numbers
          </p>
        </Reveal>
        <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {METRICS.map((m) => (
            <StaggerItem
              key={m.outcome}
              className="text-center md:text-left md:border-l md:border-stone-200 md:pl-8 md:first:border-l-0 md:first:pl-0"
            >
              <div className="font-display text-5xl sm:text-6xl font-semibold tracking-tight text-stone-900 leading-none tabular-nums">
                <CountUp to={m.value} />
                <span>{m.suffix}</span>
              </div>
              <p className="mt-4 text-sm sm:text-base font-medium text-stone-900 leading-snug">
                {m.outcome}
              </p>
              <p className="mt-2 text-[0.8rem] sm:text-sm text-stone-500 leading-relaxed max-w-[28ch] mx-auto md:mx-0">
                {m.detail}
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
