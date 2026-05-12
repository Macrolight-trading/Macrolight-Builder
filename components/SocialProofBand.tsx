import Image from "next/image";

const STATS = [
  { value: "Boutique", label: "Full attention on every build" },
  { value: "Lead-first", label: "Built for calls, forms, and booked jobs" },
  { value: "< 24 hr", label: "Audit turnaround, no commitment" },
  { value: "No fluff", label: "Clear positioning, transparent execution" },
];

export default function SocialProofBand() {
  return (
    <section className="relative overflow-hidden">
      {/* Full-width background image */}
      <div className="absolute inset-0">
        {/*
          TODO(originals): replace with a Macrolight-owned hero shot (or
          a brand-color gradient/SVG) and drop into /public/img/.
          The dark overlay below masks 95% of the image so a 1600w q=60
          request is plenty — dropping from 1920w + q=80 saves ~120 KB
          on the LCP path. alt="" + aria-hidden because the image is
          purely decorative (the overlay hides the subject).
        */}
        <Image
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=60&fit=crop"
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority={false}
        />
        {/* Dark overlay with violet tint */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/85 to-violet-900/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-24 sm:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: quote */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50 mb-6">
              From the founders
            </p>
            <blockquote
              className="font-display font-bold italic text-white leading-[1.15] tracking-tight mb-8"
              style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)" }}
            >
              &ldquo;We built Macrolight because we kept watching great local
              businesses lose customers to worse competitors with better
              websites. We&rsquo;re here to fix that.&rdquo;
            </blockquote>
            <div className="flex items-center gap-4">
              {/* Stacked initials — replace with real headshots once
                  /public/team/bradley.jpg and /public/team/nick.jpg exist. */}
              <div className="flex -space-x-3">
                <div className="h-12 w-12 rounded-full bg-violet-500 ring-2 ring-gray-900 flex items-center justify-center text-white font-bold text-sm">
                  BB
                </div>
                <div className="h-12 w-12 rounded-full bg-cyan-500 ring-2 ring-gray-900 flex items-center justify-center text-white font-bold text-sm">
                  NO
                </div>
              </div>
              <div>
                <p className="text-white font-semibold">
                  Bradley Bayley &amp; Nick Ottoy
                </p>
                <p className="text-white/50 text-sm">
                  Co-Founders, Macrolight Builder &middot; Birmingham, MI
                </p>
              </div>
            </div>
          </div>

          {/* Right: stats grid */}
          <div className="grid grid-cols-2 gap-6">
            {STATS.map(({ value, label }) => (
              <div
                key={label}
                className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 p-6"
              >
                <div
                  className="font-display font-bold text-white leading-none mb-2"
                  style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
                >
                  {value}
                </div>
                <p className="text-white/50 text-sm font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
