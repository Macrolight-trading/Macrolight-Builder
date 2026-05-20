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
  { value: "15 min", label: "Audit call length" },
  { value: "Lead-first", label: "Build philosophy" },
  { value: "Founding", label: "Client cohort" },
  { value: "0", label: "Long-term contracts" },
];

const CALL_AGENDA = [
  "Screen-share your current site live",
  "Run our 20-point audit while you watch",
  "Show you the 3 biggest leaks costing leads",
  "Tell you straight whether we're a fit",
];

export default function CTASection({
  eyebrow = "Ready when you are",
  headline = "Book your free 15-min audit call.",
  subhead = "Hop on with a founder. We'll screen-share your site, run our 20-point audit live, and show you exactly where you're losing customers. No pitch, no contract — and if we're not a fit, we'll tell you who is.",
  primaryLabel = "Find a time on our calendar",
  primaryHref = "/book",
  secondaryLabel = "See Pricing",
  secondaryHref = "/pricing",
}: CTASectionProps) {
  return (
    <section className="bg-gray-900 overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 items-stretch">

          {/* Left: CTA content (3/5 width) */}
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

            <p className="text-base text-white/50 leading-relaxed max-w-lg mb-8">
              {subhead}
            </p>

            {/* Call agenda — reduces booking anxiety by spelling out what happens */}
            <div className="mb-10 max-w-lg">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/40 mb-4">
                On the call, we&apos;ll:
              </p>
              <ul className="space-y-2.5">
                {CALL_AGENDA.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/70">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden>
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

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
                15 minutes. No pitch. No contract. You leave with the audit either way.
              </p>
            </div>
          </div>

          {/* Right: Photo panel (2/5 width) */}
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
              <p className="text-sm font-medium text-gray-800 leading-snug mb-3">
                &ldquo;We build, host, and manage lead-generating websites for local businesses focused on real revenue growth.&rdquo;
              </p>
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-xs">
                  M
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">
                    Bradley Bayley &amp; Nick Ottoy
                  </p>
                  <p className="text-[0.6rem] text-gray-400">
                    Co-Founders, Macrolight Builder
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
