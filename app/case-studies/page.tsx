import type { Metadata } from "next";
import Link from "next/link";
import { getAllCaseStudies } from "@/lib/case-studies";
import {
  LawnCarePreview,
  LawFirmPreview,
  RestaurantPreview,
  HvacPreview,
  DentistPreview,
} from "@/components/home/sections/previews";
import type { ComponentType } from "react";

export const metadata: Metadata = {
  title: "Case Studies",
  description:
    "Explore transparent sample build scenarios that show how Macrolight Builder structures lead-generating websites for local businesses.",
  alternates: { canonical: "/case-studies" },
  openGraph: {
    title: "Case Studies — Macrolight Builder",
    description:
      "Transparent sample build scenarios for local business lead-generation websites.",
    url: "https://macrolight-builder.com/case-studies",
    type: "website",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Macrolight Builder Case Studies",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Case Studies — Macrolight Builder",
    description:
      "Transparent sample build scenarios for local business lead-generation websites.",
    images: ["/og-default.png"],
  },
};

const ACCENT = "#C8A24B";

/** Map case-study slug → preview component + URL string + accent. */
const PREVIEW_BY_SLUG: Record<
  string,
  { Preview: ComponentType; url: string; accent: string }
> = {
  restaurants: {
    Preview: RestaurantPreview,
    url: "thepearlkitchen.com",
    accent: "#C9A96E",
  },
  "law-firms": {
    Preview: LawFirmPreview,
    url: "crestwoodlegal.com",
    accent: "#C9A84C",
  },
  hvac: {
    Preview: HvacPreview,
    url: "arcticbreezehhvac.com",
    accent: "#1a6fc4",
  },
  dentists: {
    Preview: DentistPreview,
    url: "brightsmile-dental.com",
    accent: "#00897b",
  },
  "lawn-care": {
    Preview: LawnCarePreview,
    url: "greenfield-lawn.com",
    accent: "#6BA33E",
  },
};

export default function CaseStudiesPage() {
  const caseStudies = getAllCaseStudies();

  return (
    <main>
      {/* ── Hero ── */}
      <section className="relative isolate overflow-hidden bg-stone-50 pt-20 sm:pt-28 pb-16 sm:pb-20">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 pointer-events-none"
          style={{
            background: `radial-gradient(60% 60% at 50% 30%, ${ACCENT}22 0%, transparent 65%)`,
          }}
        />
        <div className="mx-auto max-w-4xl px-5 sm:px-8 text-center">
          <p className="text-[0.65rem] sm:text-xs font-medium uppercase tracking-[0.22em] text-stone-500 mb-5 sm:mb-7">
            Sample build scenarios
          </p>
          <h1
            className="font-display font-semibold text-stone-900 leading-[1.02] tracking-tight text-balance"
            style={{ fontSize: "clamp(2.25rem, 5.5vw, 4.5rem)" }}
          >
            Transparent. <em className="text-stone-300">By design.</em>
          </h1>
          <p className="mt-7 sm:mt-9 text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl mx-auto">
            We&rsquo;re in our founding stage, so these examples show exactly
            how we structure lead-generation systems — before publishing
            verified client results.
          </p>
        </div>
      </section>

      {/* ── Case study cards — stacked layout, preview on top, content below.
            Mirrors the home-page LiveSamples cards so the visual language
            is consistent across the site. ── */}
      <section className="bg-white py-16 sm:py-24 border-t border-stone-200/60">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {caseStudies.map((cs) => {
              const preview = PREVIEW_BY_SLUG[cs.slug];

              return (
                <article
                  key={cs.slug}
                  className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Preview — top, full card width, natural aspect */}
                  {preview && (
                    <Link
                      href={cs.sampleSiteHref}
                      className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-stone-900"
                      aria-label={`View ${cs.company} sample site`}
                    >
                      <div className="relative border-b border-stone-100">
                        {/* Browser chrome */}
                        <div className="flex items-center gap-1.5 bg-stone-50 px-3 py-2.5 border-b border-stone-100">
                          <span
                            className="h-2 w-2 rounded-full bg-stone-300"
                            aria-hidden
                          />
                          <span
                            className="h-2 w-2 rounded-full bg-stone-300"
                            aria-hidden
                          />
                          <span
                            className="h-2 w-2 rounded-full bg-stone-300"
                            aria-hidden
                          />
                          <div className="mx-auto flex items-center gap-1.5 rounded-md border border-stone-200 bg-white px-2.5 py-1 text-[10px] text-stone-400">
                            <svg
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="h-2.5 w-2.5 text-stone-300"
                              aria-hidden
                            >
                              <path
                                fillRule="evenodd"
                                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="truncate">{preview.url}</span>
                          </div>
                          <div className="w-4" aria-hidden />
                        </div>

                        {/* Actual preview at its natural aspect ratio */}
                        <div className="relative bg-white overflow-hidden">
                          <preview.Preview />
                        </div>

                        {/* Industry badge — top right of preview area */}
                        <div className="absolute top-12 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-stone-700 shadow-sm border border-stone-200">
                          <span
                            aria-hidden
                            className="inline-block h-1.5 w-1.5 rounded-full"
                            style={{ background: preview.accent }}
                          />
                          {cs.industry} sample
                        </div>
                      </div>
                    </Link>
                  )}

                  {/* Content — bottom, beneath the preview */}
                  <div className="p-6 sm:p-7">
                    {/* Industry pill + location */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-stone-700">
                        <span
                          aria-hidden
                          className="inline-block h-1.5 w-1.5 rounded-full"
                          style={{ background: preview?.accent ?? "#a8a29e" }}
                        />
                        {cs.industry}
                      </span>
                      <span className="text-xs text-stone-400">
                        {cs.location}
                      </span>
                    </div>

                    <h2 className="font-display text-xl sm:text-2xl font-semibold text-stone-900 leading-tight mb-2.5 tracking-tight">
                      {cs.company}
                    </h2>

                    <p className="text-sm text-stone-500 leading-relaxed mb-5 line-clamp-2">
                      {cs.challenge}
                    </p>

                    {/* Key metrics — compact 3-up */}
                    <div className="grid grid-cols-3 gap-3 mb-6 pt-5 border-t border-stone-100">
                      {cs.results.map((result) => (
                        <div key={result.metric}>
                          <p className="font-display text-lg sm:text-xl font-semibold text-stone-900 leading-none tabular-nums">
                            {result.value}
                          </p>
                          <p className="mt-1.5 text-[0.6rem] text-stone-500 uppercase tracking-[0.14em] leading-tight">
                            {result.metric}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      <Link
                        href={cs.sampleSiteHref}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 text-stone-50 px-5 py-2.5 text-sm font-semibold hover:bg-stone-800 transition-colors whitespace-nowrap"
                      >
                        View sample site
                        <span aria-hidden>→</span>
                      </Link>
                      <Link
                        href={`/case-studies/${cs.slug}`}
                        className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors"
                      >
                        Read scenario details
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
