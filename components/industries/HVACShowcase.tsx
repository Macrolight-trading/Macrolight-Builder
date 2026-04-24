import Button from "@/components/Button";
import Section from "@/components/Section";
import ContactForm from "@/components/ContactForm";
import type { IndustryProfile } from "@/lib/industries";

/**
 * HVAC — arctic/frost panel UI, electric cyan & ice blue, dispatch energy.
 * Example-site mock: thermostat, membership upsell, truck ETA.
 */
export default function HVACShowcase({
  industry,
}: {
  industry: IndustryProfile;
}) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(6,182,212,0.2),transparent_50%),radial-gradient(ellipse_at_100%_40%,rgba(37,99,235,0.12),transparent_55%)]"
      />

      <section className="relative overflow-hidden pt-20 pb-24 sm:pt-28 sm:pb-32">
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(6,182,212,0.04) 0 1px, transparent 1px 48px), repeating-linear-gradient(90deg, rgba(6,182,212,0.04) 0 1px, transparent 1px 48px)",
            maskImage:
              "radial-gradient(ellipse at center, black 35%, transparent 75%)",
          }}
          aria-hidden
        />
        <div className="orb h-[520px] w-[520px] -top-44 -right-32 bg-cyan-500" aria-hidden />
        <div className="orb h-[380px] w-[380px] top-20 -left-20 bg-sky-600 opacity-50" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-200 animate-fade-in">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-50" />
                  <span className="relative h-2 w-2 rounded-full bg-cyan-300" />
                </span>
                On-call now · 3 crews in your zone
              </div>

              <h1 className="animate-fade-in-up mt-5 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 leading-[1.05]">
                When the AC quits,{" "}
                <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 bg-clip-text text-transparent">
                  homeowners
                </span>{" "}
                don&apos;t scroll — they pick whoever answers first.
              </h1>

              <p className="animate-fade-in-up mt-6 text-lg text-cyan-100/70 max-w-xl leading-relaxed">
                {industry.heroTagline} We build speed-first, mobile booking,
                and membership funnels that turn panic searches into booked
                trucks.
              </p>

              <div className="animate-fade-in-up mt-8 flex flex-col sm:flex-row gap-3">
                <Button
                  href="/contact"
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-[0_0_40px_-8px_rgba(34,211,238,0.55)]"
                >
                  Map my service-ticket flow
                </Button>
                <Button href="tel:+15550100" variant="outline" onLight size="lg">
                  Emergency line
                </Button>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-3 max-w-md text-center sm:text-left">
                <div>
                  <div className="text-2xl font-extrabold text-zinc-900">4.9</div>
                  <div className="text-[11px] text-cyan-200/50">Route efficiency</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-cyan-200">+240</div>
                  <div className="text-[11px] text-cyan-200/50">Memberships (example)</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-zinc-900">&lt; 60s</div>
                  <div className="text-[11px] text-cyan-200/50">To book online</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-8 bg-gradient-to-br from-cyan-500/25 to-blue-700/10 blur-3xl" />
              <div className="relative rounded-3xl border border-cyan-500/20 bg-gradient-to-b from-slate-950 to-[#050c14] shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between border-b border-cyan-900/30 bg-cyan-950/20 px-4 py-2.5">
                  <span className="text-[11px] text-cyan-200/50 tracking-tight">
                    cooltechhvac.com
                  </span>
                  <span className="text-[10px] text-emerald-400">Live</span>
                </div>
                <div className="p-6">
                  <div className="mx-auto max-w-[200px] rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-slate-900 to-slate-950 p-4 shadow-inner">
                    <div className="text-center text-[10px] text-cyan-200/50 uppercase">
                      Inside temp
                    </div>
                    <div className="text-center text-4xl font-bold text-zinc-900 tabular-nums">
                      72°
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-slate-800">
                      <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
                    </div>
                    <div className="mt-3 flex justify-between text-[10px] text-slate-500">
                      <span>Cooling</span>
                      <span className="text-cyan-400">Comfort</span>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl border border-white/5 bg-slate-900/50 p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Truck 2</span>
                      <span className="text-emerald-400">8 min out</span>
                    </div>
                    <div className="mt-2 h-16 rounded-lg bg-slate-950 relative overflow-hidden">
                      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-cyan-500/10 to-transparent" />
                      <div className="absolute top-1/2 left-1/4 h-2 w-2 -translate-y-1/2 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee]" />
                    </div>
                    <div className="mt-2 text-[10px] text-slate-500 text-center">
                      Dispatch automated when customer books
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg border border-cyan-500/20 bg-cyan-950/20 p-3">
                    <div className="text-xs text-cyan-200/80 font-medium">
                      Annual Comfort Club
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Two tune-ups, priority line, 15% off repairs
                    </p>
                    <div className="mt-2 rounded bg-gradient-to-r from-cyan-500 to-blue-600 py-1.5 text-center text-xs font-semibold text-white">
                      Add membership
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-2 left-0 hidden md:block rounded-lg border border-cyan-500/20 bg-slate-950/95 px-3 py-2 text-[11px] text-cyan-100 shadow-lg animate-float">
                <span className="text-blue-300">After-hours</span> booking — no
                voicemail black hole
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section padding="xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan-300">
            Revenue hiding in the truck roll
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-900">
            The busiest days shouldn&apos;t be your leakiest online days.
          </h2>
        </div>
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {industry.painPoints.map((p, i) => (
            <div
              key={p.title}
              className="rounded-2xl border border-cyan-500/15 bg-gradient-to-b from-cyan-950/20 to-transparent p-7 hover:-translate-y-1 hover:border-cyan-400/35 transition-all"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-200 font-bold">
                0{i + 1}
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
        <div className="grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <p className="text-sm font-semibold uppercase tracking-wider text-sky-300">
              What we install
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-zinc-900">
              Season-proof pages for every system you run.
            </h2>
            <p className="mt-4 text-slate-400 leading-relaxed">
              Service-area SEO, IAQ, commercial — each with a clear job-to-book
              path and optional membership attach.
            </p>
            <ul className="mt-6 space-y-2.5">
              {industry.services.map((svc) => (
                <li
                  key={svc}
                  className="flex items-center gap-2.5 text-sm text-slate-200"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  {svc}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-3 grid sm:grid-cols-2 gap-4">
            {[
              { t: "Heat wave mode", c: "Dynamic banner when temps spike in your zips." },
              { t: "Frozen pipe burst", c: "Emergency CTA that routes to the on-call team." },
              { t: "Recurring revenue", c: "Membership sold at booking confirmation." },
              { t: "Commercial", c: "Multi-location dispatch form + SLA copy." },
            ].map((b) => (
              <div
                key={b.t}
                className="rounded-2xl border border-slate-700/50 bg-slate-900/30 p-5"
              >
                <div className="text-sm font-semibold text-cyan-200">{b.t}</div>
                <p className="mt-1 text-sm text-slate-500">{b.c}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section padding="md">
        <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-slate-900/40 to-blue-950/30 p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-lg text-slate-200 max-w-2xl">
            <span className="text-cyan-300 font-semibold">Peak season:</span>{" "}
            your site should book jobs while you&apos;re on a roof or in a
            crawl space — not send everyone to a busy signal.
          </p>
          <Button href="/contact" className="shrink-0 bg-cyan-500 text-slate-950 font-semibold">
            Show me the booking flow
          </Button>
        </div>
      </Section>

      <Section padding="lg">
        <blockquote className="mx-auto max-w-3xl text-center">
          <p className="text-2xl sm:text-3xl font-semibold text-zinc-900 leading-snug">
            &ldquo;{industry.testimonials[0]?.quote}&rdquo;
          </p>
          <footer className="mt-6 text-sm text-cyan-200/50">
            <span className="text-cyan-200 font-medium">
              {industry.testimonials[0]?.author}
            </span>{" "}
            · {industry.testimonials[0]?.role}
          </footer>
        </blockquote>
      </Section>

      <Section padding="xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-cyan-300">
              Load calculation
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-zinc-900">
              Free website audit: where you&apos;re losing the emergency call.
            </h2>
            <p className="mt-4 text-slate-400 text-lg max-w-lg">
              Speed, local relevance, and booking friction — in plain English
              for your service manager.
            </p>
          </div>
          <ContactForm variant="preview" />
        </div>
      </Section>

      <section className="relative py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-12">
          <div className="relative overflow-hidden rounded-3xl border border-cyan-500/25 bg-gradient-to-br from-cyan-900/20 via-slate-950 to-blue-950/40 p-10 sm:p-16 text-center">
            <div className="orb h-80 w-80 -bottom-20 -right-20 bg-blue-600/30" aria-hidden />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-900">
                Get More {industry.clientsLabel}
              </h2>
              <p className="mt-5 text-slate-300 text-lg max-w-2xl mx-auto">
                July heat and January freezes don&apos;t wait. Your pipeline
                shouldn&apos;t either.
              </p>
              <div className="mt-8">
                <Button
                  href="/contact"
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                >
                  Book the audit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
