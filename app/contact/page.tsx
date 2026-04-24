import type { Metadata } from "next";
import Image from "next/image";
import Section from "@/components/Section";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Request a Free Website Audit",
  description:
    "Tell us about your business. We'll analyze your current website and send you a prioritized conversion plan within 24 hours.",
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
      <section className="relative overflow-hidden pt-20 pb-10 sm:pt-28">
        <div
          className="absolute inset-0 grid-bg pointer-events-none"
          aria-hidden
        />
        <div
          className="orb bg-violet-600 h-80 w-80 -top-20 -left-20"
          aria-hidden
        />
        <div
          className="orb bg-cyan-500 h-80 w-80 top-10 -right-20"
          aria-hidden
        />

        <div className="relative mx-auto max-w-4xl px-5 sm:px-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400 animate-fade-in">
            Free audit
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.05] animate-fade-in-up">
            Request Free <span className="gradient-text">Website Audit</span>
          </h1>
          <p className="mt-5 text-lg text-white/70 max-w-2xl mx-auto animate-fade-in-up">
            Tell us about your business. We&apos;ll review your current
            website and send a prioritized conversion plan within 24 hours —
            no cost, no pitch.
          </p>
        </div>
      </section>

      <Section padding="lg" className="border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
          <div className="lg:col-span-2 space-y-5">
            {bullets.map((b, i) => (
              <div key={b.title} className="flex gap-4">
                <div className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/30 to-cyan-500/30 ring-1 ring-inset ring-white/10 text-white font-semibold text-sm">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    {b.title}
                  </h3>
                  <p className="mt-1 text-sm text-white/60 leading-relaxed">
                    {b.body}
                  </p>
                </div>
              </div>
            ))}

            <div className="surface rounded-2xl p-5 mt-8">
              <div className="text-xs text-white/40 uppercase tracking-wider">
                Prefer email?
              </div>
              <a
                href="mailto:hello@macrolight.co"
                className="mt-1 block text-white font-medium hover:text-cyan-300 transition-colors"
              >
                hello@macrolight.co
              </a>
            </div>

            <div className="relative mt-6 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/40 p-4">
              <Image
                src="/images/placeholders/audit-illustration.svg"
                alt="Stylized document and checklist representing your audit report"
                width={400}
                height={360}
                className="h-auto w-full opacity-90"
                unoptimized
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            <ContactForm />
          </div>
        </div>
      </Section>
    </>
  );
}
