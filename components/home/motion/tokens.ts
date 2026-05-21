/**
 * Motion design tokens for the v2 home page.
 *
 * One easing curve, three durations, one stagger interval. Every animated
 * component in components/home/ pulls from this file so the page feels
 * like one coherent motion system rather than a patchwork.
 *
 * If a section needs something outside this vocabulary, add a new token
 * here rather than inlining a magic number — that's how motion drift
 * starts.
 */
import type { Variants, Transition } from "motion/react";

/** Smooth out-easing. Used as the default for every reveal in v2. */
export const EASE: Transition["ease"] = [0.22, 1, 0.36, 1];

export const DUR = {
  /** Snappy — hover lifts, micro-interactions. */
  fast: 0.35,
  /** Default reveal duration — body of the page. */
  base: 0.6,
  /** Hero / showpiece moments. Use sparingly. */
  slow: 0.9,
} as const;

/** Interval between staggered children. */
export const STAGGER = 0.08;

/** Default viewport options for whileInView reveals. */
export const VIEWPORT = { once: true, margin: "-10% 0px -10% 0px" } as const;

/* ─── Prebuilt variants ──────────────────────────────────────────── */

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR.base, ease: EASE },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DUR.base, ease: EASE },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DUR.base, ease: EASE },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: STAGGER,
      delayChildren: 0.05,
    },
  },
};
