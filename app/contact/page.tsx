import type { Metadata } from "next";
import Section from "@/components/Section";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Request a Free Website Audit",
  description:
    "Tell us about your business. We'll analyze your current website and send you a prioritized conversion plan within 24 hours.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Request a Free Website Audit — Macrolight Builders",
    description:
      "Get a no-obligation website conversion audit in 24 hours. We'll show you exactly how to turn more visitors into customers.",
    url: "https://macrolightbuilders.com/contact",
  },
};

const bullets = [
  {
    title: "Conversion teardown",
    body: "We audit every section of your current site for clarity, friction, and missed opportunity.",
  },
  {
    title: "Mobile & speed diagnostic",
    body: "We measure real-world performance on the devices your customers actually use.",
  },
  {
    title: "Competitor gap analysis",
    body: "We compare you side-by-side against the top three ranking competitors in your market.",
  },
  {
    title: "Prioritized action plan",
    body: "You receive a clear, ranked list of what to fix first for the fastest lift in leads.",
  },
];

export default function ContactPage() {
  return (
    <>
      {/* Page header */}
      <section className="relative overflow-hidden bg-gray-50 border-b border-gray-200 pt-20 pb-14 sm:pt-28">
        <div className="absolute inset-0 dot-bg pointer-events-none" aria-hidden />
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-violet-100 opacity-50 blur-3xl pointer-events-none" aria-hidden />

        <div className="relative mx-auto max-w-4xl px-5 sm:px-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-600 animate-fade-in">
            Free audit
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.05] animate-fade-in-up">
            Request Free{" "}
            <span className="gradient-text">Website Audit</span>
          </h1>
          <p className="mt-5 text-lg text-gray-500 max-w-2xl mx-auto animate-fade-in-up">
            Tell us about your business. We&apos;ll review your current
            website and send a prioritized conversion plan within 24 hours —
            no cost, no pitch.
          </p>
        </div>
      </section>

      {/* Content */}
      <Section padding="lg" className="bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
          {/* Left: what you get */}
          <div className="lg:col-span-2 space-y-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6">
              What's included
            </p>
            {bullets.map((b, i) => (
              <div key={b.title} className="flex gap-4">
                <div className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 border border-violet-100 text-violet-600 font-semibold text-sm">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {b.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                    {b.body}
                  </p>
                </div>
              </div>
            ))}

            {/* Email fallback */}
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 mt-8">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Prefer email?
              </div>
              <a
                href="mailto:hello@macrolight.co"
                className="mt-1 block text-gray-900 font-medium hover:text-violet-600 transition-colors"
              >
                hello@macrolight.co
              </a>
            </div>

            {/* Trust signals */}
            <div className="bg-violet-50 rounded-2xl border border-violet-100 p-5 mt-4">
              <div className="flex gap-3 mb-3">
                {["★","★","★","★","★"].map((s, i) => (
                  <span key={i} className="text-amber-400 text-sm">{s}</span>
                ))}
              </div>
              <p className="text-sm text-gray-700 font-medium">
                "Our leads doubled in the first two months. Best investment we made."
              </p>
              <p className="mt-2 text-xs text-gray-500">
                — Mike T., Roofing contractor, Columbus OH
              </p>
            </div>
          </div>

          {/* Right: form */}
          <div className="lg:col-span-3">
            <ContactForm />
          </div>
        </div>
      </Section>
    </>
  );
}
