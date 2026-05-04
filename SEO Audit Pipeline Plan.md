# SEO Audit Pipeline — Implementation Plan

**Project:** Macrolight Builders  
**Purpose:** On-demand, automated SEO audit for client and prospect sites — scores four categories, surfaces prioritised issues with actionable recommendations, outputs a branded PDF and a persistent admin dashboard view.

---

## 1. What We're Building

When you land a new prospect or onboard a client, you enter their URL in the admin dashboard and click "Run Audit." Within a few minutes you get:

- A scored breakdown across Technical SEO, On-Page Content, Backlink Profile, and Local SEO
- A prioritised issue list (Critical / Warning / Info) with plain-English explanations and specific fix recommendations
- A branded PDF report you can email to the client or use in a pitch deck
- A persistent dashboard view that you can return to any time

All audit results are stored in the database so you can compare the before-and-after once you've built their new site.

---

## 2. Architecture Overview

```
Admin Dashboard (UI)
        │
        │ POST /api/audits          (trigger)
        ▼
  AuditJob created in DB  ──────────────────────────┐
        │                                            │
        │ background fetch (same request, streaming) │
        ▼                                            │
  Audit Runner (lib/audit/)                         │
   ├── Technical Crawler                            │
   ├── On-Page Analyser                             │
   ├── Backlink Checker (DataForSEO API)            │
   └── Local SEO Checker (Google Places API)        │
        │                                            │
        │ results                                    │
        ▼                                            │
  AuditResult saved to DB  ◄──────────────────────────┘
        │
        ├──▶  Dashboard view (/admin/audits/[id])
        └──▶  PDF generation → download or email
```

The runner executes the four audit modules in parallel where possible (technical + on-page can share a single page fetch; backlinks and local SEO hit external APIs concurrently). Total runtime target: under 90 seconds for a typical site.

---

## 3. The Four Audit Modules

### 3.1 Technical SEO

**What it checks:**
- Core Web Vitals (LCP, FID/INP, CLS) and overall Performance score
- Mobile usability score
- Page speed (TTFB, FCP)
- HTTPS / SSL
- robots.txt presence and validity
- XML sitemap presence and reachability
- Canonical tag correctness
- Meta robots tags (noindex, nofollow checks)
- Broken internal links (crawl up to 50 pages)
- Redirect chains
- Missing or duplicate title tags and meta descriptions across crawled pages
- Open Graph / Twitter Card tags
- Structured data presence (JSON-LD)

**Data source:** Google PageSpeed Insights API (free, requires a Google Cloud API key). Supplemented by a lightweight custom crawler using `axios` + `cheerio` that fetches and parses HTML for tag-level checks.

**Effort:** Medium. PageSpeed API integration is straightforward. The crawler is the most complex piece — start with single-page, expand to multi-page crawl in a later milestone.

---

### 3.2 On-Page / Content

**What it checks:**
- Title tag: presence, length (50–60 chars), keyword placement
- Meta description: presence, length (150–160 chars)
- H1: present, single, not duplicated as title
- H2–H6 hierarchy
- Image alt text coverage (% of images with alt text)
- Internal linking: number of internal links, pages with no inbound links
- Content length (flag pages under 300 words as thin)
- Duplicate or near-duplicate title/description across pages
- Keyword density (basic — flag over-optimisation)
- Presence of a blog / content section

**Data source:** Same crawler as Technical SEO — no extra API needed. The crawler fetches pages, parses with `cheerio`, and runs all on-page checks client-side in the runner.

**Effort:** Low-medium. Shares infrastructure with the Technical module.

---

### 3.3 Backlink Profile

**What it checks:**
- Domain Rating / Domain Authority
- Total referring domains
- Total backlinks
- Top 10 linking domains (with their DR)
- Anchor text distribution
- Toxic / spammy link flags
- Competitor backlink gap (optional, later milestone)

**Data source:** DataForSEO API (recommended). Pay-per-use pricing — a domain summary call costs roughly $0.003–0.01 per lookup, making it essentially free at the volume you'll be running audits. It returns domain-level backlink data without requiring a subscription. Alternatives: Moz API (free tier but limited), Ahrefs API (subscription required, most comprehensive).

