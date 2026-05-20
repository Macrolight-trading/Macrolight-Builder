import type { Metadata } from "next";
import Link from "next/link";
import CalEmbed from "@/components/portal/CalEmbed";

export const metadata: Metadata = {
  title: "Book a Free 15-Min Audit Call · Macrolight Builder",
  description:
    "Hop on a 15-minute call with a founder. We'll screen-share your site, run our 20-point audit live, and show you the biggest leaks. No pitch, no contract.",
};

interface BookPageProps {
  searchParams: Promise<{ plan?: string }>;
}

/**
 * Public /book page. Visually mirrors /portal/book-a-call so a visitor who
 * later becomes a client sees a consistent booking surface inside and
 * outside the portal shell.
 *
 * Layout: single-column on a gray-50 background, modest title + subtitle,
 * white rounded card containing the Cal.com embed.
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
    <section className="bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-4xl px-5 sm:px-8 lg:px-12 py-10 lg:py-14">

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-violet-600 hover:text-violet-800 transition-colors mb-6"
        >
          ← Back to home
        </Link>

        {/* Header — matches portal's text-2xl + muted subtitle pattern */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Book a call</h1>
          <p className="mt-1 text-sm text-gray-500">
            Pick a time that works for you — calls are 15 minutes and you&apos;ll
            get a calendar invite plus a video link by email.
          </p>
        </div>

        {/* Plan-aware pill — surfaces the pricing context when a visitor
            arrives from the pricing section so they know we'll talk about
            the right tier. */}
        {planLabel && (
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-violet-50 border border-violet-100 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" aria-hidden />
            <span className="text-xs font-semibold text-violet-700">
              Talking about the {planLabel} plan
            </span>
          </div>
        )}

        {/* Embed card — same wrapper classes as the portal page */}
        <div className="bg-white rounded-xl border border-gray-200 p-2 sm:p-4">
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
                The calendar isn&apos;t configured yet. Please email or call us
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

        {/* Quiet phone footer — keeps a call path visible without competing
            with the embed visually. */}
        <p className="mt-6 text-sm text-gray-500">
          Prefer to call?{" "}
          <a
            href="tel:+12482147957"
            className="font-semibold text-violet-600 hover:text-violet-700 transition-colors"
          >
            (248) 214-7957
          </a>
        </p>
      </div>
    </section>
  );
}
