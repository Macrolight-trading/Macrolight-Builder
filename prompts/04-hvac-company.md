# Prompt: HVAC Company Website

Build a lead-capture website for a residential and light-commercial HVAC contractor using the Macrolight Builder stack (Next.js 14, Tailwind CSS, Prisma, Resend, Stripe).

## Business Details
- **Business name:** [NAME]
- **Location / service area:** [CITY + RADIUS or COUNTY LIST]
- **Phone:** [PHONE]
- **Services:** AC installation & replacement, furnace/heating, tune-ups, duct cleaning, emergency repair

## Pages to Build
1. **Homepage** — Seasonal hero (AC in summer, heat in winter), emergency service CTA, services overview, financing mention, reviews
2. **Services** — Per-service pages: AC Repair, AC Installation, Heating, Maintenance Plans
3. **Maintenance Plans** — Pricing cards (Stripe checkout for annual plans if selling online)
4. **Service Area** — List of towns/zip codes served for local SEO
5. **Contact / Request Service** — Form with service type, urgency level, address. Saves to Prisma + notification email.

## Key Requirements
- Emergency call CTA (phone number) pinned to top bar on all pages
- Financing / "0% APR" mention on high-ticket pages (installation/replacement)
- Maintenance plan Stripe checkout wired if selling plans online
- Schema markup: `HVACBusiness`, `LocalBusiness`, `Service`
- Service area page targets "[city] HVAC" keyword variants

## Tone & Copy Direction
Practical, reassuring, local. Homeowners are often stressed (AC out in July). Lead with speed and reliability. Use specific service area city names in headlines where possible.
