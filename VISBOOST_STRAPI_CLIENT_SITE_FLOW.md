# VisBoost → Builder → Client Site Flow

How VisBoost connects to Macrolight Builder, how the Strapi content API stores and serves data, and how client sites fit in today vs. the planned build path.

**Phase 1 status (live now):** VisBoost and client site renderers share **one site API key** (`mlsk_…`). VisBoost can **pair**, **publish**, and **read** content. Client sites **read published content** via the same key (`?audience=site`) and **ingest leads** via a separate ingest secret.

---

## Actors

| Actor | Role |
| --- | --- |
| **Macrolight Builder** | Control plane — admin UI, CRM, Postgres (`strapi_sites`, `strapi_content_entries`), API routes |
| **VisBoost** | External product — runs audits, generates content, pairs to a Builder site via API key |
| **Client site** | Per-client Next.js repo deployed on Vercel — marketing site the end customer sees |
| **Builder admin** | Creates site records, generates pairing keys, reviews content in `/admin/portal/strapi` |

---

## High-level architecture

```mermaid
flowchart TB
  subgraph Admin["Macrolight Builder (admin)"]
    A1["/admin/portal/strapi"]
    A2["/admin/portal/projects"]
    A3["/admin/crm"]
  end

  subgraph BuilderAPI["Macrolight Builder (API)"]
    P1["POST /api/strapi/pair"]
    P2["GET/POST /api/strapi/content"]
    P3["POST /api/ingest/visboost-handoff"]
    P4["POST /api/ingest/lead"]
    DB[("Postgres\nstrapi_sites\nstrapi_content_entries\nleads / contacts")]
  end

  subgraph VisBoost["VisBoost (server-side)"]
    V1["Pair on startup / config"]
    V2["Publish generated content"]
    V3["Forward audit handoffs"]
  end

  subgraph ClientSite["Client site (Vercel)"]
    C1["Contact form handler"]
    C2["Page renderer\nGET ?audience=site"]
  end

  A1 -->|"Create site + generate mlsk_ key"| DB
  A2 -->|"Set previewUrl / liveUrl"| DB

  V1 & V2 & C2 -->|"same x-macrolight-key"| P1 & P2
  V3 -->|"x-ingest-secret"| P3

  P1 --> DB
  P2 --> DB
  P3 --> DB
  P3 --> A3

  C1 -->|"x-ingest-secret"| P4
  P4 --> DB

  C2 -->|"GET ?audience=site"| P2

  A1 --> P2
```

---

## 1. Admin setup — register a client site in Builder

Before VisBoost or a client site can connect, an admin creates the Builder-side records.

```mermaid
flowchart TD
  Start([New client engagement]) --> CreateUser["Client signs up / admin creates User"]
  CreateUser --> CreateProject["Admin links Project\n(previewUrl, liveUrl, stage)"]
  CreateProject --> CreateStrapiSite["Admin → /admin/portal/strapi\n+ New Strapi site"]
  CreateStrapiSite --> FillFields["Set name, slug,\nuserId, projectId,\nstrapiBaseUrl (optional)"]
  FillFields --> GenKey["Click Generate key"]
  GenKey --> CopyKey["Copy mlsk_… key\n(shown once)"]
  CopyKey --> HandToVisBoost["Paste key into VisBoost config\n(server-side only)"]
  CopyKey --> HandToClient["Optional: set client site env vars\nfor lead ingest"]
```

**What gets stored (`strapi_sites`):**

- `userId` / `projectId` — scalar links to the client's portal account and delivery project
- `slug` — stable site identifier (unique across all Builder sites)
- `pairingKeyHash` + `pairingKeyPrefix` + `pairingKeyLast4` — hashed pairing key (plaintext never stored)
- `status` — `UNLINKED` → `PENDING` → `ACTIVE` (after successful pair/publish)
- `strapiBaseUrl`, `strapiSpaceId`, `strapiCollection` — metadata for a future shared Strapi instance

---

## 2. VisBoost pairing — connect to the right Builder site

VisBoost proves it belongs to one specific client site using the Builder-issued pairing key.

