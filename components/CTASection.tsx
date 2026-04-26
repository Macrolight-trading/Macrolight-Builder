import Link from "next/link";
import Image from "next/image";

interface CTASectionProps {
  eyebrow?: string;
  headline?: string;
  subhead?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

const TRUST_SIGNALS = [
  { value: "120+", label: "Businesses helped" },
  { value: "4.9★", label: "Average rating" },
  { value: "< 24 hrs", label: "Avg. response" },
  { value: "0", label: "Long-term contracts" },
];

export default function CTASection({
  eyebrow = "Ready when you are",
  headline = "Get Your Free Website Audit.",
  subhead = "We analyze your site across 20 conversion factors and send you a prioritized action plan — no cost, no commitment.",
  primaryLabel = "Request My Audit",
  primaryHref = "/contact",
  secondaryLabel = "See Pricing",
  secondaryHref = "/pricing",
}: CTASectionProps) {
  return (
    <section className="bg-gray-900 overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 items-stretch">

          {/* ── Left: CTA content (3/5 width) ── */}
          <div className="lg:col-span-3 py-24 sm:py-32 pr-0 lg:pr-16">

            {/* Section label */}
            <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-14">
              <span className="text-xs font-semibold uppercase tracking-widest text-white/40">
                {eyebrow}
              </span>
              <span className="flex items-center gap-2 text-xs text-white/30 uppercase tracking-widest">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Available now
              </span>
            </div>

            {/* Trust stats */}
            <div className="grid grid-cols-2 gap-6 mb-14 max-w-md">
              {TRUST_SIGNALS.map(({ value, label }) => (
                <div key={label}>
                  <span className="font-display font-bold text-white leading-none" style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)" }}>
                    {value}
                  </span>
                  <span className="block mt-1.5 text-xs uppercase tracking-wide text-white/35">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Headline */}
            <h2
              className="font-display font-bold text-white leading-[1.1] tracking-tight mb-7"
              style={{ fontSize: "clamp(2rem, 5vw, 3.8rem)" }}
            >
              {headline}
            </h2>

            <p className="text-base text-white/50 leading-relaxed max-w-lg mb-10">
              {subhead}
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <Link
                href={primaryHref}
                className="btn-gradient inline-flex items-center gap-2.5 px-8 py-4 text-sm font-bold rounded-xl whitespace-nowrap shadow-lg"
              >
                {primaryLabel}
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link
                href={secondaryHref}
                className="text-sm font-semibold text-white/50 hover:text-white transition-colors"
              >
                {secondaryLabel} →
              </Link>
            </div>

            {/* Trust note */}
            <div className="mt-6 flex items-center gap-2.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 text-emerald-400 shrink-0" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <p className="text-sm text-white/40">
                No contracts. Free audit delivered within 24 hours.
              </p>
            </div>
          </div>

          {/* ── Right: Photo panel (2/5 width) ── */}
          <div className="hidden lg:block lg:col-span-2 relative -mr-12 overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=85&fit=crop&crop=faces"
              alt="Professional reviewing website results on a laptop"
              fill
              sizes="40vw"
              className="object-cover object-center"
            />
            {/* Gradient fade into the dark section on the left */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/20 to-transparent" />

            {/* Floating review card */}
            <div className="absolute bottom-12 left-8 right-8 bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-2xl">
              <div className="flex gap-1 mb-2">
                {["★","★","★","★","★"].map((s, i) => (
                  <span key={i} className="text-amber-400 text-sm">{s}</span>
                ))}
              </div>
              <p className="text-sm font-medium text-gray-800 leading-snug mb-3">
                "We went from 2 leads a week to 14 leads a week in the first month."
              </p>
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-xs">
                  R
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">Rachel D.</p>
                  <p className="text-[0.6rem] text-gray-400">HVAC Company · Dayton, OH</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
