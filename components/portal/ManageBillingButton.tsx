"use client";

import { useState } from "react";

/**
 * Sends the user to a freshly-minted Stripe Billing Portal session so they
 * can update payment methods, cancel, or download invoices. Disabled if
 * the user doesn't have a Stripe customer yet (i.e., never checked out).
 */
export default function ManageBillingButton({
  hasStripeCustomer,
}: {
  hasStripeCustomer: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    if (!hasStripeCustomer) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.url) {
        throw new Error(data?.error || "Could not open billing portal");
      }
      window.location.href = data.url as string;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not open billing portal");
      setLoading(false);
    }
  }

  if (!hasStripeCustomer) {
    return (
      <p className="text-xs text-gray-400">
        Manage billing becomes available after your first checkout.
      </p>
    );
  }

  return (
    <div>
      <button
        onClick={go}
        disabled={loading}
        className="text-xs font-semibold text-violet-600 hover:text-violet-700 disabled:opacity-50"
      >
        {loading ? "Opening…" : "Manage billing →"}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
