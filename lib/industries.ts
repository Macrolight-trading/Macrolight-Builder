/**
 * Industry profile for dynamic niche pages.
 * Add a new industry by appending an entry here — the /[industry] route
 * will pick it up automatically, with sensible fallbacks for unknown slugs.
 */
export interface IndustryProfile {
  slug: string;
  name: string; // singular/display name, e.g. "Roofing"
  clientsLabel: string; // plural label used in CTAs, e.g. "Roofing Clients"
  heroTagline: string;
  painPoints: Array<{ title: string; description: string }>;
  services: string[];
  testimonials: Array<{
    quote: string;
    author: string;
    role: string;
  }>;
  accent?: {
    /** Tailwind gradient from-* to-* classes */
    from: string;
    to: string;
  };
}

export const industries: Record<string, IndustryProfile> = {
  roofing: {
    slug: "roofing",
    name: "Roofing",
    clientsLabel: "Roofing Clients",
    heroTagline:
      "Stop losing storm-season leads to competitors with better websites.",
    painPoints: [
      {
        title: "You rank, but no one calls",
        description:
          "Your site shows up in Google, yet visitors bounce before requesting a quote.",
      },
      {
        title: "Slow, outdated site on mobile",
        description:
          "Homeowners searching after a storm are on their phones — and your site takes 6+ seconds to load.",
      },
      {
        title: "Leads land in the void",
        description:
          "Quote requests go to an inbox nobody checks, and follow-ups happen 48 hours too late.",
      },
    ],
    services: [
      "Residential roof replacement",
      "Commercial roofing",
      "Storm damage & insurance claims",
      "Gutter installation & repair",
      "24/7 emergency tarping",
    ],
    testimonials: [
      {
        quote:
          "We're a new agency, but the process was clear and focused on getting more qualified roofing calls instead of just making the site look pretty.",
        author: "Founding client statement",
        role: "Roofing business owner",
      },
    ],
    accent: { from: "from-orange-500", to: "to-red-500" },
  },

  restaurants: {
    slug: "restaurants",
    name: "Restaurant",
    clientsLabel: "Restaurant Reservations",
    heroTagline:
      "Fill tables on slow nights with a site that actually drives bookings.",
    painPoints: [
      {
        title: "Your menu is a PDF",
        description:
          "Mobile visitors pinch, zoom, and leave. They never see your best-selling dish.",
      },
      {
        title: "Reservations live on a third-party site",
        description:
          "Google sends people to OpenTable — not you — and you pay a commission for your own customers.",
      },
      {
        title: "No way to capture repeat diners",
        description:
          "Nothing on your site captures emails or drives repeat visits for slow weekdays.",
      },
    ],
    services: [
      "Menu showcase with photography",
      "Direct reservations & waitlist",
      "Online ordering integration",
      "Private events & catering",
      "Gift card & loyalty program",
    ],
    testimonials: [
      {
        quote:
          "The build plan made it obvious how online visitors move from menu browsing to bookings. That's exactly the clarity we wanted.",
        author: "Founding client statement",
        role: "Restaurant operator",
      },
    ],
    accent: { from: "from-amber-500", to: "to-pink-500" },
  },

  "law-firms": {
    slug: "law-firms",
    name: "Law Firm",
    clientsLabel: "Qualified Case Leads",
    heroTagline:
      "Convert high-intent legal searches into consultation bookings — automatically.",
    painPoints: [
      {
        title: "You pay for Google Ads, but leads don't qualify",
        description:
          "Your site doesn't pre-qualify cases, so your paralegals waste hours on bad fits.",
      },
      {
        title: "Trust signals are missing",
        description:
          "No case results, no attorney bios, no bar credentials — visitors leave to find a firm that feels legitimate.",
      },
      {
        title: "No intake automation",
        description:
          "Forms email a partner who's in court. By the time someone responds, the prospect hired a competitor.",
      },
    ],
    services: [
      "Personal injury & accident claims",
      "Family law & divorce",
      "Estate planning & probate",
      "Business & contract law",
      "Criminal defense",
    ],
    testimonials: [
      {
        quote:
          "We liked the intake strategy and case-fit flow. It's built to attract better legal inquiries, not just more traffic.",
        author: "Founding client statement",
        role: "Law firm partner",
      },
    ],
    accent: { from: "from-blue-500", to: "to-indigo-500" },
  },

  hvac: {
    slug: "hvac",
    name: "HVAC",
    clientsLabel: "HVAC Service Calls",
    heroTagline:
      "Dominate your service area with a site that books jobs on autopilot.",
    painPoints: [
      {
        title: "Emergency calls slip through",
        description:
          "When an AC dies in July, the first contractor to answer wins. Your site isn't built for that moment.",
      },
      {
        title: "Seasonal spikes overwhelm your team",
        description:
          "You're fielding phone calls all day while the job site falls behind. No online booking = no leverage.",
      },
      {
        title: "Tune-up memberships never scale",
        description:
          "Your recurring maintenance plan is your most profitable product — and nobody finds it on your site.",
      },
    ],
    services: [
      "Residential HVAC installation",
      "Emergency repair & diagnostics",
      "Annual maintenance memberships",
      "Commercial HVAC contracts",
      "Indoor air quality services",
    ],
    testimonials: [
      {
        quote:
          "The emergency-first layout and service-page structure fit how HVAC customers actually search and call.",
        author: "Founding client statement",
        role: "HVAC business owner",
      },
    ],
    accent: { from: "from-cyan-500", to: "to-blue-500" },
  },

  dentists: {
    slug: "dentists",
    name: "Dental",
    clientsLabel: "New Patient Appointments",
    heroTagline:
      "Turn searches like 'dentist near me' into booked, paying patients.",
    painPoints: [
      {
        title: "Your site hides insurance info",
        description:
          "The #1 question before booking is 'do you take my insurance?' — and it's buried four clicks deep.",
      },
      {
        title: "No online booking",
        description:
          "New patients prefer booking at 10pm on their phone — not calling during office hours.",
      },
      {
        title: "Cosmetic services aren't merchandised",
        description:
          "Your highest-margin services (Invisalign, implants, whitening) get one paragraph and no photos.",
      },
    ],
    services: [
      "General & preventive care",
      "Cosmetic dentistry",
      "Invisalign & orthodontics",
      "Implants & restorative",
      "Emergency dental care",
    ],
    testimonials: [
      {
        quote:
          "The online booking and insurance visibility strategy is exactly what a modern dental site should prioritize.",
        author: "Founding client statement",
        role: "Dental practice owner",
      },
    ],
    accent: { from: "from-teal-500", to: "to-emerald-500" },
  },

  "lawn-care": {
    slug: "lawn-care",
    name: "Lawn Care",
    clientsLabel: "Lawn Care Clients",
    heroTagline:
      "Turn your landscaping expertise into a steady stream of booked estimates — without chasing leads.",
    painPoints: [
      {
        title: "Calls spike, then go cold",
        description:
          "Spring and fall bring a flood of requests, but your site has no way to capture off-season leads or keep homeowners coming back.",
      },
      {
        title: "No online estimate request",
        description:
          "Homeowners want to submit their project details at 9pm on a Sunday — not wait to call during business hours.",
      },
      {
        title: "Your work isn't visible",
        description:
          "You've transformed hundreds of yards, but your site has no gallery, no before/after photos, and nothing to build trust before they call.",
      },
    ],
    services: [
      "Landscape design & installation",
      "Lawn maintenance & mowing",
      "Spring & fall cleanups",
      "Shrub trimming & pruning",
      "Weeding & bed care",
      "Mulching & bed refresh",
    ],
    testimonials: [
      {
        quote:
          "The estimate flow and gallery-first layout are practical for lawn-care buyers comparing multiple providers.",
        author: "Founding client statement",
        role: "Lawn care business owner",
      },
    ],
    accent: { from: "from-green-600", to: "to-emerald-500" },
  },
};

