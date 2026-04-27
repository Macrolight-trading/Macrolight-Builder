"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface ContactActionsProps {
  contactId: string;
  currentStatus: string;
}

const btnCls =
  "inline-flex items-center rounded-lg border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50";

export default function ContactActions({ contactId, currentStatus }: ContactActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const updateStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/contacts/${contactId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update");
      router.refresh();
    } catch {
      // silently fail — the UI will remain unchanged
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-3">
      {currentStatus === "NEW" && (
        <>
          <button
            onClick={() => updateStatus("READ")}
            disabled={loading}
            className={`${btnCls} border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100`}
          >
            Mark Read
          </button>
          <button
            onClick={() => updateStatus("ARCHIVED")}
            disabled={loading}
            className={`${btnCls} border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100`}
          >
            Archive
          </button>
        </>
      )}
      {currentStatus === "READ" && (
        <>
          <button
            onClick={() => updateStatus("REPLIED")}
            disabled={loading}
            className={`${btnCls} border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100`}
          >
            Mark Replied
          </button>
          <button
            onClick={() => updateStatus("ARCHIVED")}
            disabled={loading}
            className={`${btnCls} border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100`}
          >
            Archive
          </button>
        </>
      )}
      {currentStatus === "REPLIED" && (
        <button
          onClick={() => updateStatus("ARCHIVED")}
          disabled={loading}
          className={`${btnCls} border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100`}
        >
          Archive
        </button>
      )}
      {currentStatus === "ARCHIVED" && (
        <button
          onClick={() => updateStatus("READ")}
          disabled={loading}
          className={`${btnCls} border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100`}
        >
          Restore
        </button>
      )}
    </div>
  );
}
