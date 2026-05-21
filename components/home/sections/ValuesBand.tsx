"use client";

import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

/**
 * Values pillars — Macrolight's answer to FlowNinja's
 * "Startup speed. Enterprise scale. One team. Your team." (§8).
 *
 * A short period-triplet header sets the rhythm, then four pillar
 * cards explain the position. Sits late in the page after the visitor
 * has seen the proof, so the values feel earned rather than asserted.
 */

const PILLARS = [
  {
    word: "Boutique.",
    title: "Limited builds per quarter.",
    detail:
      "We cap our roster on purpose. Every client gets a founder on the call, not a junior on a queue.",
  },
  {
    word: "Lead-first.",
    title: "Designed to convert, then to look good.",
    detail:
      "Conversion architecture comes before pixels. The site looks great because it works — not the other way around.",
  },
  {
    word: "Local.",
    title: "Birmingham, MI · serving the US.",
    detail:
      "We're built by Midwesterners who understand local-business owners because we are some. No outsourcing, no time-zone games.",
  },
  {
    word: "Yours.",
    title: "Own the code, the domain, the design.",
    detail:
      "Zero platform lock-in. Zero held-hostage assets. If you ever leave, we hand it all over clean — no migration fee.",
  },
];

export default function ValuesBand() {
  return (
    <section className="bg-white py-20 sm:py-28 border-y border-stone-200/60">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="text-[0.65rem] sm:text-xs font-medium uppercase tracking-[0.22em] text-stone-500 mb-4 sm:mb-5">
            How we work
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2
            className="font-display font-semibold text-stone-900 leading-[1.05] tracking-tight max-w-4xl"
            style={{ fontSize: "clamp(2rem, 4.8vw, 3.6rem)" }}
          >
            Boutique. Lead-first. Local.{" "}
            <em className="text-stone-300">Yours.</em>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-4 sm:mt-5 text-[0.95rem] sm:text-base text-stone-500 leading-relaxed max-w-xl">
            Four commitments we make to every client — the kind of thing
            you&rsquo;d want to know before you write a check.
          </p>
        </Reveal>

        <Stagger
          className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6"
          delayChildren={0.15}
        >
          {PILLARS.map((p) => (
            <StaggerItem
              key={p.word}
              className="rounded-2xl border border-stone-200 bg-stone-50 p-6 sm:p-7"
            >
              <p className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-stone-900 leading-tight">
                {p.word}
              </p>
              <p className="mt-3 sm:mt-4 text-sm font-medium text-stone-900 leading-snug">
                {p.title}
              </p>
              <p className="mt-2 text-[0.8rem] sm:text-sm text-stone-500 leading-relaxed">
                {p.detail}
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
