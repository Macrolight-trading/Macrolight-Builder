# Prompt: Restaurant Website

Build a reservation- and ordering-focused website for a local restaurant using the Macrolight Builder stack (Next.js 14, Tailwind CSS, Prisma, Resend, Stripe).

## Business Details
- **Restaurant name:** [NAME]
- **Cuisine type:** [CUISINE]
- **Location:** [ADDRESS]
- **Phone:** [PHONE]
- **Hours:** [MON–SUN HOURS]
- **Reservation link / system:** [OPENTABLE URL or direct form]

## Pages to Build
1. **Homepage** — Hero with food photography, "Book a Table" CTA above the fold, hours, location embed
2. **Menu** — Sections by category (Starters, Mains, Desserts, Drinks) — no PDFs, mobile-readable HTML
3. **Reservations** — Direct booking form or embedded widget; capture email for repeat-diner list
4. **Private Events / Catering** — Inquiry form wired to lead notifications
5. **Contact** — Address, hours, parking info, Google Maps embed

## Key Requirements
- Menu rendered as semantic HTML — not a PDF or image
- Reservation form saves to Prisma contacts table and fires notification email
- Gift card / online ordering CTA if applicable
- Schema markup: `Restaurant`, `Menu`, `OpeningHoursSpecification`
- OpenGraph image using hero food photo for social sharing
- Google PageSpeed score target: 90+ mobile

## Tone & Copy Direction
Warm, sensory, inviting. Lead with ambiance and dish descriptions. Short sentences. Make it easy to picture the experience before arriving.
