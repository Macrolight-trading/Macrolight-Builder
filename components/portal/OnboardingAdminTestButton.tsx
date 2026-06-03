"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type OnboardingAdminToolbarProps = {
  hasBrief: boolean;
};

export default function OnboardingAdminToolbar({
  hasBrief,
}: OnboardingAdminToolbarProps) {
  const router = useRouter();
  const [testLoading, setTestLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleTestSubmit() {
    setTestLoading(true);
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
      setTestLoading(false);
    }
  }

  async function handleClearBrief() {
    if (
      !window.confirm(
        "Clear your onboarding markdown brief? This removes the .md file and marks onboarding incomplete. Chat history is kept.",
      )
    ) {
      return;
    }

    setClearLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/portal/onboarding/brief", {
        method: "DELETE",
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to clear brief");
      }

      setMessage(data?.message ?? "Onboarding brief cleared.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear brief");
    } finally {
      setClearLoading(false);
    }
  }

  if (!hasBrief) return null;

  const busy = testLoading || clearLoading;

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-3 py-2.5 sm:px-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-amber-900 sm:text-sm">
          <span className="font-semibold">Admin tools:</span> Test Hermes delivery
          or clear your saved markdown brief.
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={handleTestSubmit}
            disabled={busy}
            className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-100 disabled:opacity-50 sm:text-sm"
          >
            {testLoading ? "Submitting…" : "Test submit brief"}
          </button>
          <button
            type="button"
            onClick={handleClearBrief}
            disabled={busy}
            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50 sm:text-sm"
          >
            {clearLoading ? "Clearing…" : "Clear markdown brief"}
          </button>
        </div>
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
