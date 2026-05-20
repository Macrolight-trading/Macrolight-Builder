import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Book a Free 15-Min Audit Call · Macrolight Builder",
  description:
    "Hop on a 15-minute call with a founder. We'll screen-share your site, run our 20-point audit live, and show you the biggest leaks. No pitch, no contract.",
};

const AGENDA = [
  "Screen-share your current site live",
  "Run our 20-point audit while you watch",
  "Show you the 3 biggest leaks costing leads",
  "Tell you straight whether we're a fit (or refer you elsewhere if not)",
];

const TRUST = [
  { value: "15 min", label: "That's it" },
  { value: "$0", label: "Cost" },
  { value: "0", label: "Pitch slides" },
];

interface BookPageProps {
  searchParams: Promise<{ plan?: string }>;
}

export default async function BookPage({ searchParams }: BookPageProps) {
  const { plan } = await searchParams;
  const planLabel = plan
    ? plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase()
    : null;

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-12 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

          {/* ── Left: pitch + agenda ── */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-violet-600 hover:text-violet-800 transition-colors mb-6"
            >
              ← Back to home
            </Link>

            {planLabel && (
              <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 border border-violet-100 px-3 py-1 mb-5">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-500" aria-hidden />
                <span className="text-xs font-semibold text-violet-700">
                  Talking about the {planLabel} plan
                </span>
              </div>
            )}

            <h1
              className="font-display font-bold text-gray-900 leading-[1.05] tracking-tight"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.4rem)" }}
            >
              Book your free
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg, #7c3aed 0%, #0891b2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                15-min audit call.
              </span>
            </h1>

            <p className="mt-6 text-base text-gray-600 leading-relaxed max-w-lg">
              You&apos;ll be on the call with{" "}
              <span className="font-semibold text-gray-900">Bradley or Nick</span>{" "}
              — the founders. We&apos;ll screen-share your site, run our 20-point
              audit live, and show you where you&apos;re losing customers.
            </p>

            {/* Agenda */}
            <div className="mt-10">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gray-400 mb-4">
                What happens on the call
              </p>
              <ul className="space-y-3">
                {AGENDA.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-base text-gray-700">
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5"
                      aria-hidden
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust stats */}
            <div className="mt-10 pt-8 border-t border-gray-100 grid grid-cols-3 gap-6 max-w-md">
              {TRUST.map(({ value, label }) => (
                <div key={label}>
                  <div className="font-display text-2xl font-bold text-gray-900 leading-none">
                    {value}
                  </div>
                  <div className="mt-1 text-xs text-gray-400 font-medium">{label}</div>
                </div>
              ))}
            </div>

            {/* Phone fallback */}
            <div className="mt-10 p-5 rounded-2xl bg-gray-50 border border-gray-100">
              <p className="text-sm text-gray-600 mb-2">
                Rather skip the form?
              </p>
              <a
                href="tel:+12482147957"
                className="inline-flex items-center gap-2 text-base font-semibold text-violet-700 hover:text-violet-900 transition-colors"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
                  <path d="M2 3.5A1.5 1.5 0 013.5 2h2.879a1.5 1.5 0 011.06.44l1.829 1.828a1.5 1.5 0 01.328 1.628l-.715 1.788a11.04 11.04 0 005.434 5.434l1.788-.715a1.5 1.5 0 011.628.328l1.829 1.829a1.5 1.5 0 01.439 1.06V16.5A1.5 1.5 0 0116.5 18h-1A13.5 13.5 0 012 4.5v-1z" />
                </svg>
                Call (248) 214-7957
              </a>
            </div>
          </div>

          {/* ── Right: calendar embed slot ── */}
          <div>
            <div className="lg:sticky lg:top-24">
              <div className="rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/60 overflow-hidden">
                <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-violet-600 mb-1">
                    Pick a time
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    Available this week
                  </p>
                </div>

                {/*
                  ── Calendar embed slot ─────────────────────────────────
                  Paste your booking provider snippet here. Two examples:

                  Cal.com inline embed:
                    <script type="text/javascript">
                      (function (C, A, L) { ... })(window, "https://app.cal.com/embed/embed.js", "init");
                      Cal("init", "15min", {origin:"https://cal.com"});
                      Cal.ns["15min"]("inline", {
                        elementOrSelector:"#cal-embed",
                        config: {layout: "month_view"},
                        calLink: "<your-handle>/15min",
                      });
                    </script>
                    <div id="cal-embed" style="width:100%;height:680px;overflow:scroll" />

                  Calendly inline embed:
                    <div
                      className="calendly-inline-widget"
                      data-url="https://calendly.com/<your-handle>/15min"
                      style={{ minWidth: 320, height: 680 }}
                    />
                    <script src="https://assets.calendly.com/assets/external/widget.js" async />

                  Until one of those is wired in, this placeholder block
                  renders so the page is never empty.
                */}
                <div
                  id="cal-embed"
                  className="flex flex-col items-center justify-center text-center px-6 py-16 bg-gradient-to-br from-violet-50 via-white to-cyan-50"
                  style={{ minHeight: 480 }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="h-12 w-12 text-violet-400 mb-5"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                    />
                  </svg>
                  <p className="text-base font-semibold text-gray-900 mb-2">
                    Calendar loading…
                  </p>
                  <p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-6">
                    Our scheduler embeds here. Until it&apos;s wired up,
                    email or call us directly and we&apos;ll get you on a
                    time within 24 hours.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <a
                      href="mailto:bbayley50@gmail.com?subject=Book%20a%2015-min%20audit%20call"
                      className="inline-flex items-center gap-2 rounded-lg bg-violet-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-violet-700 transition-colors"
                    >
                      Email to book
                    </a>
                    <a
                      href="tel:+12482147957"
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 text-gray-800 px-5 py-2.5 text-sm font-semibold hover:border-violet-300 transition-colors"
                    >
                      Or call us
                    </a>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-500 text-center">
                    🔒 15 minutes. No pitch. No contract.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
