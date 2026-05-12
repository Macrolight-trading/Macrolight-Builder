"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface LeadFormProps {
  initialValues?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    jobTitle?: string;
    industry?: string;
    website?: string;
    source?: string;
    status?: string;
    value?: number | null;
    description?: string;
  };
}

const STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "UNQUALIFIED",
  "CONVERTED",
  "LOST",
] as const;

const SOURCES = ["website", "referral", "outbound", "ad", "event", "other"];

const inputCls =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400";

export default function LeadForm({ initialValues }: LeadFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initialValues?.id);

  const [form, setForm] = useState({
    name: initialValues?.name ?? "",
    email: initialValues?.email ?? "",
    phone: initialValues?.phone ?? "",
    company: initialValues?.company ?? "",
    jobTitle: initialValues?.jobTitle ?? "",
    industry: initialValues?.industry ?? "",
    website: initialValues?.website ?? "",
    source: initialValues?.source ?? "website",
    status: initialValues?.status ?? "NEW",
    value:
      initialValues?.value != null ? (initialValues.value / 100).toString() : "",
    description: initialValues?.description ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        company: form.company || null,
        jobTitle: form.jobTitle || null,
        industry: form.industry || null,
        website: form.website || null,
        source: form.source || null,
        status: form.status,
        value: form.value ? Math.round(parseFloat(form.value) * 100) : null,
        description: form.description || null,
      };

      const url = isEdit
        ? `/api/admin/crm/leads/${initialValues!.id}`
        : `/api/admin/crm/leads`;
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Save failed");
      }
      const lead = await res.json();
      router.push(`/admin/crm/leads/${lead.id}`);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Name" required>
          <input
            required
            className={inputCls}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </Field>
        <Field label="Email" required>
          <input
            required
            type="email"
            className={inputCls}
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </Field>
        <Field label="Phone">
          <input
            className={inputCls}
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </Field>
        <Field label="Company">
          <input
            className={inputCls}
            value={form.company}
            onChange={(e) => update("company", e.target.value)}
          />
        </Field>
        <Field label="Job title">
          <input
            className={inputCls}
            value={form.jobTitle}
            onChange={(e) => update("jobTitle", e.target.value)}
          />
        </Field>
        <Field label="Industry">
          <input
            className={inputCls}
            value={form.industry}
            onChange={(e) => update("industry", e.target.value)}
          />
        </Field>
        <Field label="Website">
          <input
            className={inputCls}
            value={form.website}
            placeholder="https://"
            onChange={(e) => update("website", e.target.value)}
          />
        </Field>
        <Field label="Potential value (USD)">
          <input
            className={inputCls}
            type="number"
            min={0}
            step={1}
            value={form.value}
            onChange={(e) => update("value", e.target.value)}
          />
        </Field>
        <Field label="Source">
          <select
            className={inputCls}
            value={form.source}
            onChange={(e) => update("source", e.target.value)}
          >
            {SOURCES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select
            className={inputCls}
            value={form.status}
            onChange={(e) => update("status", e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Notes">
        <textarea
          className={inputCls + " min-h-[100px]"}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Anything else worth remembering about this lead…"
        />
      </Field>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
        >
          {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Lead"}
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
