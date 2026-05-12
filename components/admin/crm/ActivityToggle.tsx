"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ActivityToggle({
  activityId,
  completed,
}: {
  activityId: string;
  completed: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/crm/activities/${activityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
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
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-label={completed ? "Mark incomplete" : "Mark complete"}
      className={`mt-0.5 h-4 w-4 shrink-0 rounded border transition-colors ${
        completed
          ? "bg-emerald-500 border-emerald-500"
          : "bg-white border-gray-300 hover:border-violet-500"
      } ${loading ? "animate-pulse" : ""}`}
    >
      {completed && (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="white"
          strokeWidth={3}
          className="h-full w-full"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 10l3 3 7-7"
          />
        </svg>
      )}
    </button>
  );
}
