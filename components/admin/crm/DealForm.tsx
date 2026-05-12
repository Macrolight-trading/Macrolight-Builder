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

const inputCls =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400";

interface DealFormProps {
  leads: { id: string; name: string; company: string | null }[];
  initialValues?: {
    id?: string;
    title?: string;
    value?: number | null;
    stage?: string;
    probability?: number;
    expectedCloseDate?: string | null;
    leadId?: string | null;
  };
}

export default function DealForm({ leads, initialValues }: DealFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initialValues?.id);

  const [form, setForm] = useState({
    title: initialValues?.title ?? "",
    value:
      initialValues?.value != null
        ? (initialValues.value / 100).toString()
        : "",
    stage: initialValues?.stage ?? "PROSPECT",
    probability:
      initialValues?.probability != null
        ? String(initialValues.probability)
        : "10",
    expectedCloseDate: initialValues?.expectedCloseDate ?? "",
    leadId: initialValues?.leadId ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.value) {
      setError("Title and value are required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = {
        title: form.title,
        value: Math.round(parseFloat(form.value) * 100),
        stage: form.stage,
        probability: parseInt(form.probability, 10) || 10,
        expectedCloseDate: form.expectedCloseDate || null,
        leadId: form.leadId || null,
      };

      const url = isEdit
        ? `/api/admin/crm/deals/${initialValues!.id}`
        : `/api/admin/crm/deals`;
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Save failed");
      }
      const deal = await res.json();
      router.push(`/admin/crm/deals/${deal.id}`);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      <Field label="Title" required>
        <input
          required
          className={inputCls}
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="e.g. Acme Co — Growth plan + audit"
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Value (USD)" required>
          <input
            required
            className={inputCls}
            type="number"
            min={0}
            step={1}
            value={form.value}
            onChange={(e) => update("value", e.target.value)}
          />
        </Field>
        <Field label="Probability (%)">
          <input
            className={inputCls}
            type="number"
            min={0}
            max={100}
            value={form.probability}
            onChange={(e) => update("probability", e.target.value)}
          />
        </Field>
        <Field label="Stage">
          <select
            className={inputCls}
            value={form.stage}
            onChange={(e) => update("stage", e.target.value)}
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Expected close date">
          <input
            className={inputCls}
            type="date"
            value={form.expectedCloseDate}
            onChange={(e) => update("expectedCloseDate", e.target.value)}
          />
        </Field>
      </div>

      <Field label="Associated lead">
        <select
          className={inputCls}
          value={form.leadId}
          onChange={(e) => update("leadId", e.target.value)}
        >
          <option value="">— None —</option>
          {leads.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
              {l.company ? ` (${l.company})` : ""}
            </option>
          ))}
        </select>
      </Field>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
        >
          {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Deal"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}
