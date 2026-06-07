# Macrolight CMS — Build Plan v2 (Corrected)
*A client-facing website editor integrated into the existing Macrolight Builder platform*

> **What changed from v1:** v1 was written for a greenfield app with its own MongoDB + custom auth. Your repo is already a mature Next.js 14 app on **Prisma/Postgres + next-auth + Stripe + Vercel Blob + the Vercel AI SDK**, with a working `/portal` (clients) and `/admin` (back office). This version maps the CMS onto what you already have, and keeps **MongoDB Atlas only for the CMS content layer** (which is genuinely document-shaped). Pricing is unchanged — CMS becomes an entitlement on your existing plans, not a new tier.

---

## What We're Building

A CMS layer on top of every Macrolight-generated site. A logged-in client opens an editor inside the portal they already have, edits copy, swaps images, manages SEO, and publishes — and the change flows to their live site. You manage every site from your existing admin back office.

No new login, no new dashboard, no second auth system. The editor is a new authenticated route inside the portal you've already built.

---

## Two-Datastore Architecture (deliberate)

```
Postgres (existing — Prisma)          MongoDB Atlas (new — CMS content)
├── User / Session / Account          ├── sites        ← registry + deploy hook
├── Plan / PlanOption / Subscription  ├── pages        ← per-page content JSON
├── Project (one per client)          ├── versions     ← publish snapshots (rollback)
├── Contact / Lead / CRM              └── submissions  ← form leads (mirrored to CRM)
└── MediaFile (Vercel Blob)
```

**Why split it this way.** Identity, billing, entitlements, and CRM already live in Postgres and are relational — leave them there. CMS page content is flexible, nested, and schema-light — exactly what a document store is good at, and you already have an Atlas cluster you want to use. The two stores are linked by the Postgres `userId` / `projectId` (a cuid string) stored on each Mongo `sites` document. No data is duplicated across stores except that one foreign key.

**The seam to respect:** authentication and "who is this person / what plan are they on" is answered by next-auth + Postgres on every request. Mongo never authenticates anyone — it only stores content for a `siteId` once the request is already authorized.

---

## MongoDB Collections (Atlas)

### `sites`
```json
{
  "_id": "ObjectId",
  "userId": "cuid",              // FK → Postgres User.id (the client)
  "projectId": "cuid",          // FK → Postgres Project.id
  "name": "Bob's Plumbing Co",
  "slug": "bobs-plumbing",
  "liveUrl": "https://bobs-plumbing.vercel.app",
  "vercelDeployHookUrl": "https://api.vercel.com/v1/integrations/deploy/...",
  "cmsEnabled": true,           // entitlement mirror; source of truth is the plan
  "guardianOverride": false,    // per-site safety toggle (off = strict)
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```
> No `passwordHash` and no `agencyOwnerId`. Auth is next-auth; the "agency owner" is always you (Macrolight admin), enforced by `Role.ADMIN`.

### `pages`
```json
{
  "_id": "ObjectId",
  "siteId": "ObjectId",
  "slug": "/",
  "title": "Home",
  "content": { "sections": [ { "type": "hero", "fields": { "...": "..." } } ] },
  "seoTitle": "Bob's Plumbing | Detroit Plumbers",
  "seoDescription": "...",
  "seoKeyword": "plumber Detroit",
  "status": "draft | published",
  "updatedAt": "ISO date"
}
```
> **Content is structured JSON sections**, not raw HTML. This is the single most important design choice — see "Content schema" below. It makes the safety layer almost trivial and keeps clients from breaking layout.

### `versions`
```json
{
  "_id": "ObjectId",
  "pageId": "ObjectId",
  "siteId": "ObjectId",
  "content": { "...snapshot of page content" },
  "seo": { "title": "...", "description": "...", "keyword": "..." },
  "publishedAt": "ISO date",
  "publishedBy": "userId (client) | admin",
  "label": "v4 — client edit"
}
```

### `submissions`
```json
{
  "_id": "ObjectId",
  "siteId": "ObjectId",
  "formData": { "name": "...", "email": "...", "message": "..." },
  "receivedAt": "ISO date",
  "read": false,
  "syncedLeadId": "cuid | null"   // mirrored into Postgres Lead/CRM
}
```
> Store the raw submission in Mongo **and** mirror it into your existing `Lead`/`Contact` CRM so leads still land where you already work them. The mirror is fire-and-forget; the Mongo doc is the source of truth for the per-site inbox.

