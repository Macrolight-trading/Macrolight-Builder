"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STAGES = [
  "PROSPECT",
  "QUALIFIED",
  "PROPOSAL",
  "NEGOTIATION",
  "WON",
  "LOST",
] as const;

export default function DealStageMover({
  dealId,
  stage,
}: {
  dealId: string;
  stage: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const setStage = async (next: string) => {
    if (next === stage) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/crm/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: next }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      value={stage}
      onChange={(e) => setStage(e.target.value)}
      disabled={loading}
      className="w-full text-[11px] rounded-md border border-gray-200 px-2 py-1 text-gray-600 font-semibold uppercase tracking-wide"
    >
      {STAGES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
