# Shared content layer (phase 1)

Status: active
Owner: Macrolight Builder control plane
Writers: VisBoost only
Readers: Macrolight Builder admins, VisBoost, and client site renderers (server-side)

## Single site API key

Each client site gets **one** API key (`mlsk_…`), generated in **Admin → Strapi CMS** (`/admin/portal/strapi`). The same key is used by:

| Consumer | Method | Endpoint |
| --- | --- | --- |
| VisBoost (publish) | POST | `/api/strapi/content` |
| VisBoost (review) | GET | `/api/strapi/content` |
| Client site renderer | GET | `/api/strapi/content?audience=site` |
| Either (pair check) | GET/POST | `/api/strapi/pair` |

Pass the key as `x-macrolight-key` (or `Authorization: Bearer mlsk_…`). **Server-side only** — never expose it to the browser.

**Env vars on VisBoost / client site repos:**

```env
MACROLIGHT_BUILDER_URL=https://macrolight-builder.com
MACROLIGHT_SITE_KEY=mlsk_…
```

Copy `lib/strapi/site-renderer-client.ts` into client site repos for a ready-made fetch helper.

## What is live now

VisBoost publishes generated content into Builder's shared content layer at `POST /api/strapi/content`, scoped by the site API key.

Builder stores each content item in `strapi_content_entries` and exposes reads through:

- `GET /api/strapi/content` — Builder admin session, or site API key (VisBoost: all paired entries)
- `GET /api/strapi/content?audience=site` — same site API key (client renderer: `PUBLISHED` + `FUTURE_SITE_READ` only)

## Current data contract

A content publish request from VisBoost sends:

- `sourceProvider` (`visboost`)
- `sourceRequestId` (VisBoost content request id)
- `entryType` (currently template/blog type)
- `title`
- `slug` (optional; Builder derives one if omitted)
- `excerpt` (optional)
- `seoTitle` (optional)
- `seoDescription` (optional)
- `markdown`
- `html`
- `heroImage` (optional JSON)
- `metadata` (optional JSON)
- `status` (`DRAFT`/`PUBLISHED`/`ARCHIVED`)
- `visibility` (`INTERNAL` default, or `FUTURE_SITE_READ` when ready for the live site)

Builder upserts by:

- `(siteId, sourceRequestId)` when provided
- otherwise `(siteId, slug)`

## Read scopes (same key, different filters)

| Caller | Sees |
| --- | --- |
| Builder admin | All entries (any site) |
| VisBoost (`GET`, default) | `INTERNAL` + `FUTURE_SITE_READ` for its site |
| Client site (`GET ?audience=site`) | `PUBLISHED` + `FUTURE_SITE_READ` only |

Drafts and internal-only content stay invisible to the live site renderer even though it uses the same key.

## Client site renderer example

```ts
import { fetchSitePage } from "@/lib/macrolight/site-renderer-client";

const page = await fetchSitePage({
  builderUrl: process.env.MACROLIGHT_BUILDER_URL!,
  siteKey: process.env.MACROLIGHT_SITE_KEY!,
  slug: "about",
  revalidate: 60,
});
```

## Future work

- Slimmer render payload (strip internal metadata fields)
- Section-based page schema adapter per site family
- Background sync to a shared Strapi instance (optional)
