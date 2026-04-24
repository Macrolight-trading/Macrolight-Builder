import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  highlighted?: boolean;
  as?: "div" | "article" | "section";
}

export default function Card({
  children,
  className = "",
  hover = true,
  highlighted = false,
  as: Tag = "div",
}: CardProps) {
  const base = "relative rounded-2xl p-6 sm:p-8 transition-all duration-300";
  const surface = highlighted
    ? "bg-gradient-to-br from-violet-100/90 via-fuchsia-50/80 to-cyan-100/80 border border-violet-200/80 shadow-md dark:from-violet-500/[0.12] dark:via-fuchsia-500/[0.08] dark:to-cyan-500/[0.12] dark:border-violet-400/30 dark:shadow-glow"
    : "surface";
  const hoverStyles = hover
    ? "hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgba(124,58,237,0.18)] dark:hover:shadow-[0_20px_60px_-20px_rgba(124,58,237,0.35)]"
    : "";

  return (
    <Tag className={`${base} ${surface} ${hoverStyles} ${className}`}>
      {highlighted && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-violet-300/50 dark:ring-white/10"
        />
      )}
      {children}
    </Tag>
  );
}
