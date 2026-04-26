import Link from "next/link";
import type { IndustryProfile } from "@/lib/industries";

/**
 * Full-page wrapper for industry showcase sites.
 * Renders the showcase as a real, full-viewport website.
 * A small floating return bar gives users a way back to Macrolight.
 */
export default function IndustryPreviewFrame({
  industry,
  children,
}: {
  industry: IndustryProfile;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {/* ── Floating "Back to Macrolight" bar ── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 rounded-full bg-gray-900/90 backdrop-blur-md border border-white/10 px-5 py-2.5 shadow-2xl shadow-black/40">
        <span className="h-1.5 w-1.5 rounded-full bg-violet-400" aria-hidden />
        <span className="text-xs text-white/60 font-medium whitespace-nowrap">
          Sample site — {industry.name}
        </span>
        <span className="text-white/20">·</span>
        <Link
          href="/"
          className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors whitespace-nowrap"
        >
          ← Back to Macrolight
        </Link>
      </div>

      {/* ── Full-page showcase content ── */}
      <div className="industry-site-light text-zinc-900 antialiased">
        {children}
      </div>
    </div>
  );
}
