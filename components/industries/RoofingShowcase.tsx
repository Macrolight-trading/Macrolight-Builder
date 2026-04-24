import Button from "@/components/Button";
import Section from "@/components/Section";
import ContactForm from "@/components/ContactForm";
import type { IndustryProfile } from "@/lib/industries";

/**
 * Roofing — dark slate palette with amber/orange/red storm-response accents.
 * Hero frames the business around emergency storm response; example-site
 * preview mocks a service-area locator with a live "technician dispatched"
 * feel. Stats, trust badges, and insurance-claim emphasis reinforce trust.
 */
export default function RoofingShowcase({
  industry,
}: {
  industry: IndustryProfile;
}) {
  return (
    <div className="relative">
      {/* Themed background layer */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.18),transparent_60%)]"
      />

      {/* HERO */}
      <section className="relative overflow-hidden pt-20 pb-24 sm:pt-28 sm:pb-32">
        <div className="absolute inset-0 grid-bg-light pointer-events-none" aria-hidden />
        <div className="orb h-[520px] w-[520px] -top-40 -left-40 bg-orange-600" aria-hidden />
        <div className="orb h-[360px] w-[360px] top-10 -right-20 bg-red-600 opacity-40" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              {/* Emergency badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 animate-fade-in">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
                24/7 Storm Response · Active dispatch
              </div>

              <h1 className="animate-fade-in-up mt-5 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 leading-[1.05]">
                Storm damage waits for{" "}
                <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                  no one.
                </span>
                <br />
                Neither should your website.
              </h1>

              <p className="animate-fade-in-up mt-6 text-lg text-zinc-600 max-w-xl leading-relaxed">
                {industry.heroTagline} We install a storm-season lead engine
                that dispatches inspections before homeowners finish their
                first Google search.
              </p>

              <div className="animate-fade-in-up mt-8 flex flex-col sm:flex-row gap-3">
                <Button
                  href="/contact"
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 via-orange-500 to-red-500 text-white hover:shadow-[0_0_40px_-10px_rgba(249,115,22,0.6)] hover:scale-[1.02]"
                >
                  Book Free Roof Inspection
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-4 w-4"
                    aria-hidden
                  >
                    <path
                      d="M5 12h14M13 5l7 7-7 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Button>
                <Button href="tel:+15550100" variant="outline" onLight size="lg">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-4 w-4"
                    aria-hidden
                  >
                    <path
                      d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.91.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Call Emergency Line
                </Button>
              </div>

              {/* Trust bar */}
              <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
                {[
                  { num: "2,400+", label: "Roofs installed" },
                  { num: "< 2 hrs", label: "Emergency response" },
                  { num: "4.9★", label: "Google rating" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl font-extrabold text-zinc-900">
                      {s.num}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Example-site mock: service-area dispatch UI */}
            <div className="relative">
              <div className="absolute -inset-8 bg-gradient-to-br from-orange-500/30 via-red-500/10 to-transparent blur-3xl" />
              <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                  <div className="mx-auto text-xs text-zinc-500">
                    crestlineroofing.com
                  </div>
                </div>

                {/* Shingle diagonal pattern */}
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(135deg, #fff 0 2px, transparent 2px 16px)",
                  }}
                />

                <div className="relative p-6">
                  {/* Area locator */}
                  <div className="rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-zinc-500 uppercase tracking-wider">
                        Your service area
                      </div>
                      <span className="text-xs text-emerald-400">
                        ● Crew available
                      </span>
                    </div>
                    <div className="mt-3 h-32 rounded-lg bg-[radial-gradient(circle_at_35%_50%,rgba(249,115,22,0.25),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(239,68,68,0.2),transparent_50%)] relative overflow-hidden">
                      {/* simulated map contours */}
                      <svg
                        viewBox="0 0 200 80"
                        className="absolute inset-0 h-full w-full text-zinc-900/20"
                        aria-hidden
                      >
                        <path
                          d="M0,40 Q40,20 80,40 T160,40 T240,30"
                          stroke="currentColor"
                          fill="none"
                          strokeWidth="0.5"
                        />
                        <path
                          d="M0,55 Q40,35 80,55 T160,55 T240,45"
                          stroke="currentColor"
                          fill="none"
                          strokeWidth="0.5"
                        />
                      </svg>
                      {/* pin */}
                      <div className="absolute top-10 left-1/3">
                        <div className="h-3 w-3 rounded-full bg-orange-400 animate-pulse shadow-[0_0_20px_rgba(251,146,60,0.8)]" />
                      </div>
                      {/* crew */}
                      <div className="absolute bottom-6 right-1/4">
                        <div className="flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2 py-1 text-[10px] text-zinc-700 shadow-sm">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          Crew #3
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Request form */}
                  <div className="mt-5 space-y-3">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider">
                      Request free inspection
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex h-9 items-center rounded-md border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-500">
                        Street address
                      </div>
                      <div className="flex h-9 items-center rounded-md border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-500">
                        Phone
                      </div>
                    </div>
                    <div className="rounded-md bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2.5 text-sm font-semibold text-white text-center">
                      Dispatch Inspector — Free
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500">
                      <span>✓ Insurance claim assistance</span>
                      <span>✓ GAF certified</span>
                      <span>✓ 25-yr warranty</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating notification */}
              <div className="absolute -bottom-4 -left-4 hidden md:flex items-center gap-3 rounded-xl border border-zinc-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur animate-float">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-xs font-bold">
                  🛠
                </div>
                <div>
                  <div className="text-xs text-zinc-900 font-medium">
                    New inspection request
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    123 Oak St · 2 min ago
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PAIN POINTS with roofing theme */}
      <Section padding="xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-400">
            Storm-season leaks
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900">
            Why your competitors get the storm calls.
          </h2>
        </div>
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {industry.painPoints.map((p, i) => (
            <div
              key={p.title}
              className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-7 hover:-translate-y-1 hover:border-orange-400/40 transition-all duration-300"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/30 to-red-500/30 ring-1 ring-inset ring-orange-400/30 text-orange-300 font-bold">
                0{i + 1}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-zinc-900">
                {p.title}
              </h3>
              <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* BEFORE / AFTER GALLERY + SERVICES */}
      <Section padding="xl">
        <div className="grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-400">
              Before & after
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 leading-tight">
              Proof that scrolls — and sells.
            </h2>
            <p className="mt-4 text-zinc-600 leading-relaxed">
              Your job site photos become your most powerful sales tool. We
              merchandise them with interactive sliders, damage callouts, and
              before/after pairs at the exact moment a homeowner is deciding
              who to call.
            </p>
            <ul className="mt-6 space-y-3">
              {industry.services.map((svc) => (
                <li
                  key={svc}
                  className="flex items-center gap-3 text-sm text-zinc-700"
                >
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-orange-500/20 to-red-500/20 ring-1 ring-orange-400/20">
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-3.5 w-3.5 text-orange-300"
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

          <div className="lg:col-span-3 grid grid-cols-2 gap-4">
            {[
              { label: "BEFORE", tone: "from-slate-800 to-slate-900" },
              { label: "AFTER", tone: "from-orange-900/50 to-red-950/80" },
              { label: "BEFORE", tone: "from-slate-800 to-slate-900" },
              { label: "AFTER", tone: "from-orange-900/50 to-red-950/80" },
            ].map((item, i) => (
              <div
                key={i}
                className={`aspect-[4/3] rounded-2xl border border-white/10 bg-gradient-to-br ${item.tone} relative overflow-hidden group`}
              >
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(135deg, rgba(255,255,255,0.15) 0 2px, transparent 2px 14px)",
                  }}
                />
                <div className="absolute top-3 left-3 rounded-md bg-black/60 backdrop-blur px-2 py-1 text-[10px] font-semibold text-white tracking-wider">
                  {item.label}
                </div>
                <div className="absolute bottom-3 right-3 text-[10px] text-zinc-500">
                  Storm damage · Clarksville
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* INSURANCE HELP STRIP */}
      <Section padding="md">
        <div className="rounded-3xl border border-orange-400/20 bg-gradient-to-r from-orange-500/10 via-red-500/5 to-transparent p-8 sm:p-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-orange-300">
                Insurance Claim Assistance
              </p>
              <h3 className="mt-2 text-2xl sm:text-3xl font-bold text-zinc-900">
                We walk homeowners through the claim — you walk onto the job.
              </h3>
              <p className="mt-2 text-zinc-600 max-w-2xl">
                A built-in intake flow captures policy info, damage photos,
                and contact details so your team arrives with everything
                ready.
              </p>
            </div>
            <Button
              href="/contact"
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
              size="lg"
            >
              See it in action
            </Button>
          </div>
        </div>
      </Section>

      {/* TESTIMONIAL */}
      <Section padding="lg">
        <blockquote className="mx-auto max-w-3xl text-center">
          <div className="flex items-center justify-center gap-0.5 text-orange-400 mb-5">
            {[0, 1, 2, 3, 4].map((i) => (
              <svg
                key={i}
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
                aria-hidden
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.163c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118L10 14.347l-3.368 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.645 9.384c-.784-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.957z" />
              </svg>
            ))}
          </div>
          <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 leading-snug">
            &ldquo;{industry.testimonials[0]?.quote}&rdquo;
          </p>
          <footer className="mt-6 text-sm text-zinc-600">
            <span className="text-zinc-900 font-medium">
              {industry.testimonials[0]?.author}
            </span>{" "}
            · {industry.testimonials[0]?.role}
          </footer>
        </blockquote>
      </Section>

      {/* CONTACT */}
      <Section padding="xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-400">
              Free audit
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 leading-tight">
              Get your roofing site audited before the next storm.
            </h2>
            <p className="mt-4 text-zinc-600 text-lg max-w-lg">
              We&apos;ll audit your current site and send a prioritized report
              on what&apos;s costing you inspection calls — no pitch, no
              commitment.
            </p>
          </div>
          <ContactForm variant="preview" />
        </div>
      </Section>

      {/* FINAL CTA — themed */}
      <section className="relative py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-12">
          <div className="relative overflow-hidden rounded-3xl border border-orange-400/20 bg-gradient-to-br from-orange-600/25 via-red-600/10 to-slate-900 p-10 sm:p-16 text-center">
            <div className="orb bg-orange-500 h-80 w-80 -top-20 -left-20" aria-hidden />
            <div className="orb bg-red-600 h-80 w-80 -bottom-20 -right-20" aria-hidden />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900">
                Get More {industry.clientsLabel}
              </h2>
              <p className="mt-5 text-zinc-600 text-lg max-w-2xl mx-auto">
                The next big storm is already forecast. Make sure your
                website&apos;s ready for it.
              </p>
              <div className="mt-8">
                <Button
                  href="/contact"
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-[0_0_40px_-10px_rgba(249,115,22,0.6)]"
                >
                  Book Free Inspection Audit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
