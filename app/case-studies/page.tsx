import type { Metadata } from "next";
import Link from "next/link";
import { getAllCaseStudies } from "@/lib/case-studies";

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
            Transparent sample{" "}
            <span className="gradient-text">build scenarios.</span>
          </h1>
          <p className="mt-5 text-lg text-gray-500 max-w-2xl mx-auto animate-fade-in-up">
            We&apos;re in our founding stage, so these examples show exactly how we
            structure lead-generation systems before publishing verified results.
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
                  {/* Live hero preview (clickable) */}
                  <Link
                    href={cs.sampleSiteHref}
                    className={`relative h-64 lg:h-auto min-h-[320px] overflow-hidden block ${
                      isReversed ? "lg:order-2" : ""
                    }`}
                    aria-label={`Open ${cs.company} sample site`}
                  >
                    <iframe
                      src={cs.sampleSiteHref}
                      title={`${cs.company} hero preview`}
                      className="absolute top-0 left-0 w-[142.857%] h-[142.857%] origin-top-left pointer-events-none"
                      style={{ transform: "scale(0.7)" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/72 via-gray-900/20 to-transparent transition-opacity group-hover:opacity-90" />
                    <div className="absolute top-4 right-4 rounded-full bg-white/90 text-gray-900 text-[0.65rem] font-semibold uppercase tracking-[0.16em] px-3 py-1.5 shadow-sm">
                      Live hero preview
                    </div>
                    <div className="absolute left-6 bottom-6 right-6">
                      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/75 font-semibold mb-1">
                        {cs.industry} sample
                      </p>
                      <p className="text-lg font-semibold text-white leading-tight">
                        {cs.company}
                      </p>
                    </div>
                  </Link>

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

                    {/* Links */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <Link
                        href={cs.sampleSiteHref}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 text-white px-5 py-3 text-sm font-semibold shadow-lg shadow-violet-200 hover:bg-violet-700 transition-colors group/link"
                      >
                        View sample site
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
                      <Link
                        href={`/case-studies/${cs.slug}`}
                        className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
                      >
                        Read scenario details
                      </Link>
                    </div>
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
