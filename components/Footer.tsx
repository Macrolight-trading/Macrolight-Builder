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
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Accessibility", href: "/accessibility" },
    ],
  },
];

const ACCENT = "#C8A24B";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-stone-900 mt-auto">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10">
          <div className="col-span-2">
            <Logo onDark />
            <p className="mt-4 text-sm text-stone-400 max-w-xs leading-relaxed">
              Macrolight Builder installs client acquisition systems for local
              businesses. We build, host, and manage websites engineered to
              convert.
            </p>

            <address
              itemScope
              itemType="https://schema.org/LocalBusiness"
              className="mt-6 not-italic text-sm text-stone-400 leading-relaxed"
            >
              <span
                itemProp="name"
                className="block font-medium text-stone-200"
              >
                Macrolight Builder
              </span>
              <span
                itemProp="address"
                itemScope
                itemType="https://schema.org/PostalAddress"
                className="block"
              >
                <span itemProp="streetAddress">1902 Villa Rd</span>,{" "}
                <span itemProp="addressLocality">Birmingham</span>,{" "}
                <span itemProp="addressRegion">MI</span>{" "}
                <span itemProp="postalCode">48009</span>
              </span>
              <a
                itemProp="telephone"
                href="tel:+12482147957"
                className="mt-1 inline-block text-stone-300 hover:text-white transition-colors"
              >
                (248) 214-7957
              </a>
            </address>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-stone-700/60 bg-stone-800/40 px-3 py-1.5 text-stone-400">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: ACCENT }}
              />
              <span className="text-[0.65rem] uppercase tracking-[0.18em] font-medium">
                All systems operational
              </span>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <div className="text-[0.65rem] font-semibold text-stone-400 uppercase tracking-[0.18em]">
                {col.title}
              </div>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-stone-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-stone-500">
            &copy; {year} Macrolight Builder. All rights reserved.
          </p>
          <p className="text-xs text-stone-500 italic font-display">
            Built for businesses that value leads over likes.
          </p>
        </div>
      </div>
    </footer>
  );
}