**Effort:** Low. DataForSEO has clean REST endpoints. One API call returns all the core metrics. Store raw JSON response in the DB for later display.

---

### 3.4 Local SEO

**What it checks:**
- Google Business Profile exists and is verified (via Google Places API)
- Business name, address, phone (NAP) on the website matches GBP listing
- LocalBusiness schema markup present on the site
- Star rating and review count
- Business categories on GBP
- Hours listed
- Photos present on GBP listing
- Website URL linked from GBP

**Data source:** Google Places API (Text Search + Place Details). Free tier covers ~1,000 lookups/month — more than enough. For NAP extraction from the site itself, the existing crawler parses the page for phone/address patterns.

**Effort:** Medium. The Places API lookup is straightforward. NAP matching (comparing extracted site text with GBP data) requires some fuzzy matching logic.

---

## 4. Scoring System

Each module produces a score from 0–100. The overall audit score is a weighted average:

| Module | Weight | Rationale |
|---|---|---|
| Technical SEO | 35% | Foundational — issues here block everything else |
| On-Page / Content | 30% | Direct ranking factor |
| Backlink Profile | 20% | Important but slower to change |
| Local SEO | 15% | High relevance for local businesses |

Each individual check within a module produces one of three severity levels:

- **Critical** — actively harming rankings or user experience (e.g., noindex on homepage, no HTTPS, missing H1)
- **Warning** — suboptimal, should be fixed (e.g., title tag too long, missing alt text on 40% of images)
- **Info** — opportunity, not a deficiency (e.g., could add FAQ schema, blog doesn't exist yet)

The module score deducts from 100 based on: Critical issues × 10pts, Warning issues × 3pts, floored at 0.

---

## 5. Database Schema

Add three new models to `schema.prisma`:

```prisma
model AuditJob {
  id          String      @id @default(cuid())
  url         String
  clientName  String
  status      AuditStatus @default(PENDING)
  startedAt   DateTime?
  completedAt DateTime?
  createdAt   DateTime    @default(now())
  result      AuditResult?
  createdBy   String?     // userId
}

model AuditResult {
  id                String   @id @default(cuid())
  jobId             String   @unique
  job               AuditJob @relation(fields: [jobId], references: [id])
  overallScore      Int
  technicalScore    Int
  onPageScore       Int
  backlinkScore     Int
  localSeoScore     Int
  issues            Json     // structured array of AuditIssue objects
  rawData           Json     // full API responses for reference
  pdfUrl            String?  // link to generated PDF
  createdAt         DateTime @default(now())
}

enum AuditStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
}
```

The `issues` JSON field holds an array of objects shaped like:
```json
{
  "module": "technical",
  "severity": "critical",
  "check": "noindex_on_homepage",
  "title": "Homepage is set to noindex",
  "description": "Your homepage has a meta robots tag telling Google not to index it.",
  "recommendation": "Remove the noindex directive from the homepage's <head> tag.",
  "docsUrl": "https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag"
}
```

---

## 6. File Structure

```
lib/
  audit/
    index.ts            ← orchestrator (runs all modules, saves result)
    types.ts            ← AuditIssue, AuditModuleResult, etc.
    scorer.ts           ← scoring logic
    modules/
      technical.ts      ← PageSpeed API + crawler checks
      onpage.ts         ← cheerio-based content checks
      backlinks.ts      ← DataForSEO API wrapper
      local-seo.ts      ← Google Places API wrapper
    crawler.ts          ← shared page fetcher / cheerio parser
    pdf.ts              ← PDF report generator

app/api/
  audits/
    route.ts            ← POST (create job + trigger run), GET (list all)
    [id]/
      route.ts          ← GET (single audit result)
      pdf/route.ts      ← GET (stream PDF download)

app/admin/
  audits/
    page.tsx            ← list of all audits
    new/page.tsx        ← "Run New Audit" form
    [id]/page.tsx       ← full audit result dashboard
    [id]/report/page.tsx ← printable PDF-ready view
```

---

## 7. API Keys Required

| Service | What For | Cost | Where to Get |
|---|---|---|---|
| Google PageSpeed Insights | Technical scores, Core Web Vitals | Free | Google Cloud Console |
| Google Places | GBP data for Local SEO | Free up to ~$200/mo | Google Cloud Console |
| DataForSEO | Backlink profile | ~$0.01/audit | dataforseo.com |

Add to `.env`:
```
GOOGLE_PAGESPEED_API_KEY=
GOOGLE_PLACES_API_KEY=
DATAFORSEO_LOGIN=
DATAFORSEO_PASSWORD=
```

---

## 8. PDF Report Structure

The branded PDF (generated via HTML-to-PDF using Puppeteer/Playwright, or the existing PDF skill) includes:

1. **Cover page** — Macrolight Builders logo, client name, site URL, audit date, overall score
2. **Executive summary** — one paragraph plain-English overview, score chart across 4 categories
3. **Critical issues** — top 3–5 critical findings with explanations and fixes
4. **Module sections** (one per module) — score, what was checked, issues found with recommendations
5. **What's working** — positive signals found during the audit (don't just show problems)
6. **Next steps / CTA** — "Here's what Macrolight Builders would fix first…" — natural pitch moment

