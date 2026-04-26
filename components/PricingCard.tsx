import Button from "./Button";

export interface PricingTier {
  name: string;
  tagline: string;
  buildFee: number;
  monthlyFee: number;
  highlighted?: boolean;
  ctaLabel: string;
  ctaHref: string;
  features: string[];
  badge?: string;
}

export default function PricingCard({ tier }: { tier: PricingTier }) {
  return (
    <div
      className={`relative flex flex-col h-full rounded-2xl transition-all duration-300 hover:-translate-y-1 ${
        tier.highlighted
          ? "bg-white border-2 border-violet-400 shadow-xl shadow-violet-100/60 shimmer-border"
          : "bg-white border border-gray-200 shadow-sm hover:shadow-md"
      }`}
    >
      {tier.highlighted && tier.badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-cyan-600 px-4 py-1.5 text-xs font-bold text-white shadow-md whitespace-nowrap">
            <span className="h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse" />
            {tier.badge}
          </span>
        </div>
      )}

      <div className={`flex flex-col h-full p-7 sm:p-8 ${tier.highlighted ? "pt-10" : ""}`}>
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
            {tier.highlighted && (
              <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-violet-600 bg-violet-50 border border-violet-200 rounded-full px-2.5 py-0.5">
                Best Value
              </span>
            )}
          </div>
          <p className="mt-1.5 text-sm text-gray-500">{tier.tagline}</p>
        </div>

        <div className="mt-6 mb-6 pb-6 border-b border-gray-100">
          <div className="flex items-end gap-2">
            <span className="text-4xl font-extrabold tracking-tight text-gray-900">
              ${tier.buildFee.toLocaleString()}
            </span>
            <span className="text-sm text-gray-400 pb-1.5">one-time build</span>
          </div>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-2xl font-bold text-gray-900">
              + ${tier.monthlyFee}
              <span className="text-base font-medium text-gray-400">/mo</span>
            </span>
            <span className="text-sm text-gray-400 pb-1">hosting & support</span>
          </div>
          {tier.highlighted && (
            <p className="mt-3 text-xs text-emerald-600 font-medium">
              ✓ Month-to-month · Cancel anytime
            </p>
          )}
        </div>

        <ul className="space-y-3 mb-8 flex-1">
          {tier.features.map((f) => (
            <li key={f} className="flex gap-3 text-sm text-gray-700">
              <svg
                className={`h-5 w-5 shrink-0 ${tier.highlighted ? "text-violet-500" : "text-emerald-500"}`}
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto space-y-3">
          <Button
            href={tier.ctaHref}
            variant={tier.highlighted ? "primary" : "secondary"}
            size="md"
            fullWidth
          >
            {tier.ctaLabel}
          </Button>
          {tier.highlighted && (
            <p className="text-center text-xs text-gray-400">
              🔒 30-day satisfaction guarantee
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
