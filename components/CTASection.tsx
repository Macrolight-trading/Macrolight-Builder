import Button from "./Button";

interface CTASectionProps {
  eyebrow?: string;
  headline?: string;
  subhead?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export default function CTASection({
  eyebrow = "Ready when you are",
  headline = "Get Your Free Website Audit",
  subhead = "We'll analyze your current site across 20 conversion factors and send you a prioritized plan — no cost, no commitment.",
  primaryLabel = "Request My Audit",
  primaryHref = "/contact",
  secondaryLabel = "See Pricing",
  secondaryHref = "/pricing",
}: CTASectionProps) {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-12">
        <div className="relative overflow-hidden rounded-3xl border border-violet-200/60 bg-gradient-to-br from-violet-600 via-violet-700 to-cyan-700 p-10 sm:p-16 text-center shadow-lg shadow-violet-500/10">
          <div
            aria-hidden
            className="absolute inset-0 grid-bg opacity-25 pointer-events-none"
          />
          <div
            aria-hidden
            className="orb bg-cyan-400 h-72 w-72 -top-24 -right-20 opacity-30"
          />
          <div
            aria-hidden
            className="orb bg-fuchsia-500 h-64 w-64 -bottom-20 -left-10 opacity-25"
          />

          <div className="relative">
            <p className="text-sm font-semibold uppercase tracking-wider text-violet-100">
              {eyebrow}
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {headline}
            </h2>
            <p className="mt-5 text-violet-50/90 text-lg max-w-2xl mx-auto">
              {subhead}
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button href={primaryHref} variant="primary" size="lg">
                {primaryLabel}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4"
                  aria-hidden
                >
                  <path
                    d="M5 12h14M13 5l7 7-7 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>
              <Button
                href={secondaryHref}
                variant="secondary"
                size="lg"
                className="!bg-white/10 !border-white/30 !text-white hover:!bg-white/20"
              >
                {secondaryLabel}
              </Button>
            </div>

            <p className="mt-6 text-xs text-violet-200/80">
              Average response time: under 24 hours
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
