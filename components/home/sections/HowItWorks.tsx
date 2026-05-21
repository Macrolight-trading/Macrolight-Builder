"use client";

import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { useRef } from "react";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { DUR, EASE } from "@/components/motion/tokens";

/**
 * Three-step process with photo, copy, and a scroll-drawn connecting
 * line between step circles on desktop.
 *
 * Motion budget:
 *   - Section header reveals fade-up.
 *   - Step cards stagger in from below.
 *   - Connector line draws in left-to-right as section scrolls.
 *   - Each photo holds a slow "Ken Burns" zoom while it's on screen.
 *
 * Mobile: cards stack vertically, connector is hidden (the numbered
 * circles carry the sequence).
 */

const STEPS = [
  {
    num: "01",
    title: "We audit your current site",
    detail:
      "A 20-point review of speed, conversion architecture, mobile UX, copy, and lead flow. You get a written report — not a sales pitch.",
    meta: "Free · Delivered in 24 hours",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1100&q=80&fit=crop",
    imgAlt: "Website analytics and conversion audit on a laptop screen",
  },
  {
    num: "02",
    title: "We rebuild it to convert",
    detail:
      "Research-backed layouts. Copy that actually sells. Lead capture wired end-to-end. You see drafts every week, not at the end.",
    meta: "Launch in as little as 21 days",
    img: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=1100&q=80&fit=crop",
    imgAlt: "Designer working on a local business website redesign",
  },
  {
    num: "03",
    title: "We host, monitor, and edit it monthly",
    detail:
      "Vercel edge hosting, uptime and security monitoring, and unlimited content edits turned around in 48 hours. You focus on your business.",
    meta: "Month-to-month · cancel anytime",
    img: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1100&q=80&fit=crop&crop=faces",
    imgAlt: "Business owner happy with their website results",
  },
];

export default function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 75%", "end 60%"],
  });
  const pathScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={ref} id="process" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-stone-500 mb-4 sm:mb-5">
            The process
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2
            className="font-display font-semibold text-stone-900 leading-[1.05] tracking-tight max-w-3xl"
            style={{ fontSize: "clamp(1.85rem, 4.5vw, 3.4rem)" }}
          >
            From old site to lead engine in twenty-one days.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-4 sm:mt-5 text-[0.95rem] sm:text-base text-stone-500 leading-relaxed max-w-xl">
            No agency theater. No mystery deliverables. Here is exactly what
            happens after the audit call.
          </p>
        </Reveal>

        <div className="relative mt-12 sm:mt-16">
          {/* Desktop connector line — sits over the row of numbered circles. */}
          <div
            aria-hidden
            className="hidden md:block absolute top-[12.5rem] left-[12%] right-[12%] h-px bg-stone-200 origin-left z-0"
          >
            {!reduce && (
              <motion.div
                className="h-full bg-stone-900 origin-left"
                style={{ scaleX: pathScale }}
              />
            )}
          </div>

          <Stagger
            className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8"
            delayChildren={0.15}
          >
            {STEPS.map((s) => (
              <StaggerItem key={s.num} className="relative">
                {/* Photo with slow Ken Burns */}
                <StepPhoto src={s.img} alt={s.imgAlt} />

                {/* Numbered circle — sits on the connector */}
                <div className="relative z-10 -mt-7 mb-5 flex md:justify-start">
                  <div className="h-14 w-14 rounded-full bg-white border border-stone-200 shadow-sm flex items-center justify-center font-display text-sm font-semibold tabular-nums text-stone-900">
                    {s.num}
                  </div>
                </div>

                <h3 className="font-display text-lg sm:text-xl font-semibold text-stone-900 leading-tight mb-2.5 sm:mb-3">
                  {s.title}
                </h3>
                <p className="text-sm sm:text-[0.95rem] text-stone-500 leading-relaxed mb-3 sm:mb-4">
                  {s.detail}
                </p>
                <p className="text-[0.65rem] sm:text-xs uppercase tracking-[0.18em] text-stone-400">
                  {s.meta}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}

function StepPhoto({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Slow "Ken Burns" — image scales 1 -> 1.08 as it passes through view.
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  return (
    <div
      ref={ref}
      className="relative aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-stone-900/5 bg-stone-100"
    >
      <motion.div
        style={reduce ? undefined : { scale }}
        transition={{ duration: DUR.slow, ease: EASE }}
        className="absolute inset-0"
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
      </motion.div>
    </div>
  );
}
