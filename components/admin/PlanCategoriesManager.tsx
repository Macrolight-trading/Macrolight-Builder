"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Tier = "NONE" | "STARTER" | "GROWTH" | "PRO";

type PlanCategory = {
  id: string;
  name: string;
  label: string | null;
  bundleDiscountPct: number;
  includedFromTier: Tier | null;
  sortOrder: number;
  active: boolean;
};

type Draft = Omit<PlanCategory, "id"> & { id?: string };

const EMPTY: Draft = {
  name: "",
  label: "",
  bundleDiscountPct: 0,
  includedFromTier: null,
  sortOrder: 0,
  active: true,
};

const TIER_LABELS: Record<string, string> = {
  STARTER: "Starter+",
  GROWTH: "Growth+",
  PRO: "Pro only",
};

export default function PlanCategoriesManager({
  initialCategories,
  optionCounts,
}: {
  initialCategories: PlanCategory[];
  optionCounts: Record<string, number>;
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<PlanCategory[]>(initialCategories);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!editing) return;
    setError(null);
    const payload = {
      name: editing.name.trim(),
      label: editing.label?.trim() || null,
      bundleDiscountPct: Math.max(0, Math.min(100, Math.round(editing.bundleDiscountPct))),
      includedFromTier: editing.includedFromTier ?? null,
      sortOrder: editing.sortOrder,
      active: editing.active,
    };
    if (!payload.name) { setError("Name is required."); return; }
    setSaving(true);
    try {
      const isUpdate = !!editing.id;
      const res = await fetch(
        isUpdate ? `/api/admin/plan-categories/${editing.id}` : "/api/admin/plan-categories",
        { method: isUpdate ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) },
      );
      if (!res.ok) throw new Error((await res.json())?.error ?? "Save failed");
      const saved = (await res.json()) as PlanCategory;
      setCategories((prev) => {
        const without = prev.filter((c) => c.id !== saved.id);
        return [...without, saved].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
      });
      setEditing(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove(c: PlanCategory) {
    const count = optionCounts[c.name] ?? 0;
    if (count > 0) {
      alert(`Cannot delete: ${count} plan option(s) still use this category. Move them first.`);
      return;
    }
    if (!confirm(`Delete category "${c.name}"?`)) return;
    const res = await fetch(`/api/admin/plan-categories/${c.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      alert(data?.error ?? "Delete failed.");
      return;
    }
    setCategories((prev) => prev.filter((x) => x.id !== c.id));
    router.refresh();
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {categories.length} categor{categories.length === 1 ? "y" : "ies"} configured
        </p>
        <button
          onClick={() => setEditing({ ...EMPTY })}
          className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700"
        >
          + New category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-sm text-gray-500">
            No categories yet. Categories are auto-created when you save a plan
            option with a new category name, or you can pre-create them here
            to set bundle discounts.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Name</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Display Label</th>
                <th className="px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500">Options</th>
                <th className="px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500">Included with</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500">Bundle %</th>
                <th className="px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500">Active</th>
                <th className="px-5 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40">
                  <td className="px-5 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-5 py-3 text-gray-600">{c.label || <span className="text-gray-400">—</span>}</td>
                  <td className="px-5 py-3 text-center text-gray-600">{optionCounts[c.name] ?? 0}</td>
                  <td className="px-5 py-3 text-center">
                    {c.includedFromTier && c.includedFromTier !== "NONE" ? (
                      <span className="inline-block text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-50 text-violet-700">
                        {TIER_LABELS[c.includedFromTier] ?? c.includedFromTier}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {c.bundleDiscountPct > 0 ? (
                      <span className="inline-block text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                        {c.bundleDiscountPct}% off
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">none</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-block w-2 h-2 rounded-full ${c.active ? "bg-emerald-500" : "bg-gray-300"}`} />
                  </td>
                  <td className="px-5 py-3 text-right space-x-3">
                    <button onClick={() => setEditing({ ...c, label: c.label ?? "" })} className="text-xs font-semibold text-violet-600 hover:text-violet-700">Edit</button>
                    <button onClick={() => remove(c)} className="text-xs font-semibold text-red-600 hover:text-red-700">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-40 bg-gray-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{editing.id ? "Edit category" : "New category"}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Name (key)</label>
                <input
                  type="text"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
                  placeholder="e.g. SEO &amp; Analytics"
                />
                <p className="mt-1 text-[11px] text-gray-400">
                  Must match the category value used on plan options.
                  {editing.id && " Renaming here will rename all matching plan options too."}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Display label <span className="font-normal text-gray-400">· optional</span>
                </label>
                <input
                  type="text"
                  value={editing.label ?? ""}
                  onChange={(e) => setEditing({ ...editing, label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
                  placeholder="Shown to clients (defaults to Name)"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Bundle discount %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editing.bundleDiscountPct}
                    onChange={(e) => setEditing({ ...editing, bundleDiscountPct: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
                  />
                  <p className="mt-1 text-[11px] text-gray-400">Applied when client picks every option in this category.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Sort order</label>
                  <input
                    type="number"
                    value={editing.sortOrder}
                    onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Include in base plan from tier</label>
                <select
                  value={editing.includedFromTier ?? "NONE"}
                  onChange={(e) => setEditing({ ...editing, includedFromTier: e.target.value === "NONE" ? null : (e.target.value as Tier) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none bg-white"
                >
                  <option value="NONE">Not included &mdash; clients pay extra</option>
                  <option value="STARTER">Starter and up</option>
                  <option value="GROWTH">Growth and up</option>
                  <option value="PRO">Pro only</option>
                </select>
                <p className="mt-1 text-[11px] text-gray-400">
                  When set, every option in this category is auto-included for free in the chosen base plan and any higher tier.
                </p>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={editing.active}
                  onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                  className="rounded text-violet-600 focus:ring-violet-500"
                />
                Active
              </label>
              {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} disabled={saving} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900">Cancel</button>
              <button onClick={save} disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
