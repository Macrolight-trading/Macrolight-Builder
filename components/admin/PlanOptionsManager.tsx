"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type BillingType = "ONE_TIME" | "MONTHLY";

type PlanOption = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  priceCents: number;
  billingType: BillingType;
  active: boolean;
  sortOrder: number;
};

type DraftOption = Omit<PlanOption, "id"> & { id?: string };

type ImportResultRow = {
  row: number;
  status: "created" | "updated" | "error";
  name?: string;
  error?: string;
};

type ImportResponse = {
  summary: { total: number; created: number; updated: number; errored: number };
  results: ImportResultRow[];
};

const EMPTY_DRAFT: DraftOption = {
  name: "",
  description: "",
  category: "",
  priceCents: 0,
  billingType: "MONTHLY",
  active: true,
  sortOrder: 0,
};

const TEMPLATE_CSV =
  "name,description,category,price,billingType,active,sortOrder\n" +
  'Monthly SEO Audit,"Full technical + content audit each month",SEO,299,monthly,true,10\n' +
  "Website Build,One-time custom site build,Website,4500,one-time,true,10\n" +
  "Logo Refresh,,Add-ons,750,one-time,true,20\n";

function formatPrice(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export default function PlanOptionsManager({
  initialOptions,
}: {
  initialOptions: PlanOption[];
}) {
  const router = useRouter();
  const [options, setOptions] = useState<PlanOption[]>(initialOptions);
  const [editing, setEditing] = useState<DraftOption | null>(null);
  const [importing, setImporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, PlanOption[]>();
    for (const o of options) {
      const key = o.category || "Uncategorized";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(o);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [options]);

  async function save() {
    if (!editing) return;
    setError(null);
    const payload = {
      name: editing.name.trim(),
      description: editing.description?.trim() || null,
      category: editing.category.trim(),
      priceCents: Math.max(0, Math.round(editing.priceCents)),
      billingType: editing.billingType,
      active: editing.active,
      sortOrder: editing.sortOrder,
    };
    if (!payload.name || !payload.category) {
      setError("Name and category are required.");
      return;
    }
    setSaving(true);
    try {
      const isUpdate = !!editing.id;
      const res = await fetch(
        isUpdate ? `/api/admin/plan-options/${editing.id}` : "/api/admin/plan-options",
        {
          method: isUpdate ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) throw new Error((await res.json())?.error ?? "Save failed");
      const saved = (await res.json()) as PlanOption;
      setOptions((prev) => {
        const without = prev.filter((o) => o.id !== saved.id);
        return [...without, saved].sort(
          (a, b) =>
            a.category.localeCompare(b.category) ||
            a.sortOrder - b.sortOrder ||
            a.name.localeCompare(b.name),
        );
      });
      setEditing(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this option? Existing quote requests will keep their snapshotted line item.")) return;
    const res = await fetch(`/api/admin/plan-options/${id}`, { method: "DELETE" });
    if (!res.ok) { alert("Delete failed."); return; }
    setOptions((prev) => prev.filter((o) => o.id !== id));
    router.refresh();
  }

  async function toggleActive(option: PlanOption) {
    const next = !option.active;
    setOptions((prev) => prev.map((o) => (o.id === option.id ? { ...o, active: next } : o)));
    const res = await fetch(`/api/admin/plan-options/${option.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: next }),
    });
    if (!res.ok) {
      setOptions((prev) => prev.map((o) => (o.id === option.id ? { ...o, active: !next } : o)));
      alert("Could not update.");
    }
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          {options.length} option{options.length === 1 ? "" : "s"} configured
        </p>
        <div className="flex items-center gap-2">
          <button onClick={() => setImporting(true)} className="px-3 py-2 text-sm font-semibold text-violet-700 bg-white border border-violet-200 rounded-lg hover:bg-violet-50">
            Import CSV
          </button>
          <button onClick={() => setEditing({ ...EMPTY_DRAFT })} className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700">
            + New option
          </button>
        </div>
      </div>

      {grouped.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-sm text-gray-500">
            No plan options yet. Click <span className="font-semibold">New option</span> to add the first one &mdash; or use <span className="font-semibold">Import CSV</span> to bulk-create them.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([category, items]) => (
            <div key={category} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">{category}</h2>
                <span className="text-[11px] text-gray-400">{items.length} item{items.length === 1 ? "" : "s"}</span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-5 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Name</th>
                    <th className="px-5 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Billing</th>
                    <th className="px-5 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500">Price</th>
                    <th className="px-5 py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500">Active</th>
                    <th className="px-5 py-2 text-right" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((o) => (
                    <tr key={o.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40">
                      <td className="px-5 py-3">
                        <div className="font-medium text-gray-900">{o.name}</div>
                        {o.description && (<div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{o.description}</div>)}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${o.billingType === "MONTHLY" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>
                          {o.billingType === "MONTHLY" ? "Monthly" : "One-time"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-gray-900">
                        {formatPrice(o.priceCents)}{o.billingType === "MONTHLY" && (<span className="text-xs text-gray-400">/mo</span>)}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <button onClick={() => toggleActive(o)} className={`w-9 h-5 rounded-full relative transition-colors ${o.active ? "bg-emerald-500" : "bg-gray-300"}`} aria-label="Toggle active">
                          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${o.active ? "translate-x-4" : "translate-x-0.5"}`} />
                        </button>
                      </td>
                      <td className="px-5 py-3 text-right space-x-3">
                        <button onClick={() => setEditing({ ...o, description: o.description ?? "" })} className="text-xs font-semibold text-violet-600 hover:text-violet-700">Edit</button>
                        <button onClick={() => remove(o.id)} className="text-xs font-semibold text-red-600 hover:text-red-700">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {editing && <EditModal editing={editing} options={options} saving={saving} error={error} onChange={setEditing} onCancel={() => setEditing(null)} onSave={save} />}

      {importing && (
        <ImportModal
          onClose={() => setImporting(false)}
          onCompleted={(newOptions) => {
            setOptions(() => [...newOptions].sort((a, b) => a.category.localeCompare(b.category) || a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)));
            router.refresh();
          }}
        />
      )}
    </>
  );
}

function EditModal({
  editing,
  options,
  saving,
  error,
  onChange,
  onCancel,
  onSave,
}: {
  editing: DraftOption;
  options: PlanOption[];
  saving: boolean;
  error: string | null;
  onChange: (next: DraftOption) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 bg-gray-900/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{editing.id ? "Edit option" : "New option"}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Name</label>
            <input type="text" value={editing.name} onChange={(e) => onChange({ ...editing, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none" placeholder="e.g. Monthly SEO audit" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Description <span className="font-normal text-gray-400">&middot; optional</span></label>
            <textarea value={editing.description ?? ""} onChange={(e) => onChange({ ...editing, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none resize-none" placeholder="Short description shown to clients in the builder" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
              <input type="text" value={editing.category} onChange={(e) => onChange({ ...editing, category: e.target.value })} list="plan-categories" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none" placeholder="SEO, Website, Add-ons" />
              <datalist id="plan-categories">
                {Array.from(new Set(options.map((o) => o.category))).map((c) => (<option key={c} value={c} />))}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Sort order</label>
              <input type="number" value={editing.sortOrder} onChange={(e) => onChange({ ...editing, sortOrder: Number(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Price (USD)</label>
              <input type="number" step="0.01" min="0" value={editing.priceCents / 100} onChange={(e) => onChange({ ...editing, priceCents: Math.round((Number(e.target.value) || 0) * 100) })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Billing</label>
              <select value={editing.billingType} onChange={(e) => onChange({ ...editing, billingType: e.target.value as BillingType })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none bg-white">
                <option value="MONTHLY">Monthly recurring</option>
                <option value="ONE_TIME">One-time</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={editing.active} onChange={(e) => onChange({ ...editing, active: e.target.checked })} className="rounded text-violet-600 focus:ring-violet-500" />
            Active (visible to clients)
          </label>
          {error && (<p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>)}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} disabled={saving} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900">Cancel</button>
          <button onClick={onSave} disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
        </div>
      </div>
    </div>
  );
}

function ImportModal({
  onClose,
  onCompleted,
}: {
  onClose: () => void;
  onCompleted: (refreshed: PlanOption[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  function downloadTemplate() {
    const blob = new Blob([TEMPLATE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plan-options-template.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function submit() {
    if (!file) { setError("Pick a CSV file first."); return; }
    setError(null);
    setBusy(true);
    try {
      const form = new FormData();
      form.set("file", file);
      const res = await fetch("/api/admin/plan-options/import", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Import failed");
      setResult(data as ImportResponse);
      const refreshed = await fetch("/api/admin/plan-options").then((r) => (r.ok ? (r.json() as Promise<PlanOption[]>) : []));
      onCompleted(refreshed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 bg-gray-900/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-900">Import plan options</h3>
        <p className="mt-1 text-sm text-gray-500">
          Upload a CSV to bulk-create or update options. Rows matching an existing <span className="font-medium">name + category</span> will update that option; new combinations are created.
        </p>
        <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50/60 p-4 text-xs text-gray-600">
          <p className="font-semibold text-gray-700 mb-2">Required columns</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li><code className="text-violet-700">name</code> &middot; the option label</li>
            <li><code className="text-violet-700">category</code> &middot; e.g. SEO, Website, Add-ons</li>
            <li><code className="text-violet-700">price</code> &middot; dollars (199 or 199.00; $ and commas OK)</li>
            <li><code className="text-violet-700">billingType</code> &middot; <code>monthly</code> or <code>one-time</code></li>
          </ul>
          <p className="font-semibold text-gray-700 mt-3 mb-1">Optional columns</p>
          <p><code className="text-violet-700">description</code>, <code className="text-violet-700">active</code> (true/false, default true), <code className="text-violet-700">sortOrder</code> (number, default 0)</p>
          <button type="button" onClick={downloadTemplate} className="mt-3 text-violet-700 font-semibold hover:text-violet-800">Download template CSV &rarr;</button>
        </div>
        <div className="mt-5">
          <label className="block text-xs font-semibold text-gray-600 mb-1">CSV file</label>
          <input ref={inputRef} type="file" accept=".csv,text/csv" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setResult(null); setError(null); }} className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
          {file && (<p className="mt-2 text-xs text-gray-500">Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)</p>)}
        </div>
        {error && (<p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>)}
        {result && (
          <div className="mt-5 rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50/60 border-b border-gray-100 flex items-center justify-between text-sm">
              <span className="font-semibold text-gray-900">{result.summary.total} row{result.summary.total === 1 ? "" : "s"} processed</span>
              <span className="space-x-3 text-xs">
                <span className="text-emerald-700">{result.summary.created} created</span>
                <span className="text-blue-700">{result.summary.updated} updated</span>
                {result.summary.errored > 0 && (<span className="text-red-700">{result.summary.errored} failed</span>)}
              </span>
            </div>
            <ul className="max-h-48 overflow-y-auto divide-y divide-gray-100 text-xs">
              {result.results.map((r) => (
                <li key={r.row} className="px-4 py-2 flex items-center justify-between gap-3">
                  <span className="text-gray-700 truncate">Row {r.row}{r.name ? `: ${r.name}` : ""}</span>
                  <span className={`font-semibold ${r.status === "error" ? "text-red-700" : r.status === "updated" ? "text-blue-700" : "text-emerald-700"}`}>
                    {r.status === "error" ? r.error || "error" : r.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} disabled={busy} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900">{result ? "Done" : "Cancel"}</button>
          {!result && (
            <button onClick={submit} disabled={busy || !file} className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed">{busy ? "Importing..." : "Import"}</button>
          )}
        </div>
      </div>
    </div>
  );
}
