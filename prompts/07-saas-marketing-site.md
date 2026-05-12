# Prompt: SaaS / Software Product Marketing Site

Build a product marketing and signup-driving site for a SaaS product using the Macrolight Builder stack (Next.js 14, Tailwind CSS, Prisma, Resend, Stripe).

## Product Details
- **Product name:** [NAME]
- **One-liner:** [What it does and who it's for]
- **Primary CTA:** [Start free trial / Book a demo / Join waitlist]
- **Pricing model:** [Free tier + paid / Per seat / Usage-based]

## Pages to Build
1. **Homepage** — Hero with headline + subhead + CTA, product screenshot/demo, 3 core benefits, social proof (logos / testimonials), pricing preview, final CTA
2. **Features** — Deep-dive per feature with screenshots and benefit copy
3. **Pricing** — Pricing cards using PricingCard component; Stripe checkout wired for self-serve plans
4. **Case Studies / Customers** — 2–3 customer stories with metrics
5. **Blog** — MDX or CMS-backed blog for SEO content marketing

## Key Requirements
- Stripe Checkout wired for self-serve plan purchase
- Waitlist / demo request form saves to Prisma contacts + fires notification email
- OpenGraph meta per page for social sharing
- Blog with sitemap.xml and robots.txt for SEO
- AI chat widget (ChatWidget component) on pricing and demo pages
- Schema markup: `SoftwareApplication`, `Product`

## Tone & Copy Direction
Clear, specific, outcome-focused. Lead with the result ("Close 40% more deals") not the feature ("pipeline management"). Use real numbers where possible. Short sentences. B2B-friendly but not stuffy.
