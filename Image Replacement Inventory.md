# Image Replacement Inventory

The agency-side site currently sources 20 images from `images.unsplash.com`.
Replace each with an original (or a brand-aligned SVG / gradient) and drop
into `public/img/`. After replacement, remove the `images.unsplash.com`
remote pattern in `next.config.js` so we can't accidentally reintroduce it.

The industry-page mockups (under `components/industries/*Showcase.tsx`)
also use Unsplash, but those now render inside the noindex'd
`/sample/[industry]` iframe, so search engines never see them — they're a
lower priority. Replace at your leisure.

## Agency-side images to replace (priority order)

### Above-the-fold (LCP impact — replace first)

| Component | Current source | Suggested original | Target size |
|---|---|---|---|
| `components/Hero.tsx` line 21 | `photo-1414235077428` (restaurant) | Real client restaurant or stylized illustration | 900×1200, AVIF/WebP |
| `components/Hero.tsx` line 27 | `photo-1632759145351` (roofing) | Real roofer site screenshot or brand illustration | 600×800, AVIF/WebP |
| `components/Hero.tsx` line 33 | `photo-1621905252507` (HVAC) | Real HVAC site screenshot or brand illustration | 600×800, AVIF/WebP |
| `components/HeroPhotoCarousel.tsx` | Same three URLs as Hero | Same replacements | Same |

### Below-the-fold

| Component | Count | Suggested approach |
|---|---|---|
| `components/Features.tsx` | 4 | Brand-color illustrations or real product screenshots |
| `components/HowItWorks.tsx` | 3 | Real screenshots from the build process (kickoff doc, design system, analytics dashboard) |
| `components/CTASection.tsx` | 1 | Founder photo (you/Nick) — would double as authenticity signal |
| `components/SocialProofBand.tsx` | 1 | Already trimmed to 1600w q=60 since overlay hides 95%. Could become a pure CSS gradient. |
| `components/SamplePreviews.tsx` | 5 | These render inside agency-side sample previews — lowest priority |

## Mechanical replacement steps

1. Create `public/img/` directory and drop new originals in.
2. For each `<Image src="https://images.unsplash.com/...">` change:
   - `src="/img/your-file.webp"`
   - Make sure `width` and `height` props match the file's actual aspect ratio
   - Keep `sizes="..."` attribute as-is (don't remove it, or Next will request 3840-wide variants)
3. Delete the `images.unsplash.com` `remotePatterns` entry in `next.config.js`.
4. Run `npm run build` and verify no broken `<Image>` calls remain.

## Why this matters

Unsplash images burn three things:
- **Page weight** — even at q=80 a 1920×1080 hero is ~280 KB; an originals-first
  workflow lets you serve AVIF at q=60 for ~40 KB with no perceptible quality loss.
- **Authenticity signal** — reverse-image search reveals the same shots on
  thousands of other agency sites. A founder photo or branded illustration
  is unmistakably yours.
- **Lighthouse mobile score** — the `next.config.js` change already constrains
  optimized variants to ≤1920w (was 3840), but local files cache far better
  than third-party images and shave off the cross-origin handshake too.
