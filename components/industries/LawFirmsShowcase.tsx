import Button from "@/components/Button";
import Section from "@/components/Section";
import ContactForm from "@/components/ContactForm";
import type { IndustryProfile } from "@/lib/industries";

/**
 * Law firms — deep navy docket, brass/gold trust line, serif headlines.
 * Example-site mock: confidential intake, bar credentials strip, consult slots.
 */
export default function LawFirmsShowcase({
  industry,
}: {
  industry: IndustryProfile;
}) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.14),transparent_58%)]"
      />

      <section className="relative overflow-hidden pt-20 pb-24 sm:pt-28 sm:pb-32">
        <div className="absolute inset-0 grid-bg-light pointer-events-none opacity-50" aria-hidden />
        <div className="orb h-[480px] w-[480px] -top-40 -left-28 bg-indigo-700" aria-hidden />
        <div className="orb h-[360px] w-[360px] top-32 -right-20 bg-blue-600 opacity-45" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-blue-200 animate-fade-in">
                <svg
                  className="h-3.5 w-3.5 text-amber-200"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M12 1L3 5v6c0 5.25 3.75 9.75 9 11 5.25-1.25 9-5.75 9-11V5l-9-4z" />
                </svg>
                Confidential · Attorney–client review request
              </div>

              <h1 className="animate-fade-in-up mt-5 font-serif text-4xl sm:text-5xl md:text-[3.4rem] font-bold tracking-tight text-zinc-900 leading-[1.1]">
                When someone searches for{" "}
                <span className="bg-gradient-to-r from-amber-200 via-amber-100 to-blue-200 bg-clip-text text-transparent">
                  justice in your city,
                </span>{" "}
                your site should be the one they trust.
              </h1>

              <p className="animate-fade-in-up mt-6 text-lg text-slate-300 max-w-xl leading-relaxed">
                {industry.heroTagline} We design intake, credibility, and
                consult scheduling so high-intent cases route to the right
                screen — not the wrong inbox.
              </p>

              <div className="animate-fade-in-up mt-8 flex flex-col sm:flex-row gap-3">
                <Button
                  href="/contact"
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border border-blue-400/20 hover:shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)]"
                >
                  Request case evaluation workflow
                </Button>
                <Button href="tel:+15550100" variant="outline" onLight size="lg">
                  Speak with intake
                </Button>
              </div>

              <div className="mt-10 flex flex-wrap gap-8 text-sm text-slate-500">
                <div>
                  <div className="text-xs uppercase tracking-widest text-amber-200/80">
                    Bar listed
                  </div>
                  <div className="text-zinc-900 font-semibold">State + federal</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-amber-200/80">
                    Avg. response
                  </div>
                  <div className="text-zinc-900 font-semibold">Under 5 min</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-amber-200/80">
                    Intake
                  </div>
                  <div className="text-zinc-900 font-semibold">Pre-qualified</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-br from-indigo-600/20 to-slate-900 blur-3xl" />
              <div className="relative rounded-3xl border border-slate-600/50 bg-[#0a1224] shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-700/60 bg-slate-950/80 px-4 py-3">
                  <span className="text-xs text-slate-500 tracking-wide">
                    reedassociates.com
                  </span>
                  <span className="text-[10px] text-emerald-400/90">
                    Encrypted
                  </span>
                </div>
                <div className="p-6 space-y-5">
                  <div className="flex gap-3">
                    <div className="h-12 w-12 rounded-lg bg-slate-800 ring-1 ring-amber-500/30" />
                    <div>
                      <div className="text-sm font-semibold text-zinc-900">
                        Reed &amp; Associates
                      </div>
                      <div className="text-xs text-amber-200/80">
                        Personal injury · Business · Family
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-700/80 bg-slate-900/50 p-3">
                    <div className="text-[10px] uppercase text-slate-500 tracking-wider">
                      Step 1 of 3
                    </div>
                    <div className="mt-1 text-sm text-slate-200">
                      Tell us about your case (confidential)
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="h-8 rounded border border-slate-700/80 bg-slate-950/80 px-2 flex items-center text-xs text-slate-600">
                        Matter type
                      </div>
                      <div className="h-8 rounded border border-slate-700/80 bg-slate-950/80 px-2 flex items-center text-xs text-slate-600">
                        Brief description
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Next: conflict check &amp; consult window</span>
                    <span className="text-amber-200/80">20+ yrs combined</span>
                  </div>
                  <div className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 py-2.5 text-center text-sm font-semibold text-white">
                    Book a consultation — no fee unless stated
                  </div>
                </div>
              </div>

              <div className="absolute -left-2 bottom-8 hidden md:flex flex-col gap-1 rounded-lg border border-slate-600/50 bg-slate-950/95 px-3 py-2 text-[10px] text-slate-300 shadow-lg animate-float">
                <span className="text-emerald-400">New lead qualified</span>
                <span className="text-slate-500">Auto-routed to partner calendar</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section padding="xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-300">
            Where high-stakes clients slip away
          </p>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-900">
            Trust isn&apos;t implied — it&apos;s structured on the page.
          </h2>
        </div>
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {industry.painPoints.map((p, i) => (
            <div
              key={p.title}
              className="relative rounded-2xl border border-slate-600/40 bg-gradient-to-b from-slate-900/40 to-transparent p-7 hover:-translate-y-1 hover:border-amber-500/30 transition-all"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded border border-amber-500/40 bg-amber-500/10 text-amber-200 font-serif font-bold">
                {i + 1}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-zinc-900">{p.title}</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section padding="xl">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-200/80">
              Practice areas, elevated
            </p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-bold text-zinc-900">
              Every line of business gets its own conversion story.
            </h2>
            <p className="mt-4 text-slate-400 leading-relaxed">
              Juries read tone. So do clients. We align bios, case snapshots,
              and clear CTAs with how your firm actually wins work.
            </p>
            <ul className="mt-6 space-y-3">
              {industry.services.map((svc) => (
                <li
                  key={svc}
                  className="flex items-center gap-3 text-sm text-slate-200"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                  {svc}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            {[
              {
                t: "Verdicts & outcomes",
                d: "Redacted summaries that read like your reputation depends on it — because it does.",
              },
              {
                t: "Attorney match",
                d: "Route PI vs. business vs. family inquiries to the right team automatically.",
              },
              {
                t: "Trust stack",
                d: "Bar, awards, and affiliations in a scannable row — not buried in the footer.",
              },
            ].map((x) => (
              <div
                key={x.t}
                className="rounded-2xl border border-slate-600/30 bg-slate-950/30 p-5"
              >
                <div className="text-sm font-semibold text-amber-100">{x.t}</div>
                <p className="mt-1 text-sm text-slate-500">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section padding="md">
        <div className="rounded-3xl border border-blue-500/25 bg-gradient-to-r from-slate-900/80 to-indigo-950/40 p-8 sm:p-10">
          <div className="flex flex-col lg:flex-row items-start gap-6 justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-300">
                After-hours
              </p>
              <h3 className="mt-2 font-serif text-2xl sm:text-3xl text-zinc-900">
                The accident doesn&apos;t wait for office hours. Neither should your intake.
              </h3>
            </div>
            <Button href="/contact" size="lg" className="shrink-0 bg-blue-600 text-zinc-900">
              See live demo
            </Button>
          </div>
        </div>
      </Section>

      <Section padding="lg">
        <blockquote className="mx-auto max-w-3xl text-center">
          <div className="text-4xl text-amber-200/50 font-serif mb-4" aria-hidden>
            &ldquo;
          </div>
          <p className="font-serif text-2xl sm:text-3xl text-slate-100 leading-snug">
            {industry.testimonials[0]?.quote}
          </p>
          <footer className="mt-6 text-sm text-slate-500">
            <span className="text-amber-200 font-medium">
              {industry.testimonials[0]?.author}
            </span>{" "}
            · {industry.testimonials[0]?.role}
          </footer>
        </blockquote>
      </Section>

      <Section padding="xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-300">
              Due diligence
            </p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl text-zinc-900">
              We&apos;ll review your site like opposing counsel would.
            </h2>
            <p className="mt-4 text-slate-400 text-lg max-w-lg">
              Clear findings on trust gaps, intake friction, and what to fix
              first — no hourly billing, no pressure.
            </p>
          </div>
          <ContactForm variant="preview" />
        </div>
      </Section>

      <section className="relative py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-12">
          <div className="relative overflow-hidden rounded-3xl border border-slate-600/50 bg-gradient-to-br from-slate-950 via-indigo-950/50 to-slate-950 p-10 sm:p-16 text-center">
            <div className="orb h-64 w-64 -top-10 right-0 bg-indigo-600/40" aria-hidden />
            <div className="relative">
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-900">
                Get More {industry.clientsLabel}
              </h2>
              <p className="mt-5 text-slate-400 text-lg max-w-2xl mx-auto">
                Your next retainable case is already searching. Make sure
                you&apos;re the firm that looks ready for it.
              </p>
              <div className="mt-8">
                <Button
                  href="/contact"
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                >
                  Book intake audit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
