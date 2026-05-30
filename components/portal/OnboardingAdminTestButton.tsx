"use client";

import { useState } from "react";

type OnboardingAdminTestButtonProps = {
  hasBrief: boolean;
};

export default function OnboardingAdminTestButton({
  hasBrief,
}: OnboardingAdminTestButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!hasBrief) return null;

  async function handleTestSubmit() {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/portal/onboarding/test-payment", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Test submit failed");
      }

      setMessage(data.message ?? "Test payment event queued for Hermes.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Test submit failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-3 py-2.5 sm:px-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-amber-900 sm:text-sm">
          <span className="font-semibold">Admin test:</span> Queue{" "}
          <code className="rounded bg-amber-100 px-1 py-0.5 text-[11px]">
            payment_confirmed
          </code>{" "}
          with this brief (same as checkout success).
        </p>
        <button
          type="button"
          onClick={handleTestSubmit}
          disabled={loading}
          className="shrink-0 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-100 disabled:opacity-50 sm:text-sm"
        >
          {loading ? "Submitting…" : "Test submit brief"}
        </button>
      </div>
      {message && (
        <p className="mt-2 text-xs text-emerald-700 sm:text-sm">{message}</p>
      )}
      {error && (
        <p className="mt-2 text-xs text-red-600 sm:text-sm">{error}</p>
      )}
    </div>
  );
}
