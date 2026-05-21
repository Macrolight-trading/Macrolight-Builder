"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { DUR, EASE, VIEWPORT } from "./tokens";

interface RevealProps {
  children: ReactNode;
  /** Delay in seconds. */
  delay?: number;
  /** Distance to translate up from. Default 16px. */
  y?: number;
  /** Duration override. Default DUR.base. */
  duration?: number;
  className?: string;
  /** ID for in-page navigation / anchor links. */
  id?: string;
}

/**
 * Workhorse scroll-reveal primitive — ~90% of the v2 home page motion
 * routes through this. Fades + slides up once when the element enters
 * the viewport. Honors `prefers-reduced-motion` by skipping the
 * animation entirely (renders as a plain div).
 *
 * Always renders a <div>. If you need a different tag, wrap or nest —
 * keeping the API narrow avoids a thicket of generics.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 16,
  duration = DUR.base,
  className,
  id,
}: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div id={id} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      id={id}
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
