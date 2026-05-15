"use client";

import { useState } from "react";

const PLANS = ["NONE", "STARTER", "GROWTH", "PRO", "CUSTOM"] as const;
type Plan = (typeof PLANS)[number];

const planStyles: Record<Plan, string> = {
  NONE: "bg-red-50 text-red-400",
  STARTER: "bg-gray-100 text-gray-600",
  GROWTH: "bg-blue-50 text-blue-700",
  PRO: "bg-amber-50 text-amber-700",
  CUSTOM: "bg-purple-50 text-purple-700",
};

export function PlanSelector({
  userId,
  initialPlan,
}: {
  userId: string;
  initialPlan: Plan;
}) {
  const [plan, setPlan] = useState<Plan>(initialPlan);
  const [saving, setSaving] = useState(false);

  async function handleChange(next: Plan) {
    if (next === plan) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: next }),
      });
      if (res.ok) {
        setPlan(next);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-1">
      {PLANS.map((p) => (
        <button
          key={p}
          disabled={saving}
          onClick={() => handleChange(p)}
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition-opacity ${
            p === plan
              ? planStyles[p]
              : "bg-gray-50 text-gray-300 hover:text-gray-500"
          } ${saving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