---

## What You Already Have (do NOT rebuild)

| v1 proposed | You already have | Action |
|---|---|---|
| Custom bcrypt + JWT auth, per-site password gate | **next-auth** sessions, `Role` enum, `/portal` + `/admin/login` | Reuse session auth; delete the JWT/password idea |
| `MASTER_DASHBOARD_PASSWORD` | `Role.ADMIN` + `/admin` | Gate admin CMS views by role |
| New `/dashboard` master view | `/admin/portal` (projects, onboarding, plans, delivery) | Add CMS views *inside* `/admin/portal` |
| New `submissions` inbox from scratch | `Contact` / `Lead` models, `/api/contact`, `/admin/crm` | Mirror Mongo submissions into the existing CRM |
| Image upload handling | `@vercel/blob` + `MediaFile` model + `/api/portal/media` | Reuse for image swap |
| OpenRouter + `claude-3-haiku` for AI edits | Vercel AI SDK (`ai`, `@ai-sdk/openai`), `/api/chat`, `lib/ai/model.ts` | Reuse the existing model pipeline |
| New `sites` table for the registry | `Project` (one per `User`, has `liveUrl`/`previewUrl`/`stage`) | Link Mongo `sites` to `Project`, don't duplicate |

---

## Content Schema (the foundation — build this first)

Because your client sites are **separate repos with content currently hardcoded in JSX**, a CMS can't edit them until content is decoupled from layout. Define a stable, typed section schema that both the editor and the client site understand:

```ts
type Section =
  | { type: "hero";      fields: { heading: string; subheading: string; ctaLabel: string; ctaHref: string; image?: string } }
  | { type: "features";  fields: { items: { title: string; body: string; icon?: string }[] } }
  | { type: "testimonials"; fields: { items: { quote: string; author: string; role?: string }[] } }
  | { type: "cta";       fields: { heading: string; buttonLabel: string; buttonHref: string } }
  | { type: "richtext";  fields: { html: string } };   // sanitized, the only free-form block

type PageContent = { sections: Section[] };
```

Clients only ever edit `fields` values. They cannot add `<script>`, change classNames, or restructure layout, because those concepts don't exist in the schema. This is why the safety layer (below) shrinks to almost nothing.

---

## Content Adapter (per client repo — the decoupling step)

Each client repo gets one small module that fetches its content from the CMS and renders it through the repo's own components, using ISR so updates appear without a manual redeploy:

```ts
// lib/cms.ts inside each client repo
export async function getPage(slug: string) {
  const res = await fetch(`${process.env.CMS_API}/api/public/page?siteId=${SITE_ID}&slug=${slug}`, {
    headers: { "x-site-token": process.env.CMS_SITE_TOKEN! },
    next: { revalidate: 60, tags: [`site:${SITE_ID}`] },
  });
  return res.json() as Promise<PageContent>;
}
```

The page component maps `sections[]` to the repo's existing React components. **Refactoring hardcoded strings into this lookup is the real work of the project** — it's one-time per site. New sites are scaffolded this way from day one; your single existing client is migrated later.

---

## File Structure (inside the Macrolight Builder repo)

```
/app
  /admin/portal
    /sites
      page.tsx                ← list all CMS sites (add to existing admin nav)
      /[siteId]
        page.tsx              ← pages, version history, submissions for one site
  /portal
    /editor
      page.tsx                ← client editor (session-gated + plan-gated)
  /api
    /portal/cms
      pages/route.ts          ← GET/POST page content (session required)
      publish/route.ts        ← snapshot + update + trigger deploy hook
      versions/route.ts       ← GET version list
      rollback/route.ts       ← restore a version
      seo/route.ts            ← save SEO fields
    /admin/cms
      sites/route.ts          ← create/list/update sites (ADMIN only)
      submissions/route.ts    ← per-site inbox
    /public
      page/route.ts           ← read-only, token-auth, served to client sites
    /ingest
      submission/route.ts     ← client sites POST form leads here
/lib
  mongo.ts                    ← NEW: Atlas connection (separate from prisma.ts)
  cms/
    sites.ts                  ← site registry helpers
    pages.ts                  ← page read/write
    guardian.ts               ← content validation (slim, schema-based)
    vercel.ts                 ← deploy-hook trigger
    entitlement.ts            ← "does this user's plan include CMS?"
```

