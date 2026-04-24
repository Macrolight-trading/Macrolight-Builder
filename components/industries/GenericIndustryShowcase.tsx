import Button from "@/components/Button";
import Card from "@/components/Card";
import Section from "@/components/Section";
import CTASection from "@/components/CTASection";
import ContactForm from "@/components/ContactForm";
import type { IndustryProfile } from "@/lib/industries";

/**
 * Generic fallback for industry slugs that don't have a bespoke showcase.
 * Uses the profile's accent colors if provided; otherwise violet→cyan.
 */
export default function GenericIndustryShowcase({
  industry,
}: {
  industry: IndustryProfile;
}) {
  const accentFrom = industry.accent?.from ?? "from-violet-500";
  const accentTo = industry.accent?.to ?? "to-cyan-500";

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-24 sm:pt-28 sm:pb-32">
        <div className="absolute inset-0 grid-bg-light pointer-events-none" aria-hidden />
        <div
          className={`orb h-[480px] w-[480px] -top-40 -left-40 bg-gradient-to-br ${accentFrom} ${accentTo}`}
          aria-hidden
        />
        <div className="relative mx-auto max-w-5xl px-5 sm:px-8 lg:px-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs text-zinc-600 shadow-sm backdrop-blur animate-fade-in">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full bg-gradient-to-r ${accentFrom} ${accentTo}`}
            />
            Industry playbook · {industry.name}
          </div>
          <h1 className="animate-fade-in-up mt-6 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 leading-[1.05]">
            Websites That Get More{" "}
            <span
              className={`bg-gradient-to-r ${accentFrom} ${accentTo} bg-clip-text text-transparent`}
            >
              {industry.clientsLabel}
            </span>
          </h1>
          <p className="animate-fade-in-up mt-6 text-lg sm:text-xl text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            {industry.heroTagline}
          </p>
          <div className="animate-fade-in-up mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button href="/contact" variant="primary" size="lg">
              Get More {industry.clientsLabel}
            </Button>
            <Button href="/pricing" variant="secondary" size="lg" onLight>
              See Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* Pain points */}
      <Section padding="xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan-700">
            Why most {industry.name.toLowerCase()} websites lose money
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900">
            The three leaks every {industry.name.toLowerCase()} site has.
          </h2>
        </div>
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {industry.painPoints.map((p, i) => (
            <Card key={p.title}>
              <div className="text-5xl font-black bg-gradient-to-br from-white/20 to-white/5 bg-clip-text text-transparent">
                0{i + 1}
              </div>
              <h3 className="mt-2 text-lg font-semibold text-zinc-900">{p.title}</h3>
              <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                {p.description}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Services */}
      <Section padding="xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-violet-700">
            Services we merchandise
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
            Turn every service page into a sales page.
          </h2>
        </div>
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {industry.services.map((svc) => (
            <div
              key={svc}
              className="surface rounded-xl px-5 py-4 text-sm text-zinc-700"
            >
              {svc}
            </div>
          ))}
        </div>
      </Section>

      {/* Contact */}
      <Section padding="xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-cyan-700">
              Start here
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 leading-tight">
              See exactly how to get more{" "}
              <span className="gradient-text">
                {industry.clientsLabel.toLowerCase()}
              </span>
              .
            </h2>
            <p className="mt-4 text-zinc-600 text-lg max-w-lg">
              Request your free audit. Within 24 hours you&apos;ll have a
              prioritized list of what&apos;s costing you leads.
            </p>
          </div>
          <ContactForm variant="preview" />
        </div>
      </Section>

      <CTASection
        eyebrow={`Built for ${industry.name.toLowerCase()} businesses`}
        headline={`Get More ${industry.clientsLabel}`}
        subhead={`Let's audit your current ${industry.name.toLowerCase()} website and show you exactly what's leaking leads — at no cost.`}
        primaryLabel="Get My Free Audit"
      />
    </>
  );
}
