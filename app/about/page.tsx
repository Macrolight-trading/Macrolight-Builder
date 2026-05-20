import type { Metadata } from "next";
import Image from "next/image";
import Section from "@/components/Section";
import CTASection from "@/components/CTASection";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  // Keyword-rich title (template appends " | Macrolight Builder").
  title: "About Our Web Design Agency",
  description:
    "Meet Bradley Bayley & Nick Ottoy — co-founders of Macrolight Builder. We build high-converting websites that generate real revenue for local businesses.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About — Macrolight Builder",
    description:
      "Meet the founders behind Macrolight Builder. Conversion-first websites for local businesses.",
    url: "https://macrolight-builder.com/about",
    type: "website",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "About Macrolight Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About — Macrolight Builder",
    description:
      "Meet the founders behind Macrolight Builder. Conversion-first websites for local businesses.",
    images: ["/og-default.png"],
  },
};

const aboutSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About Macrolight Builder",
  description:
    "Learn about the founders, mission, and values behind Macrolight Builder — a Birmingham, MI web design agency for local businesses.",
  url: "https://macrolight-builder.com/about",
  mainEntity: {
    "@type": "Organization",
    name: "Macrolight Builder",
    url: "https://macrolight-builder.com",
    founder: [
      { "@type": "Person", name: "Bradley Bayley" },
      { "@type": "Person", name: "Nick Ottoy" },
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: "1902 Villa Rd",
      addressLocality: "Birmingham",
      addressRegion: "MI",
      postalCode: "48009",
      addressCountry: "US",
    },
    telephone: "+1-248-214-7957",
  },
};

const values = [
  {
    title: "Conversion First",
    description:
      "Every design decision, every line of code, every pixel is measured against one question: does this help your visitor become a customer? Beautiful websites are great — but only if they ring your phone.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    title: "Radical Transparency",
    description:
      "No jargon-filled invoices. No mystery fees. You see exactly what we build, why we build it, and what it costs. We share analytics dashboards so you always know how your site is performing.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: "Built to Last",
    description:
      "We use modern, battle-tested technology so your site stays fast, secure, and maintainable for years — not months. No page builders that break on the next update. Just clean, production-grade code.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
];

// Real founders. To swap in headshots:
//   1. Save a square JPG/PNG (~400x400 or larger) to /public/team/bradley.jpg
//      and /public/team/nick.jpg.
//   2. Set the `photo` field below to the matching path (e.g. "/team/bradley.jpg").
// Until `photo` is set, the styled initials avatar renders as a fallback.
const team: Array<{
  name: string;
  role: string;
  initials: string;
  color: string;
  bio: string;
  photo?: string;
}> = [
  {
    name: "Bradley Bayley",
    role: "Co-Founder",
    initials: "BB",
    color: "bg-violet-600",
    bio: "Full-stack engineer focused on page speed and conversion. Bradley leads the build side of every Macrolight project — the code, hosting, analytics, and the lead-capture systems that make a site actually pay for itself.",
    // photo: "/team/bradley.jpg",
  },
  {
    name: "Nick Ottoy",
    role: "Co-Founder",
    initials: "NO",
    color: "bg-cyan-600",
    bio: "Strategy and client side. Nick spends most of his time talking to local business owners about what's actually keeping the phone from ringing — then turns that into the positioning, content, and growth plan behind each build.",
    // photo: "/team/nick.jpg",
  },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd data={aboutSchema} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gray-50 border-b border-gray-200 pt-20 pb-14 sm:pt-28">
        <div className="absolute inset-0 dot-bg pointer-events-none" aria-hidden />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-violet-100 opacity-60 blur-3xl pointer-events-none" aria-hidden />

        <div className="relative mx-auto max-w-4xl px-5 sm:px-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-600 animate-fade-in">
            About Us
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.05] animate-fade-in-up">
            We build websites that{" "}
            <span className="gradient-text">actually work.</span>
          </h1>
          <p className="mt-5 text-lg text-gray-500 max-w-2xl mx-auto animate-fade-in-up">
            Not just pretty pages — revenue-generating systems designed from the
            ground up for local businesses that need more customers.
          </p>
        </div>
      </section>

      {/* Our Mission */}
      <Section padding="lg" className="bg-white">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            Our Mission
          </h2>
          <p className="mt-6 text-lg text-gray-500 leading-relaxed">
            Most local businesses get sold a website and then get left on their
            own. We think that&apos;s broken. Our mission is to build websites
            that generate real, measurable revenue — and then stick around to
            make sure they keep performing. Every page we ship is engineered to
            convert visitors into phone calls, form fills, and booked
            appointments. If your website isn&apos;t paying for itself, we
            haven&apos;t done our job.
          </p>
        </div>
      </Section>

      {/* Our Values */}
      <Section padding="lg" className="bg-gray-50 border-t border-gray-100">
        <div className="mx-auto max-w-2xl text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            Our Values
          </h2>
          <p className="mt-4 text-base text-gray-500">
            Three principles that guide every project we take on.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((v) => (
            <div
              key={v.title}
              className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-violet-50 text-violet-600 mb-5">
                {v.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900">{v.title}</h3>
              <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                {v.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* The Founders */}
      <Section padding="lg" className="bg-white border-t border-gray-100">
        <div className="mx-auto max-w-2xl text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            The Founders
          </h2>
          <p className="mt-4 text-base text-gray-500">
            Two founders, no middle layer. Every project gets the people whose
            names are on the door.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {team.map((member) => (
            <div
              key={member.name}
              className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-200 hover:shadow-md transition-shadow"
              itemScope
              itemType="https://schema.org/Person"
            >
              {member.photo ? (
                <div className="relative mx-auto h-24 w-24 rounded-full overflow-hidden mb-5 ring-4 ring-white shadow">
                  <Image
                    src={member.photo}
                    alt={`${member.name} — ${member.role}, Macrolight Builder`}
                    fill
                    sizes="96px"
                    className="object-cover"
                    itemProp="image"
                  />
                </div>
              ) : (
                <div
                  className={`mx-auto h-24 w-24 rounded-full ${member.color} flex items-center justify-center text-white text-2xl font-bold mb-5`}
                  aria-hidden
                >
                  {member.initials}
                </div>
              )}
              <h3 className="text-lg font-bold text-gray-900" itemProp="name">
                {member.name}
              </h3>
              <p
                className="text-sm font-medium text-violet-600 mt-1"
                itemProp="jobTitle"
              >
                {member.role}
              </p>
              <p
                className="mt-4 text-sm text-gray-500 leading-relaxed"
                itemProp="description"
              >
                {member.bio}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-gray-400">
          Based in Birmingham, MI &middot; Building for local businesses across the U.S.
        </p>
      </Section>

      {/* CTA */}
      <CTASection
        eyebrow="Work with us"
        headline="Let's build something that works."
        subhead="Get a free conversion audit of your current site. We'll show you exactly where you're losing leads — and how to fix it."
      />
    </>
  );
}
