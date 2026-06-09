# Macrolight Builder

Macrolight Builder is the internal platform for [Macrolight Builders](https://macrolightbuilders.com) — a productized web agency for local service businesses. This monorepo powers the public marketing site, the client portal, and the admin back office in a single Next.js application.

## What it does

**Public site** — Marketing pages (home, pricing, industries, case studies, blog), contact and signup flows, Cal.com booking embed, and an on-site AI chat widget.

**Client portal** (`/portal`) — Authenticated area where clients onboard via an AI-guided brief, review build plans, upload media, message the team, manage billing, and track project progress.

**Admin back office** (`/admin`) — Operations hub for Macrolight staff:

- **CRM** — Leads, deals, activities, notes, and contact conversion
- **SEO audits** — Automated audits (technical, on-page, backlinks, local SEO) with scored reports and PDF export
- **Client delivery** — Project stages, Google Calendar sync, and delivery task tracking
- **Plan builder** — Custom plan categories, options, recommendations, and SOW generation
- **Billing** — Stripe subscriptions, checkout, and payment history
- **Analytics** — First-party page-view tracking

**Integrations** — Stripe, Resend (email), Vercel Blob (media), Google PageSpeed / Places / Calendar / Ads, DataForSEO, Cal.com, Microsoft Clarity, and a Hermes agent API for machine-to-machine workflows.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS, Motion |
| Database | PostgreSQL via Prisma |
| Auth | NextAuth.js (credentials + sessions) |
| Payments | Stripe |
| Email | Resend |
| File storage | Vercel Blob |
| AI | Vercel AI SDK (gateway + optional OpenAI) |
| PDF reports | Puppeteer + `@sparticuz/chromium-min` |

## Project structure

```
app/
  page.tsx, pricing/, blog/, contact/   # Public marketing routes
  portal/                               # Client portal
  admin/                                # Admin back office
  api/                                  # REST API routes
components/                             # Shared UI
lib/
  audit/                                # SEO audit pipeline
  onboarding/                           # AI onboarding chat + brief
  delivery/                             # Calendar sync + task loading
  stripe.ts, email.ts, auth.ts          # Core services
prisma/                                 # Schema, migrations, seed
content/blog/                           # MDX blog posts
prompts/                                # Industry site-generation prompts
```

## Local development

**Prerequisites:** Node.js 20+, a PostgreSQL database (e.g. [Neon](https://neon.tech)), and a copy of `.env.local`.

```bash
cp .env.example .env.local   # then fill in values
npm install
npx prisma migrate dev
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

### npm scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server (cleans `.next` first) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run data:cleanup-defaults` | Remove legacy demo seed data |

## Environment variables

Copy `.env.example` to `.env.local` and configure as needed. Variables are grouped by service (database, auth, email, SEO audit APIs, Stripe, Cal.com, etc.). Only `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` are required for a minimal local setup.

Optional bootstrap vars for the first admin user:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD` (12+ characters)
- `ADMIN_NAME`

See also:

- [STRIPE_SETUP.md](./STRIPE_SETUP.md) — Subscriptions, checkout, and webhooks
- [CAL_SETUP.md](./CAL_SETUP.md) — Book-a-call embed and webhook sync

## Production admin setup

1. Configure environment variables:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
2. Optionally set initial admin bootstrap vars:
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD` (12+ characters)
   - `ADMIN_NAME`
3. Run migrations and seed:

```bash
npx prisma migrate deploy
npx prisma db seed
```

### Seed behavior

- No demo/default users, contacts, payments, or analytics data are inserted.
- Seed only creates or updates an admin user when both `ADMIN_EMAIL` and `ADMIN_PASSWORD` are provided.

### Remove existing default data

If you previously seeded demo/default records, run:

```bash
npm run data:cleanup-defaults
```

## Deployment

The app is designed for [Vercel](https://vercel.com). Set environment variables in the Vercel dashboard, connect your Neon (or other Postgres) database, and deploy. Run `npx prisma migrate deploy` against the production database before or as part of your release process.

## Related docs

Internal planning and setup notes live in the repo root:

- `BUSINESS_PLAN.md` — Product and go-to-market strategy
- `MACROLIGHT_CMS_BUILD_PLAN_v2.md` — Planned CMS layer architecture
- `SEO Audit Pipeline Plan.md` — Audit engine design
- `STRIPE_SETUP.md`, `CAL_SETUP.md` — Integration walkthroughs
