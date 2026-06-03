"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type OnboardingStatusControlProps = {
  userId: string;
  completedAt: Date | string | null;
};

export default function OnboardingStatusControl({
  userId,
  completedAt,
}: OnboardingStatusControlProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isComplete = !!completedAt;

  async function setCompleted(completed: boolean) {
    if (
      !completed &&
      !window.confirm(
        "Mark onboarding as incomplete? The client will lose access to Build a Plan until onboarding is completed again.",
      )
    ) {
      return;
    }

    setError(null);
    setBusy(true);
    try {
      const res = await fetch(
        `/api/admin/portal/onboarding/${encodeURIComponent(userId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed }),
        },
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to update onboarding status");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  const completedLabel = completedAt
    ? new Date(completedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="shrink-0 text-right">
      <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
            isComplete
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {isComplete ? "Onboarding complete" : "Onboarding incomplete"}
        </span>
        {isComplete ? (
          <button
            type="button"
            onClick={() => setCompleted(false)}
            disabled={busy}
            className="text-xs font-semibold text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            {busy ? "Saving…" : "Mark incomplete"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCompleted(true)}
            disabled={busy}
            className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {busy ? "Saving…" : "Mark complete"}
          </button>
        )}
      </div>
      {completedLabel && (
        <p className="mt-1 text-[11px] text-gray-400">Completed {completedLabel}</p>
      )}
      {!isComplete && (
        <p className="mt-1 max-w-[220px] text-[11px] leading-snug text-gray-400">
          Unlocks Build a Plan for this client in the portal.
        </p>
      )}
      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}
