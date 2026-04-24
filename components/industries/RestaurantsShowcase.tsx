import Button from "@/components/Button";
import Section from "@/components/Section";
import ContactForm from "@/components/ContactForm";
import type { IndustryProfile } from "@/lib/industries";

/**
 * Restaurants — charred oak / brass / rose-wine highlights.
 * Example-site mock: live menu cards, same-night reservations, slow-night CTA.
 */
export default function RestaurantsShowcase({
  industry,
}: {
  industry: IndustryProfile;
}) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(244,63,94,0.12),transparent_55%),radial-gradient(ellipse_at_80%_20%,rgba(245,158,11,0.1),transparent_45%)]"
      />

      <section className="relative overflow-hidden pt-20 pb-24 sm:pt-28 sm:pb-32">
        <div className="absolute inset-0 grid-bg-light pointer-events-none" aria-hidden />
        <div className="orb h-[500px] w-[500px] -top-36 -right-32 bg-rose-500" aria-hidden />
        <div className="orb h-[380px] w-[380px] top-20 -left-24 bg-amber-500 opacity-50" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-200 animate-fade-in">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
                Tonight: tables open 7:00 &amp; 8:30
              </div>

              <h1 className="animate-fade-in-up mt-5 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 leading-[1.05]">
                The menu is{" "}
                <span className="bg-gradient-to-r from-amber-300 via-rose-400 to-fuchsia-500 bg-clip-text text-transparent">
                  unforgettable
                </span>
                <br />
                <span className="text-zinc-800">Your website should be too.</span>
              </h1>

              <p className="animate-fade-in-up mt-6 text-lg text-rose-100/80 max-w-xl leading-relaxed">
                {industry.heroTagline} We build reservation-first pages that
                show your food the way it looks on the pass — and convert
                scrollers into covers.
              </p>

              <div className="animate-fade-in-up mt-8 flex flex-col sm:flex-row gap-3">
                <Button
                  href="/contact"
                  size="lg"
                  className="bg-gradient-to-r from-amber-500 via-rose-500 to-fuchsia-600 text-white hover:shadow-[0_0_40px_-10px_rgba(244,63,94,0.55)] hover:scale-[1.02]"
                >
                  Book a Site Tasting Call
                </Button>
                <Button href="tel:+15550100" variant="outline" onLight size="lg">
                  Call the dining room
                </Button>
              </div>

              <div className="mt-10 flex flex-wrap gap-6 text-sm text-zinc-900/55">
                <div>
                  <div className="text-2xl font-extrabold text-amber-200">+41%</div>
                  <div className="text-xs">Tuesday covers (example)</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-rose-200">0 PDFs</div>
                  <div className="text-xs">Menus you have to pinch-zoom</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-fuchsia-200">2 taps</div>
                  <div className="text-xs">To reserve, not 7</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-br from-amber-500/20 via-rose-500/10 to-fuchsia-600/5 blur-3xl" />
              <div className="relative rounded-3xl border border-white/10 bg-[#0c0a0b] shadow-2xl overflow-hidden">
                <div className="flex items-center gap-2 border-b border-amber-900/20 bg-stone-950/80 px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
                  <div className="mx-auto text-xs text-amber-200/50 tracking-wide">
                    noorkitchen.com
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-amber-200/60">
                        Chef&apos;s this week
                      </div>
                      <div className="text-lg font-semibold text-stone-100">
                        Slow-roasted &amp; seasonal
                      </div>
                    </div>
                    <div className="rounded-full bg-rose-500/20 border border-rose-500/30 px-3 py-1 text-xs text-rose-200">
                      Res open
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {["Charred octopus", "Cavatelli", "Aged duck", "Sunchoke"].map(
                      (d) => (
                        <div
                          key={d}
                          className="rounded-xl border border-white/5 bg-gradient-to-br from-stone-900/90 to-stone-950 p-3"
                        >
                          <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-amber-900/40 to-rose-950/50 mb-2" />
                          <div className="text-xs font-medium text-stone-200">
                            {d}
                          </div>
                          <div className="text-[10px] text-stone-500">+$4 wine pair</div>
                        </div>
                      )
                    )}
                  </div>

                  <div className="rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-950/50 to-rose-950/30 p-4">
                    <div className="flex items-center justify-between text-xs text-stone-300">
                      <span>Party of 2 · Fri 8:00</span>
                      <span className="text-emerald-400">Direct booking</span>
                    </div>
                    <div className="mt-3 rounded-lg bg-gradient-to-r from-amber-500 to-rose-600 py-2.5 text-center text-sm font-semibold text-white">
                      Confirm reservation — no third-party fee
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-3 -right-2 hidden md:block rounded-xl border border-rose-500/20 bg-[#120c0e]/95 backdrop-blur px-3 py-2 text-[11px] text-rose-100 shadow-xl animate-float">
                <span className="text-amber-300 font-semibold">New:</span> Wine club
                waitlist +47 signups
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section padding="xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-rose-300">
            Front-of-house leaks
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900">
            Why diners bounce before the bread hits the table.
          </h2>
        </div>
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {industry.painPoints.map((p, i) => (
            <div
              key={p.title}
              className="relative rounded-2xl border border-amber-500/15 bg-gradient-to-b from-amber-950/20 to-transparent p-7 hover:-translate-y-1 hover:border-rose-400/35 transition-all duration-300"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/30 to-rose-500/20 ring-1 ring-amber-400/25 text-amber-200 font-bold">
                0{i + 1}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-zinc-900">{p.title}</h3>
              <p className="mt-2 text-sm text-stone-400 leading-relaxed">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section padding="xl">
        <div className="grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-300">
              Merchandise the room
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
              From menu to last course — one branded journey.
            </h2>
            <p className="mt-4 text-stone-400 leading-relaxed">
              We wire photography, private dining, and merch into a single
              experience so OpenTable isn&apos;t the only place guests remember
              your name.
            </p>
            <ul className="mt-6 space-y-3">
              {industry.services.map((svc) => (
                <li
                  key={svc}
                  className="flex items-center gap-3 text-sm text-stone-200"
                >
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-rose-500/15 ring-1 ring-rose-400/20">
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-3.5 w-3.5 text-rose-300"
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
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {["Slow Monday", "Industry Tuesday", "Date night", "Brunch block"].map(
              (t, i) => (
                <div
                  key={t}
                  className="rounded-2xl border border-white/10 bg-gradient-to-br from-stone-900/50 to-stone-950 p-5"
                >
                  <div className="text-xs text-amber-200/60 uppercase tracking-wider">
                    Promo slot
                  </div>
                  <div className="mt-2 text-lg font-bold text-zinc-900">{t}</div>
                  <p className="mt-2 text-sm text-stone-500">
                    {i % 2 === 0
                      ? "Auto email + social graphics when covers drop."
                      : "One-click add-on: wine pairing or dessert flight."}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </Section>

      <Section padding="md">
        <div className="rounded-3xl border border-rose-500/20 bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-fuchsia-600/5 p-8 sm:p-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-200">
                Own the relationship
              </p>
              <h3 className="mt-2 text-2xl sm:text-3xl font-bold text-zinc-900">
                Capture emails before the platforms take their cut.
              </h3>
              <p className="mt-2 text-stone-400 max-w-2xl">
                Birthday campaigns, private-event nurture, and loyalty cues —
                all tied to the nights you need to fill.
              </p>
            </div>
            <Button
              href="/contact"
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-rose-600 text-white"
            >
              See the full stack
            </Button>
          </div>
        </div>
      </Section>

      <Section padding="lg">
        <blockquote className="mx-auto max-w-3xl text-center">
          <div className="flex items-center justify-center gap-0.5 text-amber-400 mb-5">
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
          <footer className="mt-6 text-sm text-stone-400">
            <span className="text-rose-200 font-medium">
              {industry.testimonials[0]?.author}
            </span>{" "}
            · {industry.testimonials[0]?.role}
          </footer>
        </blockquote>
      </Section>

      <Section padding="xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-300">
              Table talk
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900">
              Get your reservation flow audited on us.
            </h2>
            <p className="mt-4 text-stone-400 text-lg max-w-lg">
              We map where you lose the guest between Google, Instagram, and
              your door — and what to fix first.
            </p>
          </div>
          <ContactForm variant="preview" />
        </div>
      </Section>

      <section className="relative py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-12">
          <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-900/20 via-rose-900/10 to-stone-950 p-10 sm:p-16 text-center">
            <div className="orb bg-amber-500 h-72 w-72 -top-16 -right-20 opacity-40" aria-hidden />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-900">
                Get More {industry.clientsLabel}
              </h2>
              <p className="mt-5 text-stone-300 text-lg max-w-2xl mx-auto">
                Empty chairs are expensive. A site that sells the experience
                isn&apos;t.
              </p>
              <div className="mt-8">
                <Button
                  href="/contact"
                  size="lg"
                  className="bg-gradient-to-r from-amber-500 to-rose-600 text-white"
                >
                  Start the audit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
