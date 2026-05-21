"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useEffect, useRef } from "react";

interface CountUpProps {
  to: number;
  /** Animation duration approximation; the spring decides final timing. */
  duration?: number;
}

/**
 * Counts a number up from 0 → `to` when it scrolls into view, once.
 * Spring-based so it lands smoothly without an awkward final tick. Falls
 * back to the static number under prefers-reduced-motion.
 */
export default function CountUp({ to, duration = 1.2 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "-15% 0px -15% 0px" });

  const mv = useMotionValue(0);
  const spring = useSpring(mv, {
    duration: duration * 1000,
    bounce: 0,
  });
  const rounded = useTransform(spring, (latest) => Math.round(latest));

  useEffect(() => {
    if (inView && !reduce) {
      mv.set(to);
    }
  }, [inView, reduce, to, mv]);

  if (reduce) {
    return <span ref={ref}>{to}</span>;
  }

  return <motion.span ref={ref}>{rounded}</motion.span>;
}
