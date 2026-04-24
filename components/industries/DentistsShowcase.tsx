import Button from "@/components/Button";
import Section from "@/components/Section";
import ContactForm from "@/components/ContactForm";
import type { IndustryProfile } from "@/lib/industries";

/**
 * Dental — clinical calm: soft teal, mint, porcelain highlights.
 * Example-site mock: insurance check, new-patient booking, smile arc.
 */
export default function DentistsShowcase({
  industry,
}: {
  industry: IndustryProfile;
}) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(45,212,191,0.12),transparent_50%),radial-gradient(ellipse_at_100%_80%,rgba(16,185,129,0.1),transparent_45%)]"
      />

      <section className="relative overflow-hidden pt-20 pb-24 sm:pt-28 sm:pb-32">
        <div className="absolute inset-0 grid-bg-light pointer-events-none" aria-hidden />
        <div className="orb h-[500px] w-[500px] -top-40 -right-20 bg-teal-500 opacity-50" aria-hidden />
        <div className="orb h-[400px] w-[400px] top-32 -left-32 bg-emerald-500 opacity-40" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-emerald-950/40 px-3 py-1.5 text-xs font-medium text-teal-200 animate-fade-in">
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    d="M6 10c0-1.5 1-3 2.5-3S11 7 12 7s2.5-.5 2.5-2 1-3 2.5-3 2.5 1.5 2.5 3v1c0 2-1 4-3 4.5"
                  />
                </svg>
                Accepting new patients · Same-week hygiene
              </div>

              <h1 className="animate-fade-in-up mt-5 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 leading-[1.05]">
                Smiles that belong on a{" "}
                <span className="bg-gradient-to-r from-teal-200 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
                  billboard
                </span>{" "}
                — and a website that finally matches your chairside care.
              </h1>

              <p className="animate-fade-in-up mt-6 text-lg text-emerald-100/70 max-w-xl leading-relaxed">
                {industry.heroTagline} We design calm, high-trust flows for
                insurance questions, new-patient booking, and cosmetic
                services that actually get seen.
              </p>

              <div className="animate-fade-in-up mt-8 flex flex-col sm:flex-row gap-3">
                <Button
                  href="/contact"
                  size="lg"
                  className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:shadow-[0_0_40px_-10px_rgba(45,212,191,0.5)]"
                >
                  Plan my patient journey
                </Button>
                <Button href="tel:+15550100" variant="outline" onLight size="lg">
                  Front desk
                </Button>
              </div>

              <div className="mt-10 flex flex-wrap gap-6 text-sm">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2">
                  <div className="text-xs text-teal-300/80">PPO / HSA</div>
                  <div className="text-zinc-900 font-semibold">Up front</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2">
                  <div className="text-xs text-teal-300/80">Online booking</div>
                  <div className="text-zinc-900 font-semibold">2 min</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2">
                  <div className="text-xs text-teal-300/80">Cosmetic</div>
                  <div className="text-zinc-900 font-semibold">Photo-led</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-br from-teal-500/15 to-emerald-600/10 blur-3xl" />
              <div className="relative rounded-3xl border border-teal-500/20 bg-[#0a1210] shadow-2xl overflow-hidden">
                <div className="border-b border-teal-900/30 bg-gradient-to-r from-emerald-950/50 to-teal-950/30 px-4 py-2.5 flex justify-center">
                  <span className="text-xs text-teal-200/50 tracking-wide">
                    brightsmiledental.com
                  </span>
                </div>
                <div className="p-6">
                  <div className="text-center text-xs text-teal-300/70 uppercase tracking-widest">
                    New patient
                  </div>
                  <div className="mt-1 text-center text-lg font-semibold text-zinc-900">
                    Check insurance in seconds
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-9 rounded-lg border border-teal-500/20 bg-slate-950/50 px-3 flex items-center text-xs text-slate-500">
                      Insurance carrier
                    </div>
                    <div className="h-9 rounded-lg border border-teal-500/20 bg-slate-950/50 px-3 flex items-center text-xs text-slate-500">
                      Member ID
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-emerald-400">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      In network — est. co-pay shown before booking
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/5 bg-slate-900/30 p-4">
                    <div className="text-[10px] text-slate-500 uppercase">
                      Book cleaning
                    </div>
                    <div className="mt-1 flex items-end justify-between">
                      <div>
                        <div className="text-2xl font-bold text-zinc-900">Thu 3:00</div>
                        <div className="text-xs text-slate-500">Hygienist: Jordan</div>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-400/30 to-emerald-500/20 ring-2 ring-teal-400/30" />
                    </div>
                    <div className="mt-3 w-full rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 py-2 text-center text-sm font-medium text-white">
                      Confirm new patient
                    </div>
                  </div>

                  <div className="mt-4 flex justify-center">
                    <svg
                      className="w-32 h-8 text-teal-500/20"
                      viewBox="0 0 120 32"
                      aria-hidden
                    >
                      <path
                        d="M10 20 Q30 8 50 20 T90 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <p className="text-center text-[10px] text-slate-500">
                    Cosmetic gallery · Invisalign · Implants
                  </p>
                </div>
              </div>

              <div className="absolute -right-1 top-24 hidden md:block w-40 rounded-lg border border-emerald-500/20 bg-slate-950/95 p-2 text-[10px] text-slate-300 shadow-lg animate-float">
                <div className="text-emerald-300 font-medium">Reminders</div>
                <div className="text-slate-500">Auto SMS + recall campaigns</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section padding="xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-teal-300">
            The chair is empty for the wrong reasons
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-900">
            Patients decide before they ever pick up a mirror.
          </h2>
        </div>
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {industry.painPoints.map((p, i) => (
            <div
              key={p.title}
              className="rounded-2xl border border-teal-500/15 bg-gradient-to-b from-emerald-950/25 to-transparent p-7 hover:-translate-y-1 hover:border-teal-400/35 transition-all"
            >
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-teal-500/15 text-teal-200 text-sm font-bold">
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
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-300">
              What we highlight
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-zinc-900">
              Clinical credibility + retail clarity for every procedure.
            </h2>
            <ul className="mt-6 space-y-2.5">
              {industry.services.map((svc) => (
                <li
                  key={svc}
                  className="flex items-center gap-2.5 text-sm text-slate-200"
                >
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500/15">
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-2.5 w-2.5 text-teal-300"
                      aria-hidden
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4L8.5 12l6.8-6.7a1 1 0 011.4 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  {svc}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            {[
              {
                h: "Before / after (done tastefully)",
                b: "Patient-approved galleries with consent flow built in.",
              },
              {
                h: "Fear reducers on every page",
                b: "Sedation, financing, and what a first visit actually includes.",
              },
              {
                h: "Recall that feels caring",
                b: "Not spam — rhythm that matches your hygiene schedule.",
              },
            ].map((x) => (
              <div
                key={x.h}
                className="rounded-2xl border border-white/5 bg-white/[0.02] p-5"
              >
                <h3 className="font-semibold text-zinc-900">{x.h}</h3>
                <p className="mt-1 text-sm text-slate-500">{x.b}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section padding="md">
        <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-teal-950/50 to-emerald-950/30 p-8 sm:p-10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-lg text-slate-200 max-w-2xl">
            <span className="text-teal-300 font-semibold">Revenue you already earned:</span>{" "}
            high-margin services deserve more than a bullet on a list page.
          </p>
          <Button href="/contact" className="shrink-0 bg-emerald-500 text-slate-950 font-semibold">
            Show cosmetic path
          </Button>
        </div>
      </Section>

      <Section padding="lg">
        <blockquote className="mx-auto max-w-3xl text-center">
          <p className="text-2xl sm:text-3xl font-semibold text-zinc-900 leading-snug">
            &ldquo;{industry.testimonials[0]?.quote}&rdquo;
          </p>
          <footer className="mt-6 text-sm text-slate-500">
            <span className="text-teal-200 font-medium">
              {industry.testimonials[0]?.author}
            </span>{" "}
            · {industry.testimonials[0]?.role}
          </footer>
        </blockquote>
      </Section>

      <Section padding="xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-300">
              Oral health of your site
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-zinc-900">
              Complimentary digital exam for your online presence.
            </h2>
            <p className="mt-4 text-slate-400 text-lg max-w-lg">
              Where you lose searches, how booking compares to the group down
              the street, and a prioritized treatment plan.
            </p>
          </div>
          <ContactForm variant="preview" />
        </div>
      </Section>

      <section className="relative py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-12">
          <div className="relative overflow-hidden rounded-3xl border border-teal-500/20 bg-gradient-to-br from-emerald-900/20 via-slate-950 to-teal-950/30 p-10 sm:p-16 text-center">
            <div className="orb h-64 w-64 -top-8 left-1/2 -translate-x-1/2 bg-teal-500/20" aria-hidden />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-900">
                Get More {industry.clientsLabel}
              </h2>
              <p className="mt-5 text-slate-300 text-lg max-w-2xl mx-auto">
                Your practice isn&apos;t generic — the experience on your site
                shouldn&apos;t be either.
              </p>
              <div className="mt-8">
                <Button
                  href="/contact"
                  size="lg"
                  className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
                >
                  Request practice audit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
