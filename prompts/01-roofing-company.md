# Prompt: Roofing Company Website

Build a conversion-focused website for a residential and commercial roofing company using the Macrolight Builder stack (Next.js 14, Tailwind CSS, Prisma, Resend, Stripe).

## Business Details
- **Business name:** [CLIENT NAME]
- **Location:** [CITY, STATE]
- **Phone:** [PHONE]
- **Email:** [EMAIL]
- **Services:** Residential roof replacement, commercial roofing, storm damage & insurance claims, gutter installation, emergency tarping

## Pages to Build
1. **Homepage** — Hero with storm-season urgency headline, click-to-call CTA, trust badges (licensed & insured, years in business), 3 core services, testimonials, final CTA
2. **Services** — Individual sections per service with problem/solution framing
3. **About** — Team, credentials, service area map
4. **Contact** — Contact form wired to Resend notifications + Prisma contact storage, click-to-call button prominent

## Key Requirements
- Mobile-first (majority of storm leads come from mobile)
- Sub-3s load time — no heavy images unoptimized
- Contact form saves to DB and fires a notification email to `LEAD_NOTIFICATION_EMAIL`
- Click-to-call button pinned to bottom of mobile viewport
- Schema markup: `LocalBusiness`, `RoofingContractor`
- Pricing section matching Growth tier ($1,000 build / $149/mo)

## Tone & Copy Direction
Direct, confident, homeowner-friendly. Lead with the problem (storm damage, old roof leaking) before the solution. Avoid roofing jargon. Urgency is appropriate — storm season framing works.
