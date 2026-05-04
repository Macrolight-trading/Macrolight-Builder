# SEO Audit Pipeline — Comprehensive Report Plan

**Project:** Macrolight Builders
**Status:** Extends the existing audit pipeline (see `SEO Audit Pipeline Plan.md`)
**Purpose:** Layer additional DataForSEO-backed sections onto the existing audit so the client-facing PDF moves from a strong technical audit to a **full competitive intelligence + reputation report** — the kind of deliverable that justifies a sales conversation on its own.

---

## 1. What's Already Live

The existing pipeline ships six modules with these DataForSEO endpoints in production:

| Module | Endpoints in use |
|---|---|
| Backlinks | `/backlinks/summary/live`, `/backlinks/anchors/live`, `/backlinks/backlinks/live` |
| Domain Analytics | `/dataforseo_labs/google/domain_rank_overview/live`, `/.../ranked_keywords/live`, `/.../competitors_domain/live` |
| SERP Visibility | `/serp/google/organic/live/advanced` (brand-name query) |
| Technical | Google PageSpeed Insights (not DataForSEO) |
| On-Page | Internal cheerio crawler (not DataForSEO) |
| Local SEO | Google Places API + cheerio NAP extraction (not DataForSEO) |

Total DataForSEO calls per audit today: **7** — roughly **$0.07–0.15** per audit at current pricing.

This plan adds **two new scored modules**, **enriches the six existing modules** with deeper DataForSEO data, and adds **three unscored "data sections"** to the PDF for narrative impact. Target post-implementation cost: **$0.50–1.50 per audit** depending on which optional endpoints are enabled.

---

## 2. New Report Structure