> `lib/prisma.ts` stays exactly as is. `lib/mongo.ts` is a new, independent connection pool for Atlas. They never import each other.

---

## Feature List

### 1. Admin CMS views (inside existing `/admin/portal`)
- A "Sites" section listing every CMS site (name, live URL, plan, last edited, unread submissions).
- Create/edit a site: name, live URL, Vercel **deploy hook URL**, link to the client `User`/`Project`, CMS on/off.
- Drill into a site → its pages, version history, and submissions.
- Gated by `Role.ADMIN` (already enforced in your admin layout).

### 2. Client editor (`/portal/editor`)
- **No password gate** — the client is already logged into the portal. A server check confirms (a) they own a site and (b) their plan includes CMS; otherwise show an upgrade prompt.
- Left: page list + "add page" (blank / about / pricing / article templates).
- Center: section-based editor — edit hero, features, testimonials, CTA, etc. by field. Image swap via the existing Vercel Blob `/api/portal/media` flow.
- Right: SEO panel (keyword, meta title, meta description, live 0–100 score) + AI sidebar (reuses your `ai` SDK pipeline with the current page as context).
- Top bar: device preview toggles, **Save** (writes draft to Mongo, no deploy) and **Publish** (snapshot + deploy).
- Clear "Saved" vs "Published" states.

### 3. Safety layer (`/lib/cms/guardian.ts`) — slim
Because content is structured JSON, validation is mostly "does the edited content still match the section schema?" Allow field-value edits; reject unknown section types, malformed shapes, and any `richtext` HTML that fails sanitization. Per-site `guardianOverride` for power users / yourself.

### 4. Version history & rollback
Every publish writes a labeled snapshot to `versions`. Admin per-site view lists them (timestamp, author, label). One-click rollback restores the snapshot and re-triggers the deploy hook.

### 5. Form inbox (Mongo + CRM mirror)
Client sites POST submissions to `/api/ingest/submission` (token-auth, no session). Each lands in Mongo `submissions` and is mirrored into your existing `Lead`/`Contact` pipeline so it shows up in `/admin/crm`. Per-site unread badge + CSV export.

### 6. SEO panel
Focus keyword, meta title, meta description. Live score (keyword in title, keyword in description, description length, title length), 0–100 with color. Stored on the `pages` doc, written into `<head>` by the client site's adapter on render.

---

## How Publish Works (given separate repos + Atlas)

When a client hits **Publish**:
1. `guardian.ts` validates the new content against the section schema.
2. A snapshot is written to `versions` (Mongo).
3. The `pages` doc is updated and marked `published` (Mongo).
4. `/api/portal/cms/publish` fires the site's **Vercel Deploy Hook** (URL stored on the `sites` doc) — a simple `POST`, no Vercel token juggling per request.
5. The client site rebuilds; its content adapter pulls the fresh content via the public read API.

> **Faster path (optional):** instead of a full redeploy, call on-demand `revalidateTag('site:<id>')` against the client site so ISR refreshes near-instantly. Use the deploy hook as the reliable fallback. **Avoid GitHub write-back on every edit** — committing to client repos per save is brittle and pollutes history.

---

## Environment Variables to Add

```env
# Existing — unchanged
DATABASE_URL=postgresql://...        # Postgres (Prisma)
# (next-auth, Stripe, Vercel Blob, AI SDK already configured)

# New — CMS content store
MONGODB_CMS_URI=mongodb+srv://...    # your Atlas cluster
MONGODB_CMS_DB=macrolight_cms

# New — publish + public read
CMS_PUBLIC_READ_SECRET=random_32_char_string   # signs the x-site-token client sites use
# (per-site Vercel deploy hook URLs are stored in the sites collection, not env)
```
> No `CMS_JWT_SECRET`, no `MASTER_DASHBOARD_PASSWORD`, no `OPENROUTER_API_KEY` — those are all covered by systems you already run.

---

## Build Sequence (Claude Code prompt order)

### Step 0 — Content schema + adapter convention *(new; do this first)*
Define the `Section`/`PageContent` types in a shared location. Build the per-repo `lib/cms.ts` content adapter and the `/api/public/page` read endpoint (token-auth). Prove the loop end to end on a throwaway scaffold site: edit a JSON doc by hand → site renders it via ISR. Nothing else should be built until this loop works.

