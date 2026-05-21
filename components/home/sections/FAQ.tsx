"use client";

import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useState } from "react";
import Reveal from "@/components/motion/Reveal";
import { DUR, EASE } from "@/components/motion/tokens";

/**
 * FAQ — six concise items to clear the most common objections before
 * the visitor reaches the final CTA. One open at a time; animated
 * height for the open/close transition.
 */

const FAQS = [
  {
    q: "How long does a typical build take?",
    a: "Twenty-one days from kickoff to live site. Audit and discovery happen in days 1–3, copy and design in week one, build and integration in week two, polish and launch in week three. Faster is possible for smaller scopes — slower if you want it to be.",
  },
  {
    q: "Do I actually own the website?",
    a: "Yes — fully. You own the domain, the design, and the source code. If you ever leave, we hand it over clean. No proprietary platform lock-in, no held-hostage assets, no migration fees.",
  },
  {
    q: "What if I want to cancel?",
    a: "Cancel any month with 30 days notice. There are no annual contracts and no cancellation fees. Your site stays live during the notice period and you keep everything we built.",
  },
  {
    q: "Can you work with my existing CRM or lead pipeline?",
    a: "Yes. We've integrated with HubSpot, Salesforce, GoHighLevel, ServiceTitan, Jobber, and most form-routing tools (Zapier, Make). If your stack is more bespoke, we'll scope it on the audit call before you commit.",
  },
  {
    q: "How is this different from Wix or Squarespace?",
    a: "Those tools give you a page; we give you a lead engine. The difference shows up in conversion-engineered copy, mobile-first layouts that don't fall apart, edge hosting (sub-second loads vs. 4-second Wix loads), and the fact that someone actually answers when you need an edit. The work happens before the pixels.",
  },
  {
    q: "What does the audit actually cost?",
    a: "Nothing. A 15-minute call, a screen-share, a written 20-point review delivered within 24 hours. If we're not the right fit, we'll tell you straight and point you toward who is. No high-pressure pitch — we're a boutique shop and we'd rather pass than push.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <Reveal>
          <p className="text-[0.65rem] sm:text-xs font-medium uppercase tracking-[0.22em] text-stone-500 mb-4 sm:mb-5 text-center">
            Common questions · the ones we get on every call
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2
            className="font-display font-semibold text-stone-900 leading-[1.05] tracking-tight text-center"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.9rem)" }}
          >
            Everything you&rsquo;re probably wondering.
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-10 sm:mt-14 divide-y divide-stone-200 border-y border-stone-200">
            {FAQS.map((item, i) => (
              <FAQRow
                key={item.q}
                question={item.q}
                answer={item.a}
                open={open === i}
                onToggle={() => setOpen(open === i ? null : i)}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FAQRow({
  question,
  answer,
  open,
  onToggle,
}: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  const reduce = useReducedMotion();

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-6 py-5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-stone-900 rounded-sm"
      >
        <span className="text-base sm:text-lg font-medium text-stone-900">
          {question}
        </span>
        <motion.span
          aria-hidden
          animate={{ rotate: open ? 45 : 0 }}
          transition={
            reduce ? { duration: 0 } : { duration: DUR.fast, ease: EASE }
          }
          className="flex-shrink-0 text-stone-400 group-hover:text-stone-900"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: DUR.fast, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="pb-5 pr-12 text-sm sm:text-base text-stone-500 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
