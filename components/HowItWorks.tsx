import Section from "./Section";

const steps = [
  {
    number: "01",
    title: "We analyze your current website",
    description:
      "A 20-point audit covering speed, conversion architecture, mobile UX, messaging, and lead flow. You receive a clear report — not a sales pitch.",
  },
  {
    number: "02",
    title: "We redesign it for conversions",
    description:
      "Our team rebuilds your site with research-backed layouts, copywriting that actually sells, and the lead capture system wired in end-to-end.",
  },
  {
    number: "03",
    title: "We deploy and manage everything",
    description:
      "Launch on Vercel's edge network. We handle hosting, updates, edits, and optimizations every month so you can focus on running your business.",
  },
];

export default function HowItWorks() {
  return (
    <Section
      id="how-it-works"
      padding="xl"
      className="relative border-t border-white/5 bg-zinc-900/20"
    >
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-violet-300">
          How it works
        </p>
        <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
          From legacy site to lead engine — in 21 days.
        </h2>
        <p className="mt-4 text-lg text-white/60">
          A simple, proven three-step install. No agency theater, no missed
          deadlines, no mystery.
        </p>
      </div>

      <div className="mt-16 relative">
        <div
          className="hidden lg:block absolute top-14 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
          aria-hidden
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div key={step.number} className="relative">
              <div
                className="absolute -top-4 left-1/2 lg:left-10 -translate-x-1/2 lg:translate-x-0 z-10"
                aria-hidden
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 text-white font-bold shadow-glow ring-4 ring-zinc-950">
                  {idx + 1}
                </div>
              </div>
              <div className="surface rounded-2xl p-7 pt-10 h-full">
                <div className="text-xs font-mono text-white/30 tracking-widest">
                  STEP {step.number}
                </div>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm text-white/60 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
