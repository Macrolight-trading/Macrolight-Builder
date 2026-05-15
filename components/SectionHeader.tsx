interface SectionHeaderProps {
  /** Short uppercase label, e.g. "What We Do" or "The Process". */
  eyebrow: string;
  /** Optional supporting text on the right (count, date, tagline). */
  meta?: string;
  /** Accent dot color. Defaults to violet. */
  accent?: "violet" | "cyan" | "emerald" | "amber";
  /** Adds a bottom rule under the row. Defaults to true. */
  divider?: boolean;
  /** Bottom margin. Defaults to mb-16. */
  className?: string;
}

const accentDotMap: Record<NonNullable<SectionHeaderProps["accent"]>, string> = {
  violet: "bg-violet-500 ring-violet-200",
  cyan: "bg-cyan-500 ring-cyan-200",
  emerald: "bg-emerald-500 ring-emerald-200",
  amber: "bg-amber-500 ring-amber-200",
};

const accentBarMap: Record<NonNullable<SectionHeaderProps["accent"]>, string> = {
  violet: "bg-gradient-to-b from-violet-500 to-cyan-500",
  cyan: "bg-gradient-to-b from-cyan-500 to-violet-500",
  emerald: "bg-gradient-to-b from-emerald-500 to-cyan-500",
  amber: "bg-gradient-to-b from-amber-500 to-rose-500",
};

/**
 * Larger, more designed replacement for the previous cramped pattern:
 *
 *   <div className="flex items-center justify-between border-b border-gray-200 pb-5 mb-16">
 *     <span className="text-xs ... text-gray-400">What We Do</span>
 *     <span className="text-xs ... text-gray-300">04 capabilities</span>
 *   </div>
 *
 * Visual weight comes from:
 *   - a vertical accent bar (gradient)
 *   - a larger, bolder, darker uppercase label
 *   - more generous spacing
 *   - an optional pill-styled meta on the right
 */
export default function SectionHeader({
  eyebrow,
  meta,
  accent = "violet",
  divider = true,
  className = "mb-14 sm:mb-16",
}: SectionHeaderProps) {
  return (
    <div
      className={
        "flex flex-wrap items-center justify-between gap-4 " +
        (divider ? "border-b border-gray-200 pb-6 " : "") +
        className
      }
    >
      <div className="inline-flex items-center gap-3.5">
        {/* Vertical accent bar — gives the eyebrow real presence */}
        <span
          aria-hidden
          className={
            "block h-7 w-1.5 rounded-full " + accentBarMap[accent]
          }
        />
        <span className="text-sm sm:text-base font-bold uppercase tracking-[0.18em] text-gray-900">
          {eyebrow}
        </span>
      </div>

      {meta && (
        <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3.5 py-1.5 shadow-sm">
          <span
            aria-hidden
            className={
              "h-1.5 w-1.5 rounded-full ring-2 " + accentDotMap[accent]
            }
          />
          <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
            {meta}
          </span>
        </span>
      )}
    </div>
  );
}
