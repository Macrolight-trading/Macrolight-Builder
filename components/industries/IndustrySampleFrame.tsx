"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { IndustryProfile } from "@/lib/industries";

/**
 * Iframe wrapper for the industry sample showcase.
 *
 * Loads the noindex'd `/sample/[slug]` route inside an iframe so:
 *   - Fake business data inside the mockup (placeholder reviews, made-up
 *     phone numbers, fictional addresses) doesn't get indexed against
 *     macrolight-builder.com — that route is noindex'd and disallowed in
 *     robots.txt.
 *   - The mockup's own H1 lives in its own document, so the parent
 *     /[industry] page now has exactly one H1 ("Websites That Get
 *     More …"), which is what the SEO audit flagged.
 *
 * Auto-resizes height to the iframe's content so visitors don't see a
 * scrollbar inside the showcase. The iframe still scrolls naturally as
 * part of the parent page.
 */
export default function IndustrySampleFrame({
  industry,
  slug,
}: {
  industry: IndustryProfile;
  slug: string;
}) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number>(900);

  useEffect(() => {
    function resize() {
      const doc = ref.current?.contentDocument;
      if (!doc) return;
      const next = Math.max(
        doc.documentElement.scrollHeight,
        doc.body?.scrollHeight ?? 0,
      );
      if (next && Math.abs(next - height) > 4) {
        setHeight(next);
      }
    }
    // Initial measure + repeated polling — covers async image loads,
    // font swaps, and content that grows after first paint. The cost
    // is negligible (one read per second) and the alternative
    // (postMessage from inside the iframe) is fragile across the
    // same-origin / cross-origin boundary.
    const id = window.setInterval(resize, 1000);
    const onLoad = () => resize();
    const node = ref.current;
    node?.addEventListener("load", onLoad);
    return () => {
      window.clearInterval(id);
      node?.removeEventListener("load", onLoad);
    };
  }, [height]);

  return (
    <div className="relative">
      <iframe
        ref={ref}
        src={`/sample/${slug}`}
        title={`Sample ${industry.name} website — Macrolight Builder mockup`}
        className="block w-full border-0"
        style={{ height }}
        // Same-origin iframe — we need to read scrollHeight to auto-size.
        // No `sandbox` attribute on purpose; this is our own route.
        loading="lazy"
      />

      {/* Floating "Back to Macrolight" bar — sits over the iframe so
          visitors always have a way out of the sample. */}
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
    </div>
  );
}
