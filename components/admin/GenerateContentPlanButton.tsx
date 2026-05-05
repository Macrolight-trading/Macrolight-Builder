"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

/**
 * Client island that fires the AI Content Plan generation for an audit.
 *
 * Renders inline on /admin/audits/[id]. Two states:
 *   - No plan yet → "Generate Content Plan" button
 *   - Plan exists (passed as `hasPlan`) → "Regenerate Plan" with confirm step
 *
 * On success, calls router.refresh() so the server-rendered page picks up
 * the new aiContentPlan and renders the Content Plan section.
 */
export default function GenerateContentPlanButton({
  auditId,
  hasPlan,
}: {
  auditId: string;
  hasPlan: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const busy = submitting || isPending;

  async function handleClick() {
    if (busy) return;
    if (hasPlan) {
      const ok = window.confirm(
        "Regenerate the Content Plan? This calls gpt-4o again and replaces the existing plan."
      );
      if (!ok) return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(
        `/api/audits/${auditId}/content-plan${hasPlan ? "?regenerate=1" : ""}`,
        { method: "POST" }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError((body as { error?: string }).error ?? `HTTP ${res.status}`);
        setSubmitting(false);
        return;
      }
      // Refresh server data so the new plan renders.
      startTransition(() => router.refresh());
      setSubmitting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {busy ? (
          <>
            <Spinner />
            {hasPlan ? "Regenerating…" : "Generating…"}
          </>
        ) : hasPlan ? (
          "Regenerate Content Plan"
        ) : (
          "Generate Content Plan"
        )}
      </button>
      {busy && (
        <p className="text-xs text-gray-500">
          gpt-4o typically takes 5–15 seconds.
        </p>
      )}
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-white"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
