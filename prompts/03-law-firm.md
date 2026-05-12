# Prompt: Law Firm Website

Build a case-qualifying, consultation-booking website for a law firm using the Macrolight Builder stack (Next.js 14, Tailwind CSS, Prisma, Resend, Stripe).

## Business Details
- **Firm name:** [NAME]
- **Practice areas:** [e.g. Personal Injury, Family Law, DUI Defense]
- **Location:** [CITY, STATE]
- **Phone:** [PHONE]
- **Consultation type:** [Free 30-min call / Paid consult]

## Pages to Build
1. **Homepage** — Authority headline, primary practice area cards, social proof (case results / bar admissions), consultation CTA
2. **Practice Areas** — One page per area with problem framing, what to expect, FAQ, case result snippets
3. **Attorney Profiles** — Bio, bar number, law school, photo, areas handled
4. **Case Results** — Anonymised verdicts / settlements (check bar rules first)
5. **Contact / Free Consultation** — Multi-step form: case type → contact details → preferred call time. Saves to Prisma, fires notification email.

## Key Requirements
- Consultation form must pre-qualify by practice area — captures case type before contact info
- Click-to-call prominent on every page
- Schema markup: `LegalService`, `Attorney`, `FAQPage`
- Disclaimer footer on every page ("Not legal advice…")
- No Google Ads conversion code needed — organic & referral focus
- HTTPS enforced, no form data logged client-side

## Tone & Copy Direction
Authoritative but accessible. Avoid Latin phrases and legalese in hero copy. Lead with outcomes ("$1.2M recovered for injured workers") not credentials. Empathy first, credentials second.
