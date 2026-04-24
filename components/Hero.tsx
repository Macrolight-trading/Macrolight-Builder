import Image from "next/image";
import Button from "./Button";

const AVATARS = [
  "/images/placeholders/avatar-1.svg",
  "/images/placeholders/avatar-2.svg",
  "/images/placeholders/avatar-3.svg",
  "/images/placeholders/avatar-4.svg",
  "/images/placeholders/avatar-5.svg",
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-28 sm:pt-28 sm:pb-36">
      <div
        className="absolute inset-0 grid-bg pointer-events-none"
        aria-hidden
      />
      <div
        className="orb bg-violet-600 h-[500px] w-[500px] -top-40 -left-40"
        aria-hidden
      />
      <div
        className="orb bg-cyan-500 h-[400px] w-[400px] top-20 -right-20"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <div className="animate-fade-in inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs text-white/70 backdrop-blur">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Now accepting new clients for Q2 2026
          </div>

          <h1 className="animate-fade-in-up mt-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.05]">
            Turn Your Website Into a{" "}
            <span className="gradient-text">Lead Generation Machine</span>
          </h1>

          <p className="animate-fade-in-up mt-6 text-lg sm:text-xl text-white/70 leading-relaxed max-w-2xl mx-auto">
            We build, host, and manage high-converting websites for local
            businesses. Not a digital business card — a{" "}
            <span className="text-white font-semibold">
              client acquisition system
            </span>{" "}
            installed into your business.
          </p>

          <div className="animate-fade-in-up mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button href="/contact" variant="primary" size="lg">
              Get a Free Website Audit
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path
                  d="M5 12h14M13 5l7 7-7 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
            <Button href="/#sample-previews" variant="secondary" size="lg">
              See example sites
            </Button>
          </div>

          <div className="animate-fade-in mt-16 flex flex-col items-center gap-4">
            <div className="flex -space-x-2">
              {AVATARS.map((src, i) => (
                <div
                  key={src}
                  className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-zinc-950"
                  style={{ zIndex: 5 - i }}
                >
                  <Image
                    src={src}
                    alt=""
                    width={36}
                    height={36}
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <div className="flex items-center gap-0.5 text-amber-400">
                {[0, 1, 2, 3, 4].map((i) => (
                  <svg
                    key={i}
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.163c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118L10 14.347l-3.368 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.645 9.384c-.784-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.957z" />
                  </svg>
                ))}
              </div>
              <span>Trusted by 120+ local businesses</span>
            </div>
          </div>
        </div>

        <div className="animate-scale-in mt-20 relative mx-auto max-w-5xl">
          <div className="absolute -inset-x-8 -inset-y-6 bg-gradient-to-br from-violet-500/20 via-transparent to-cyan-500/20 blur-3xl" />
          <div className="relative overflow-hidden rounded-2xl border border-zinc-600/50 bg-zinc-900/80 shadow-2xl">
            <div className="flex items-center gap-2 border-b border-white/5 bg-white/[0.02] px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              <div className="mx-auto flex items-center gap-1.5 rounded-md bg-zinc-800/80 px-3 py-1 text-[11px] text-zinc-400 ring-1 ring-white/5">
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-3 w-3 text-emerald-400"
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                yourbusiness.com
              </div>
            </div>
            <div className="p-0 bg-zinc-950/50">
              <Image
                src="/images/placeholders/metrics-dashboard.svg"
                alt="Example lead dashboard: pipeline metrics and lead volume"
                width={960}
                height={520}
                className="h-auto w-full opacity-95"
                unoptimized
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
