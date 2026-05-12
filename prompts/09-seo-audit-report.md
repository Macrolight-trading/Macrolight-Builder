# Prompt: SEO Audit Report for a Prospect / Client

Use this prompt to run a full SEO audit on a client's existing website using the built-in audit pipeline and generate a PDF report to use as a sales or consulting deliverable.

## How to Run
1. Go to **Admin → Audits → New Audit**
2. Enter the client's URL and business name
3. Click **Run Audit** — the pipeline runs all modules in ~30–90s
4. Review scores in the audit detail view
5. Click **Download PDF** to get the branded report
6. Optionally click **Generate Content Plan** for an AI-written page roadmap

## What the Audit Covers
| Module | What it checks |
|---|---|
| **Technical** | PageSpeed, Core Web Vitals, HTTPS, crawlability, sitemap, robots |
| **On-Page** | Title tags, meta descriptions, H1s, image alt text, internal links |
| **Backlinks** | Domain rank, referring domains, anchor text, spam score (DataForSEO) |
| **Local SEO** | Google Business Profile, NAP consistency, LocalBusiness schema, citation coverage |
| **Domain Analytics** | Organic keyword count, estimated traffic, top rankings, competitors (DataForSEO) |
| **SERP Visibility** | Target keyword rankings, featured snippet potential |
| **Local Pack** | Google Maps pack presence for primary service keywords |
| **Reputation** | Google / Yelp / Trustpilot ratings, recent negative review velocity |

## AI Content Plan Output
The content plan generates:
- Strategic summary of gaps vs competitors
- Up to 5 prioritised page recommendations (service pages, blog posts, landing pages)
- Per-page: target keyword, search volume, content outline, internal linking note

## Required Environment Variables
```
DATAFORSEO_LOGIN=
DATAFORSEO_PASSWORD=
GOOGLE_PLACES_API_KEY=
GOOGLE_PAGESPEED_API_KEY=
AI_GATEWAY_API_KEY=   # or OPENAI_API_KEY directly
```

## Using the Report as a Sales Tool
- Share the PDF directly with the prospect after a discovery call
- Highlight critical issues (red scores) as the reason to act now
- Use the content plan as the deliverable for a paid "website strategy" engagement
- The report header shows the client name and URL — fully white-labelable by editing `lib/audit/pdf-template.ts`
