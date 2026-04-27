import type { Metadata } from "next";
import Link from "next/link";
import { getAllCaseStudies } from "@/lib/case-studies";

export const metadata: Metadata = {
  title: "Case Studies",
  description:
    "See how Macrolight Builders helps local businesses generate more leads, rank higher on Google, and grow revenue with conversion-optimized websites.",
  alternates: { canonical: "/case-studies" },
  openGraph: {
    title: "Case Studies — Macrolight Builders",
    description:
      "Real results for real businesses. See how our websites drive leads, revenue, and growth.",
    url: "https://macrolightbuilders.com/case-studies",
    type: "website",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Macrolight Builders Case Studies",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Case Studies — Macrolight Builders",
    description:
      "Real results for real businesses. See how our websites drive leads, revenue, and growth.",
    images: ["/og-default.png"],
  },
};

export default function CaseStudiesPage() {
  const caseStudies = getAllCaseStudies();

  return (
    <>
      {/* ── Hero header ── */}
      <section className="relative overflow-hidden bg-gray-50 border-b border-gray-200 pt-20 pb-14 sm:pt-28">
        <div
          className="absolute inset-0 dot-bg pointer-events-none"
          aria-hidden
        />
        <div
          className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-violet-100 opacity-60 blur-3xl pointer-events-none"
          aria-hidden
        />

        <div className="relative mx-auto max-w-4xl px-5 sm:px-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-600 animate-fade-in">
            Case Studies
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.05] animate-fade-in-up">
            Real results for{" "}
            <span className="gradient-text">real businesses.</span>
          </h1>
          <p className="mt-5 text-lg text-gray-500 max-w-2xl mx-auto animate-fade-in-up">
            We don&apos;t just build websites — we build client acquisition
            systems. Here&apos;s what that looks like in practice.
          </p>
        </div>
      </section>

      {/* ── Case study cards ── */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 space-y-16">
          {caseStudies.map((cs, index) => {
            const isReversed = index % 2 === 1;

            return (
              <div
                key={cs.slug}
                className="group rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl"
              >
                <div
                  className={`grid grid-cols-1 lg:grid-cols-2 ${
                    isReversed ? "lg:direction-rtl" : ""
                  }`}
                >
                  {/* Image placeholder */}
                  <div
                    className={`relative h-64 lg:h-auto min-h-[320px] bg-gradient-to-br from-violet-100 to-cyan-50 flex items-center justify-center ${
                      isReversed ? "lg:order-2" : ""
                    }`}
                  >
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm mb-4">
                        <span className="text-3xl font-bold text-violet-600">
                          {cs.company.charAt(0)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-violet-600/60">
                        {cs.company}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div
                    className={`p-8 sm:p-10 lg:p-12 flex flex-col justify-center ${
                      isReversed ? "lg:order-1" : ""
                    }`}
                  >
                    {/* Industry pill + location */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-violet-50 text-violet-600">
                        {cs.industry}
                      </span>
                      <span className="text-xs text-gray-400">
                        {cs.location}
                      </span>
                    </div>

                    {/* Company name */}
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                      {cs.company}
                    </h2>

                    {/* Challenge summary */}
                    <p className="text-sm text-gray-500 leading-relaxed mb-8 line-clamp-3">
                      {cs.challenge}
                    </p>

                    {/* Key metrics */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      {cs.results.map((result) => (
                        <div key={result.metric}>
                          <p className="text-2xl sm:text-3xl font-bold gradient-text leading-none">
                            {result.value}
                          </p>
                          <p className="mt-1.5 text-xs text-gray-400 uppercase tracking-wide">
                            {result.metric}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Read full story link */}
                    <Link
                      href={`/case-studies/${cs.slug}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-800 transition-colors group/link"
                    >
                      Read full story
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4 group-hover/link:translate-x-0.5 transition-transform"
                        aria-hidden
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
