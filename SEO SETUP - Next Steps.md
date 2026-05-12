# SEO Setup — Next Steps

Bradley, the code changes are in. These two final steps need you to be logged
in, so I'm leaving them as a checklist.

---

## 1. Submit the sitemap to Google Search Console

You already have a Google verification token in `app/layout.tsx`
(`91PGka_W_3DW5thpt2jpl7vKQ8tf5MxsLbx_ptC5B4s`), so the property is connected.

1. Go to https://search.google.com/search-console
2. Sign in with the Google account that owns the property.
3. Pick the `macrolight-builder.com` property from the dropdown.
4. In the left nav: **Indexing → Sitemaps**.
5. Under **Add a new sitemap**, type `sitemap.xml` and click **Submit**.
6. Wait ~10–60 seconds for status to flip from "Couldn't fetch" to **Success**.
   Indexing of new URLs (Privacy, Terms, founder bios) usually takes 1–7 days
   to show up in **Pages** and **URL Inspection**.

Tip: After Google reads it, click into the sitemap row → **See page indexing**
to monitor coverage. Anything stuck on "Discovered, not indexed" for >2 weeks
is worth investigating.

---

## 2. Set up Bing Webmaster Tools

Bing also powers DuckDuckGo and ChatGPT search results, so this isn't optional.
The fastest path is to import directly from Search Console — no separate
verification needed.

1. Go to https://www.bing.com/webmasters
2. Sign in with a Microsoft account (create one if needed — it'll attach to
   `bbayley50@gmail.com` either way).
3. On the welcome screen choose **Import from Google Search Console**.
4. Authorize the OAuth handshake; pick `macrolight-builder.com`; click **Import**.
   This pulls verification + your sitemap automatically.
5. (Manual fallback if the import doesn't work) Click **Add a site** →
   `https://macrolight-builder.com` → choose **XML file** verification → upload
   the file Bing gives you to `/public/`, then deploy and click **Verify**.
6. Once verified: **Sitemaps → Submit sitemap** →
   `https://macrolight-builder.com/sitemap.xml`.

Useful Bing Webmaster reports to glance at weekly:
- **Site Explorer** — lets you crawl-test any URL.
- **URL Inspection** — Bing's equivalent of GSC's coverage check.
- **SEO Reports** — flags on-page issues Bingbot finds.

---

## 3. Optional but high-leverage

- **Google Business Profile** — claim/verify the listing for `1902 Villa Rd,
  Birmingham, MI 48009` and put the same NAP on it. Google compares it
  against the schema.org `LocalBusiness` markup now in the footer; matching
  data is a small but real local-SEO ranking signal.
- **Founder photos** — drop 400×400+ JPGs at `public/team/bradley.jpg` and
  `public/team/nick.jpg`, then uncomment the `photo:` lines in
  `app/about/page.tsx`. The `Image` component is already wired up.
- **`lib/blog.ts` is truncated on disk.** Looks like a OneDrive sync issue
  unrelated to this work — the file ends mid-sentence at line 315 and is
  missing the `getAllPosts` / `getAllCaseStudies` exports. Run
  `git status` and `git restore lib/blog.ts` (and any other files git
  reports as modified) before deploying. A few other files in this folder
  showed the same symptom and were rewritten by hand during this session.