```mermaid
sequenceDiagram
  participant VB as VisBoost backend
  participant API as POST /api/strapi/pair
  participant DB as strapi_sites

  VB->>API: GET or POST\nx-macrolight-key: mlsk_ab12cd34_…
  API->>API: Parse prefix mlsk_ab12cd34
  API->>DB: Lookup by pairingKeyPrefix
  API->>API: sha256(key) vs pairingKeyHash\n(constant-time compare)
  alt Invalid / missing key
    API-->>VB: 401 Unauthorized
  else Site DISABLED
    API-->>VB: 403 Site is disabled
  else Success
    API->>DB: lastPairedAt = now, status = ACTIVE
    API-->>VB: { ok, site: { siteId, slug, userId, projectId, strapiBaseUrl, … } }
  end
```

**Response payload (`toPairingPayload`):** minimal site metadata VisBoost needs to scope all future calls — `siteId`, `slug`, `name`, `userId`, `projectId`, Strapi connection fields.

**Auth header options:**

- `x-macrolight-key: mlsk_…`
- `Authorization: Bearer mlsk_…`

> Server-to-server only. Never call from a browser — the key would leak.

---

## 3. VisBoost content creation — publish into Builder

VisBoost generates content (blog posts, landing copy, etc.) and pushes it into Builder's shared content layer.

```mermaid
flowchart TD
  VBStart([VisBoost finishes content generation]) --> HasKey{Pairing key\nconfigured?}
  HasKey -->|No| PairFirst["Call /api/strapi/pair first"]
  HasKey -->|Yes| BuildPayload["Build publish payload"]
  PairFirst --> BuildPayload

  BuildPayload --> PostContent["POST /api/strapi/content\nx-macrolight-key"]
  PostContent --> Auth["authenticatePairingRequest"]
  Auth -->|Fail| Reject401["401 / 403"]
  Auth -->|OK| Validate["Require title, markdown, html"]
  Validate --> Upsert["upsertContentEntry"]

  Upsert --> KeyCheck{sourceRequestId\nprovided?}
  KeyCheck -->|Yes| ByRequest["Upsert by (siteId, sourceRequestId)"]
  KeyCheck -->|No| BySlug["Upsert by (siteId, slug)"]

  ByRequest --> SaveDB[("strapi_content_entries")]
  BySlug --> SaveDB
  SaveDB --> UpdateSite["strapi_sites.lastSyncedAt = now\nstatus = ACTIVE"]
  UpdateSite --> Response["Return { ok, site, entry }"]
```

### Publish payload (VisBoost → Builder)

| Field | Required | Notes |
| --- | --- | --- |
| `title` | Yes | Display title |
| `markdown` | Yes | Source markdown |
| `html` | Yes | Rendered HTML |
| `sourceProvider` | No | Defaults to `visboost` |
| `sourceRequestId` | No | VisBoost request ID — enables idempotent upsert |
| `entryType` | No | e.g. `blog_post` |
| `slug` | No | Derived from title if omitted |
| `excerpt`, `seoTitle`, `seoDescription` | No | SEO fields |
| `heroImage`, `metadata` | No | JSON blobs |
| `status` | No | `DRAFT` (default), `PUBLISHED`, `ARCHIVED` |
| `visibility` | No | `INTERNAL` (default) or `FUTURE_SITE_READ` |

### Who can read content — same key, different scopes

```mermaid
flowchart LR
  subgraph Writers
    VB["VisBoost\nPOST"]
  end

  subgraph Readers["Readers (same mlsk_ key)"]
    ADM["Builder admin session"]
    VBGET["VisBoost\nGET default"]
    CS["Client site renderer\nGET ?audience=site"]
  end

  VB -->|POST| DB[("strapi_content_entries")]
  ADM -->|GET all| DB
  VBGET -->|"INTERNAL +\nFUTURE_SITE_READ"| DB
  CS -->|"PUBLISHED +\nFUTURE_SITE_READ only"| DB
```

| Caller | Endpoint | Sees |
| --- | --- | --- |
| VisBoost | `GET /api/strapi/content` | `INTERNAL` + `FUTURE_SITE_READ` |
| Client site | `GET /api/strapi/content?audience=site` | `PUBLISHED` + `FUTURE_SITE_READ` only |
| Builder admin | `GET /api/strapi/content?siteId=…` | All entries |