### Step 1 — Mongo connection + collections
```
Create lib/mongo.ts: a singleton MongoDB Atlas connection using MONGODB_CMS_URI,
independent of lib/prisma.ts. Add typed helpers and indexes for collections:
sites (index userId, slug), pages (index siteId+slug), versions (index pageId),
submissions (index siteId+read). Add TypeScript types for each document shape.
```

### Step 2 — API routes
```
Build CMS API routes. Auth model: portal routes use getServerSession (next-auth);
admin routes additionally require Role.ADMIN; public/ingest routes use x-site-token.
- GET/POST /api/portal/cms/pages       (session; scope to the caller's siteId)
- POST   /api/portal/cms/publish        (validate → version snapshot → update → deploy hook)
- GET    /api/portal/cms/versions
- POST   /api/portal/cms/rollback
- POST   /api/portal/cms/seo
- POST   /api/admin/cms/sites           (ADMIN: create/update a site + deploy hook url)
- GET    /api/admin/cms/submissions     (ADMIN)
- GET    /api/public/page               (x-site-token; read-only content for client sites)
- POST   /api/ingest/submission         (x-site-token; writes Mongo + mirrors to Lead)
Add lib/cms/entitlement.ts to check the caller's plan includes CMS.
```

### Step 3 — Admin CMS views
```
Inside the existing /admin/portal area, add a Sites section: list all CMS sites
with plan, last edited, and unread submission count. Add create/edit (name, liveUrl,
vercelDeployHookUrl, link to User/Project, cmsEnabled). Drill-in shows pages,
version history, and submissions. Match the existing admin design system. ADMIN only.
```

### Step 4 — Client editor
```
Build /portal/editor. Server component checks session + CMS entitlement; redirect
to an upgrade prompt if the plan doesn't include CMS. Layout: left page list,
center section-based editor (field inputs per section type, image swap via the
existing /api/portal/media Vercel Blob flow), right SEO panel + AI sidebar
(reuse the existing ai SDK pipeline). Top bar: device preview, Save (draft),
Publish (calls /api/portal/cms/publish).
```

### Step 5 — Safety layer
```
Build lib/cms/guardian.ts. Validate edited PageContent against the Section schema:
ALLOW field-value changes; REJECT unknown section types, malformed shapes, and any
richtext HTML that fails sanitization. Honor the per-site guardianOverride flag.
Call it inside /api/portal/cms/publish before writing the version.
```

### Step 6 — Submissions + CRM mirror
```
Implement /api/ingest/submission: accept siteId + flexible formData, write to the
submissions collection, and mirror into the existing Lead/Contact pipeline (store
the created Lead id on the submission). Add unread badge + CSV export to the admin
per-site view.
```

### Step 7 — Version history UI + rollback
```
In the admin per-site view, add a version list (timestamp, author, label) with a
Rollback button calling /api/portal/cms/rollback, which restores the snapshot as
current content and re-triggers the deploy hook.
```

### Step 8 — Migrate the one existing client *(later)*
```
Refactor the existing client's repo to replace hardcoded content with the Step 0
content adapter. Seed its current copy into Mongo pages. Point its deploy hook into
the sites doc. Verify edit → publish → live update works before handing them the editor.
```

---

## What You Hand a Client

Nothing new to log into. Their existing portal account gains an **Editor** tab once their plan includes CMS. They log in where they already do, edit, hit Publish.

---

## Monetization (pricing unchanged)

No new tiers and no price changes. CMS access is an **entitlement** expressed through your existing `Plan` / `PlanOption` system — flip it on for whichever plans you choose, or sell it as an add-on `PlanOption`. The editor checks entitlement server-side and shows an upgrade prompt when it's off. All of this rides on the Stripe + plan machinery you already run.

---

## Notes
- **Keep the two stores cleanly separated** — `lib/prisma.ts` and `lib/mongo.ts` never import each other. The only link is the Postgres `userId`/`projectId` stored on the Mongo `sites` doc.
- **Deploy hooks beat the deployments API** — store one hook URL per site; publish is a single POST.
- **Reuse the AI SDK** you already have; don't add a second AI provider.
- **Structured content is the safety layer** — investing in the section schema (Step 0) is what makes everything downstream simple and safe.
- **Sequence discipline:** Step 0 must produce a working edit→render loop before any UI is built.
```
