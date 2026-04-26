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
    ? "bg-white border border-violet-200 shadow-lg shadow-violet-100/50"
    : "surface";

  const hoverStyles = hover
    ? "hover:-translate-y-1 hover:shadow-lg"
    : "";

  return (
    <Tag className={`${base} ${surface} ${hoverStyles} ${className}`}>
      {highlighted && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-violet-200"
        />
      )}
      {children}
    </Tag>
  );
}
