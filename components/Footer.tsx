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
      { label: "How we build", href: "/how-we-build" },
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
      { label: "Lawn Care", href: "/lawn-care" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Case Studies", href: "/case-studies" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-gray-900 mt-auto">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-14">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10">
          <div className="col-span-2">
            <Logo onDark />
            <p className="mt-4 text-sm text-white/50 max-w-xs leading-relaxed">
              Macrolight Builders installs client acquisition systems for local
              businesses. We build, host, and manage websites engineered to
              convert.
            </p>
            <div className="mt-5 flex items-center gap-2 text-white/35">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs">All systems operational</span>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <div className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                {col.title}
              </div>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/55 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-white/35">
            © {year} Macrolight Builders. All rights reserved.
          </p>
          <p className="text-xs text-white/35">
            Built for businesses that value leads over likes.
          </p>
        </div>
      </div>
    </footer>
  );
}
