import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  /** Constrain the inner content width. Default: 7xl */
  container?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl";
  /** Vertical padding preset. Default: lg */
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  /** Optional decorative background */
  decoration?: "none" | "grid" | "radial";
}

const containerMap: Record<NonNullable<SectionProps["container"]>, string> = {
  sm: "max-w-2xl",
  md: "max-w-3xl",
  lg: "max-w-4xl",
  xl: "max-w-5xl",
  "2xl": "max-w-6xl",
  "3xl": "max-w-7xl",
  "4xl": "max-w-7xl",
  "5xl": "max-w-7xl",
  "6xl": "max-w-7xl",
  "7xl": "max-w-7xl",
};

const paddingMap: Record<NonNullable<SectionProps["padding"]>, string> = {
  none: "py-0",
  sm: "py-12 sm:py-16",
  md: "py-16 sm:py-20",
  lg: "py-20 sm:py-28",
  xl: "py-28 sm:py-36",
};

export default function Section({
  children,
  className = "",
  id,
  container = "7xl",
  padding = "lg",
  decoration = "none",
}: SectionProps) {
  return (
    <section
      id={id}
      className={`relative ${paddingMap[padding]} ${className}`}
    >
      {decoration === "grid" && (
        <div className="absolute inset-0 grid-bg pointer-events-none" aria-hidden />
      )}
      {decoration === "radial" && (
        <div className="absolute inset-0 bg-radial-fade pointer-events-none" aria-hidden />
      )}
      <div
        className={`relative mx-auto ${containerMap[container]} px-5 sm:px-8 lg:px-12`}
      >
        {children}
      </div>
    </section>
  );
}
