import type { Metadata } from "next";
import Link from "next/link";

/**
 * App Router root not-found page.
 * Returns HTTP 404 (Next handles the status code automatically when
 * `notFound()` is called or this file resolves a route).
 *
 * SEO note: this replaces the prior behaviour where `/[anything]` would
 * synthesise an industry-style 200 page. See app/[industry]/page.tsx and
 * lib/industries.ts for the allowlist.
 */
export const metadata: Metadata = {
  title: "Page Not Found",
  description:
    "The page you're looking for doesn't exist. Browse our industries, pricing, or case studies instead.",
  robots: {
    index: false,
    follow: false,
  },
};

const industries = [
  { slug: "roofing", label: "Roofing" },
  { slug: "restaurants", label: "Restaurants" },
  { slug: "law-firms", label: "Law Firms" },
  { slug: "hvac", label: "HVAC" },
  { slug: "dentists", label: "Dentists" },
  { slug: "lawn-care", label: "Lawn Care" },
];

export default function NotFound() {
  return (
    <section className="relative bg-white">
      <div className="mx-auto max-w-3xl px-5 sm:px-8 py-24 sm:py-32 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">
          404
        </p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
          Page not found
        </h1>
        <p className="mt-4 text-lg text-gray-600 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been
          moved. Try one of the links below.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-lg bg-violet-600 px-5 py-2.5 font-semibold text-white shadow-sm hover:bg-violet-700 transition-colors"
          >
            ← Back to home
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center rounded-lg bg-white border border-gray-200 px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Request a free audit
          </Link>
        </div>

        <div className="mt-12 border-t border-gray-100 pt-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Industry pages
          </p>
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            {industries.map((i) => (
              <li key={i.slug}>
                <Link
                  href={`/${i.slug}`}
                  className="font-medium text-violet-600 hover:text-violet-800 transition-colors"
                >
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
