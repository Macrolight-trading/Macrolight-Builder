import type { Metadata } from "next";
import Section from "@/components/Section";
import MinimalContactForm from "@/components/MinimalContactForm";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Request a Free Website Audit",
  description:
    "Drop your website. We'll send back a prioritized conversion plan within 24 hours. No call required.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Request a Free Website Audit — Macrolight Builder",
    description:
      "Get a no-obligation website conversion audit in 24 hours. We'll show you exactly how to turn more visitors into customers.",
    url: "https://macrolight-builder.com/contact",
    type: "website",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Macrolight Builder — request a free website audit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Request a Free Website Audit — Macrolight Builder",
    description:
      "Get a no-obligation website conversion audit in 24 hours. We'll show you exactly how to turn more visitors into customers.",
    images: ["/og-default.png"],
  },
};

const contactPageSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Request a Free Website Audit — Macrolight Builder",
  url: "https://macrolight-builder.com/contact",
  description:
    "Request a free, no-obligation website conversion audit from Macrolight Builder.",
  isPartOf: {
    "@type": "WebSite",
    name: "Macrolight Builder",
    url: "https://macrolight-builder.com",
  },
  mainEntity: {
    "@type": "Organization",
    name: "Macrolight Builder",
    url: "https://macrolight-builder.com",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      url: "https://macrolight-builder.com/contact",
      availableLanguage: ["English"],
    },
  },
};

export default function ContactPage() {
  return (
    <>
      <JsonLd data={contactPageSchema} />

      {/* Single combined section: hero + form, nothing else above the fold */}
      <section className="relative overflow-hidden bg-gray-50 border-b border-gray-200 pt-20 pb-20 sm:pt-28 sm:pb-28">
        <div className="absolute inset-0 dot-bg pointer-events-none" aria-hidden />
        <div
          className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-violet-100 opacity-50 blur-3xl pointer-events-none"
          aria-hidden
        />

        <div className="relative mx-auto max-w-2xl px-5 sm:px-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-600 animate-fade-in">
            Free audit
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.05] animate-fade-in-up">
            Get your free{" "}
            <span className="gradient-text">website audit</span>
          </h1>
          <p className="mt-5 text-lg text-gray-500 animate-fade-in-up">
            Drop your site. We&apos;ll send a prioritized conversion plan back
            within 24 hours.
          </p>

          <div className="mt-10 text-left animate-fade-in-up">
            <MinimalContactForm />
          </div>

          <p className="mt-8 text-sm text-gray-400">
            Prefer email?{" "}
            <a
              href="mailto:hello@macrolight-builder.com"
              className="font-medium text-violet-600 hover:underline"
            >
              hello@macrolight-builder.com
            </a>
          </p>
        </div>
      </section>

      {/* Light trust strip — kept tiny so the page stays focused on the form */}
      <Section padding="md" className="bg-white">
        <div className="mx-auto max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-2xl font-extrabold text-gray-900">24h</p>
            <p className="mt-1 text-sm text-gray-500">Audit turnaround</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900">0$</p>
            <p className="mt-1 text-sm text-gray-500">Cost. No pitch attached.</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900">50+</p>
            <p className="mt-1 text-sm text-gray-500">Points checked per site</p>
          </div>
        </div>
      </Section>
    </>
  );
}
