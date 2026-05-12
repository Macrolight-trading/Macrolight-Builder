# Prompt: General Local Service Business Website

Build a conversion-focused website for a local service business using the Macrolight Builder stack (Next.js 14, Tailwind CSS, Prisma, Resend, Stripe). Use this prompt as a starting template for any industry not covered by a specific prompt.

## Business Details
- **Business name:** [NAME]
- **Industry / trade:** [e.g. Plumbing, Electrical, Cleaning, Pest Control]
- **Location / service area:** [CITY, STATE]
- **Phone:** [PHONE]
- **Key differentiator:** [e.g. Same-day service, family-owned 20 years, lowest price guarantee]

## Pages to Build
1. **Homepage** — Problem-aware hero, core services grid, trust signals (licensed, insured, years in business, review count), CTA
2. **Services** — One section or page per service with problem/solution framing and included items
3. **About** — Story, team, credentials, service area
4. **Testimonials / Reviews** — Pull from Google or embed review schema
5. **Contact / Get a Quote** — Form with service type + urgency. Saves to Prisma contacts + fires notification email.

## Key Requirements
- Contact form wired to `LEAD_NOTIFICATION_EMAIL` via Resend
- Click-to-call button on all mobile views
- Schema markup: `LocalBusiness` + trade-specific type if available
- Service area page for local SEO keyword coverage
- Analytics tracking via `@vercel/analytics`
- Sitemap and robots.txt via Next.js route handlers

## Pricing Tier Selection
| Situation | Tier |
|---|---|
| New business, simple 3–5 page site | **Starter** ($500 build / $79/mo) |
| Established business wanting lead gen | **Growth** ($1,000 build / $149/mo) |
| Multi-location or complex funnels | **Pro** ($2,500 build / $249/mo) |

## Tone & Copy Direction
Adapt to the trade. Blue-collar trades: direct, no-nonsense, reliability-focused. Professional services: credibility-forward, outcome-led. Always lead with the customer's problem before the solution.
