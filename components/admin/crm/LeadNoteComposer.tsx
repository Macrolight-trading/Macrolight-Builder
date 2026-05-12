"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LeadNoteComposer({
  leadId,
  dealId,
}: {
  leadId?: string;
  dealId?: string;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/crm/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, leadId, dealId }),
      });
      if (!res.ok) throw new Error();
      setBody("");
      router.refresh();
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add a note about this lead…"
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-[70px]"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !body.trim()}
          className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save note"}
        </button>
      </div>
    </form>
  );
}
