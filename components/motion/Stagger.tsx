"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { DUR, EASE, STAGGER, VIEWPORT } from "./tokens";

interface StaggerProps {
  children: ReactNode;
  className?: string;
  /** Override stagger interval. Default 0.08s. */
  stagger?: number;
  /** Delay before the first child starts. */
  delayChildren?: number;
}

/**
 * Container that staggers the reveal of its direct <StaggerItem>
 * children. Wraps lists / grids / multi-card rows where a coordinated
 * cascade reads as more premium than every child fading independently.
 */
export function Stagger({
  children,
  className,
  stagger = STAGGER,
  delayChildren = 0.05,
}: StaggerProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: stagger,
            delayChildren,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  /** Distance to translate up from. Default 14px. */
  y?: number;
}

/**
 * Direct child of <Stagger>. Each item picks up the cascade timing from
 * the container automatically.
 */
export function StaggerItem({ children, className, y = 14 }: StaggerItemProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: DUR.base, ease: EASE },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
