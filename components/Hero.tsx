import Link from "next/link";
import Image from "next/image";
import HeroPhotoCarousel from "./HeroPhotoCarousel";
import HeroPrimaryCTA from "./HeroPrimaryCTA";

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
    src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80&fit=crop",
    alt: "Thriving restaurant dining room with warm lighting",
    label: "Restaurant · Cleveland, OH",
    stat: "Designed to turn traffic into leads",
  },
  {
    src: "https://images.unsplash.com/photo-1632759145351-1d592919f522?w=600&q=80&fit=crop",
    alt: "Roofer installing shingles on a residential roof",
    label: "Roofing · Columbus, OH",
    stat: "Example conversion-focused build",
  },
  {
    src: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80&fit=crop&crop=center",
    alt: "HVAC technician working on an air conditioning system",
    label: "HVAC · Cincinnati, OH",
    stat: "Built to capture emergency calls",
  },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* ── Main split layout ── */}
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 lg:min-h-[calc(100vh-64px)] items-center py-8 sm:py-14 lg:py-20">

          {/* ── Left: Text ── */}
          <div className="flex flex-col justify-center">

            {/* Social proof pill — reframed: "new agency" → boutique scarcity.
                On mobile we show only the primary boutique pill to save vertical
                space; the announcement banner above already surfaces the
                "booking calls this week" message. */}
            <div className="flex flex-wrap items-center gap-3 mb-5 sm:mb-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 sm:px-4 sm:py-1.5 shadow-sm">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-500" aria-hidden />
                <span className="text-[0.7rem] sm:text-xs font-medium text-gray-600">
                  Boutique by design. Limited builds per quarter.
                </span>
              </div>
              <div className="hidden sm:inline-flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
                <span className="text-xs font-medium text-gray-500">
                  Founding cohort — booking calls this week
                </span>
              </div>
            </div>

            {/* Headline — Playfair Display text art.
                Mobile clamp lower bound reduced from 2.4rem → 1.95rem so the
                headline takes 3 short lines instead of pushing the CTA below
                the fold. */}
            <h1 className="animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
              {/* Line 1: large serif */}
              <span
                className="block font-display font-bold text-gray-900 leading-[1.05] tracking-tight"
                style={{ fontSize: "clamp(1.95rem, 5.5vw, 4.5rem)" }}
              >
                Your Phone Should
              </span>
              {/* Line 2: italic serif with gradient accent */}
              <span
                className="block font-display font-bold italic leading-[1.05] tracking-tight"
                style={{
                  fontSize: "clamp(1.95rem, 5.5vw, 4.5rem)",
                  background: "linear-gradient(90deg, #7c3aed 0%, #0891b2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Be Ringing More.
              </span>
              {/* Line 3: muted. Was text-gray-200 — too faint to read on
                  mobile against the white background. text-gray-300 reads
                  cleanly while still de-emphasizing the line vs. the first
                  two. */}
              <span
                className="block font-display font-bold text-gray-300 leading-[1.05] tracking-tight"
                style={{ fontSize: "clamp(1.95rem, 5.5vw, 4.5rem)" }}
              >
                Every Single Month.
              </span>
            </h1>

            {/* Sub copy — tighter on mobile so the primary CTA stays above
                the fold. */}
            <p
              className="mt-5 sm:mt-7 text-base sm:text-lg text-gray-500 leading-relaxed max-w-lg animate-fade-in-up"
              style={{ animationDelay: "0.18s" }}
            >
              We build, host, and manage websites for local businesses that do
              one thing: turn visitors into paying customers.{" "}
              <span className="text-gray-800 font-medium">
                Not a digital business card — a lead machine.
              </span>
            </p>

            {/* ── Mobile photo carousel ──
                Lives inline here on mobile (between subhead and CTA) to
                break up the text block. On desktop the photo collage lives
                in the right column of the grid, so this is hidden. */}
            <div
              className="lg:hidden mt-6 animate-fade-in-up"
              style={{ animationDelay: "0.22s" }}
            >
              <HeroPhotoCarousel />
            </div>

            {/* Primary CTA — Book a call (with audit form as fallback toggle) */}
            <div
              className="mt-6 sm:mt-9 max-w-xl animate-fade-in-up"
              style={{ animationDelay: "0.26s" }}
            >
              <HeroPrimaryCTA />
            </div>

            {/* Secondary nav links */}
            <div
              className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 animate-fade-in-up"
              style={{ animationDelay: "0.32s" }}
            >
              <Link
                href="/#sample-previews"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
              >
                See example sites
                <span aria-hidden>→</span>
              </Link>
              <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-gray-300" aria-hidden />
              <Link
                href="/#pricing"
                className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
              >
                See pricing →
              </Link>
            </div>

            {/* Stats — reframed around the call commitment.
                On mobile we shorten "Birmingham, MI" → "Birmingham" so the
                third column doesn't wrap onto two lines, and use smaller
                numerals + tighter top spacing. */}
            <div
              className="mt-6 pt-5 sm:mt-10 sm:pt-8 border-t border-gray-100 grid grid-cols-3 gap-3 sm:gap-6 max-w-sm animate-fade-in-up"
              style={{ animationDelay: "0.38s" }}
            >
              {[
                { num: "15 min", numMobile: "15 min", label: "Audit call length" },
                { num: "Lead-first", numMobile: "Lead-first", label: "Build approach" },
                { num: "Birmingham, MI", numMobile: "Birmingham", label: "Built locally" },
              ].map(({ num, numMobile, label }) => (
                <div key={label}>
                  <div className="font-display text-lg sm:text-2xl font-bold text-gray-900 leading-tight">
                    <span className="sm:hidden">{numMobile}</span>
                    <span className="hidden sm:inline">{num}</span>
                  </div>
                  <div className="mt-1 text-[0.65rem] sm:text-xs text-gray-400 font-medium leading-snug">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile carousel was previously here as a separate row at the
              bottom of the grid; it's now inlined between the subhead and
              the CTA inside the text column so the image breaks up the
              text block instead of trailing it. */}

          {/* ── Right: Photo collage (desktop only) ── */}
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
