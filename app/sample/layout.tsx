/**
 * Layout for /sample/* routes — the standalone industry showcase
 * mockups (RestaurantsShowcase, LawFirmsShowcase, HVACShowcase, etc.).
 *
 * These pages are designed to look like *separate* fictional websites,
 * not part of macrolight-builder.com. They use their own inline styles,
 * their own fonts (Cormorant Garamond, DM Serif, Playfair, Inter,
 * Montserrat, etc.) and their own color palettes per business.
 *
 * The root `app/layout.tsx` body sets `font-sans antialiased
 * min-h-screen flex flex-col bg-white text-gray-900`. The `font-sans`,
 * `text-gray-900` and `flex flex-col` were cascading into the
 * showcases and visibly altering their sizing/typography. Likewise the
 * universal `* { border-color: var(--border); }` rule in globals.css
 * was overriding showcase border colors that used the `border` shorthand
 * but relied on default-color cascading.
 *
 * This layout creates an isolated container that:
 *   - Fills the body's flex column (flexGrow + width 100%) so showcase
 *     `min-h-screen`/`100vh` measurements behave as designed.
 *   - Resets the inherited color and font-family back to a neutral
 *     baseline; each showcase still sets its own values on its root
 *     element, which now take effect cleanly.
 *   - Sets `isolation: isolate` so any z-index inside the showcase
 *     stays scoped to the mockup (no clashes with our floating
 *     "Back to Macrolight" bar).
 */
export default function SampleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        width: "100%",
        flexGrow: 1,
        isolation: "isolate",
        // Neutral baseline — showcases override these on their roots.
        color: "inherit",
        fontFamily:
          "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
      }}
    >
      {children}
    </div>
  );
}
