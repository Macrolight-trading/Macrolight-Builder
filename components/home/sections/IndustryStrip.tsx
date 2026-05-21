"use client";

import { motion, useReducedMotion } from "motion/react";
import Reveal from "@/components/motion/Reveal";

/**
 * Industry breadth strip — Macrolight's replacement for FlowNinja's
 * "Trusted by 200+" logo wall (§4 of design notes).
 *
 * We don't claim a customer count yet, so instead we show *vertical*
 * breadth: the local-business industries we've built around. The
 * marquee scrolls slowly left-to-right (paused on hover) so the row
 * reads as continuous proof rather than a static list.
 *
 * Two copies of the pill list are rendered back-to-back so the loop
 * is seamless. The motion is pure CSS animation (no useScroll), which
 * is cheap and continues even when the section isn't in view.
 */

const INDUSTRIES = [
  "Restaurants",
  "HVAC",
  "Dental practices",
  "Law firms",
  "Lawn care",
  "Roofing",
  "Auto repair",
  "Med spas",
  "Real estate",
  "Plumbing",
  "Chiropractic",
  "Pest control",
];

const ACCENT = "#C8A24B";

export default function IndustryStrip() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-stone-50 border-y border-stone-200/60 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 mb-6 sm:mb-8 text-center">
        <Reveal>
          <p className="text-[0.7rem] sm:text-xs font-medium uppercase tracking-[0.22em] text-stone-500 inline-flex items-center gap-2 flex-wrap justify-center">
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: ACCENT }}
            />
            Built for the local businesses people actually call
          </p>
        </Reveal>
      </div>

      {/* Marquee — two copies of the pill list, infinite scroll.
          We render via inline keyframes so the animation lives entirely
          in CSS and doesn't tax the motion runtime. */}
      <style>{`
        @keyframes industry-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .industry-marquee-track {
          animation: industry-marquee 38s linear infinite;
        }
        .industry-marquee-track.paused {
          animation-play-state: paused;
        }
      `}</style>

      <div
        className="relative group [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
        aria-hidden={reduce ? undefined : true}
      >
        <div
          className={`flex w-max gap-3 sm:gap-4 ${
            reduce ? "" : "industry-marquee-track group-hover:paused"
          }`}
        >
          {/* Two copies for seamless loop */}
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className="flex gap-3 sm:gap-4 flex-shrink-0 pr-3 sm:pr-4"
            >
              {INDUSTRIES.map((industry) => (
                <span
                  key={`${copy}-${industry}`}
                  className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-stone-700 whitespace-nowrap shadow-sm"
                >
                  <span
                    aria-hidden
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ background: ACCENT }}
                  />
                  {industry}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Accessible version of the list — read by screen readers only */}
      <ul className="sr-only">
        {INDUSTRIES.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </section>
  );
}