---

## 4. VisBoost audit handoff — CRM path (separate from Strapi)

When VisBoost completes an audit and wants Builder ops to follow up, it uses a **different** endpoint — no pairing key involved.

```mermaid
sequenceDiagram
  participant VB as VisBoost backend
  participant API as POST /api/ingest/visboost-handoff
  participant CRM as Builder CRM (Postgres)

  VB->>API: POST\nx-ingest-secret: VISBOOST_INGEST_SECRET\n{ handoffId, clientId, clientName, url, serviceType, overallScore, topFindings, … }
  API->>API: Authorize secret
  API->>CRM: Check idempotency by handoffId
  alt Already ingested
    API-->>VB: 200 { idempotent: true, leadId, … }
  else New handoff
    API->>CRM: Find or create Lead\n(email: handoff+{clientId}@clients.visboost)
    API->>CRM: Create Note (full audit context)
    API->>CRM: Create Activity (TASK for ops review)
    API->>CRM: Create VisboostHandoff marker
    API-->>VB: 201 { leadId, noteId, activityId }
  end
```

**Env vars:**

- Builder: `VISBOOST_INGEST_SECRET` (falls back to `LEAD_INGEST_SECRET`)
- VisBoost: same secret as `x-ingest-secret` header

**Admin visibility:** `/admin/crm` — leads, notes, and follow-up tasks.

---

## 5. How Builder's Strapi API handles data internally

Builder is the **control plane**. It does not expose a raw Strapi admin API to client sites. Instead:

```mermaid
flowchart TB
  subgraph External["External callers"]
    VB["VisBoost"]
    ADM["Builder admin browser"]
  end

  subgraph Routes["API routes"]
    Pair["/api/strapi/pair"]
    Content["/api/strapi/content"]
    AdminSites["/api/admin/strapi/sites"]
    RotateKey["/api/admin/strapi/sites/:id/rotate-key"]
  end

  subgraph Lib["lib/strapi/"]
    Keys["keys.ts\nmlsk_ generation + hash verify"]
    Sites["sites.ts\nCRUD + pairing auth"]
    ContentLib["content.ts\nupsert + list"]
  end

  subgraph Storage["Postgres"]
    SS[("strapi_sites")]
    SCE[("strapi_content_entries")]
  end

  VB --> Pair & Content
  ADM --> AdminSites & RotateKey & Content

  Pair --> Keys --> Sites --> SS
  Content --> Sites
  Content --> ContentLib --> SCE
  AdminSites --> Sites
  RotateKey --> Keys

  SCE -->|siteId FK| SS
```

### Key design choices

1. **One site API key per site** (shared by VisBoost + client renderer). Format: `mlsk_<8-hex-prefix>_<48-hex-secret>`.
2. **Plaintext keys are never stored** — only `sha256` hash + lookup prefix.
3. **Content upsert is idempotent** — by `(siteId, sourceRequestId)` or `(siteId, slug)`.
4. **Visibility + audience gate** — VisBoost sees `INTERNAL` drafts; the client renderer (`?audience=site`) only sees `PUBLISHED` + `FUTURE_SITE_READ`.
5. **Strapi instance fields** (`strapiBaseUrl`, etc.) are metadata for a future sync worker — phase 1 stores content in Postgres, not in a remote Strapi CMS.

---

## 6. Client sites — what works today

```mermaid
flowchart TD
  Build([Next.js build / ISR]) --> Renderer["Server component or\ndata fetch"]
  Renderer --> ContentGET["GET /api/strapi/content?audience=site&slug=…\nx-macrolight-key: MACROLIGHT_SITE_KEY"]
  ContentGET --> RenderPage["Render html / markdown"]

  Visitor([Site visitor]) --> Form["Contact form"]
  Form --> ClientAPI["Client site\n/api/contact (server route)"]
  ClientAPI --> Ingest["POST /api/ingest/lead\nx-ingest-secret"]
  Ingest --> CRM[("Builder CRM")]

  subgraph Env["Client site env (server only)"]
    E1["MACROLIGHT_BUILDER_URL"]
    E2["MACROLIGHT_SITE_KEY\n= same mlsk_ key as VisBoost"]
    E3["MACROLIGHT_INGEST_SECRET\n= Builder LEAD_INGEST_SECRET"]
  end

  Env --> Renderer & ClientAPI
```

