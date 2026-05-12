export interface CaseStudyResult {
  metric: string;
  value: string;
  description: string;
}

export interface CaseStudy {
  slug: string;
  sampleSiteHref: string;
  company: string;
  industry: string;
  location: string;
  previewImage: string;
  previewImageAlt: string;
  challenge: string;
  solution: string;
  results: CaseStudyResult[];
  /**
   * Real client testimonial. ONLY populate when we have a verified quote
   * from a named, real client (with permission to publish). We previously
   * filled this with self-quotes attributed to "Macrolight Founding Team",
   * which is worse than having no testimonial at all — leave undefined
   * until a real one is available.
   */
  testimonialQuote?: string;
  testimonialAuthor?: string;
  testimonialRole?: string;
  timeframe: string;
}

export const caseStudies: CaseStudy[] = [
  {
    slug: "restaurants",
    sampleSiteHref: "/restaurants",
    company: "Restaurant Sample Build",
    industry: "Restaurant",
    location: "Cleveland, OH",
    previewImage:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80&fit=crop",
    previewImageAlt:
      "Restaurant owners reviewing online reservations and menu pages",
    challenge:
      "Many independent restaurants rely on social pages alone, making menus hard to find, reservations inconsistent, and local search visibility weaker than nearby competitors.",
    solution:
      "Our restaurant playbook prioritizes menu accessibility, mobile reservation UX, location-based SEO, and trust-building presentation that mirrors the in-person brand experience.",
    results: [
      {
        metric: "Build Type",
        value: "Sample",
        description:
          "Shows a practical structure for reservation-forward restaurant websites.",
      },
      {
        metric: "Primary Focus",
        value: "Bookings",
        description:
          "Menu clarity, click-to-call, and streamlined booking flow for mobile-first visitors.",
      },
      {
        metric: "Proof Status",
        value: "Founding",
        description:
          "Verified performance numbers will be added once founding clients are live.",
      },
    ],
    timeframe: "Founding phase",
  },
  {
    slug: "law-firms",
    sampleSiteHref: "/law-firms",
    company: "Law Firm Sample Build",
    industry: "Law Firm",
    location: "Columbus, OH",
    previewImage:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1600&q=80&fit=crop",
    previewImageAlt:
      "Law office team reviewing consultation intake and case evaluation flow",
    challenge:
      "Growing law firms often struggle with poor intake UX, weak trust architecture, and ad traffic that does not convert into qualified consultations.",
    solution:
      "Our legal-services sample emphasizes clear practice-area paths, immediate consultation CTAs, and trust-first page structure to improve qualified lead intake.",
    results: [
      {
        metric: "Build Type",
        value: "Sample",
        description:
          "Demonstrates a consultation-focused legal website architecture.",
      },
      {
        metric: "Primary Focus",
        value: "Intake",
        description:
          "Stronger qualification flow and clear contact pathways for high-intent prospects.",
      },
      {
        metric: "Proof Status",
        value: "Founding",
        description:
          "Metrics are published only after real campaigns and verification.",
      },
    ],
    timeframe: "Founding phase",
  },
  {
    slug: "hvac",
    sampleSiteHref: "/hvac",
    company: "HVAC Sample Build",
    industry: "HVAC",
    location: "Cincinnati, OH",
    previewImage:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1600&q=80&fit=crop",
    previewImageAlt:
      "HVAC technician and dispatcher reviewing service requests on a tablet",
    challenge:
      "A common HVAC problem set is outdated mobile UX, form reliability issues, and weak local landing-page architecture for emergency and seasonal demand.",
    solution:
      "Our HVAC sample implementation uses service-specific pages, clear emergency contact hierarchy, and technical SEO fundamentals to support both paid and organic lead channels.",
    results: [
      {
        metric: "Build Type",
        value: "Sample",
        description:
          "A blueprint for high-intent HVAC traffic capture and cleaner conversion paths.",
      },
      {
        metric: "Primary Focus",
        value: "Service Leads",
        description:
          "Supports click-to-call behavior and structured service page navigation.",
      },
      {
        metric: "Proof Status",
        value: "Founding",
        description:
          "Performance reporting will move to documented client data after launch campaigns complete.",
      },
    ],
    timeframe: "Founding phase",
  },
  {
    slug: "dentists",
    sampleSiteHref: "/dentists",
    company: "Dental Sample Build",
    industry: "Dentist",
    location: "Dayton, OH",
    previewImage:
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1600&q=80&fit=crop",
    previewImageAlt:
      "Dental team reviewing online appointment requests at the front desk",
    challenge:
      "Dental practices often lose potential new patients due to unclear insurance info, weak service-page merchandising, and no frictionless booking flow.",
    solution:
      "Our dental sample site prioritizes insurance clarity, treatment-specific landing pages, and fast appointment conversion paths for mobile users.",
    results: [
      {
        metric: "Build Type",
        value: "Sample",
        description:
          "Shows a practical structure for a new-patient and cosmetic-service-focused dental website.",
      },
      {
        metric: "Primary Focus",
        value: "Appointments",
        description:
          "Reduce booking friction with clearer pathways from search intent to scheduled consultation.",
      },
      {
        metric: "Proof Status",
        value: "Founding",
        description:
          "Verified outcomes are published only after launch and documented performance data.",
      },
    ],
    timeframe: "Founding phase",
  },
];

export function getAllCaseStudies(): CaseStudy[] {
  return caseStudies;
}

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((cs) => cs.slug === slug);
}
