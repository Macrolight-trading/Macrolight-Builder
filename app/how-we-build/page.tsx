import type { Metadata } from "next";
import Section from "@/components/Section";
import CTASection from "@/components/CTASection";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "How We Build",
  description:
    "Our five-step process and modern tech stack — Next.js, React, Tailwind CSS, Vercel — engineered for speed, SEO, and conversions.",
  alternates: { canonical: "/how-we-build" },
  openGraph: {
    title: "How We Build — Macrolight Builders",
    description:
      "Discover the process and technology behind every Macrolight Builders website. Built for speed, SEO, and real business results.",
    url: "https://macrolightbuilders.com/how-we-build",
  },
};

const howWeBuildSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "How We Build — Macrolight Builders",
  description:
    "Our five-step process and modern tech stack for building high-converting local business websites.",
  url: "https://macrolightbuilders.com/how-we-build",
};

const steps = [
  {
    number: "01",
    title: "Discovery",
    description:
      "We start with a deep-dive into your business, your customers, and your competition. We audit your current site, review your analytics, and map out exactly what needs to happen to turn more visitors into paying customers.",
  },
  {
    number: "02",
    title: "Design",
    description:
      "Our design lead creates high-fidelity mockups tailored to your brand and industry. Every layout decision is backed by conversion data — not guesswork. You approve the design before a single line of code is written.",
  },
  {
    number: "03",
    title: "Build",
    description:
      "We hand-code your site in Next.js and React for blazing performance and rock-solid SEO. No bloated page builders, no templates. Every page is optimized for Core Web Vitals and mobile-first.",
  },
  {
    number: "04",
    title: "Launch",
    description:
      "We deploy to Vercel's global edge network, configure your domain, set up analytics tracking, and submit your sitemap to Google. Your site goes live with schema markup, open graph tags, and sub-second load times on day one.",
  },
  {
    number: "05",
    title: "Grow",
    description:
      "Launch is just the beginning. We monitor performance, run A/B tests, publish fresh content, and continuously optimize your site to drive more leads every month. You get a monthly report showing exactly what's working.",
  },
];

