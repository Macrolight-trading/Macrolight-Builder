"use client";

import { motion, useScroll, useSpring, useReducedMotion } from "motion/react";

/**
 * Thin progress bar fixed at the top of the viewport, driven by overall
 * scroll position. Premium-minimal signature touch — Linear, Stripe, and
 * the Framer site all use a variant of this.
 *
 * Spring-smoothed so it doesn't track 1:1 with the (sometimes-jittery)
 * scroll event stream. Hidden under prefers-reduced-motion.
 */
export default function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 22,
    mass: 0.3,
    restDelta: 0.001,
  });

  if (reduce) return null;

  return (
    <motion.div
      aria-hidden
      style={{ scaleX, transformOrigin: "0% 50%" }}
      className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-[var(--ml-accent,#C8A24B)] pointer-events-none"
    />
  );
}