/** List of all configured industry slugs (used for static generation). */
export const industrySlugs = Object.keys(industries);

/** Strict check: is this slug a real, configured industry? */
export function isValidIndustrySlug(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(
    industries,
    slug.toLowerCase()
  );
}

/**
 * Resolve a configured industry profile from a slug. Returns `undefined`
 * for unknown slugs so the catch-all route can call `notFound()` instead
 * of generating an indexable doorway page.
 *
 * SEO note: this used to return a generic profile for ANY slug, which made
 * `/[anything]` render an HTTP 200 industry-style page. That created an
 * unbounded set of crawlable URLs. Do not reintroduce a fallback profile
 * here — unknown slugs MUST 404.
 */
export function getIndustry(slug: string): IndustryProfile | undefined {
  const normalized = slug.toLowerCase();
  return industries[normalized];
}

/**
 * Internal-only: build a generic profile from a slug. Kept for places that
 * intentionally render a generic industry block (e.g. previews from a CMS),
 * but NEVER used by the public `/[industry]` route.
 */
export function buildGenericIndustry(slug: string): IndustryProfile {
  const normalized = slug.toLowerCase();
  const pretty = normalized
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");

  return {
    slug: normalized,
    name: pretty,
    clientsLabel: `${pretty} Clients`,
    heroTagline: `Turn your ${pretty.toLowerCase()} website into a predictable source of qualified leads.`,
    painPoints: [
      {
        title: "Your site isn't built to convert",
        description:
          "Visitors arrive but nothing guides them toward becoming a customer.",
      },
      {
        title: "Leads fall through the cracks",
        description:
          "No automated follow-up, no tracking, no way to know what's working.",
      },
      {
        title: "You're invisible on mobile",
        description:
          "A slow, clunky mobile experience is costing you the majority of your traffic.",
      },
    ],
    services: [
      "Core services showcase",
      "Service-area landing pages",
      "Online booking & intake",
      "Review & reputation integration",
      "Local SEO optimization",
    ],
    testimonials: [
      {
        quote:
          "We went from a digital business card to a full lead-gen system. Best investment we've made this year.",
        author: "A happy client",
        role: `${pretty} business owner`,
      },
    ],
  };
}