The current PDF has six sections (Cover → Summary → Critical Issues → Module Sections → What's Working → CTA). The new structure extends to thirteen sections, organised so the most pitch-relevant content lands in the first half:

```
1.  Cover                          (existing)
2.  Executive Summary              (existing — refreshed with score chart)
3.  At-a-Glance Snapshot           (NEW — visibility / traffic / reputation tiles)
4.  Top Critical Issues            (existing)
5.  Where You Show Up (and Don't)  (NEW — Local Pack visibility for service queries)
6.  Competitive Position           (NEW — keyword gap + backlink gap side-by-side)
7.  12-Month Trend Lines           (NEW — traffic + ranking + RD growth charts)
8.  Module Sections                (existing — all eight scored modules)
9.  Reputation Snapshot            (NEW — reviews aggregated across platforms)
10. Citation Health                (NEW — NAP consistency across major directories)
11. Link Opportunities             (NEW — top 10 backlink-gap opportunities)
12. What's Working                 (existing)
13. Recommended 90-Day Roadmap     (NEW — auto-generated priority action list)
14. CTA                            (existing)
```

Sections 5 and 6 are the highest-leverage additions: they answer the two questions every prospect actually asks ("am I showing up?" and "what are competitors doing that I'm not?") with concrete, named data. Section 13 turns the audit from a diagnosis into a proposal.

---

## 3. Module Map — What's New, What's Enriched

### 3.1 New: Local Pack Visibility module

**The question:** When prospects in [city] search for [service], does the business appear in the Maps 3-pack?

This is the single most valuable signal for a local service business and we're not measuring it today. The existing SERP Visibility module only checks brand-name searches — it doesn't check commercial-intent local queries.

**How it works:**

1. Build a query set from `clientName`, extracted city/region (already pulled by Local SEO module), and a list of inferred service keywords. For v1, ask the admin to enter 3–5 service keywords when creating the audit ("plumber", "drain cleaning", "water heater repair"). Later we can derive these automatically from `/dataforseo_labs/google/keywords_for_site/live`.
2. For each `{service} in {city}` query, call `/serp/google/maps/live/advanced` with `location_code` resolved from the city.
3. Record: does the audited domain appear in the Maps results? At what position (1–3 = local pack, 4–20 = local finder)? Which competitors hold positions 1–3?
4. Score: % of queries where the business appears in the local 3-pack.

**Endpoint:** `/serp/google/maps/live/advanced` — $0.002 per query (live)
**Per-audit cost:** ~$0.01 for 5 queries

**PDF rendering:**
A table showing each query, the position the audited business appears at (or "Not in top 20"), and which three competitors own the pack. Visually striking — most prospects have never seen this presented clearly.

**Severity mapping:**
- Appears in pack for 0% of queries → critical
- Appears in pack for <40% → warning
- Appears in pack for ≥80% → positive ("dominates the local pack for [N] of [M] core service queries")

---

### 3.2 New: Reputation module

**The question:** What does the public review of this business look like across the platforms that matter?

Today the Local SEO module fetches Google rating + review count via Places. That's only one platform and only the aggregate number — no sentiment, no recent-review trends, no Yelp/Trustpilot.

**How it works:**

1. Fetch reviews from Google, Yelp, and Trustpilot (the three platforms most likely to surface for service businesses) via the Business Data API. Each platform uses the task-queue pattern — submit, then poll `/task_get/advanced` after ~30s.
2. Compute aggregates per platform: total review count, average rating, count of 1–2★ reviews in the last 90 days.
3. Optionally call `/content_analysis/search/live` for the brand name to surface brand mentions outside review platforms — competitor mentions, news mentions, forum threads, unlinked mentions.
4. Score: weighted aggregate of recent rating across platforms with extra penalty for high recent negative-review velocity.

**Endpoints:**
- `/business_data/google/reviews/task_post` + `task_get/advanced` — included in Business Data plan
- `/business_data/yelp/reviews/task_post` + `task_get/advanced` — included
- `/business_data/trustpilot/reviews/task_post` + `task_get/advanced` — included
- `/content_analysis/search/live` (optional) — see DataForSEO pricing

**Per-audit cost:** ~$0.05–0.10 (3 platforms + optional brand mention search)

**PDF rendering:**
Three platform tiles with star + count + delta-vs-90-days-ago, plus a "recent themes" callout if `/content_analysis/sentiment_analysis/live` is enabled (verify exact endpoint path before implementing — agent flagged it as unverified).

**Severity mapping:**
- Aggregate rating <3.5 → critical
- Three or more 1–2★ reviews in last 30 days → warning ("recent review velocity")
- Aggregate rating ≥4.5 with 50+ total reviews → positive

---

### 3.3 Enriched: Domain Analytics

Three new sub-sections layer onto the existing module:

**3.3.1 Keyword Gap** — `/dataforseo_labs/google/domain_intersection/live`
Pass the audited domain + the top 3 competitors already discovered by the existing `competitors_domain` call. Returns keywords competitors rank for that the audited domain does not. Extract the top 25 by competitor traffic estimate. **PDF section 6** ("Competitive Position") renders this as: "Your top 3 competitors collectively rank for [N] keywords you don't. Highest-value missing keywords: [list]."

**3.3.2 Top Pages by Traffic** — `/dataforseo_labs/google/relevant_pages/live`
Returns the audited domain's top 10 pages by estimated organic traffic. Tells the client which pages are actually working, scopes a content overhaul. Renders inline in the Domain Analytics module section as a small table.

**3.3.3 Historical Trend** — `/dataforseo_labs/google/historical_rank_overview/live`
Returns 12 months of monthly snapshots of organic-keyword count + estimated traffic. **PDF section 7** ("12-Month Trend Lines") renders this as a sparkline chart per metric. The narrative writes itself when traffic has fallen ("organic visibility is down 38% from a year ago — here's what changed").

**Per-audit cost:** ~$0.30 (three Labs calls + per-result charges for ~25 keywords + ~10 pages + 12 monthly snapshots)

---

### 3.4 Enriched: Backlinks

Three new sub-sections:

**3.4.1 Backlink Gap** — `/backlinks/domain_intersection/live`
Pass the audited domain + top 3 competitors. Returns domains that link to all competitors but not the audited site. Extract the top 10 by referring-domain rank. **PDF section 11** ("Link Opportunities") renders this as a table — each row is a concrete pitch outreach target. By far the most actionable single artifact in the report.

**3.4.2 Top Pages by Backlinks** — `/backlinks/domain_pages_summary/live`
Returns the audited domain's pages ranked by backlink count. Identifies which URLs hold the link equity — useful for prioritising redirect strategy when the rebuild changes URL structure. Renders inline in the Backlinks module section.

**3.4.3 Backlink Growth** — `/backlinks/history/live`
Returns RD count + backlink count by month for the past 12 months. **PDF section 7** renders alongside the traffic trend. Shows whether the link profile is growing, flat, or in decline.

**Per-audit cost:** ~$0.10 (three Backlinks calls + per-row charges)

---

### 3.5 Enriched: Local SEO

**3.5.1 Citation Consistency Audit** — `/business_data/business_listings/search/live`
Pass the business name + city. Returns matching listings across Google, Yelp, Yellow Pages, BBB, Foursquare, and others. Compare the NAP (name, address, phone) on each listing to the on-site NAP we already extract. Surface mismatches as warnings.

**PDF section 10** ("Citation Health") renders as a per-platform table with a "Match / Mismatch / Not Listed" indicator. This is a standard "citation audit" deliverable — prospects often pay separately for it.

**3.5.2 Replace Google Places lookup** (optional)
The current Local SEO module uses the Google Places API. We could move to `/business_data/google/my_business_info/task_post` for parity inside the DataForSEO ecosystem (single vendor, single bill). **Recommended: keep Google Places.** It's free up to ~$200/mo, the data is the source of truth, and there's no real upside to consolidating.

**Per-audit cost:** ~$0.05 (one citation lookup, scaled by directory count)

---

### 3.6 Enriched: SERP Visibility

**3.6.1 Add commercial-intent keyword to the SERP check.**
Today we only check the brand name. Add a second SERP call for the primary service keyword (e.g. "plumber" or whichever service term the admin enters). Same `/serp/google/organic/live/advanced` endpoint, just a second query. Surfaces whether the business shows up at all in the high-intent SERP, plus whether competitors dominate.

**3.6.2 Add Google AI Mode check** — `/serp/google/ai_mode/live/advanced`
Fast-becoming the most important visibility surface. Run for the brand keyword and the primary service keyword. Track presence + whether the audited domain is cited. The existing `serp-visibility` module already has the AI-overview parsing path — extend it to AI Mode too.

**Per-audit cost:** +$0.01 (two extra SERP calls)

---

### 3.7 Enriched: Technical (optional)

**3.7.1 Add a DataForSEO instant_pages check** — `/on_page/instant_pages`
Layered on top of the in-house crawler + PageSpeed combo. DataForSEO's instant_pages catches things the cheerio crawler misses: rendered-DOM issues (JS-injected content), real redirect chains with full hop history, mixed-content warnings, status code anomalies. Use it to validate the homepage specifically — a sanity check on top of our crawl.

**Recommended: defer to post-launch.** The current Technical module already produces strong findings from PageSpeed + crawler. This is a "nice to have" deepening play, not a critical addition.

**Per-audit cost:** ~$0.005 per page

---

### 3.8 Other endpoints surveyed but not recommended

- **`/dataforseo_labs/google/keyword_ideas/live`** — useful for content strategy but already partially served by the keyword gap analysis. Skip for v1.
- **`/dataforseo_labs/google/historical_serps/live`** — interesting but adds page count without changing the pitch narrative.
- **`/serp/google/local_finder/live/advanced`** — overlaps with `/serp/google/maps/live/advanced`. Use Maps.
- **`/backlinks/referring_networks/live`** — toxic-link footprint detection is interesting but rarely actionable for service businesses with small link profiles.
- **`/on_page/lighthouse/live/json`** — duplicates Google PageSpeed Insights. Stick with PageSpeed (free).
- **`/on_page/task_post`** (full managed crawl) — overkill for the v1 use case. Worth revisiting if we ever need to audit very large sites (>500 pages).

---

## 4. Architecture Changes

```
Admin Dashboard (UI)
        │
        │ POST /api/audits          (trigger)
        ▼
  AuditJob created in DB
        │
        ▼
  Audit Runner (lib/audit/index.ts)
        │
        ├── Crawl shared once (existing)
        │
        │  ── Existing modules (run in parallel) ──
        ├── Technical            (PageSpeed + crawler)
        ├── On-Page              (crawler)
        ├── Local SEO            (crawler + Places + NEW: citations)
        ├── Backlinks            (existing 3 + NEW: gap, top pages, history)
        ├── Domain Analytics     (existing 3 + NEW: keyword gap, relevant pages, history)
        ├── SERP Visibility      (existing 1 + NEW: service-keyword query, AI Mode query)
        │
        │  ── New modules (run in parallel with existing) ──
        ├── Local Pack           (5× /serp/google/maps/live/advanced)
        └── Reputation           (3× business_data reviews queue + optional content_analysis)
        │
        ▼
  AuditResult saved to DB  (new rawData fields per module)
        │
        ├──▶ Dashboard view  (extended with new sections)
        └──▶ PDF generation  (extended with new sections)
```

**Concurrency:** The 8 scored modules + their sub-calls now total ~25 DataForSEO calls per audit. All run in parallel — DataForSEO has no documented per-account concurrent-request cap that would bite at this scale. Total wall-clock impact: still well under the 90s SLA, since the long pole remains the in-house crawler (~30–60s) plus PageSpeed (~30–45s).

**Task-queue endpoints:** Reviews use the `task_post` → poll `task_get/advanced` pattern, not live. We submit all three platforms in parallel up front, then await results with a 60s polling deadline. If a platform hasn't returned by the deadline, mark just that platform as "pending" in rawData; the next audit will pick it up. Don't fail the whole module.

---

## 5. Database Schema Changes

Two new score columns and one expanded JSON shape.

**Add to `AuditResult`:**
```prisma
localPackScore   Int?
reputationScore  Int?
```

(Use nullable Int for these — there's no reason not to, and it makes "module not run" clean. Existing modules can stay non-null since they default to 0 with the `availability` map for honesty signalling.)

**Expanded `rawData` shape** (no schema change — JSON column):

```ts
{
  availability: {
    technical:       { available: boolean; reason: string | null },
    onpage:          { available: boolean; reason: string | null },
    backlinks:       { available: boolean; reason: string | null },
    localSeo:        { available: boolean; reason: string | null },
    domainAnalytics: { available: boolean; reason: string | null },
    serpVisibility:  { available: boolean; reason: string | null },
    localPack:       { available: boolean; reason: string | null },   // NEW
    reputation:      { available: boolean; reason: string | null },   // NEW
    overallAvailable: boolean,
  },
  // ... existing per-module rawData ...
  localPack: {
    queries: Array<{
      keyword: string;
      location: string;
      brandPosition: number | null;     // 1–3 = local pack, 4–20 = local finder, null = not present
      topThreeCompetitors: Array<{ domain: string; position: number; rating: number | null }>;
    }>;
    queriesAttempted: number;
    queriesInPack: number;
  },
  reputation: {
    google:     { avgRating: number | null; total: number; recentNegative: number; sampleReviews: Array<...> };
    yelp:       { avgRating: number | null; total: number; recentNegative: number; sampleReviews: Array<...> };
    trustpilot: { avgRating: number | null; total: number; recentNegative: number; sampleReviews: Array<...> };
    aggregateRating: number | null;
    brandMentions?: Array<{ url: string; domain: string; title: string; sentiment?: number }>;
  },
  // Enriched module sub-sections:
  domainAnalytics: {
    overview: ..., rankedKeywords: ..., competitors: ...,    // existing
    keywordGap: Array<{ keyword: string; competitorWithBest: string; competitorTraffic: number; difficulty: number | null }>;
    relevantPages: Array<{ url: string; etv: number; topKeyword: string }>;
    historical: Array<{ month: string; organicCount: number; etv: number }>;
  },
  backlinks: {
    summary: ..., topAnchors: ..., topBacklinks: ...,        // existing
    backlinkGap: Array<{ referringDomain: string; rank: number; linksToCompetitors: number; pageRanking?: string }>;
    topPagesByBacklinks: Array<{ url: string; backlinks: number; referringDomains: number }>;
    historical: Array<{ month: string; backlinks: number; referringDomains: number }>;
  },
  localSeo: {
    places: ..., siteNap: ..., hasLocalBusinessSchema: ...,  // existing
    citations: Array<{ source: string; matched: boolean; mismatchFields?: string[]; url?: string }>;
  },
}
```

---

## 6. Scoring Updates

Two new modules need weights; rebalance the existing six.

| Module | Current weight | New weight | Rationale |
|---|---|---|---|
| Technical SEO | 20% | 15% | Foundational but well-covered; lower marginal weight |
| On-Page | 20% | 15% | Same |
| Backlinks | 15% | 12% | Existing weight stays close — gap data is bonus context |
| Local SEO | 10% | 10% | Citations are signal but Local SEO doesn't dominate |
| Domain Analytics | 20% | 15% | Trend + gap context lifts the qualitative weight |
| SERP Visibility | 15% | 12% | Brand SERP + commercial SERP + AI Mode |
| **Local Pack** (new) | — | 13% | Highest-leverage local signal — earns its weight |
| **Reputation** (new) | — | 8% | Important but volatile (one bad week of reviews shouldn't dominate) |
| **Total** | 100% | 100% | |

The weight redistribution / module-availability logic in `lib/audit/scorer.ts` already handles unavailable modules — no changes to the scorer except adding the two new module entries to `MODULE_WEIGHTS`.

---

## 7. File Structure (additions)

```
lib/audit/
  modules/
    local-pack.ts           ← NEW
    reputation.ts           ← NEW
  enrichments/              ← NEW directory
    keyword-gap.ts          ← consumed by domain-analytics
    top-pages-traffic.ts    ← consumed by domain-analytics
    historical-traffic.ts   ← consumed by domain-analytics
    backlink-gap.ts         ← consumed by backlinks
    top-pages-backlinks.ts  ← consumed by backlinks
    backlink-history.ts     ← consumed by backlinks
    citations.ts            ← consumed by local-seo
  pdf-template.ts           ← extended with new sections
```

The "enrichments" pattern keeps each new sub-call in its own file with its own type definitions and severity-mapping logic, while the parent module pulls them in. Keeps modules from ballooning past 600 lines and makes per-feature toggle / disable trivial.

---

## 8. PDF Template — New Sections in Detail

Each new section gets its own self-contained block in `lib/audit/pdf-template.ts`. Honest-data treatment is preserved: if a feature can't run (missing endpoint access, no competitors discovered, etc.), the section renders "Not available" without surfacing API config issues.

**Section 3 — At-a-Glance Snapshot.** Four-tile mini-dashboard: estimated monthly visits (from Domain Analytics overview) | Local-pack visibility % (from Local Pack module) | Aggregate review rating (from Reputation) | Backlink-gap opportunity count (from Backlinks enrichment). Single row, scannable in 5 seconds.

**Section 5 — Where You Show Up (and Don't).** Table with three columns: Search Query | Position | Top 3 in the Pack. Up to 10 rows. A "✓" appears next to the audited domain row if it's in the pack; otherwise "—". Below the table: a one-line interpretation ("You appear in the local pack for 2 of 5 core service queries — Smith Plumbing, ABC Drains, and Quick Fix HVAC dominate the others").

**Section 6 — Competitive Position.** Two columns side by side. Left: "Keywords competitors rank for that you don't" (top 10 from keyword gap). Right: "Sites linking to competitors that don't link to you" (top 10 from backlink gap). Each entry is concrete and actionable.

**Section 7 — 12-Month Trend Lines.** Two SVG sparkline charts rendered server-side: organic traffic (from `historical_rank_overview`) and referring domains (from `/backlinks/history/live`). Use a tiny inline SVG generator — no JS at PDF render time.

**Section 9 — Reputation Snapshot.** Three platform tiles: Google | Yelp | Trustpilot. Each shows star rating, review count, and a delta vs. 90 days ago. Below: a "Recent Themes" callout if sentiment data is available (top 3 phrases from negative reviews).

**Section 10 — Citation Health.** Single table: Directory | Listed | NAP Match. Up to ~10 rows. Highlight mismatches in amber.

**Section 11 — Link Opportunities.** Top 10 backlink-gap rows, each with: domain | DR | "Links to which competitors" | "Suggested outreach angle". The outreach angle is templated based on the type of link (directory submission, guest post target, partnership, etc.).

**Section 13 — Recommended 90-Day Roadmap.** Auto-generated from the issue list. Take all critical issues, sort by module weight × severity, take the top 8–10. Group by week 1–4 (quick wins), week 5–8 (content + outreach), week 9–12 (technical foundation). Each item links back to the relevant module section. This is the section the prospect actually screenshots.

---

## 9. Implementation Milestones

These layer on top of the existing M1–M5. Five additional milestones, sized for sequential shipping.

### M6 — Local Pack Visibility (est. 2 days)

- Add `runLocalPackAudit` module
- UI: extend "Run Audit" form with 3–5 service-keyword inputs
- Wire into orchestrator + scorer (13% weight)
- Add PDF section 5 + dashboard section
- Add to availability map

**Deliverable:** Audits show local-pack visibility for service queries.

### M7 — Backlinks + Domain Analytics enrichments (est. 3 days)

- `lib/audit/enrichments/keyword-gap.ts`, `relevant-pages.ts`, `historical-traffic.ts`
- `lib/audit/enrichments/backlink-gap.ts`, `top-pages-backlinks.ts`, `backlink-history.ts`
- Wire into existing modules' rawData
- Add PDF sections 6, 7, 11
- Add SVG sparkline generator (no external dep — hand-rolled)

**Deliverable:** Competitive position + trend lines + link opportunities all rendered.

### M8 — Reputation module (est. 2 days)

- `runReputationAudit` module with task-queue handling for the three review platforms
- Optional: content_analysis brand-mention call gated behind a feature flag
- Wire into orchestrator + scorer (8% weight)
- Add PDF section 9 + dashboard section

**Deliverable:** Reviews aggregated across Google, Yelp, Trustpilot.

### M9 — Citation Health + Service-keyword SERP + AI Mode (est. 2 days)

- `lib/audit/enrichments/citations.ts` consumed by Local SEO
- Extend SERP Visibility with second keyword + AI Mode query
- Add PDF section 10
- Update Local SEO module section in PDF to include citation table

**Deliverable:** Standard "citation audit" line item delivered + commercial-intent SERP coverage.

### M10 — At-a-Glance + 90-Day Roadmap + polish (est. 2 days)

- PDF section 3 (snapshot tiles) — pulls from now-populated rawData
- PDF section 13 (roadmap) — auto-generated from sorted issue list
- Refresh the executive summary copy to reference the new sections
- End-to-end audit cost / runtime monitoring

**Deliverable:** Comprehensive client-ready report.

**Total estimated effort: 11 days across M6–M10.**

---

## 10. Cost Analysis

Per-audit DataForSEO cost, fully built out:

| Source | Calls | Cost |
|---|---|---|
| Existing — Backlinks (summary, anchors, backlinks) | 3 | ~$0.06 |
| Existing — Domain Analytics (overview, keywords, competitors) | 3 | ~$0.30 |
| Existing — SERP Visibility (brand SERP) | 1 | ~$0.002 |
| **NEW** — Local Pack (5 service queries) | 5 | ~$0.01 |
| **NEW** — Domain Analytics enrichments (gap + pages + history) | 3 | ~$0.30 |
| **NEW** — Backlinks enrichments (gap + pages + history) | 3 | ~$0.06 |
| **NEW** — Citations | 1 | ~$0.05 |
| **NEW** — Reputation (Google + Yelp + Trustpilot reviews) | 6 (3 post + 3 get) | ~$0.10 |
| **NEW** — SERP Visibility (commercial keyword + AI Mode) | 2 | ~$0.005 |
| **OPTIONAL** — Brand mentions (content_analysis) | 1 | ~$0.05 |
| **OPTIONAL** — OnPage instant_pages | 1 | ~$0.005 |
| **Total** | ~28 | **~$0.95–1.00 per audit** |

At one audit per prospect at ~$1 per audit, even running the audit on 100 prospects costs $100 — negligible against the deal value of one signed client. Pricing concern is moot at expected volume.

---

## 11. Open Questions

**Service-keyword inputs.** M6 asks the admin to enter 3–5 service keywords. Better UX: auto-suggest by reading the homepage's H1 + nav menu + extracted topical signals from a single `/dataforseo_labs/google/keywords_for_site/live` call. Add as a polish item in M10 if the manual entry friction is annoying.

**Location resolution.** Local Pack module needs a `location_code` for the maps query. The Local SEO module already extracts city/region. We'd need a small helper to call DataForSEO's `/serp/google/locations/list` once at startup and cache, then look up the closest match for the extracted city. Not hard, but worth flagging.

**Reputation review-collection latency.** The `task_post` → `task_get/advanced` pattern adds 30–60s of polling per platform. With three platforms in parallel, that's manageable, but if Trustpilot is slow we could end up at 90s+ on the audit total. Acceptable per the existing SLA, but worth measuring on the first few real runs.

**Sentiment endpoint path.** The agent flagged `/content_analysis/sentiment_analysis/live` as unverified. Before implementing the brand-mention sentiment angle, manually confirm the path against DataForSEO docs — gracefully skip the section if the endpoint shape differs from expected.

**Roadmap auto-generation tone.** The 90-day roadmap is the section most likely to feel boilerplate or robotic to a prospect. Worth investing in the templating: per-issue "next-step" copy that reads like a consultant wrote it, not like a linter. Maybe reuse the existing `recommendation` field but rephrase imperatively for the roadmap context.

**Per-platform listing universe for citations.** `/business_data/business_listings/search/live` returns matches across the platforms DataForSEO indexes — we'd want to call out a stable list (Yelp, BBB, Yellow Pages, Foursquare, Apple Maps, Bing Places) so the table is consistent across audits even when no listing is found.

---

## Summary

| Area | Decision |
|---|---|
| New scored modules | Local Pack Visibility, Reputation |
| Existing modules enriched | Backlinks (gap + top pages + history), Domain Analytics (gap + pages + history), Local SEO (citations), SERP Visibility (commercial keyword + AI Mode) |
| New PDF sections | At-a-Glance, Where You Show Up, Competitive Position, 12-Month Trend Lines, Reputation, Citation Health, Link Opportunities, 90-Day Roadmap |
| Schema additions | `localPackScore`, `reputationScore` on `AuditResult` |
| Scoring rebalance | Local Pack 13%, Reputation 8%, existing six rebalanced to fit |
| Total per-audit cost | ~$0.95–$1.00 (vs. ~$0.07 today) |
| Total estimated effort | 11 days across 5 new milestones (M6–M10) |
