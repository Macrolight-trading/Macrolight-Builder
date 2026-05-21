# Home Page Redesign Plan — Framer Motion + Premium Minimal Theme

**Stack:** Next.js 14 (App Router) · React 18 · TypeScript · Tailwind 3 · adding `motion` (formerly `framer-motion`)
**Goal:** Replace `app/page.tsx` and its seven section components with a fully redesigned home page in a premium-minimal aesthetic (Linear / Vercel / Stripe vocabulary), with medium-intensity motion — coherent scroll reveals, a few hero moments, and disciplined easing.
**Non-goals:** No platform migration. No CMS swap. No copy rewrite beyond what the new layout demands.

---

## Guiding principles

1. **Conversion first, motion second.** This is a sales page for local-business websites — every motion choice must support reading order, trust, and time-to-CTA, never delay it.
2. **One motion language.** A single easing curve, two or three durations, one stagger interval. Consistency is what makes "premium minimal" read as premium.
3. **Respect `prefers-reduced-motion`** at the primitive level so it propagates everywhere.
4. **Server-render the page; animate the leaves.** Keep `page.tsx` a server component. Mark only motion components `"use client"`.

---

## Phase 0 — Decisions to lock before code

These shape everything downstream; worth ten minutes now.

- **Section list (proposed):** Hero → Trust strip (logos / metrics) → Live samples (gallery, kinetic) → How it works (3-step) → Outcomes (proof + metric tiles) → Pricing teaser → FAQ (short) → CTA. Open question: keep `SocialProofBand` as its own section or merge into Trust strip?
- **Accent color.** "Macrolight" suggests something luminous. Recommend a warm off-white base (`#FAFAF7`), ink foreground (`#0E0E10`), and one muted accent — either soft amber (`#C8A24B`) or quiet teal (`#1F6F6A`). Pick one, lock it.
- **Type pairing.** Display serif for headlines + clean sans for body reads premium. Suggest *Fraunces* (display) + *Inter* (body), both via `next/font`. Or *Instrument Serif* + *Geist* if you want lighter weights.
- **Motion tokens.** Default ease `[0.22, 1, 0.36, 1]` (smooth out), durations `0.35s` / `0.6s` / `0.9s`, stagger `0.08s`. Lock these in a single file.

---

## Phase 1 — Theme system (foundation)

Before touching any section, set up the design tokens so every component pulls from one source.

- `tailwind.config.ts` — extend `colors`, `fontFamily`, `boxShadow`, `transitionTimingFunction` with the locked tokens. Replace ad-hoc hex values throughout existing components later.
- `app/globals.css` — CSS custom properties for surface / ink / accent so dark-mode (if added later) is a token swap, not a refactor.
- `app/layout.tsx` — load fonts via `next/font` with `display: swap`, set `<html className={...}>`.
- `lib/motion.ts` — export `EASE`, `DUR`, `STAGGER`, plus prebuilt variants (`fadeUp`, `fadeIn`, `scaleIn`). Single import surface for every animated component.

**Deliverable:** running the existing page should already feel slightly different (new fonts, new neutrals) before any new components ship.

---

## Phase 2 — Motion primitives

A tiny client-side component kit so animation never leaks into section code.

- `components/motion/Reveal.tsx` — `whileInView` fade-up with `viewport={{ once: true, margin: "-10%" }}`. Default building block; ~90% of motion uses it.
- `components/motion/Stagger.tsx` — wraps children, applies staggered variants. For lists, feature grids, sample tiles.
- `components/motion/Magnetic.tsx` — subtle mouse-tracking pull for primary CTA only. One hero moment, not a global pattern.
- `components/motion/ScrollProgress.tsx` — thin top progress bar driven by `useScroll`. Premium-minimal signature touch.
- All primitives respect `useReducedMotion()` — return static element when true.

---

## Phase 3 — Section redesigns (top-to-bottom)

Each section gets a content brief + a motion brief. Build in this order; each is independently shippable behind the feature flag.

**Hero.** Centered serif headline that animates in word-by-word (one hero moment), supporting line fades in beneath, primary CTA gets magnetic pull, secondary is a quiet ghost button. Background: single soft radial gradient that drifts very slowly on `useScroll` (parallax, not particles). Replace `HeroPhotoCarousel` with a single quietly-animated browser-frame mock of a sample site — less is more here.

**Trust strip.** Logos or "X sites built · Y leads delivered · Z industries" metric row. `Stagger` reveal. Numbers count up once with `motion.span` + `animate` from 0. No carousel; static and confident.

**Live samples.** 3-up grid of real sample sites. Each card has a hover-tilt + subtle scale (1.0 → 1.02) + image zoom. Section enters via `Stagger`. On click, opens the existing sample preview flow — don't rebuild that.

**How it works.** Three steps, horizontal on desktop, stacked on mobile. Connecting line draws in on scroll (`pathLength` animation). Each step reveals in sequence.

**Outcomes / proof.** Big-number metric tiles ("4.2× more form submits in 60 days") + one anchor testimonial. Tiles enter staggered; testimonial fades in.

**Pricing teaser.** Compact two-card preview (not full pricing — that lives on `/pricing`). Hover state lifts the recommended card by 4px. Link to full pricing page.

**FAQ.** Short, four to six items. Native `<details>` with custom CSS for the open/close, or `AnimatePresence` for height animation if you want it smoother. Reduces a lot of "should I email them?" friction before the final CTA.

**Final CTA.** Full-width section, large serif again to bookend the Hero. Same magnetic CTA. Quiet animated gradient backdrop.

---

## Phase 4 — Rollout

- Build the new page at `app/(site)/v2/page.tsx` first (or behind an env flag). Old page stays live.
- Review on desktop + mobile + tablet at real device sizes, not just dev tools.
- A/B for one to two weeks if you have the traffic; otherwise swap directly and watch analytics for one week.
- Once shipped, retire the old section components that are no longer imported anywhere (`HeroPhotoCarousel`, etc.).

---

## Phase 5 — Verification (don't skip)

- **Lighthouse:** Performance ≥ 90, CLS < 0.05. Motion should not regress these.
- **Reduced motion:** Toggle in OS settings; confirm every animation degrades to a static state.
- **Mobile:** All scroll-linked effects feel smooth on a mid-tier Android. If not, simplify.
- **Accessibility:** Headings still semantic, focus order intact, CTAs reachable by keyboard, contrast ≥ 4.5:1 on body text.
- **Real-device screenshot pass:** iPhone, Android, 13" laptop, 27" monitor. Premium minimal lives or dies on edges and spacing — check them.

---

## Effort estimate

- Phase 0 (decisions): half-day
- Phase 1 (theme): half-day
- Phase 2 (primitives): half-day
- Phase 3 (sections): two to three days
- Phase 4 + 5 (rollout + QA): one day

**Total: ~5 working days** for a clean ship.

---

## Open questions for Bradley

1. Accent color — amber or teal? (Or a different direction entirely?)
2. Keep Macrolight's existing logo / wordmark, or is type-treatment up for review too?
3. Are the existing sample sites in `components/Sample Sites` the assets you want featured, or should we curate a smaller set?
4. Any sections from the current page you specifically want preserved untouched?
