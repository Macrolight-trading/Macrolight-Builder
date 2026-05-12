"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteDealButton({ dealId }: { dealId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this deal? This cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/crm/deals/${dealId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      router.push("/admin/crm/deals");
      router.refresh();
    } catch {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
    >
      {loading ? "Deleting…" : "Delete"}
    </button>
  );
}