const techStack = [
  {
    name: "Next.js",
    description: "Server-side rendering and static generation for lightning-fast page loads and perfect SEO scores out of the box.",
    icon: (
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
        <circle cx="16" cy="16" r="14" fill="currentColor" className="text-gray-900" />
        <path d="M13.5 10v12l9-12" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: "React",
    description: "Component-driven architecture that keeps code maintainable and makes updates fast — change once, update everywhere.",
    icon: (
      <svg viewBox="0 0 32 32" className="h-8 w-8 text-cyan-500" aria-hidden>
        <circle cx="16" cy="16" r="2.5" fill="currentColor" />
        <ellipse cx="16" cy="16" rx="12" ry="4.5" fill="none" stroke="currentColor" strokeWidth="1" />
        <ellipse cx="16" cy="16" rx="12" ry="4.5" fill="none" stroke="currentColor" strokeWidth="1" transform="rotate(60 16 16)" />
        <ellipse cx="16" cy="16" rx="12" ry="4.5" fill="none" stroke="currentColor" strokeWidth="1" transform="rotate(120 16 16)" />
      </svg>
    ),
  },
  {
    name: "Tailwind CSS",
    description: "Utility-first styling that produces tiny CSS bundles. No unused styles shipped to your visitors — only what each page needs.",
    icon: (
      <svg viewBox="0 0 32 32" className="h-8 w-8 text-cyan-400" aria-hidden>
        <path d="M9 13c1.333-4 4-6 8-6 6 0 6.75 4.5 9.75 5.25C28.75 12.75 30 11 32 8c-1.333 4-4 6-8 6-6 0-6.75-4.5-9.75-5.25C12.25 8.25 11 10 9 13zM0 24c1.333-4 4-6 8-6 6 0 6.75 4.5 9.75 5.25C19.75 23.75 21 22 23 19c-1.333 4-4 6-8 6-6 0-6.75-4.5-9.75-5.25C3.25 19.25 2 21 0 24z" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Vercel",
    description: "Global edge deployment with automatic SSL, instant rollbacks, and 99.99% uptime. Your site loads fast everywhere in the world.",
    icon: (
      <svg viewBox="0 0 32 32" className="h-8 w-8 text-gray-900" aria-hidden>
        <polygon points="16,6 28,26 4,26" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Prisma",
    description: "Type-safe database access that eliminates entire categories of bugs. Your data layer is reliable, fast, and easy to extend.",
    icon: (
      <svg viewBox="0 0 32 32" className="h-8 w-8 text-violet-600" aria-hidden>
        <path d="M16 4L6 28h14l6-16-10-8z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M6 28L16 4l10 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: "Neon Postgres",
    description: "Serverless Postgres with instant branching and auto-scaling. Enterprise-grade database that costs nothing when idle.",
    icon: (
      <svg viewBox="0 0 32 32" className="h-8 w-8 text-emerald-500" aria-hidden>
        <ellipse cx="16" cy="10" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 10v12c0 2.2 4.5 4 10 4s10-1.8 10-4V10" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 16c0 2.2 4.5 4 10 4s10-1.8 10-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

const benefits = [
  {
    title: "Lightning Fast",
    stat: "< 1s",
    description:
      "Sub-one-second page loads on every device. Server-rendered pages and edge caching mean your visitors never wait — and Google rewards you for it.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    title: "SEO Built-In",
    stat: "100",
    description:
      "Schema markup, auto-generated sitemaps, and Core Web Vitals optimization baked into every build. Your site is search-engine ready from day one.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
  },
  {
    title: "Scales With You",
    stat: "∞",
    description:
      "Start with a five-page site. Add a blog, booking system, or e-commerce down the road. The architecture supports it all without a rebuild.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
      </svg>
    ),
  },
];

export default function HowWeBuildPage() {
  return (
    <>
      <JsonLd data={howWeBuildSchema} />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gray-50 border-b border-gray-200 pt-20 pb-14 sm:pt-28">
        <div className="absolute inset-0 dot-bg pointer-events-none" aria-hidden />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-violet-100 opacity-60 blur-3xl pointer-events-none" aria-hidden />

        <div className="relative mx-auto max-w-4xl px-5 sm:px-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-600 animate-fade-in">
            Process & Technology
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.05] animate-fade-in-up">
            How We{" "}
            <span className="gradient-text">Build.</span>
          </h1>
          <p className="mt-5 text-lg text-gray-500 max-w-2xl mx-auto animate-fade-in-up">
            A proven five-step process powered by the same technology stack used
            by Vercel, Netflix, and OpenAI — scaled down for local businesses
            that want enterprise-grade results.
          </p>
        </div>
      </section>

      {/* ── Our Process (Timeline) ── */}
      <Section padding="lg" className="bg-white">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            Our Process
          </h2>
          <p className="mt-4 text-base text-gray-500">
            Five steps from first call to a site that pays for itself.
          </p>
        </div>

        <div className="relative max-w-3xl mx-auto">
          {/* Vertical connecting line */}
          <div
            className="absolute left-6 sm:left-8 top-0 bottom-0 w-px bg-violet-200"
            aria-hidden
          />

          <div className="space-y-12">
            {steps.map((step, idx) => (
              <div key={step.number} className="relative flex items-start gap-6 sm:gap-8">
                {/* Step number circle */}
                <div className="relative z-10 flex-shrink-0 h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-sm sm:text-base shadow-lg shadow-violet-600/25">
                  {step.number}
                </div>

                {/* Content */}
                <div className={`pt-1 sm:pt-3 ${idx === steps.length - 1 ? "" : "pb-2"}`}>
                  <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                  <p className="mt-2 text-sm sm:text-base text-gray-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Our Tech Stack ── */}
      <Section padding="lg" className="bg-gray-50 border-t border-gray-100">
        <div className="mx-auto max-w-2xl text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            Our Tech Stack
          </h2>
          <p className="mt-4 text-base text-gray-500">
            Modern, proven tools — chosen for speed, reliability, and long-term
            maintainability.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {techStack.map((tech) => (
            <div
              key={tech.name}
              className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-5">{tech.icon}</div>
              <h3 className="text-lg font-bold text-gray-900">{tech.name}</h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                {tech.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Why It Matters ── */}
      <Section padding="lg" className="bg-white border-t border-gray-100">
        <div className="mx-auto max-w-2xl text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            Why It Matters
          </h2>
          <p className="mt-4 text-base text-gray-500">
            Great technology is only valuable if it translates to real business
            outcomes. Here&apos;s what ours delivers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="bg-gray-50 rounded-2xl p-8 border border-gray-200 text-center hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-violet-50 text-violet-600 mx-auto mb-4">
                {b.icon}
              </div>
              <p className="font-display text-3xl font-bold text-violet-600 mb-1">
                {b.stat}
              </p>
              <h3 className="text-lg font-bold text-gray-900">{b.title}</h3>
              <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                {b.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── CTA ── */}
      <CTASection
        eyebrow="See it in action"
        headline="Let's build your next website."
        subhead="Get a free conversion audit and see exactly how our process and tech stack can grow your business."
      />
    </>
  );
}
