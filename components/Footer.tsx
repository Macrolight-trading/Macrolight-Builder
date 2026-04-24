import Link from "next/link";
import Logo from "./Logo";

const columns: Array<{
  title: string;
  links: Array<{ label: string; href: string }>;
}> = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Pricing", href: "/pricing" },
      { label: "Free audit", href: "/contact" },
    ],
  },
  {
    title: "Industries",
    links: [
      { label: "Roofing", href: "/roofing" },
      { label: "Restaurants", href: "/restaurants" },
      { label: "Law Firms", href: "/law-firms" },
      { label: "HVAC", href: "/hvac" },
      { label: "Dentists", href: "/dentists" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative border-t border-white/5 bg-zinc-950 mt-auto">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2">
            <Logo />
            <p className="mt-4 text-sm text-white/60 max-w-xs leading-relaxed">
              Macrolight Builders installs client acquisition systems for local
              businesses. We build, host, and manage websites engineered to
              convert.
            </p>
            <div className="mt-5 flex items-center gap-3 text-white/40">
              <span className="inline-flex items-center gap-1.5 text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                All systems operational
              </span>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <div className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                {col.title}
              </div>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            © {year} Macrolight Builders. All rights reserved.
          </p>
          <p className="text-xs text-white/40">
            Built for businesses that value leads over likes.
          </p>
        </div>
      </div>
    </footer>
  );
}
