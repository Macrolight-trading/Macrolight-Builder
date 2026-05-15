# Macrolight Builders — Business & Product Plan

_Last updated: 2026-05-13_

This plan is written to fit what already exists in this repo: a Next.js 14 + Prisma + NextAuth stack with a client portal (onboarding, messaging, media), an admin portal with project stages (ONBOARDING → DESIGN → DEVELOPMENT → REVIEW → LAUNCHED), a CRM (Lead/Deal/Activity/Note/Tag), an SEO audit engine, Stripe billing, and Vercel-native primitives (`@vercel/blob`, `@vercel/analytics`). The job now is to turn that foundation into a productized agency that prints recurring revenue, runs mostly on autopilot, and ultimately sells well.

---

## 1. The Wedge

**Pitch:** "We build a high-converting, SEO-tuned site for local service businesses in 7 days for a flat fee, then host and improve it for a monthly subscription. You never touch code."

**Why this wedge wins:**

- Local service businesses (HVAC, dental, med-spa, law, home services, fitness, contractors) are the largest, least-digitized SMB segment, with high LTV and a budget for marketing that they currently spend badly.
- Most pay $3–8K up front to a freelancer and get an abandoned WordPress site. Recurring providers (Wix, GoDaddy) deliver templates with no SEO or conversion thinking.
- A productized agency with a real portal, real SEO audit, and real subscription wins on (a) speed, (b) ongoing value, (c) trust.

**Positioning slogan:** _"Your website, on autopilot — designed, deployed, and improved every month."_

---

## 2. Offer & Pricing

Map to the `Plan` enum already in the schema: `STARTER`, `GROWTH`, `PRO`.

| Plan | Setup | Monthly | What's included |
| --- | --- | --- | --- |
| **Starter** | $1,500 | $149 | 5-page site, hosting on Vercel, SSL, contact form, basic SEO, 1 content update/mo, monthly performance report |
| **Growth** | $2,500 | $349 | Up to 12 pages, programmatic SEO landing pages, blog, lead-capture funnels, GMB sync, A/B testing, 4 content updates/mo, quarterly SEO audit |
| **Pro** | $4,500 | $749 | Unlimited pages, full SEO program (audits monthly), conversion optimization, paid-ads landing pages, integrations (CRM, scheduling, payments), priority support, dedicated strategist |

**Add-ons (high-margin):**

- Branding & logo refresh — $750 one-time
- Listing management (50+ directories) — $79/mo
- Reputation/review automation — $99/mo
- AI chatbot trained on their business — $129/mo
- Local paid ads management — 15% of spend, min $499/mo
- "Done-for-you" content (4 blog posts/mo) — $399/mo

**Unit economics target:**

- Blended ACV: ~$5,000 year 1, ~$4,200 year 2+
- Gross margin: 75%+ (Vercel + DB + email + AI costs < $25/site/mo at scale)
- Payback: < 4 months on paid acquisition
- Net revenue retention target: 110%+ via add-ons

---

## 3. Product Surface (build order)

Everything below builds on existing models. Order is greedy — finish each phase before the next, because cash from Phase 1 funds Phase 2.

### Phase 1 — Sellable MVP (weeks 0–4)

Goal: take money, deliver a site end-to-end with zero ad-hoc engineering per client.

