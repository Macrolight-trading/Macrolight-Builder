"use client";

import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { useRef } from "react";
import Reveal from "../motion/Reveal";
import { Stagger, StaggerItem } from "../motion/Stagger";

/**
 * Outcomes / proof band — the page's emotional center.
 *
 * Opens with a period-triplet header ("Built. Launched. Grown.") in the
 * FlowNinja headline tradition — terse, rhythmic, action-verb pattern
 * that telegraphs the entire offer in three words. Then the founder
 * quote + metric tiles do the heavier lifting.
 *
 * Photographic backdrop (subtly drifting + scaling on scroll) gives
 * the dark band visual texture without competing with the typography.
 */

const TILES = [
  { value: "20-point", label: "Audit · free · 24 hours" },
  { value: "21 days", label: "Kickoff → live site" },
  { value: "Sub-second", label: "Page loads, edge-hosted" },
  { value: "48 hours", label: "Turnaround on monthly edits" },
];

export default function Outcomes() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.08, 1]);

  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden bg-stone-900 text-stone-50"
    >
      {/* Photographic backdrop — heavily masked for legibility. */}
      <motion.div
        aria-hidden
        style={reduce ? undefined : { y: bgY, scale: bgScale }}
        className="absolute inset-0 -z-10"
      >
        <Image
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=60&fit=crop"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-stone-900/95 via-stone-900/90 to-stone-800/85"
        />
      </motion.div>

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8 py-20 sm:py-28">
        {/* Period-triplet header — FlowNinja-style rhythmic opener */}
        <Reveal>
          <p className="text-[0.65rem] sm:text-xs font-medium uppercase tracking-[0.22em] text-stone-400 mb-5 sm:mb-7">
            From the founders
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2
            className="font-display font-semibold text-stone-50 leading-[1.05] tracking-tight mb-10 sm:mb-14"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.6rem)" }}
          >
            Built. Launched. <em className="text-stone-300">Grown.</em>
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 sm:gap-14 lg:gap-16 items-start">
          {/* Quote — 3/5 on desktop */}
          <div className="lg:col-span-3">
            <Reveal delay={0.1}>
              <blockquote
                className="font-display italic text-stone-50 leading-[1.18] tracking-tight"
                style={{ fontSize: "clamp(1.5rem, 3vw, 2.3rem)" }}
              >
                &ldquo;We built Macrolight because we kept watching great local
                businesses lose customers to worse competitors with better
                websites. We&rsquo;re here to fix that.&rdquo;
              </blockquote>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-7 sm:mt-8 flex items-center gap-4">
                <div className="flex -space-x-2">
                  <div className="h-11 w-11 rounded-full bg-stone-700 ring-2 ring-stone-900 flex items-center justify-center text-xs font-semibold text-stone-100">
                    BB
                  </div>
                  <div className="h-11 w-11 rounded-full bg-stone-600 ring-2 ring-stone-900 flex items-center justify-center text-xs font-semibold text-stone-100">
                    NO
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-100">
                    Bradley Bayley &amp; Nick Ottoy
                  </p>
                  <p className="text-xs text-stone-400">
                    Co-founders · Birmingham, MI
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Tiles — 2/5 on desktop */}
          <Stagger
            className="lg:col-span-2 grid grid-cols-2 gap-3"
            delayChildren={0.25}
          >
            {TILES.map((t) => (
              <StaggerItem
                key={t.label}
                className="rounded-2xl border border-stone-700/50 bg-stone-800/40 backdrop-blur-sm p-4 sm:p-5"
              >
                <p className="font-display text-xl sm:text-2xl font-semibold text-stone-50 leading-tight">
                  {t.value}
                </p>
                <p className="mt-1.5 sm:mt-2 text-[0.7rem] sm:text-xs text-stone-400 leading-relaxed">
                  {t.label}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
