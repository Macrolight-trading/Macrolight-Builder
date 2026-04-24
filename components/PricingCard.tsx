import Button from "./Button";
import Card from "./Card";

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
    <Card highlighted={tier.highlighted} className="flex flex-col h-full">
      {tier.highlighted && tier.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-3 py-1 text-xs font-semibold text-white shadow-md dark:shadow-glow">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {tier.badge}
          </span>
        </div>
      )}

      <div>
        <div className="flex items-baseline justify-between">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
            {tier.name}
          </h3>
        </div>
        <p className="mt-1 text-sm text-zinc-600 dark:text-white/60">
          {tier.tagline}
        </p>
      </div>

      <div className="mt-6 mb-6">
        <div className="flex items-end gap-2">
          <span className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            ${tier.buildFee.toLocaleString()}
          </span>
          <span className="text-sm text-zinc-500 dark:text-white/50 pb-1.5">
            one-time build
          </span>
        </div>
        <div className="mt-2 flex items-end gap-2">
          <span className="text-2xl font-bold text-zinc-900 dark:text-white">
            + ${tier.monthlyFee}
            <span className="text-base font-medium text-zinc-500 dark:text-white/60">
              /mo
            </span>
          </span>
          <span className="text-sm text-zinc-500 dark:text-white/50 pb-1">
            hosting & management
          </span>
        </div>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {tier.features.map((f) => (
          <li
            key={f}
            className="flex gap-3 text-sm text-zinc-700 dark:text-white/80"
          >
            <svg
              className="h-5 w-5 shrink-0 text-cyan-600 dark:text-cyan-400"
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

      <Button
        href={tier.ctaHref}
        variant={tier.highlighted ? "primary" : "secondary"}
        size="md"
        fullWidth
      >
        {tier.ctaLabel}
      </Button>
    </Card>
  );
}