1. **Public marketing site** at the root domain — hero, social proof, pricing, FAQ, "Get my free SEO audit" CTA wired to the existing `AuditJob` flow as the top-of-funnel lead magnet.
2. **Checkout & subscription** — finish Stripe Checkout flows (one-time setup + monthly). Webhook → create `User` + `Project(stage=ONBOARDING)` + seed `OnboardingData`. Send the welcome email via existing `lib/email.ts`.
3. **Onboarding hardening** — the `OnboardingForm` exists; add field-level validation, a 12-step wizard with progress save, logo upload to `@vercel/blob`, brand-asset upload, and a "schedule kickoff call" step (Calendly embed).
4. **Template library** — 6 industry templates (HVAC, dental, med-spa, law, home services, fitness) stored as JSON theme configs (`themePicks` is already a field). Each template = layout + section variants + copy archetypes + color tokens.
5. **One-click site provisioning** (the core automation — see §4).
6. **Admin portal polish** — the project pipeline view exists; add stage automation, SLA timers per stage, and a "Send to client for review" button that creates a preview link.
7. **Client review & approval** — preview URL, inline comments on screenshots (use `@vercel/blob` + existing `Message` model with a `targetUrl` field added).
8. **Launch flow** — DNS instructions page, auto-detection of correct DNS propagation, "Go live" button moves `Project.stage` to `LAUNCHED` and sets `liveUrl`.

### Phase 2 — Retention engine (weeks 5–12)

Goal: make the monthly fee feel like a steal so churn approaches zero.

1. **Monthly client report** — auto-generated PDF (reuse the audit PDF infra): traffic, leads from forms, ranking changes, work performed this month. Emailed on the 1st.
2. **Content request system** — clients submit edit requests through the portal; SLA-tracked; AI drafts copy for admin approval; one-click publish.
3. **Programmatic SEO** — generate `/services/[service]/[city]` pages from a templated source-of-truth in the DB; ties directly to the existing `AuditResult` data to target identified keyword gaps.
4. **Lead routing** — site contact forms POST back into the platform; clients see leads in their portal, with SMS/email forwarding. This is what makes them stay — _their leads live here_.
5. **Reviews module** — pull Google/Yelp reviews, display on site, request flow via SMS (Twilio).
6. **Uptime & performance monitoring** — daily Lighthouse run per site, alerting on regressions, surface in client report.

### Phase 3 — Margin & moat (months 4–9)

1. **AI Site Builder agent** — internal tool that takes `OnboardingData` + competitor URLs and produces a complete first-draft site in <10 minutes (copy, layout, images, schema markup). Drops human design time from 8h → 1h per project.
2. **Self-serve tier** — "Starter Self-Serve" at $99/mo, no setup fee, AI does the whole build. Acts as a top-of-funnel for upgrades.
3. **White-label / agency reseller** — let other agencies (bookkeepers, marketing consultants) resell under their brand. Revenue share 50/50. This is the channel that compounds.
4. **Client data warehouse** — aggregate anonymized form-fill, traffic, and conversion data across the portfolio → benchmarks ("you convert 2.3× the HVAC average"). This becomes a moat: nobody else can replicate this without scale.
5. **Integrations marketplace** — pre-built integrations with ServiceTitan, Jobber, Housecall Pro, ClinicSense, Mindbody. Each integration = an upsell trigger.

### Phase 4 — Exit-grade features (months 9–18)

See §7 for why each of these directly lifts multiple.

---

## 4. Automation: build & deploy on Vercel

This is the operational core. Every client site = its own Vercel project on a multi-tenant template repo.

**Architecture:**

```
macrolight-platform (this repo)        macrolight-site-template (separate repo)
├── admin + client portal               ├── Next.js site
├── CRM, onboarding, billing            ├── Reads tenant config from DB or
└── orchestrator service ──────────────▶│   build-time JSON
                                        └── Deployed per-client as own Vercel project
```

**Pipeline (triggered when admin clicks "Provision site" or AI builder finishes a draft):**

