"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { useRef } from "react";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import Magnetic from "@/components/motion/Magnetic";
import { DUR, EASE } from "@/components/motion/tokens";
import { ACCENT } from "@/components/theme/tokens";

/**
 * V2 /about page — premium minimal.
 *
 * Sections:
 *   1. Hero (eyebrow + display headline, founder photo placeholder strip)
 *   2. Story (two-column: paragraph + key facts)
 *   3. Values pillars (4 cards, FlowNinja-style period-triplet)
 *   4. Final CTA
 */

const VALUES = [
  {
    word: "Boutique.",
    detail:
      "We cap our roster on purpose. Every client works with a founder, not a hand-off to a junior on a queue.",
  },
  {
    word: "Honest.",
    detail:
      "If we're not the right fit, we say so on the audit call. No upsells, no scope creep — just straight answers.",
  },
  {
    word: "Lead-first.",
    detail:
      "Conversion architecture comes before pixels. We build for the customer your visitor is about to become.",
  },
  {
    word: "Yours.",
    detail:
      "You own the code, the domain, the design. Zero platform lock-in. If you ever leave, we hand it over clean.",
  },
];

const STORY_FACTS = [
  { label: "Founded", value: "2024" },
  { label: "Based in", value: "Birmingham, MI" },
  { label: "Verticals built", value: "5+" },
  { label: "Build cadence", value: "21 days" },
];

export default function NewAboutPage() {
  return (
    <main>
      <AboutHero />
      <AboutStory />
      <AboutValues />
      <AboutFinalCTA />
    </main>
  );
}

/* ─── Hero ────────────────────────────────────────────────────────── */
function AboutHero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);

  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden bg-stone-50 pt-20 sm:pt-28 pb-16 sm:pb-20"
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
              background: `radial-gradient(60% 60% at 50% 30%, ${ACCENT}22 0%, transparent 65%)`,
            }}
          />
        </motion.div>
      )}

      <div className="mx-auto max-w-4xl px-5 sm:px-8 text-center">
        <Reveal>
          <p className="text-[0.65rem] sm:text-xs font-medium uppercase tracking-[0.22em] text-stone-500 mb-5 sm:mb-7">
            About Macrolight Builder
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1
            className="font-display font-semibold text-stone-900 leading-[1.02] tracking-tight text-balance"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
          >
            Two founders. <em className="text-stone-300">One promise.</em>
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-7 sm:mt-9 text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl mx-auto">
            We build websites for local businesses that we&rsquo;d be proud to
            send our own customers to — sites engineered to ring the phone, not
            just look good in a portfolio.
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-12 sm:mt-14 flex items-center justify-center gap-4">
            <div className="flex -space-x-3">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-stone-700 ring-4 ring-stone-50 flex items-center justify-center text-sm sm:text-base font-semibold text-stone-50">
                BB
              </div>
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-stone-600 ring-4 ring-stone-50 flex items-center justify-center text-sm sm:text-base font-semibold text-stone-50">
                NO
              </div>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-stone-900">
                Bradley Bayley &amp; Nick Ottoy
              </p>
              <p className="text-xs text-stone-500">Co-founders</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Story + key facts ───────────────────────────────────────────── */
function AboutStory() {
  return (
    <section className="bg-white py-20 sm:py-28 border-y border-stone-200/60">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Story — 7/12 */}
          <div className="lg:col-span-7">
            <Reveal>
              <p className="text-[0.65rem] sm:text-xs font-medium uppercase tracking-[0.22em] text-stone-500 mb-4 sm:mb-5">
                Why we started
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2
                className="font-display font-semibold text-stone-900 leading-[1.05] tracking-tight"
                style={{ fontSize: "clamp(1.85rem, 4vw, 3rem)" }}
              >
                We kept watching great local businesses{" "}
                <em className="text-stone-400">
                  lose to worse competitors with better websites.
                </em>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-6 sm:mt-7 space-y-5 text-stone-600 leading-relaxed">
                <p>
                  Most agencies sell websites the same way they sell cars —
                  with options packages and add-ons designed to make the
                  invoice bigger. Local businesses get pitched enterprise
                  tooling they don&rsquo;t need, contracts they can&rsquo;t
                  escape, and platforms that hold their content hostage.
                </p>
                <p>
                  We started Macrolight because we know the other path works.
                  Strip the build down to what actually matters — conversion
                  architecture, copy that sells, lead capture wired up,
                  hosting that doesn&rsquo;t crash — and price it so a
                  three-person company can afford it without financing.
                </p>
                <p>
                  That&rsquo;s the entire pitch. Boutique by design, lead-first
                  by discipline, locally owned, and yours to keep the day you
                  decide we&rsquo;re no longer needed.
                </p>
              </div>
            </Reveal>
          </div>

          {/* Key facts — 5/12 */}
          <Stagger
            className="lg:col-span-5 grid grid-cols-2 gap-4 sm:gap-5"
            delayChildren={0.2}
          >
            {STORY_FACTS.map((f) => (
              <StaggerItem
                key={f.label}
                className="rounded-2xl border border-stone-200 bg-stone-50 p-5 sm:p-6"
              >
                <p className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900 leading-none">
                  {f.value}
                </p>
                <p className="mt-2 text-[0.7rem] sm:text-xs uppercase tracking-[0.18em] text-stone-500">
                  {f.label}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}

/* ─── Values pillars ──────────────────────────────────────────────── */
function AboutValues() {
  return (
    <section className="bg-stone-50 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="text-[0.65rem] sm:text-xs font-medium uppercase tracking-[0.22em] text-stone-500 mb-4 sm:mb-5">
            What we stand for
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2
            className="font-display font-semibold text-stone-900 leading-[1.05] tracking-tight max-w-4xl"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.4rem)" }}
          >
            Boutique. Honest. Lead-first.{" "}
            <em className="text-stone-300">Yours.</em>
          </h2>
        </Reveal>

        <Stagger
          className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6"
          delayChildren={0.15}
        >
          {VALUES.map((v) => (
            <StaggerItem
              key={v.word}
              className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-7"
            >
              <p className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-stone-900 leading-tight">
                {v.word}
              </p>
              <p className="mt-3 sm:mt-4 text-[0.8rem] sm:text-sm text-stone-500 leading-relaxed">
                {v.detail}
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ─── Final CTA ───────────────────────────────────────────────────── */
function AboutFinalCTA() {
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
      className="relative isolate overflow-hidden bg-stone-50 py-24 sm:py-32 border-t border-stone-200/60"
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
            Want to talk to a founder?
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2
            className="font-display font-semibold text-stone-900 leading-[1.05] tracking-tight text-balance"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            Book a <em>free</em> 15-min audit call.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-6 sm:mt-8 text-[0.95rem] sm:text-lg text-stone-600 leading-relaxed max-w-xl mx-auto">
            Bradley or Nick will jump on the call — no SDR, no qualifying form.
            We&rsquo;ll screen-share your site and tell you straight what we
            see, even if the answer is &ldquo;you don&rsquo;t need us.&rdquo;
          </p>
        </Reveal>

        <Reveal delay={0.15} className="mt-10 sm:mt-12">
          <Magnetic strength={0.25}>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-7 sm:px-8 py-3.5 sm:py-4 text-sm font-semibold text-stone-50 shadow-sm hover:bg-stone-800 transition-colors whitespace-nowrap"
            >
              Grab a time on our calendar
              <span aria-hidden>→</span>
            </Link>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  );
}

// Expose duration/easing for any callers that want to compose more
// elaborate motion on top.
export { DUR as ABOUT_DUR, EASE as ABOUT_EASE };