---

## 9. Implementation Milestones

### Milestone 1 — Foundation (est. 2–3 days)
- Database schema (3 new models + migration)
- `AuditJob` API routes (POST to create, GET to list)
- Basic audit orchestrator in `lib/audit/index.ts`
- Technical module: PageSpeed Insights integration only (scores + CWV)
- Minimal admin UI: "Run Audit" form + results page showing scores

**Deliverable:** You can enter a URL and get a PageSpeed score shown in the admin panel.

### Milestone 2 — Full Technical + On-Page (est. 2–3 days)
- Shared crawler (`crawler.ts`) — fetches up to 20 pages
- Technical module expanded: robots.txt, sitemap, canonical, broken links, meta tags
- On-page module: all checks using crawler data
- Issue list with severity rendering in the dashboard

**Deliverable:** A full technical and content audit running from the dashboard.

### Milestone 3 — Backlinks + Local SEO (est. 1–2 days)
- DataForSEO integration for backlink data
- Google Places integration for GBP data
- NAP extraction from crawled pages
- LocalBusiness schema detection

**Deliverable:** All four modules producing results.

### Milestone 4 — PDF Report (est. 2 days)
- HTML report template (`app/admin/audits/[id]/report/page.tsx`)
- Puppeteer-based HTML-to-PDF conversion
- PDF download endpoint
- Optional: Resend integration to email PDF to client

**Deliverable:** "Download Report" button on any completed audit.

### Milestone 5 — Polish (est. 1–2 days)
- Score trend chart (if site has been audited before, show delta)
- Competitor comparison (run audit on a competitor URL side-by-side)
- Error handling, retries, loading states
- Audit history per client

---

## 10. Open Questions

**Background job handling.** Next.js API routes time out after 60 seconds on Vercel by default. If the audit runs longer than that, it'll fail mid-run. Options: (a) use Vercel's `maxDuration` setting on the route, (b) move the runner to a separate long-running worker process, or (c) break the audit into sequential sub-requests. For v1, option (a) is simplest — set `maxDuration = 300` on the audit API route.

**Crawl depth vs. speed.** Crawling more pages gives more accurate on-page data but takes longer. Recommend capping at 20–30 pages for v1 with a configurable limit.

**Backlink API choice.** DataForSEO is recommended for cost and flexibility, but if you already use or plan to use Ahrefs or SEMrush for your own SEO, using their API avoids an extra vendor. Worth confirming before wiring up the integration.

**Report branding.** The PDF design should match the Macrolight Builders visual identity. Worth mocking up the report template in Figma or HTML before implementing the generator, so the output looks polished from day one.

---

## Summary

| Area | Decision |
|---|---|
| Trigger | On-demand from admin dashboard |
| Modules | Technical, On-Page, Backlinks, Local SEO |
| Scoring | Weighted 0–100 overall, per-module scores |
| Storage | Prisma — AuditJob + AuditResult |
| Backlink API | DataForSEO (pay-per-use) |
| Local SEO API | Google Places API (free tier) |
| Technical API | Google PageSpeed Insights (free) |
| PDF output | Puppeteer HTML-to-PDF |
| Total est. effort | 8–12 days across 5 milestones |
