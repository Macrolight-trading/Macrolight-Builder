# SEO Fixes — What changed and how to verify

A pass through the Birmingham SEO punch list landed these changes.
Run `git status` first — `git diff` will show every line touched. Then
verify locally before deploying.

## Files changed

### Brand rename (plural → singular)
The visible brand is now "Macrolight Builder" everywhere; the domain
stays at `macrolight-builder.com`.

- `app/about/page.tsx`, `app/admin/layout.tsx`, `app/blog/page.tsx`,
  `app/blog/[slug]/page.tsx`, `app/case-studies/page.tsx`,
  `app/case-studies/[slug]/page.tsx`, `app/contact/page.tsx`,
  `app/how-we-build/page.tsx`, `app/layout.tsx`, `app/page.tsx`,
  `app/pricing/page.tsx`, `app/privacy/page.tsx`, `app/terms/page.tsx`,
  `app/[industry]/page.tsx`
- `components/CTASection.tsx`, `components/Footer.tsx`,
  `components/Logo.tsx`, `components/SocialProofBand.tsx`
- `lib/audit/ai/content-plan.ts`, `lib/blog.ts`,
  `lib/email-templates.ts`, `lib/audit/crawler.ts` (also fixes the
  `macrolightbuilders.com` user-agent reference back to the actual
  domain)

### Industry mockups isolated from indexing
- **NEW** `app/sample/[industry]/page.tsx` — renders the showcase with
  `robots: { index: false, follow: false }`. This is what the public
  `/[industry]` page now iframes.
- **NEW** `components/industries/IndustrySampleFrame.tsx` — auto-resizing
  iframe wrapper with the floating "Back to Macrolight" pill.
- `app/[industry]/page.tsx` — replaced the inline showcase render with
  `<IndustrySampleFrame>`. Removed the now-unused showcase imports.
- `components/SiteShell.tsx` — also skips chrome on `/sample/*` so the
  iframe content presents as a standalone "fake" site (same treatment
  `/admin/*` already had).
- `app/robots.ts` — added `/sample/` to `disallow`.

This single change fixes both the duplicate-H1 issue (each document
now has exactly one H1) and the fake-business-data leak (placeholder
reviews, names, and addresses are no longer indexed against
`macrolight-builder.com`).

### Site-wide schema
- `app/layout.tsx` — added `Organization` + `WebSite` JSON-LD blocks
  inside `<body>`. The Organization NAP is byte-identical to the
  Footer's microdata, which is what Google checks against your Google
  Business Profile listing.

### Founder-quote testimonials removed
- `lib/case-studies.ts` — the `testimonialQuote/Author/Role` fields
  are now optional on `CaseStudy`. All four self-quotes attributed to
  "Macrolight Founding Team" are gone.
- `app/case-studies/[slug]/page.tsx` — testimonial section only
  renders when a real, named quote exists. Until then the page goes
  straight from "What this sample build is designed to deliver" to
  the bottom CTA.

### Image pipeline tightened
- `next.config.js` — added `formats: ["image/avif", "image/webp"]`,
  capped `deviceSizes` at 1920 (was unconstrained → 3840), set
  `minimumCacheTTL` to 30 days. AVIF alone typically cuts hero
  payload by 50% with no perceptible quality loss.
- `components/SocialProofBand.tsx` — dropped from 1920w q=80 to
  1600w q=60 with `alt=""` and `aria-hidden`, since the dark overlay
  hides ~95% of the image. Saves ~120 KB on LCP.
- **NEW** `Image Replacement Inventory.md` — priority-ordered list of
  the remaining 19 Unsplash references on the agency side, with
  target dimensions for each replacement.

## Verify locally before deploying

There is a known OneDrive sync issue in this folder that can truncate
files mid-edit (already documented in `SEO SETUP - Next Steps.md`).
Before deploying, run:

```sh
git status
git diff --stat
```

If `git diff` shows any of these files unexpectedly truncated mid-line,
run `git checkout -- <file>` to restore, then re-apply the change by
hand or by re-running this conversation. The new files
(`app/sample/[industry]/page.tsx`,
`components/industries/IndustrySampleFrame.tsx`,
`Image Replacement Inventory.md`, this file) are net-new so should
appear as additions in `git status`.

Then:

```sh
npm run typecheck    # or: npx tsc --noEmit
npm run build
```

Both should pass. If the build fails on the `IndustrySampleFrame`
import in `app/[industry]/page.tsx`, the OneDrive truncation issue
hit one of the two new files — re-create from this conversation.

## Manual verification once deployed

1. **Schema**: paste your homepage URL into
   <https://search.google.com/test/rich-results>. Should see
   `Organization`, `WebSite`. Industry pages should also show
   `Service` and `WebPage`. Pricing should show `FAQPage`.
2. **Duplicate H1**: open any `/[industry]` page in dev tools,
   `document.querySelectorAll('h1').length` should be `1`. (The
   showcase H1 is in the iframe document — not counted.)
3. **Iframe noindex**: visit `/sample/restaurants` directly. View
   source. Confirm `<meta name="robots" content="noindex,nofollow">`
   is present.
4. **Robots disallow**:
   `curl https://macrolight-builder.com/robots.txt` should now show
   `Disallow: /sample/`.
5. **Lighthouse mobile** (Chrome DevTools → Lighthouse → Mobile,
   Performance + Accessibility + Best Practices + SEO). Target ≥90
   on all four. The image pipeline change should help Performance;
   the Organization schema should keep SEO at 100.
6. **Sitemap regeneration**: `npm run build` will regenerate
   `sitemap.xml`. Confirm `/sample/*` URLs are NOT listed (they
   shouldn't be — `app/sitemap.ts` doesn't include them).

## Known follow-ups (not done)

- **Original photos**: 19 Unsplash images on the agency side still need
  replacement. See `Image Replacement Inventory.md`.
- **Lighthouse audit**: needs to be run by you against a deployed
  preview (I can't trigger Chrome from here).
- **Google Business Profile**: claim/verify the Birmingham, MI listing
  per `SEO SETUP - Next Steps.md` step 3. The new `Organization`
  schema in the layout uses the same NAP; matching is a small but
  real ranking signal.
- **Real testimonials**: `lib/case-studies.ts` now supports them — the
  fields are optional and the page renders them when present.
- **Case studies, blog cadence, geo pages, directory backlinks** —
  these are content/marketing tasks, not code changes.
