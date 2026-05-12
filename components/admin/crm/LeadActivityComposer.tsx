"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const TYPES = ["CALL", "EMAIL", "MEETING", "TASK", "NOTE"] as const;

export default function LeadActivityComposer({
  leadId,
  dealId,
}: {
  leadId?: string;
  dealId?: string;
}) {
  const router = useRouter();
  const [type, setType] = useState<(typeof TYPES)[number]>("TASK");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/crm/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          subject,
          description: description || null,
          dueDate: dueDate || null,
          leadId,
          dealId,
        }),
      });
      if (!res.ok) throw new Error();
      setSubject("");
      setDescription("");
      setDueDate("");
      setType("TASK");
      router.refresh();
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      <div className="flex gap-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as (typeof TYPES)[number])}
          className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-600"
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="What needs to happen? e.g. Follow up call"
          className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
        />
        <button
          type="submit"
          disabled={loading || !subject.trim()}
          className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
        >
          Add
        </button>
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Add details (optional)"
        className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm min-h-[60px]"
      />
    </form>
  );
}
