"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUSES = [
  { value: "NEW", label: "New", color: "bg-blue-50 text-blue-700" },
  { value: "CONTACTED", label: "Contacted", color: "bg-amber-50 text-amber-700" },
  { value: "QUALIFIED", label: "Qualified", color: "bg-violet-50 text-violet-700" },
  { value: "CONVERTED", label: "Converted", color: "bg-emerald-50 text-emerald-700" },
  { value: "UNQUALIFIED", label: "Unqualified", color: "bg-gray-100 text-gray-500" },
  { value: "LOST", label: "Lost", color: "bg-red-50 text-red-700" },
] as const;

export default function LeadStatusControl({
  leadId,
  status,
}: {
  leadId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const setStatus = async (next: string) => {
    if (next === status) return;
    setLoading(next);
    try {
      const res = await fetch(`/api/admin/crm/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next, lastContactedAt: new Date() }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      // noop — UI will simply not update
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-1.5">
      {STATUSES.map((s) => {
        const active = s.value === status;
        return (
          <button
            key={s.value}
            type="button"
            onClick={() => setStatus(s.value)}
            disabled={Boolean(loading) || active}
            className={`text-xs font-semibold uppercase tracking-wide rounded-lg px-2 py-1.5 transition-colors ${
              active
                ? `${s.color} ring-2 ring-offset-1 ring-violet-500`
                : `${s.color} opacity-60 hover:opacity-100`
            } ${loading === s.value ? "animate-pulse" : ""}`}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
