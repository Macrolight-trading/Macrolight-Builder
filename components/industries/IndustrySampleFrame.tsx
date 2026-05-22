"use client";

import Link from "next/link";
import type { IndustryProfile } from "@/lib/industries";

/**
 * DEPRECATED: kept as a stub to avoid breaking any straggler imports.
 * The /[industry] pages now render showcases directly (no iframe), and
 * /case-studies uses the home-page React preview components.
 *
 * Renders a small "back to Macrolight" pill — harmless if mounted, but
 * no longer in the active render path.
 */
export default function IndustrySampleFrame({
  industry,
}: {
  industry: IndustryProfile;
  slug: string;
}) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 rounded-full bg-stone-900/90 backdrop-blur-md border border-stone-700/40 px-5 py-2.5 shadow-2xl">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: "#C8A24B" }}
        aria-hidden
      />
      <span className="text-xs text-stone-300 font-medium whitespace-nowrap">
        Sample site — {industry.name}
      </span>
      <span className="text-stone-500">·</span>
      <Link
        href="/"
        className="text-xs font-semibold text-stone-100 hover:text-white transition-colors whitespace-nowrap"
      >
        ← Back to Macrolight
      </Link>
    </div>
  );
}