1. **Create Vercel project** via Vercel REST API (`POST /v9/projects`), name `client-{slug}`, link to `macrolight-site-template` repo.
2. **Set env vars** on the project: `TENANT_ID`, `DATABASE_URL` (read-only role for this tenant), `PRIMARY_COLOR`, etc.
3. **Trigger deploy** via Deploy Hook (`POST` to project's deploy hook URL).
4. **Assign preview domain** `client-slug.macrolight.app` automatically.
5. **On client approval**, call Vercel Domains API to attach their custom domain, generate DNS records, show them in the portal with a copy-button.
6. **Webhook back** from Vercel on deploy state → updates `Project.stage` and `Project.previewUrl`/`liveUrl`.

**Implementation checklist:**

- [ ] `lib/vercel.ts` — wrapper for Vercel API (projects, domains, deploy hooks, env vars)
- [ ] `lib/orchestrator.ts` — state machine: ONBOARDING → DESIGN → DEVELOPMENT → REVIEW → LAUNCHED
- [ ] `app/api/admin/provision/route.ts` — admin button endpoint
- [ ] `app/api/webhooks/vercel/route.ts` — receive deploy state updates
- [ ] Cron job (`vercel.json` crons): nightly Lighthouse, weekly SEO recheck, monthly report generation
- [ ] Per-tenant DNS verification poller (Edge function) — auto-launch when DNS propagates
- [ ] Site template repo — single Next.js codebase, content-driven from DB at build time, ISR for content updates without redeploy
- [ ] Multi-region edge caching set up in template's `next.config.js`

**Cost model on Vercel:** Pro plan + per-project. At ~$25–40/mo Vercel cost per active client site at scale, plus DB pooling via Neon/Supabase ($0.20/active site), AI calls (~$5/site/mo), email (~$2/site/mo). Total infra COGS: $32–47/site → 89%+ gross margin on a $349 plan.

---

## 5. Getting Clients (Go-to-Market)

Three parallel funnels. Top to bottom = ranked by ROI.

### 5.1 Free SEO Audit lead magnet (PRIMARY CHANNEL)

You already have the audit engine. Make it the entire top of funnel.

- Public page: "Get a free 50-point SEO audit of your website in 60 seconds."
- After submission, gated wall: "Enter your email to view the full report." → creates a `Contact` → converted to `Lead` if score < 70.
- Auto-generated report includes 3–5 critical fixes _and_ a CTA: "We fix all of this and rebuild your site for you. Book a 15-min call."
- Drip sequence (existing `lib/email.ts`): day 0 report, day 2 case study, day 5 "still on the fence?", day 9 limited-time setup discount.

This converts cold traffic at ~3–5× the rate of a generic "contact us" CTA because the audit demonstrates expertise before asking for money.

### 5.2 Vertical-specific cold outbound

Mine local business listings → score with the audit engine → send personalized loom + audit PDF.

- Target one vertical at a time (start: HVAC in 10 cities)
- Pull GMB listings via API, run audit, rank by score (worst sites = most movable)
- Personalized cold email: "Saw your site at [domain]. Quick 90-sec video on what we'd fix." (Loom + PDF)
- 2–3% reply rate on warm verticals = ~30 calls/week per SDR
- Tooling: build "Outbound Campaign" model — `Campaign`, `Prospect`, `Outreach` — into CRM, plug into existing `Lead` table.

### 5.3 Partner channel (compounding)

- **Local marketing consultants & bookkeepers** — agree to send clients in exchange for 20% recurring revenue share or white-label.
- **Industry associations** — sponsor / partner with HVAC associations, dental societies, etc. Member discount, embedded webinar.
- **Integration partners** — when you build the ServiceTitan/Jobber integrations, list in their app stores → free distribution to ICP.

### 5.4 Content & SEO (long-game)

- Eat your own dog food: rank for "[city] HVAC website design", "dental SEO audit", etc.
- Free tools as link bait: free SEO audit, free local rank tracker, free schema markup generator.
- One pillar piece per vertical per quarter ("The Ultimate Guide to HVAC Websites That Convert").

---

## 6. Collecting Client Info (the moat)

Information collected = the difference between a $5K freelance project and a $50K+ ARR account. The portal should make giving you more data feel like _getting more value_.

**Tiered info collection ladder:**

1. **Tier 1 — minimal to launch** (already in `OnboardingData`): business name, colors, services, audience, tone, inspiration URLs.
2. **Tier 2 — unlock advanced features** (Phase 2): logo files, hours of operation, service areas (cities/zip codes), team bios + headshots, customer testimonials, FAQs, internal jargon glossary, top 10 keywords they want to rank for.
3. **Tier 3 — unlock automation** (Phase 3): Google Business Profile API access, Google Search Console access, GA4 access, CRM credentials, calendar booking integration, payment processor for online booking, review platform credentials.

**Mechanics that work:**

- **Progressive profiling**: don't ask for everything up front. Each completed section unlocks a portal feature (gamified).
- **AI-assisted intake**: client uploads a single PDF (their current marketing materials) → AI extracts structured fields → client confirms. Removes 80% of the friction.
- **Kickoff call recorder + transcript**: 30-min onboarding call, AI extracts brand voice, services, target audience from the transcript and pre-fills the portal.
- **Branded asset request emails**: portal sends polite follow-ups every 48h until missing assets are uploaded. Auto-escalate to admin after 5 days.

---

## 7. Growth Plan (24-month outlook)

**Targets:**

| Quarter | New clients/mo | Active subs | MRR | ARR run-rate |
| --- | --- | --- | --- | --- |
| Q1 2026 | 5 | 12 | $4.2K | $50K |
| Q2 2026 | 15 | 38 | $14K | $170K |
| Q3 2026 | 30 | 88 | $35K | $420K |
| Q4 2026 | 50 | 168 | $69K | $830K |
| Q2 2027 | 80 | 350 | $150K | $1.8M |
| Q4 2027 | 120 | 650 | $290K | $3.5M |

(Assumes 4% monthly logo churn at maturity, blended ~$420 ARPU, payback < 4 months.)

**Levers in priority order:**

1. **Productize one vertical fully**, then duplicate. HVAC first — own that vertical's templates, integrations, and SEO playbook. Each new vertical = ~30% of the work of the first.
2. **Self-serve at $99/mo** as a wedge for solopreneurs and the bottom of the SMB market — feeds upgrade revenue.
3. **Reseller program** — every signed reseller adds a sales channel without you adding headcount. Aim for 25 active resellers by month 18.
4. **Annual prepay incentive** — 2 months free on annual prepay = locks in cash + crushes churn. Aim for 40% of clients on annual.
5. **Pricing increases** — raise prices for new clients every 6 months; grandfather existing. By month 18, new ACV should be 50% higher than at launch.
6. **Multi-product strategy** — once site infra is solid, the same client data powers: a CRM-lite product, an email marketing product, a paid-ads product. Each cross-sell carries 90% margin because the data and the channel already exist.

**Team buildout cadence:**

- Months 0–3: founder only, 1 part-time designer contractor.
- Months 4–6: hire 1 full-time designer, 1 dev (you), 1 SDR.
- Months 7–12: 2 designers, 1 customer success manager, 2 SDRs, 1 ops/QA.
- Months 13–18: VP Sales, head of design, head of engineering, ~15 FTE total.

---

## 8. Features That Lift Exit Multiple

Acquirers (PE rollups, larger SaaS, ad-agency holdcos) pay materially higher multiples for businesses that look like _software_ rather than _services_. Every item below is engineered to push the business toward the SaaS end of that spectrum.

### 8.1 Recurring revenue purity

- 100% of clients on subscription (no one-time-only deals after month 12)
- Annual prepay drives % of ARR locked in
- **Why it matters:** SaaS multiples (4–8× ARR) vs agency multiples (0.8–1.5× revenue). Even partial movement is huge.

### 8.2 Gross retention > 90% / Net retention > 110%

- Quarterly business reviews tracked in CRM
- Health-score model per account (logins, leads received, feature adoption)
- Automated churn-risk alerts → CSM playbook
- Add-on attach rate is the second lever — track it like religion

### 8.3 Customer concentration < 5%

- No single client > 5% of revenue
- Track concentration in admin dashboard with hard alert

### 8.4 Real software IP

- **Proprietary site builder** — the AI builder agent + theme system. Document it as IP, file provisional patent on the most novel parts (data-driven multi-tenant deploy pipeline).
- **Proprietary audit engine** — already in repo. Productize as a standalone SaaS at $49/mo for non-clients to (a) generate leads, (b) book revenue, (c) be valued as software.
- **Data network effects** — anonymized cross-client benchmarks. The longer you operate, the more valuable the data. Hard to replicate.

### 8.5 Operating system documentation

- Every recurring process documented in a Notion/Linear playbook
- "If the founder is hit by a bus" test — can someone run this in 90 days without you?
- Acquirers pay a premium for businesses they can absorb without founder dependency.

### 8.6 Clean financial reporting

- Stripe → automated revenue recognition (deferred revenue handling)
- Monthly KPI dashboard (MRR, churn, CAC, LTV, NRR, cohort retention)
- GAAP-ready books from month 1 (use Pilot or a fractional CFO from $5K MRR)
- Buyers run quality-of-earnings (QoE) — clean books cut diligence in half.

### 8.7 Strategic fit signals

- Build adjacent product surface that a strategic would value:
  - **CRM-lite for service businesses** — sits next to your sites, captures leads, syncs to Jobber etc. ServiceTitan, Jobber, or Housecall Pro might acquire to own the front-of-funnel.
  - **Local ads management** — Meta/Google ads holdcos buy these all day.
  - **Reputation management** — Birdeye / Podium space, has consolidators.
- Build a target buyer list at month 12. Cultivate relationships before you need them.

### 8.8 Geographic & vertical diversification

- Avoid being "the HVAC website company" forever — that caps multiple. Expand into 5+ verticals.
- US + Canada + UK + AU by month 18 — broader TAM = higher comparable multiples.

### 8.9 Defensible AI moat

- Train a small fine-tuned model on your own copy library + conversion data → "the best site copy in [vertical]" becomes proprietary.
- Acquirers underwrite AI defensibility heavily right now.

### 8.10 Brand & community

- Owned vertical communities (Slack/Discord per vertical) — switching cost rises when clients feel they're in a club.
- Annual customer conference (even small, 50 people) — signals durability to acquirers.

---

## 9. Risk Register

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Vercel pricing changes / TOS | Med | High | Abstract deploy layer behind `lib/orchestrator.ts` so AWS Amplify or Netlify is swappable in <2 weeks |
| Churn spikes from underdelivery | High early | High | Strict SLA on stage transitions, SLAs in contract, dedicated CS by month 6 |
| Saturated vertical | Med | Med | Vertical diversification roadmap baked in |
| AI cost explosion | Med | Med | Cost cap per client/mo; switch to OSS models for non-customer-facing steps |
| Founder bandwidth | High | High | Hiring plan above; document everything; productize aggressively |
| Compliance (storing client GA4 tokens etc.) | Med | High | OAuth tokens encrypted at rest, SOC 2 prep starting month 12 |

---

## 10. The 30-day next-step list

1. Finish Stripe Checkout flow + webhook → User+Project provisioning.
2. Build `lib/vercel.ts` and `lib/orchestrator.ts`; ship the provisioning button.
3. Stand up `macrolight-site-template` repo with 6 industry layouts.
4. Wire the existing audit engine to a public `/audit` page with email gate.
5. Write 3 cold outbound templates + Loom script for HVAC vertical.
6. Send 200 outbound emails per week starting week 2; book 10 calls week 4.
7. Ship the first 5 paying clients by end of month 1; harden every rough edge they expose before scaling spend.

---

_The order matters: every phase pays for the next. Don't skip the boring revenue work to build the shiny AI builder — the AI builder is worthless without 30 paying customers showing you what to build._
