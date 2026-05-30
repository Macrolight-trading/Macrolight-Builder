"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE } from "@/components/motion/tokens";

type OnboardingProgressBarProps = {
  percent: number;
  phase: string;
  isCompleted: boolean;
};

export default function OnboardingProgressBar({
  percent,
  phase,
  isCompleted,
}: OnboardingProgressBarProps) {
  const reduceMotion = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div
      className="shrink-0 border-b border-gray-200 bg-white px-3 py-2.5 sm:px-4 sm:py-3"
      aria-label={`Onboarding progress: ${clamped}%`}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <AnimatePresence mode="wait">
          <motion.p
            key={phase}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="truncate text-xs font-medium text-gray-600 sm:text-sm"
          >
            {phase}
          </motion.p>
        </AnimatePresence>
        <motion.span
          key={clamped}
          initial={reduceMotion ? false : { scale: 0.85, opacity: 0.4 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className={`shrink-0 text-xs font-semibold tabular-nums sm:text-sm ${
            isCompleted ? "text-emerald-600" : "text-violet-600"
          }`}
        >
          {clamped}%
        </motion.span>
      </div>

      <div className="relative h-2 overflow-hidden rounded-full bg-gray-100 sm:h-2.5">
        <motion.div
          className={`absolute inset-y-0 left-0 rounded-full ${
            isCompleted
              ? "bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400"
              : "bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-500"
          }`}
          initial={false}
          animate={{ width: `${clamped}%` }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 90, damping: 18, mass: 0.75 }
          }
        />

        {!reduceMotion && clamped > 4 && clamped < 100 && (
          <motion.div
            className="pointer-events-none absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/50 to-transparent"
            animate={{ x: ["-120%", "520%"] }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "linear",
              repeatDelay: 0.4,
            }}
            style={{ left: `${Math.max(0, clamped - 18)}%` }}
          />
        )}

        {!reduceMotion && clamped > 0 && (
          <motion.div
            className={`absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full blur-[2px] sm:h-3.5 sm:w-3.5 ${
              isCompleted ? "bg-emerald-300" : "bg-violet-300"
            }`}
            animate={{ left: `${clamped}%`, x: "-50%" }}
            transition={{ type: "spring", stiffness: 90, damping: 18, mass: 0.75 }}
          />
        )}
      </div>
    </div>
  );
}
