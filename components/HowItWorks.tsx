import Image from "next/image";

const steps = [
  {
    num: "01",
    title: "We analyze your current website",
    desc: "A 20-point audit covering speed, conversion architecture, mobile UX, messaging, and lead flow. You receive a clear prioritized report — not a sales pitch.",
    detail: "Free · No commitment · Delivered in 24 hrs",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=85&fit=crop",
    imgAlt: "Website analytics and conversion audit on screen",
    accentColor: "bg-violet-500",
  },
  {
    num: "02",
    title: "We redesign it for conversions",
    desc: "Our team rebuilds your site with research-backed layouts, copy that actually sells, and your lead capture system wired in end-to-end. Ready in as little as 21 days.",
    detail: "Launched in as little as 21 days",
    img: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&q=85&fit=crop",
    imgAlt: "Web designer working on a local business website redesign",
    accentColor: "bg-cyan-500",
  },
  {
    num: "03",
    title: "We deploy and manage everything",
    desc: "Your site launches on Vercel's global edge network. We handle hosting, security, monthly edits, and ongoing optimization — so you can focus on running your business.",
    detail: "Month-to-month · Cancel anytime",
    img: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=85&fit=crop&crop=faces",
    imgAlt: "Business owner happy with their new website results",
    accentColor: "bg-emerald-500",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-gray-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">

        {/* Section label */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-5 mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            The Process
          </span>
          <span className="text-xs text-gray-300 uppercase tracking-widest hidden sm:block">
            From old site to lead engine — in 21 days
          </span>
        </div>

        {/* Intro */}
        <div className="mb-16 max-w-2xl">
          <h2
            className="font-display font-bold text-gray-900 leading-[1.1] tracking-tight"
            style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}
          >
            Simple process.{" "}
            <em className="not-italic text-violet-600">Real results.</em>
          </h2>
          <p className="mt-4 text-base text-gray-500 leading-relaxed">
            No jargon. No mystery. Here's exactly what happens after you reach out.
          </p>
        </div>

        {/* Step cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div
              key={step.num}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl hover:shadow-gray-200/60 hover:-translate-y-1 transition-all duration-300"
            >
              {/* Photo */}
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={step.img}
                  alt={step.imgAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {/* Number badge */}
                <div className="absolute top-4 left-4">
                  <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${step.accentColor} text-white text-sm font-bold shadow-md`}>
                    {i + 1}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-7">
                <h3
                  className="font-display font-bold text-gray-900 leading-[1.2] tracking-tight mb-3"
                  style={{ fontSize: "clamp(1.1rem, 2vw, 1.35rem)" }}
                >
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-5">
                  {step.desc}
                </p>

                {/* Detail badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
                  <span className="text-[0.65rem] font-medium text-gray-500 uppercase tracking-wide">
                    {step.detail}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-14 flex items-center gap-4 text-gray-300 border-t border-gray-200 pt-8">
          <span className="h-px flex-1 bg-gray-200" />
          <span className="text-xs uppercase tracking-widest text-gray-400">
            No agency theater. No missed deadlines. No mystery.
          </span>
          <span className="h-px flex-1 bg-gray-200" />
        </div>
      </div>
    </section>
  );
}
