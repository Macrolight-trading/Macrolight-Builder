"use client";

import { useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { useRef } from "react";
import Reveal from "../motion/Reveal";
import { DUR, EASE } from "../motion/tokens";

/**
 * Audit form repeat band — FlowNinja places the inline audit form in
 * at least four spots on the page (§3). This is our mid-late repeat:
 * a slim section between PricingTeaser and FAQ that re-engages the
 * visitor who scrolled past the hero form.
 *
 * Visually distinct from the hero — soft warm-tinted backdrop with a
 * subtle scroll drift, centered headline + form. Same form action so
 * both hero and band feed the same audit pipeline.
 */

const ACCENT = "#C8A24B";

export default function AuditFormBand() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [url, setUrl] = useState("");
  const [focused, setFocused] = useState(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden bg-stone-50 py-20 sm:py-28"
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
              background: `radial-gradient(50% 60% at 50% 50%, ${ACCENT}22 0%, transparent 65%)`,
            }}
          />
        </motion.div>
      )}

      <div className="mx-auto max-w-3xl px-5 sm:px-8 text-center">
        <Reveal>
          <p className="text-[0.65rem] sm:text-xs font-medium uppercase tracking-[0.22em] text-stone-500 mb-4 sm:mb-5">
            Still on the fence?
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2
            className="font-display font-semibold text-stone-900 leading-[1.05] tracking-tight"
            style={{ fontSize: "clamp(1.85rem, 4.5vw, 3.2rem)" }}
          >
            See where your site is losing customers.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-4 sm:mt-5 text-[0.95rem] sm:text-base text-stone-500 leading-relaxed max-w-xl mx-auto">
            Drop in your URL. We&rsquo;ll run our 20-point audit and email you a
            written report inside 24 hours. No commitment. No sales follow-up
            unless you ask.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <form
            action="/audit"
            method="GET"
            className="mt-8 sm:mt-10 max-w-xl mx-auto"
          >
            <div
              className={`flex flex-col sm:flex-row items-stretch rounded-2xl border bg-white shadow-sm transition-all ${
                focused ? "border-stone-900 shadow-md" : "border-stone-200"
              }`}
            >
              <label className="flex-1 flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 sm:py-3.5 min-w-0 text-left">
                <svg
                  aria-hidden
                  viewBox="0 0 20 20"
                  fill="none"
                  className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-stone-400 flex-shrink-0"
                >
                  <path
                    d="M3 10a7 7 0 1014 0 7 7 0 00-14 0zm0 0h14M10 3a13 13 0 010 14M10 3a13 13 0 000 14"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="sr-only">Your website URL</span>
                <input
                  type="text"
                  name="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="yourbusiness.com"
                  autoComplete="url"
                  inputMode="url"
                  className="flex-1 min-w-0 bg-transparent text-sm sm:text-base text-stone-900 placeholder:text-stone-400 focus:outline-none"
                />
              </label>
              <motion.button
                type="submit"
                whileHover={reduce ? undefined : { scale: 1.02 }}
                whileTap={reduce ? undefined : { scale: 0.98 }}
                transition={{ duration: DUR.fast, ease: EASE }}
                className="inline-flex items-center justify-center gap-2 rounded-b-2xl sm:rounded-l-none sm:rounded-r-2xl bg-stone-900 px-6 sm:px-7 py-3 sm:py-3.5 text-sm font-semibold text-stone-50 hover:bg-stone-800 whitespace-nowrap"
              >
                Scan my website
                <svg
                  aria-hidden
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.05 4.05a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L11.293 10 7.05 5.464a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.button>
            </div>
            <p className="mt-3 sm:mt-4 text-[0.7rem] sm:text-xs uppercase tracking-[0.18em] text-stone-400">
              Free · 24-hr turnaround · No sales follow-up unless you ask
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
