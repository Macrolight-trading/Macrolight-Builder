import Link from "next/link";
import { industries, type IndustryProfile } from "@/lib/industries";

const INDUSTRY_ICONS: Record<string, string> = {
  roofing: "🏠",
  restaurants: "🍽️",
  "law-firms": "⚖️",
  hvac: "❄️",
  dentists: "🦷",
  "lawn-care": "🌿",
};

export default function RelatedIndustries({
  current,
}: {
  current: IndustryProfile;
}) {
  const others = Object.values(industries).filter(
    (ind) => ind.slug !== current.slug
  );

  return (
    <section className="bg-gray-50 border-t border-gray-200 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">
            More Industries
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
            We build for these industries too
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {others.map((ind) => (
            <Link
              key={ind.slug}
              href={`/${ind.slug}`}
              className="group bg-white rounded-2xl border border-gray-200 p-5 text-center hover:shadow-lg hover:border-violet-200 hover:-translate-y-1 transition-all duration-200"
            >
              <span className="text-2xl" aria-hidden>
                {INDUSTRY_ICONS[ind.slug] || "🏢"}
              </span>
              <p className="mt-2 text-sm font-semibold text-gray-900 group-hover:text-violet-600 transition-colors">
                {ind.name}
              </p>
              <p className="mt-0.5 text-xs text-gray-400">View sample →</p>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-700 transition-colors"
          >
            Don&apos;t see your industry? Let&apos;s talk →
          </Link>
        </div>
      </div>
    </section>
  );
}
