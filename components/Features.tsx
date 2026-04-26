import Image from "next/image";

const SERVICES = [
  {
    num: "01",
    tag: "Design",
    title: "Conversion-Focused Design",
    desc: "Every section engineered around one question: will this visitor become a customer? No fluff — just layouts, copy, and calls-to-action proven to convert browsers into buyers.",
    bullets: ["Research-backed layouts", "Clear, compelling copy", "Mobile-first at every breakpoint"],
    img: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=900&q=85&fit=crop",
    imgAlt: "Designer working on a website conversion layout",
    imgRight: false,
  },
  {
    num: "02",
    tag: "Lead Capture",
    title: "Built-In Lead Capture System",
    desc: "Forms, click-to-call buttons, live chat, and follow-up sequences wired into one pipeline. The moment a visitor raises their hand, your team gets notified and takes over.",
    bullets: ["Instant lead notifications", "Click-to-call & contact forms", "CRM integration ready"],
    img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=85&fit=crop&crop=top",
    imgAlt: "Business owner receiving a new customer lead on their phone",
    imgRight: true,
  },
  {
    num: "03",
    tag: "Hosting",
    title: "Lightning Fast Hosting",
    desc: "Deployed on Vercel's global edge network. Sub-second page loads, 99.99% uptime, and automatic scaling so your site never goes down — even when ad campaigns drive traffic spikes.",
    bullets: ["Sub-second load times", "99.99% uptime guarantee", "Global edge network"],
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=85&fit=crop",
    imgAlt: "Fast loading website on a laptop and mobile device",
    imgRight: false,
  },
  {
    num: "04",
    tag: "Support",
    title: "Ongoing Support & Edits",
    desc: "Need a new service page, a seasonal promotion, or a price update? Submit a request and our team handles it within 48 hours. Your site stays fresh, accurate, and converting — always.",
    bullets: ["Unlimited content edits", "48-hour turnaround", "Dedicated support team"],
    img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=85&fit=crop",
    imgAlt: "Support team collaborating on a client website update",
    imgRight: true,
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">

        {/* Section header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-5 mb-20">
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            What We Do
          </span>
          <span className="text-xs text-gray-300 uppercase tracking-widest hidden sm:block">
            04 capabilities
          </span>
        </div>

        {/* Intro headline */}
        <div className="mb-20 max-w-3xl">
          <h2 className="font-display font-bold text-gray-900 leading-[1.1] tracking-tight"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
            Everything your website needs to{" "}
            <em className="not-italic text-violet-600">win new customers</em>
            , built in.
          </h2>
        </div>

        {/* Alternating image + text rows */}
        <div className="space-y-28">
          {SERVICES.map((s) => (
            <div
              key={s.num}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${s.imgRight ? "lg:[&>*:first-child]:order-2" : ""}`}
            >
              {/* Text side */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-[0.65rem] font-mono text-gray-300 tabular-nums">{s.num}</span>
                  <span className="inline-block rounded-full bg-violet-50 border border-violet-100 px-3 py-1 text-xs font-semibold text-violet-600 uppercase tracking-wide">
                    {s.tag}
                  </span>
                </div>
                <h3
                  className="font-display font-bold text-gray-900 leading-[1.1] tracking-tight mb-5"
                  style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)" }}
                >
                  {s.title}
                </h3>
                <p className="text-base text-gray-500 leading-relaxed mb-7">
                  {s.desc}
                </p>
                <ul className="space-y-3">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-3 text-sm font-medium text-gray-700">
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200">
                        <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3 text-emerald-600" aria-hidden>
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Image side */}
              <div className="relative">
                <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-gray-200/60 aspect-[4/3]">
                  <Image
                    src={s.img}
                    alt={s.imgAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                {/* Decorative accent */}
                <div
                  className={`absolute -z-10 w-48 h-48 rounded-full bg-violet-100 blur-3xl opacity-60 ${s.imgRight ? "-bottom-10 -left-10" : "-bottom-10 -right-10"}`}
                  aria-hidden
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
