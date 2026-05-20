import type { Metadata } from "next";
import Link from "next/link";
import CalEmbed from "@/components/portal/CalEmbed";

export const metadata: Metadata = {
  title: "Book a Free 15-Min Audit Call · Macrolight Builder",
  description:
    "Hop on a 15-minute call with a founder. We'll screen-share your site, run our 20-point audit live, and show you the biggest leaks. No pitch, no contract.",
};

const AGENDA = [
  "Screen-share your current site live",
  "Run our 20-point audit while you watch",
  "Show you the 3 biggest leaks costing leads",
  "Tell you straight whether we're a fit",
];

const TRUST_CHIPS = [
  { label: "15 minutes", emoji: "⏱" },
  { label: "Free", emoji: "💳" },
  { label: "No pitch", emoji: "🛑" },
  { label: "No contract", emoji: "📄" },
];

interface BookPageProps {
  searchParams: Promise<{ plan?: string }>;
}

/**
 * Public /book page.
 *
 * Shares the same embed wrapper styling as /portal/book-a-call so the
 * booking surface feels continuous between the public funnel and the
 * logged-in portal, but adds marketing-grade chrome on top: branded
 * header, trust chips, founder reassurance card, and an inline agenda.
 */
export default async function BookPage({ searchParams }: BookPageProps) {
  const { plan } = await searchParams;
  const planLabel = plan
    ? plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase()
    : null;

  // Cal.com booking link — derived from env so the same wiring works in
  // dev, preview, and prod. If unset, we fall through to the email/phone
  // fallback below.
  const calUsername = process.env.NEXT_PUBLIC_CAL_USERNAME ?? "";
  const calSlug = process.env.NEXT_PUBLIC_CAL_EVENT_SLUG ?? "";
  const calLink = calUsername && calSlug ? `${calUsername}/${calSlug}` : null;

  // When the visitor arrives from a pricing card we prefill the Cal "Notes"
  // field so whoever takes the call sees the plan context up front.
  const calNotes = planLabel
    ? `Interested in the ${planLabel} plan.`
    : "";

  return (
    <section className="relative min-h-screen overflow-hidden bg-gray-50">
      {/* Decorative background — soft brand wash that fades to flat gray-50
          below the fold, so the page has visual lift up top without
          overwhelming the embed card. */}
      <div
        className="absolute inset-x-0 top-0 h-[480px] pointer-events-none"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(124, 58, 237, 0.08) 0%, rgba(8, 145, 178, 0.05) 35%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-4xl px-5 sm:px-8 lg:px-12 py-10 lg:py-14">

        {/* Top row — back link + phone */}
        <div className="flex items-center justify-between mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-violet-600 hover:text-violet-800 transition-colors"
          >
            ← Back to home
          </Link>
          <a
            href="tel:+12482147957"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-violet-700 transition-colors"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-violet-600" aria-hidden>
              <path d="M2 3.5A1.5 1.5 0 013.5 2h2.879a1.5 1.5 0 011.06.44l1.829 1.828a1.5 1.5 0 01.328 1.628l-.715 1.788a11.04 11.04 0 005.434 5.434l1.788-.715a1.5 1.5 0 011.628.328l1.829 1.829a1.5 1.5 0 01.439 1.06V16.5A1.5 1.5 0 0116.5 18h-1A13.5 13.5 0 012 4.5v-1z" />
            </svg>
            (248) 214-7957
          </a>
        </div>

        {/* Header block */}
        <div className="max-w-2xl mb-10">
          {planLabel && (
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-violet-50 border border-violet-100 px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" aria-hidden />
              <span className="text-xs font-semibold text-violet-700">
                Talking about the {planLabel} plan
              </span>
            </div>
          )}

          <h1
            className="font-display font-bold text-gray-900 leading-[1.05] tracking-tight"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.4rem)" }}
          >
            Book your free{" "}
            <span
              style={{
                background:
                  "linear-gradient(90deg, #7c3aed 0%, #0891b2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              15-min audit call.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-gray-600 leading-relaxed">
            Hop on with{" "}
            <span className="font-semibold text-gray-900">
              Bradley or Nick
            </span>
            . We&apos;ll screen-share your site, run our 20-point audit live,
            and show you exactly where you&apos;re losing customers.
          </p>

          {/* Trust chips */}
          <div className="mt-6 flex flex-wrap gap-2">
            {TRUST_CHIPS.map(({ label, emoji }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm"
              >
                <span aria-hidden>{emoji}</span>
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Embed card — same inner wrapper as the portal page (white card,
            rounded, bordered), but here we add a branded title strip and a
            softer brand-tinted shadow to give it marketing weight. */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-violet-200/40 overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-violet-50/60 via-white to-cyan-50/60 flex items-center justify-between">
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-violet-600">
                Pick a time
              </p>
              <p className="text-base font-bold text-gray-900 mt-0.5">
                Available this week
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
              Calendar live
            </div>
          </div>

          <div className="bg-white rounded-xl p-2 sm:p-4">
            {calLink ? (
              <CalEmbed calLink={calLink} notes={calNotes} />
            ) : (
              <div
                className="flex flex-col items-center justify-center text-center px-6 py-16"
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
                  Booking is being set up
                </p>
                <p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-6">
                  The calendar isn&apos;t configured yet. Email or call us
                  directly and we&apos;ll get you on a time within 24 hours.
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
            )}
          </div>
        </div>

        {/* Below the embed — founder reassurance + call agenda, side by
            side on desktop. */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Founder card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex -space-x-2">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 ring-2 ring-white flex items-center justify-center text-sm font-bold text-white">
                  BB
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-700 ring-2 ring-white flex items-center justify-center text-sm font-bold text-white">
                  NO
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  Bradley Bayley &amp; Nick Ottoy
                </p>
                <p className="text-xs text-gray-500">
                  Co-Founders, Macrolight Builder
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              You&apos;ll be on the call with one of us — no SDR, no handoff.
              Every audit is run by a founder, so the advice you get is the
              advice we&apos;d give a paying client.
            </p>
          </div>

          {/* Agenda card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-violet-600">
                On the call
              </p>
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gray-400">
                4 things
              </span>
            </div>
            <ul className="space-y-2.5">
              {AGENDA.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-gray-700"
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5"
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
        </div>

        {/* Mobile phone footer (desktop shows the call CTA in the top-right
            row instead). */}
        <p className="sm:hidden mt-8 text-sm text-gray-500 text-center">
          Prefer to call?{" "}
          <a
            href="tel:+12482147957"
            className="font-semibold text-violet-600 hover:text-violet-700"
          >
            (248) 214-7957
          </a>
        </p>
      </div>
    </section>
  );
}
