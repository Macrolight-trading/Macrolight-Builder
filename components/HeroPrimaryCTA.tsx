"use client";

import Link from "next/link";
import { useState } from "react";
import HeroAuditForm from "./HeroAuditForm";

/**
 * Hero primary CTA stack.
 *
 * Default state: Book-a-call is the primary action — that's the page's
 * single conversion goal, so we put it front-and-center. Below it we
 * surface a low-friction phone link and a "Prefer email?" toggle that
 * reveals the existing two-step audit form (URL → name + email), which
 * still posts to /api/contact and feeds the same CRM pipeline.
 *
 * This preserves the working written-audit path without competing with
 * the booking CTA at first glance.
 */
export default function HeroPrimaryCTA() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-4">
      {!showForm ? (
        <>
          {/* ── Primary: Book a call ── */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/book"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 px-7 py-4 text-base font-semibold text-white shadow-lg shadow-violet-200 transition-all active:scale-[0.99] whitespace-nowrap"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden>
                <path
                  fillRule="evenodd"
                  d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
                  clipRule="evenodd"
                />
              </svg>
              Book my free 15-min audit call
            </Link>
            <a
              href="tel:+12482147957"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-4 text-base font-semibold text-gray-800 shadow-sm hover:border-violet-300 hover:text-violet-700 transition-all whitespace-nowrap"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-violet-600" aria-hidden>
                <path d="M2 3.5A1.5 1.5 0 013.5 2h2.879a1.5 1.5 0 011.06.44l1.829 1.828a1.5 1.5 0 01.328 1.628l-.715 1.788a11.04 11.04 0 005.434 5.434l1.788-.715a1.5 1.5 0 011.628.328l1.829 1.829a1.5 1.5 0 01.439 1.06V16.5A1.5 1.5 0 0116.5 18h-1A13.5 13.5 0 012 4.5v-1z" />
              </svg>
              Or call us
            </a>
          </div>

          {/* Trust microcopy */}
          <p className="text-xs text-gray-500 pl-1.5">
            <span className="font-semibold text-gray-700">15 minutes.</span>{" "}
            We screen-share your site, run our 20-point audit live, and tell
            you the 3 biggest leaks. No pitch, no contract.
          </p>

          {/* Fallback: prefer-email toggle */}
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="text-xs font-medium text-gray-400 hover:text-violet-700 underline underline-offset-4 transition-colors"
          >
            Prefer email? Get a written audit instead →
          </button>
        </>
      ) : (
        <>
          <HeroAuditForm />
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="text-xs font-medium text-gray-400 hover:text-violet-700 underline underline-offset-4 transition-colors"
          >
            ← Back to booking a call
          </button>
        </>
      )}
    </div>
  );
}
