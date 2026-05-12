# Prompt: Lawn Care & Landscaping Website

Build a quote-request website for a lawn care and landscaping business using the Macrolight Builder stack (Next.js 14, Tailwind CSS, Prisma, Resend, Stripe).

## Business Details
- **Business name:** [NAME]
- **Location / service area:** [CITY, STATE]
- **Phone:** [PHONE]
- **Services:** Weekly mowing, lawn treatment, landscaping design, mulching, fall/spring clean-up, snow removal (if applicable)

## Pages to Build
1. **Homepage** — Before/after photography hero, instant quote CTA, seasonal services, Google review count + rating
2. **Services** — Cards per service with what's included and frequency
3. **Pricing / Plans** — Recurring lawn care tiers (Basic, Standard, Premium) — optional Stripe checkout for prepay discounts
4. **Gallery** — Before/after grid with project descriptions
5. **Contact / Get a Quote** — Address + lawn size + services wanted. Saves to Prisma + notification email.

## Key Requirements
- Quote form captures lawn size (sq ft or lot size) and service interest
- Gallery page — optimized Next.js Image component, WebP
- Seasonal urgency copy (spring clean-up, fall aeration)
- Schema markup: `LocalBusiness`, `LandscapingBusiness`
- Service area page for "[city] lawn care" SEO

## Tone & Copy Direction
Neighbourly, reliable, visual. Let the before/after photos do most of the selling. Copy should be short. Price transparency builds trust — show starting prices if possible.
