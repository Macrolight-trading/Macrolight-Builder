/**
 * Shared theme tokens for the v2 design system.
 *
 * Source of truth for colors, type roles, and shadow/border values used
 * across every page that's been migrated to the new theme. Components
 * that need motion timing pull from @/components/motion/tokens instead;
 * this file is only the static visual vocabulary.
 *
 * Why tokens-in-TypeScript instead of pure Tailwind classes:
 *   - Some values (the accent amber) don't have a clean Tailwind name.
 *   - Centralizing the named roles lets us swap them once if the brand
 *     ever shifts (e.g. accent amber → muted teal).
 *
 * Tailwind classes are still the primary application surface — these
 * constants are for the values you'd inline as `style={{ color: ... }}`
 * or pass to a CSS-in-JS attribute.
 */

/** Warm gold — the single accent. Used sparingly: hero gradient, headline
 *  underlines, the audit-form's "free" dot, pricing "Most popular" pill. */
export const ACCENT = "#C8A24B";

/** Ink (foreground). For body copy and headlines on light backgrounds. */
export const INK = "#1c1917"; // stone-900

/** Muted ink. For supporting copy. */
export const INK_MUTED = "#78716c"; // stone-500

/** Surface (page background). Warm off-white. */
export const SURFACE = "#fafaf9"; // stone-50

/** Subtle border tone. */
export const BORDER = "#e7e5e4"; // stone-200

/** Dark band background (Outcomes section, etc.) */
export const DARK_SURFACE = "#1c1917"; // stone-900

/** Type role classnames — drop into className for the right semantic role. */
export const type = {
  /** Display serif headline. */
  display: "font-display font-semibold leading-[1.05] tracking-tight text-stone-900",
  /** Eyebrow tag above a section title. */
  eyebrow:
    "text-[0.65rem] sm:text-xs font-medium uppercase tracking-[0.22em] text-stone-500",
  /** Body copy. */
  body: "text-stone-600 leading-relaxed",
  /** Small detail / meta line. */
  meta: "text-[0.65rem] sm:text-xs uppercase tracking-[0.18em] text-stone-400",
} as const;
