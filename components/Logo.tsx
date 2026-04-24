import Link from "next/link";

interface LogoProps {
  className?: string;
}

export default function Logo({ className = "" }: LogoProps) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2 group ${className}`}
      aria-label="Macrolight Builders home"
    >
      <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 shadow-glow transition-transform duration-300 group-hover:scale-105">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-white"
          aria-hidden
        >
          <path
            d="M3 18L9 6L12 12L15 6L21 18"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-white font-bold tracking-tight text-lg">
        Macrolight
        <span className="text-white/50 font-medium ml-1">Builders</span>
      </span>
    </Link>
  );
}
