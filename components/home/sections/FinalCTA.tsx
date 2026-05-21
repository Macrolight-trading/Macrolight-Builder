"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { DUR, EASE } from "@/components/motion/tokens";
import Reveal from "@/components/motion/Reveal";
import Magnetic from "@/components/motion/Magnetic";

/**
 * Final CTA. Bookends the hero — same warm radial gradient (drifting the
 * opposite direction), same serif treatment, same magnetic primary
 * button. Closes the loop visually so the page feels intentional rather
 * than a stack of unrelated sections.
 */

const ACCENT = "#C8A24B";

export default function FinalCTA() {
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
      className="relative isolate overflow-hidden bg-stone-50 py-24 sm:py-36"
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
            Ready when you are · booking calls this week
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2
            className="font-display font-semibold text-stone-900 leading-[1.05] tracking-tight text-balance"
            style={{ fontSize: "clamp(2rem, 5.5vw, 4.4rem)" }}
          >
            Book your <em>free</em> 15-minute audit call.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-6 sm:mt-8 text-[0.95rem] sm:text-lg text-stone-600 leading-relaxed max-w-xl mx-auto">
            Hop on with a founder. We&rsquo;ll screen-share your site, run our
            20-point audit live, and show you the three biggest leaks costing
            you customers. No pitch, no contract — and if we&rsquo;re not a
            fit, we&rsquo;ll tell you who is.
          </p>
        </Reveal>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px -15% 0px" }}
          transition={{ duration: DUR.base, ease: EASE, delay: 0.15 }}
          className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
        >
          <Magnetic strength={0.25}>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-7 sm:px-8 py-3.5 sm:py-4 text-sm font-semibold text-stone-50 shadow-sm hover:bg-stone-800 transition-colors whitespace-nowrap"
            >
              Grab a time on our calendar
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
            </Link>
          </Magnetic>
          <Link
            href="/pricing"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-stone-700 hover:text-stone-900 transition-colors"
          >
            See pricing
            <span
              aria-hidden
              className="inline-block transition-transform group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
        </motion.div>

        <Reveal delay={0.25}>
          <p className="mt-8 sm:mt-10 text-[0.65rem] sm:text-xs uppercase tracking-[0.18em] text-stone-400">
            15 minutes · No commitment · We&rsquo;ll tell you straight
          </p>
        </Reveal>
      </div>
    </section>
  );
}
