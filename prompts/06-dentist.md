# Prompt: Dental Practice Website

Build a patient-acquisition website for a dental practice using the Macrolight Builder stack (Next.js 14, Tailwind CSS, Prisma, Resend, Stripe).

## Business Details
- **Practice name:** [NAME]
- **Dentist name(s):** [DR. NAME]
- **Location:** [ADDRESS]
- **Phone:** [PHONE]
- **Accepting new patients:** [YES/NO]
- **Insurance accepted:** [LIST or "Most major plans"]

## Pages to Build
1. **Homepage** — Welcoming hero, "Accepting New Patients" badge, services overview, doctor intro, reviews, new patient offer
2. **Services** — Preventive, Cosmetic (whitening, veneers), Restorative (implants, crowns), Emergency, Orthodontics (if applicable)
3. **New Patients** — What to expect, forms to download/complete, insurance info
4. **Meet the Team** — Doctor + hygienist bios, photos, credentials
5. **Contact / Book Appointment** — Preferred date/time, service type, insurance. Saves to Prisma + notification email.

## Key Requirements
- "Book Appointment" CTA in nav on every page
- New patient offer (e.g. "$99 new patient exam") if applicable — tied to contact form
- Schema markup: `Dentist`, `MedicalBusiness`, `Physician`
- HIPAA note: form does not collect PHI beyond name/contact/preferred time
- Google reviews widget or star rating display
- Insurance logos section

## Tone & Copy Direction
Warm, calming, professional. Many patients have dental anxiety — acknowledge it gently. Avoid clinical jargon in hero sections. Emphasise comfort, modern technology, and friendly staff.
