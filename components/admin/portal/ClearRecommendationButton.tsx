"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Small destructive action sitting next to the recommendation editor's
 * heading. Confirms then DELETEs the recommendation so the user's
 * /portal/build-plan page goes back to a blank slate.
 */
export default function ClearRecommendationButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function clear() {
    const ok = window.confirm(
      "Clear this recommendation? The client's Build a Plan page will go back to an empty state.",
    );
    if (!ok) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(
        `/api/admin/portal/plan-recommendations/${encodeURIComponent(userId)}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to clear recommendation");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to clear");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="text-right">
      <button
        type="button"
        onClick={clear}
        disabled={busy}
        className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
      >
        {busy ? "Clearing…" : "Clear recommendation"}
      </button>
      {error && (
        <p className="mt-1 text-[11px] text-red-500">{error}</p>
      )}
    </div>
  );
}
