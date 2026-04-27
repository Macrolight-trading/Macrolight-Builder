export interface CaseStudyResult {
  metric: string;
  value: string;
  description: string;
}

export interface CaseStudy {
  slug: string;
  company: string;
  industry: string;
  location: string;
  challenge: string;
  solution: string;
  results: CaseStudyResult[];
  testimonialQuote: string;
  testimonialAuthor: string;
  testimonialRole: string;
  timeframe: string;
}

export const caseStudies: CaseStudy[] = [
  {
    slug: "apex-roofing",
    company: "Apex Roofing",
    industry: "Roofing",
    location: "Columbus, OH",
    challenge:
      "Apex Roofing had been relying on a basic GoDaddy template site for three years. The site loaded slowly, had no clear calls-to-action, and looked nearly identical to every other roofer in Central Ohio. Despite running Google Ads, their cost-per-lead was climbing and form submissions had flatlined at around 8 per month.",
    solution:
      "We replaced their template with a custom, conversion-engineered site built on Next.js. Every page was designed around a single goal: get the visitor to request a free inspection. We added trust signals (license numbers, insurance badges, 150+ Google reviews), neighborhood-specific landing pages for their top service areas, and a speed-optimized media pipeline that dropped load time from 2.1 seconds to 0.4 seconds. We also integrated their CRM so every lead flows straight into their dispatch system.",
    results: [
      {
        metric: "Lead Increase",
        value: "+340%",
        description:
          "Monthly form submissions jumped from 8 to 35 within 60 days of launch.",
      },
      {
        metric: "Page Load Time",
        value: "0.4s",
        description:
          "Down from 2.1 seconds — a 5x improvement that boosted SEO rankings and reduced bounce rate by 62%.",
      },
      {
        metric: "Additional Monthly Revenue",
        value: "$47K",
        description:
          "The increase in qualified leads translated directly into closed jobs, adding $47,000 in monthly revenue.",
      },
    ],
    testimonialQuote:
      "We were spending $3,000/month on ads and barely getting calls. Within two months of the new site launching, we had to hire two more crews just to keep up with demand. Macrolight paid for itself in the first week.",
    testimonialAuthor: "Marcus Chen",
    testimonialRole: "Owner, Apex Roofing",
    timeframe: "60 days",
  },
  {
    slug: "bella-cucina",
    company: "Bella Cucina",
    industry: "Restaurant",
    location: "Cleveland, OH",
    challenge:
      "Bella Cucina is a family-owned Italian restaurant that had operated for 12 years with nothing more than a Facebook page. Customers couldn't find their menu online, reservations were phone-only, and they were invisible on Google Maps for searches like 'Italian restaurant near me.' They were losing weeknight covers to competitors who had a stronger online presence.",
    solution:
      "We built a visually rich, mobile-first site that puts the food front and center. The homepage features a rotating gallery of signature dishes, the full menu with dietary filters, and an integrated reservation widget that syncs with their floor plan. We optimized their Google Business Profile, added local schema markup, and created location-specific content that targets high-intent search queries in Greater Cleveland. A monthly blog strategy keeps the site fresh and drives organic traffic.",
    results: [
      {
        metric: "Online Reservations",
        value: "4x",
        description:
          "Online reservation volume quadrupled within the first 90 days, filling previously empty weeknight tables.",
      },
      {
        metric: "Google Maps Clicks",
        value: "+89%",
        description:
          "Direction requests and click-to-call actions from their Google Business Profile surged 89%.",
      },
      {
        metric: "Media Features",
        value: "3",
        description:
          "The new site caught the attention of Cleveland Scene, Eater Cleveland, and a popular local food blog — all within the first quarter.",
      },
    ],
    testimonialQuote:
      "For twelve years we told ourselves we didn't need a website. After seeing what Macrolight built for us, I can't believe we waited so long. Our Tuesday nights used to be dead — now we're turning people away.",
    testimonialAuthor: "Sofia Marchetti",
    testimonialRole: "Co-Owner, Bella Cucina",
    timeframe: "90 days",
  },
  {
    slug: "coolair-hvac",
    company: "CoolAir HVAC",
    industry: "HVAC",
    location: "Cincinnati, OH",
    challenge:
      "CoolAir HVAC had an outdated WordPress site that hadn't been updated in four years. The theme was broken on mobile, the contact form intermittently failed, and they ranked on page three of Google for their core service keywords. They were losing an estimated 40% of mobile visitors to a poor experience, and their main competitor had recently launched a modern site that was pulling ahead in local search.",
    solution:
      "We executed a full redesign in just 21 days — migrating from WordPress to a blazing-fast Next.js stack. The new site features service-specific landing pages for each of their offerings (AC repair, furnace installation, duct cleaning), a prominent emergency service hotline with click-to-call, and customer review integration pulling live testimonials from Google. We implemented a technical SEO overhaul including proper heading hierarchy, image optimization, internal linking, and local business schema.",
    results: [
      {
        metric: "Time to Launch",
        value: "21 days",
        description:
          "From signed proposal to live site in three weeks — no downtime, no disruption to existing leads.",
      },
      {
        metric: "More Service Calls",
        value: "+156%",
        description:
          "Inbound service call volume increased 156% in the first quarter after launch.",
      },
      {
        metric: "First Page Rankings",
        value: "12",
        description:
          "Achieved first page Google ranking for 12 high-value keywords including 'HVAC repair Cincinnati' and 'AC installation near me.'",
      },
    ],
    testimonialQuote:
      "I was nervous about switching off WordPress because that's all I'd ever known. Macrolight made it painless. The new site was live in three weeks and our phone hasn't stopped ringing since. Best business decision I've made in five years.",
    testimonialAuthor: "James Whitfield",
    testimonialRole: "President, CoolAir HVAC",
    timeframe: "21 days",
  },
];

export function getAllCaseStudies(): CaseStudy[] {
  return caseStudies;
}

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((cs) => cs.slug === slug);
}
