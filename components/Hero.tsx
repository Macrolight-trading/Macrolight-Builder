import Link from "next/link";
import Image from "next/image";

const MARQUEE_ITEMS = [
  "Conversion-Optimized Design",
  "Lead Generation Systems",
  "Fast Edge Hosting",
  "Mobile-First Builds",
  "Local SEO",
  "CRM Integration",
  "Monthly Support",
  "Analytics & Tracking",
  "A/B Testing",
  "Page Speed 100",
];

// Photo collage — real businesses benefiting from great websites
const COLLAGE = [
  {
    src: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&q=80&fit=crop",
    alt: "Business owner reviewing website results with their team",
    label: "Roofing · Columbus, OH",
    stat: "+340% more leads",
  },
  {
    src: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80&fit=crop&crop=center",
    alt: "Roofing contractor on the job",
    label: "HVAC · Cincinnati, OH",
    stat: "21 days to launch",
  },
  {
    src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80&fit=crop",
    alt: "Thriving restaurant dining room",
    label: "Restaurant · Cleveland, OH",
    stat: "4.9★ client rating",
  },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* ── Main split layout ── */}
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 min-h-[calc(100vh-64px)] items-center py-16 lg:py-20">

          {/* ── Left: Text ── */}
          <div className="flex flex-col justify-center">

            {/* Social proof pill */}
            <div className="flex flex-wrap items-center gap-3 mb-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 shadow-sm">
                <span className="flex">
                  {["★","★","★","★","★"].map((s, i) => (
                    <span key={i} className="text-amber-400 text-[0.6rem]">{s}</span>
                  ))}
                </span>
                <span className="text-xs font-medium text-gray-600">
                  4.9 · 127 sites launched
                </span>
              </div>
              <div className="inline-flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
                <span className="text-xs font-medium text-gray-500">
                  3 build slots open — next start May 18
                </span>
              </div>
            </div>

            {/* Headline — Playfair Display text art */}
            <h1 className="animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
              {/* Line 1: large serif */}
              <span
                className="block font-display font-bold text-gray-900 leading-[1.05] tracking-tight"
                style={{ fontSize: "clamp(2.4rem, 5.5vw, 4.5rem)" }}
              >
                Your Phone Should
              </span>
              {/* Line 2: italic serif with gradient accent */}
              <span
                className="block font-display font-bold italic leading-[1.05] tracking-tight"
                style={{
                  fontSize: "clamp(2.4rem, 5.5vw, 4.5rem)",
                  background: "linear-gradient(90deg, #7c3aed 0%, #0891b2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Be Ringing More.
              </span>
              {/* Line 3: smaller, muted */}
              <span
                className="block font-display font-bold text-gray-200 leading-[1.05] tracking-tight"
                style={{ fontSize: "clamp(2.4rem, 5.5vw, 4.5rem)" }}
              >
                Every Single Month.
              </span>
            </h1>

            {/* Sub copy */}
            <p
              className="mt-7 text-lg text-gray-500 leading-relaxed max-w-lg animate-fade-in-up"
              style={{ animationDelay: "0.18s" }}
            >
              We build, host, and manage websites for local businesses that do
              one thing: turn visitors into paying customers.{" "}
              <span className="text-gray-800 font-medium">
                Not a digital business card — a lead machine.
              </span>
            </p>

            {/* CTAs */}
            <div
              className="mt-9 flex flex-col sm:flex-row items-start gap-3 animate-fade-in-up"
              style={{ animationDelay: "0.26s" }}
            >
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 bg-violet-600 text-white px-7 py-4 text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors whitespace-nowrap shadow-lg shadow-violet-200"
              >
                Get a Free Audit
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link
                href="/#sample-previews"
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 border border-gray-300 px-6 py-4 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                See Example Sites →
              </Link>
            </div>

            {/* Micro-trust */}
            <p className="mt-4 text-xs text-gray-400 animate-fade-in-up" style={{ animationDelay: "0.32s" }}>
              No commitment · Free report within 24 hrs · No credit card
            </p>

            {/* Stats */}
            <div
              className="mt-10 pt-8 border-t border-gray-100 grid grid-cols-3 gap-6 max-w-sm animate-fade-in-up"
              style={{ animationDelay: "0.38s" }}
            >
              {[
                ["127",     "Sites built"],
                ["21 days", "Avg. to launch"],
                ["4.9★",    "Client rating"],
              ].map(([num, label]) => (
                <div key={label}>
                  <div className="font-display text-2xl font-bold text-gray-900 leading-none">{num}</div>
                  <div className="mt-1 text-xs text-gray-400 font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Photo collage ── */}
          <div className="hidden lg:flex flex-col gap-4 h-full items-stretch animate-fade-in" style={{ animationDelay: "0.2s" }}>

            {/* Top: large hero image */}
            <div className="relative rounded-2xl overflow-hidden flex-1 min-h-[260px] group shadow-xl shadow-gray-200/80">
              <Image
                src={COLLAGE[0].src}
                alt={COLLAGE[0].alt}
                fill
                sizes="(max-width: 1280px) 50vw, 600px"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                priority
              />
              {/* Overlay label */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
                <div>
                  <p className="text-[0.65rem] text-white/60 uppercase tracking-wider font-medium">{COLLAGE[0].label}</p>
                  <p className="text-sm font-bold text-white mt-0.5">{COLLAGE[0].stat}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-emerald-500/90 flex items-center justify-center">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-white" aria-hidden>
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Bottom: two smaller images side by side */}
            <div className="grid grid-cols-2 gap-4">
              {COLLAGE.slice(1).map((photo, i) => (
                <div key={i} className="relative rounded-2xl overflow-hidden h-44 group shadow-md shadow-gray-200/60">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 1280px) 25vw, 300px"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-[0.6rem] text-white/60 uppercase tracking-wider">{photo.label}</p>
                    <p className="text-xs font-bold text-white mt-0.5">{photo.stat}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Marquee ── */}
      <div className="border-t border-b border-gray-100 bg-gray-50 py-3.5 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-6 px-8 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gray-400"
            >
              {item}
              <span className="text-gray-300" aria-hidden>·</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