**Also link the site operationally:**

- Admin sets `Project.previewUrl` / `Project.liveUrl` so the portal can link to the live site.
- Admin creates a `StrapiSite`, generates the site API key, and sets the same key in VisBoost + client site env.

### Content renderer example

Copy `lib/strapi/site-renderer-client.ts` into the client repo:

```ts
import { fetchSitePage } from "@/lib/macrolight/site-renderer-client";

const page = await fetchSitePage({
  builderUrl: process.env.MACROLIGHT_BUILDER_URL!,
  siteKey: process.env.MACROLIGHT_SITE_KEY!,
  slug: "about",
  revalidate: 60,
});
```

### Lead ingest payload

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "555-1234",
  "company": "Acme HVAC",
  "message": "Need a quote",
  "source": "website",
  "ownerEmail": "client@example.com"
}
```

---

## 7. Publish-to-render workflow

```mermaid
flowchart LR
  S1["VisBoost publishes\nstatus: DRAFT\nvisibility: INTERNAL"] --> S2["Admin reviews"]
  S2 --> S3["Flip to PUBLISHED\n+ FUTURE_SITE_READ"]
  S3 --> S4["Client site fetches\n?audience=site\nsame MACROLIGHT_SITE_KEY"]
  S4 --> S5["Page renders on live site"]
```

### Build sequence for a new client site

```mermaid
flowchart LR
  S1["1. Scaffold site repo"] --> S2["2. Admin creates User + Project"]
  S2 --> S3["3. Admin creates StrapiSite +\ngenerates site API key"]
  S3 --> S4["4. Set MACROLIGHT_SITE_KEY\nin VisBoost + client site env"]
  S4 --> S5["5. VisBoost pairs + publishes"]
  S5 --> S6["6. Publish content for site"]
  S6 --> S7["7. Deploy client site +\nwire renderer + lead ingest"]
```

---

## API reference (quick)

| Endpoint | Method | Auth | Caller | Purpose |
| --- | --- | --- | --- | --- |
| `/api/admin/strapi/sites` | GET/POST | Admin session | Builder admin | List/create/update site records |
| `/api/admin/strapi/sites/:id/rotate-key` | POST | Admin session | Builder admin | Generate/regenerate `mlsk_` key |
| `/api/strapi/pair` | GET/POST | `x-macrolight-key` | VisBoost | Verify key, return site metadata |
| `/api/strapi/content` | POST | `x-macrolight-key` | VisBoost | Publish/upsert content entry |
| `/api/strapi/content` | GET | Admin session or site API key | Admin / VisBoost | Read all paired entries |
| `/api/strapi/content?audience=site` | GET | Site API key | Client site renderer | Read published site-visible entries |
| `/api/ingest/visboost-handoff` | POST | `x-ingest-secret` | VisBoost | Land audit handoff in CRM |
| `/api/ingest/lead` | POST | `x-ingest-secret` | Client site | Land form submission in CRM |

---

## Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `LEAD_INGEST_SECRET` | Builder | Authorizes `/api/ingest/lead` |
| `VISBOOST_INGEST_SECRET` | Builder | Authorizes `/api/ingest/visboost-handoff` (falls back to lead secret) |
| `MACROLIGHT_INGEST_SECRET` | Client site | Must match Builder's `LEAD_INGEST_SECRET` |
| `MACROLIGHT_BUILDER_URL` | Client site / VisBoost | Builder base URL |
| `MACROLIGHT_SITE_KEY` (`mlsk_…`) | VisBoost + client site (server env) | One key per site from admin UI, never in browser |
| `STRAPI_BASE_URL` | Builder (optional) | Pre-fills new Strapi site records |

---

## Related docs

- [`SHARED_CONTENT_PHASE1.md`](./SHARED_CONTENT_PHASE1.md) — phase 1 content contract and read restrictions
- [`MACROLIGHT_CMS_BUILD_PLAN_v2.md`](./MACROLIGHT_CMS_BUILD_PLAN_v2.md) — full client editor + MongoDB CMS plan
- [`.env.example`](./.env.example) — Strapi + ingest secret documentation
